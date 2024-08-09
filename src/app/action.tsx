"use server";

import { getMutableAIState } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import type { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { JokeComponent } from "../components/ui/joke-component";
import type { CoreAssistantMessage, CoreToolMessage, TextPart, ToolCallPart } from "ai";
import { generateObject, generateText, UnsupportedJSONSchemaError } from "ai";
import { type Joke, jokeSchema } from "./joke";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { conversations, messages } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QRComponent } from "~/components/ui/qr-component";
import { WolframAlphaComponent } from "~/components/ui/wolframalpha-component";

export interface ServerMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

const wolframAlphaToolSchema = z.object({
  eqn: z.string().describe("the equasion to solve or the numerical question to answer"),
});

const qrToolSchema = z.object({
  data: z.string().describe("The data to encode in the QR code."),
  size: z.string().regex(new RegExp('[0-9]+x[0-9]+')).optional()
    .describe(
      "Specifies the size of the QR code image you want to generate (in px for raster graphic " +
      "formats like png, gif or jpeg); as logical unit for vector graphics (svg, eps). " +
      "The format should be [integer]x[integer] like 150x150."),
  color: z.string().regex(new RegExp('[0-9a-fA-F]{6}')).optional()
    .describe(
      "Color of the foreground (data modules) as an RGB value in 6 character " +
      "hex format like ff0000 for red or 556B2F for DarkOliveGreen."),
  bgcolor: z.string().regex(new RegExp('[0-9a-fA-F]{6}')).optional()
    .describe(
      "Color of the background as an RGB value in 6 character hex format like ff0000 " +
      "for red or 556B2F for DarkOliveGreen."),
  margin: z.string().optional()
    .describe(
      "Thickness of the margin in pixels. The margin parameter will be ignored if svg " +
      "or eps is used as QR code format."),
  qzone: z.string().optional()
    .describe(
      "Thickness of the “quiet zone”, an area without disturbing elements to help " +
      "readers locating the QR code, in modules as measuring unit. This means a value of 1 leads " +
      "to a drawn margin around the QR code which is as thick as a data pixel/module of the QR code. " +
      "The quiet zone will be drawn in addition to an eventually set margin value."),
  format: z.union(
    [z.literal("png"), z.literal("gif"), z.literal("jpg"), z.literal("jpeg"), z.literal("svg"), z.literal("eps")]
  )
    .optional()
    .describe(
      "It is possible to create the QR code using different file formats, " +
      "available formats are: png, gif, jpg, jpeg, svg, eps"),
});

const jokeToolSchema = z.object({
  subject: z.string().describe("The subject of the joke."),
});

