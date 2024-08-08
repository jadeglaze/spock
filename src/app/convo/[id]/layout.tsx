import { type JSONValue, UnsupportedJSONSchemaError } from "ai";
import { createAI } from "ai/rsc";
import type { ReactNode } from "react";
import { type ClientMessage, continueConversation, loadMessagesFromDB, saveMessagesToDB, type ServerMessage } from "~/app/action"
import type { Joke } from "~/app/joke";
import { JokeComponent } from "~/components/ui/joke-component";
import { QRComponent } from "~/components/ui/qr-component";
import { WolframAlphaComponent } from "~/components/ui/wolframalpha-component";

export default async function AIProviderWrapperLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode, params: {id: string} }>) {
    console.log(`AIProviderWrapperLayout with id=${params.id}`)
    const conversationId = parseInt(params.id);

    const AI = createAI<ServerMessage[], ClientMessage[]>({
        actions: {
          continueConversation,
        },
        onSetAIState: async ({ state, done }) => {
            'use server';
        
            if (done) {
              await saveMessagesToDB(conversationId, state);
            }
        },
        initialAIState: await loadMessagesFromDB(conversationId),
        initialUIState: (await loadMessagesFromDB(conversationId)).map(({ id, role, content }: ServerMessage) => ({
          id,
          role,
          display: hydrateComponentForContent(content)
        })),
    });

    return (
        <AI>
            {children}
        </AI>
    );
}

type WoldramAlphaType = {input: string, result: string};

function hydrateComponentForContent(content: string): ReactNode {
    const { kind, data } = JSON.parse(content) as {kind: string, data: JSONValue};
    switch (kind) {
      case "joke":
        return <JokeComponent joke={data as Joke} />
      case "qr":
        return <QRComponent url={data as string} />
      case "wolframAlpha":
        return <WolframAlphaComponent input={(data as WoldramAlphaType).input} result={(data as WoldramAlphaType).result} />
      case "text":
        return <div>{data as string}</div>
      default:
        throw new UnsupportedJSONSchemaError({schema: kind, reason: "Because Jade didn't do that yet."})
    }
}
