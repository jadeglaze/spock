import { UnsupportedJSONSchemaError } from "ai";
import { createAI, getAIState } from "ai/rsc";
import { ReactNode } from "react";
import { ClientMessage, continueConversation, loadMessagesFromDB, saveMessagesToDB, ServerMessage } from "~/app/action"
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
        onSetAIState: async ({ state, done }: {state: any, done: any}) => {
            'use server';
        
            if (done) {
              saveMessagesToDB(conversationId, state);
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

function hydrateComponentForContent(content: string): ReactNode {
    const { kind, data } = JSON.parse(content);
    switch (kind) {
      case "joke":
        return <JokeComponent joke={data} />
      case "qr":
        return <QRComponent url={data} />
      case "wolframAlpha":
        return <WolframAlphaComponent input={data.input} result={data.result} />
      case "text":
        return <div>{data}</div>
      default:
        throw new UnsupportedJSONSchemaError({schema: kind, reason: "Because Jade didn't do that yet."})
    }
}