export async function continueConversation(
  newUserId: string, input: string,
): Promise<ClientMessage> {
  "use server";

  console.log("continueConversation2");
  const history = getMutableAIState();
  const newAsstId = nanoid();

  history.update((messages: ServerMessage[]) => [
    ...messages,
    { id: newUserId, role: "user", content: JSON.stringify({ text: input, tool: null }) },
  ])

  const result = await generateText({
    model: openai("gpt-4o"),
    maxToolRoundtrips: 5,
    system:
      "You are a helpful assistant named Kirk. " +
      "When given a prompt, reason step by step about how to respond. " +
      "Use the tools available to you when necessary. " +
      "When you give your final response, always format it as JSON with the following schema:" +
      "{" +
      '  "text": "Your plain text response goes here. Never include URLs, Markdown or JSON here.",' +
      '  "finalToolName": "If you called any tools, place the name of the final tool here.",' +
      '  "finalToolResult": "If you called any tools, place the final tool result here."' +
      "}",
    messages: history.get() as ServerMessage[],
    tools: {
      calculator: {
        description: "Do a mathematical calculations.",
        parameters: wolframAlphaToolSchema,
        execute: async ({ eqn }: { eqn: string }) => {
          const url = `http://api.wolframalpha.com/v1/result?appid=${process.env.WOLFRAM_ALPHA_APP_ID}&i=${encodeURIComponent(eqn)}`;
          const response = await fetch(url, { method: 'get' });
          const result = await response.text();
          return result;
        },
      },
      qr: {
        description:
          "Create a QR code with any data the user wants. This is especially useful for " +
          "transfering data from a computer to a phone or from one phone to another.",
        parameters: qrToolSchema,
        execute: async (params: Record<string, string | number | boolean>) => {
          const url = buildUrl("https://api.qrserver.com/v1/create-qr-code/", params);
          return url;
        },
      },
      joke: {
        description: "Tell a joke.",
        parameters: jokeToolSchema,
        execute: async ({ subject }: { subject: string }) => {
          const joke = await generateObject({
            model: openai("gpt-4o"),
            schema: jokeSchema,
            prompt: "Generate a joke that incorporates the following subject:" + subject,
          });

          return JSON.stringify(joke.object);
        },
      },
    },
  });

  // NOTE: I've intentionally told the AI to give it's final answer as JSON
  // but I'm not going to trust the Vercel API structures more.
  // Why? Because, for instance, when asking for a QR code, the bot
  // seems to incist on sticking a URL in it's final textual resposne
  // even if I tell it not to. BUT, if I tell it to return things in a 
  // strict JSON structure it seems to be more consistent at
  // separating out the URL to the slot I give it.

  // We'll look at the responseMessages in reverse to construct our
  // final answer. The most recent three should be:
  // 1) The bot's final answer in the JSON format I specified.
  // 2) The structured response from the final tool used, if any.
  // 3) The bot's request to the final tool.

  let asstContent: ServerMessageContent = {text: "Oops. Something went wrong. Please try again.", tool: null}
  try {
    const responseMessages = result.responseMessages.reverse();
    const finalAnswer = responseMessages[0] as CoreAssistantMessage;
    console.log(finalAnswer);
    const finalToolCall = responseMessages.length > 1 ? responseMessages[1] as CoreToolMessage : undefined;
    const finalToolReq = responseMessages.length > 2 ? responseMessages[2] as CoreAssistantMessage : undefined;

    const { text } = JSON.parse((finalAnswer?.content[0] as TextPart)?.text);
    console.log("text=" + text)
    const toolName = finalToolCall?.content[0]?.toolName;
    console.log("final tool=" + (toolName ?? "no tool"));
    const toolResult = finalToolCall?.content[0]?.result;
    console.log("final tool result=" + (toolResult as string ?? "no tool"));
    const toolInput = (finalToolReq?.content[1] as ToolCallPart)?.args;
    console.log("final tool args=" + (JSON.stringify(toolInput) ?? "no tool"));
  
    asstContent = {
      text: text,
      tool: (toolName && toolInput && toolResult) ? {
        name: toolName,
        input: toolInput,
        result: (toolName === "joke" ? JSON.parse(toolResult as string) : toolResult)
      } : null
    }
  } catch (e) {
    console.error(e);
  } finally {
    history.done((messages: ServerMessage[]) => [
      ...messages,
      { id: newAsstId, role: "assistant", content: JSON.stringify(asstContent) },
    ])

    return {
      id: newAsstId,
      role: "assistant",
      display: await selectComponentForContent(asstContent),
    };
  }
}

export type ServerMessageContent = {
  text: string,
  tool?: {
    name: string,
    input: unknown,
    result: string,
  } | null
};

export async function selectComponentForContent({ text, tool }: ServerMessageContent): Promise<ReactNode> {
  if (!tool) {
    return <div>{text}</div>
  }
  const { name, input, result } = tool;
  switch (name) {
    case "joke":
      return <JokeComponent joke={result as Joke} />
    case "qr":
      return <QRComponent text={text} url={result} />
    case "calculator":
      return <WolframAlphaComponent text={text} input={(input as { eqn: string }).eqn} result={result} />
    default:
      throw new UnsupportedJSONSchemaError({ schema: name, reason: `Because Jade didn't implement tool ${name} yet.` })
  }
}

function buildUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]!.toString());
  });
  return url.toString();
}

export async function resolvePromisesSequentially<T>(tasks: Promise<T>[]) {
  const results = [];
  for (const task of tasks) {
    results.push(await task);
  }
  return results;
}

export async function saveMessagesToDB(convoId: number, state: ServerMessage[]) {
  console.log(`saveChatToDB conversationId=${convoId}`);

  const messageList = state.map(({ id, role, content }: ServerMessage) => ({
    id,
    role: role.toString(),
    content,
    conversationId: convoId
  }));
  const tasks = messageList.map((msg) =>
    db.insert(messages).values(msg).onConflictDoNothing({ target: messages.id }));
  await resolvePromisesSequentially(tasks);
}

export async function loadMessagesFromDB(conversationId: number): Promise<ServerMessage[]> {
  console.log(`loadChatFromDB conversationId=${conversationId}`);
  const results = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId)
  });
  const chat = results as ServerMessage[];
  return chat;
}

export async function newConversation() {
  console.log("newConversation");
  const { insertedId } = (await db.insert(conversations).values({}).returning({ insertedId: conversations.id }))[0]!;
  console.log(`convo=${insertedId}`)
  revalidatePath("/", "layout");
  redirect(`/convo/${insertedId}`);
}
