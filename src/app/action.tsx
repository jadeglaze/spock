"use server";

import { getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { JokeComponent } from "../components/ui/joke-component";
import { generateObject } from "ai";
import { jokeSchema } from "./joke";
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

export async function continueConversation(
  newUserId: string, input: string,
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();
  const newAsstId = nanoid();

  history.update((messages: ServerMessage[]) => [
    ...messages,
    { id: newUserId, role: "user", content: JSON.stringify({kind: "text", data: input}) },
  ])

  const result = await streamUI({
    model: openai("gpt-4o"),
    messages: history.get(),
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { id: newAsstId, role: "assistant", content: JSON.stringify({kind: "text", data: content}) },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      calcuator: {
        description: "Do a mathematical calculation or find numerical properties of objects.",
        parameters: z.object({
          eqn: z.string().describe("the equasion to solve or the numerical question to answer"),
        }),
        generate: async function* ({ eqn }: {eqn: string}) {
          yield <div>Asking WolframAlpha {eqn}...</div>;
          const url = `http://api.wolframalpha.com/v1/result?appid=${process.env.WOLFRAM_ALPHA_APP_ID}&i=${encodeURIComponent(eqn)}`;
          let response = await fetch(
            url,
            {
              method: 'get',
            }
          );
      
          const result = await response.text();
          history.done((messages: ServerMessage[]) => [
            ...messages,
            { id: newAsstId, role: "assistant", content: JSON.stringify({kind: "wolframAlpha", data: {input: eqn, result: result}}) },
          ])
          return <WolframAlphaComponent input={eqn} result={result} />
        },
      },
      qr: {
        description: "Create a QR code with any data the user wants. This is especially useful for transfering data from a computer to a phone or from one phone to another.",
        parameters: z.object({
          data: z.string().describe("The data to encode in the QR code."),
          size: z.string().regex(new RegExp('[0-9]+x[0-9]+')).optional()
            .describe("Specifies the size of the QR code image you want to generate (in px for raster graphic formats like png, gif or jpeg); as logical unit for vector graphics (svg, eps). The format should be [integer]x[integer] like 150x150."),
          color: z.string().regex(new RegExp('[0-9a-fA-F]{6}')).optional()
            .describe("Color of the foreground (data modules) as an RGB value in 6 character hex format like ff0000 for red or 556B2F for DarkOliveGreen."),
          bgcolor: z.string().regex(new RegExp('[0-9a-fA-F]{6}')).optional()
            .describe("Color of the background as an RGB value in 6 character hex format like ff0000 for red or 556B2F for DarkOliveGreen."),
          margin: z.string().optional()
            .describe("Thickness of the margin in pixels. The margin parameter will be ignored if svg or eps is used as QR code format."),
          qzone: z.string().optional()
            .describe("Thickness of the “quiet zone”, an area without disturbing elements to help readers locating the QR code, in modules as measuring unit. This means a value of 1 leads to a drawn margin around the QR code which is as thick as a data pixel/module of the QR code. The quiet zone will be drawn in addition to an eventually set margin value."),
          format: z.union([z.literal("png"), z.literal("gif"), z.literal("jpg"), z.literal("jpeg"), z.literal("svg"), z.literal("eps")]).optional()
            .describe("It is possible to create the QR code using different file formats, available formats are: png, gif, jpg, jpeg, svg, eps"),
        }),
        generate: async function* (params: Record<string, string | number | boolean>) {
          yield <div>Creating QR code...</div>;
          const url = buildUrl("https://api.qrserver.com/v1/create-qr-code/", params);
          history.done((messages: ServerMessage[]) => [
            ...messages,
            { id: newAsstId, role: "assistant", content: JSON.stringify({kind: "qr", data: url}) },
          ])
          return <QRComponent url={url} />
        },
      },
      tellAJoke: {
        description: "Tell a joke.",
        parameters: z.object({
          location: z.string().describe("the users location"),
        }),
        generate: async function* ({ location }: {location: string}) {
          yield <div>One moment, thinking funny thoughts...</div>;
          const joke = await generateObject({
            model: openai("gpt-4o"),
            schema: jokeSchema,
            prompt: "Generate a joke that incorporates the following location:" +
              location,
          });
          history.done((messages: ServerMessage[]) => [
            ...messages,
            { id: newAsstId, role: "assistant", content: JSON.stringify({kind: "joke", data: joke.object}) },
          ])
          return <JokeComponent joke={joke.object} />;
        },
      },
    },
  });

  return {
    id: newAsstId,
    role: "assistant",
    display: result.value,
  };
}

function buildUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]!.toString());
  });
  return url.toString();
}

export async function saveMessagesToDB(convoId: number, state: ServerMessage[]) {
  console.log(`saveChatToDB conversationId=${convoId}`);

  const messageList = state.map(({id, role, content}: ServerMessage) => ({
    id,
    role: role.toString(),
    content,
    conversationId: convoId
  }));
  messageList.map(async (msg) => 
    await db.insert(messages).values(msg).onConflictDoNothing({target: messages.id}));
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
  const { insertedId } = (await db.insert(conversations).values({}).returning({insertedId: conversations.id}))[0]!;
  console.log(`convo=${insertedId}`)
  revalidatePath("/", "layout");
  redirect(`/convo/${insertedId}`);
}
