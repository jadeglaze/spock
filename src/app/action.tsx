"use server";

import { createAI, getAIState, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { JokeComponent } from "../components/ui/joke-component";
import { generateObject } from "ai";
import { jokeSchema } from "./joke";
import { db } from "~/server/db";

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

const wolframAlphaTool = {
  description: "Do a mathematical calculation or find numerical properties of objects.",
  parameters: z.object({
    eqn: z.string().describe("the equasion to solve or the numerical question to answer"),
  }),
  generate: async function* ({ eqn }: {eqn: string}) {
    yield <div>Asking WolframAlpha {eqn}...</div>;
    const wolframShortAnswerUrl = `http://api.wolframalpha.com/v1/result?appid=${process.env.WOLFRAM_ALPHA_APP_ID}&i=${encodeURIComponent(eqn)}`;
    let response = await fetch(
      wolframShortAnswerUrl,
      {
        method: 'get',
      }
    );

    const wolframResult = await response.text();
    return (
      <div>
        <p>Input: {eqn}</p>
        <p>Result: {wolframResult}</p>
        <p>(According to WolframAlpha)</p>
      </div>
    );
  },
};

const qrCodeTool = {
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
    return (
      <div>
        <img src={url} alt="" title="" />
        <p>Scan with your phone!</p>
      </div>
    );
  },
};

const jokeTool = {
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
    return <JokeComponent joke={joke.object} />;
  },
};


export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai("gpt-4o"),
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      calcuator: wolframAlphaTool,
      qr: qrCodeTool,
      tellAJoke: jokeTool,
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  onSetAIState: async ({ state, done }) => {
    'use server';

    if (done) {
      saveChatToDB(state);
    }
  },
  onGetUIState: async () => {
    'use server';

    console.log("onGetUIState");


    const historyFromDB: ServerMessage[] = await loadChatFromDB();
    const historyFromApp: ServerMessage[] = getAIState() as ServerMessage[];

    // If the history from the database is different from the
    // history in the app, they're not in sync so return the UIState
    // based on the history from the database

    if (historyFromDB.length !== historyFromApp.length) {
      return historyFromDB.map(({ role, content }) => ({
        id: nanoid(),
        role,
        display: content
          // role === 'function' ? (
          //   <Component {...JSON.parse(content)} />
          // ) : (
          //   content
          // ),
      }));
    }
  },  
  initialAIState: [],
  initialUIState: [],
});

function buildUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]!.toString());
  });
  return url.toString();
}

function saveChatToDB(state: ServerMessage[]) {
  console.log("saveChatToDB");
  console.log(state);
}

export async function loadChatFromDB(): Promise<ServerMessage[]> {
  console.log("loadChatFromDB");
  const messages = await db.query.messages.findMany();
  console.log(messages);
  // const chat = posts.map(({name, createdAt}) => ({
  //   role: (name as "user" | "assistant")!, 
  //   content: createdAt.toLocaleDateString()
  // }));
  // console.log(chat);
  const chat = messages as ServerMessage[];
  console.log(chat);
  return chat;
}
