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
        // onGetUIState: async () => {
        //     'use server';
        
        //     console.log("onGetUIState");
        //     const historyFromDB: ServerMessage[] = await loadMessagesFromDB(conversationId);
        //     const historyFromApp: ServerMessage[] = getAIState() as ServerMessage[];
        
        //     // If the history from the database is different from the
        //     // history in the app, they're not in sync so return the UIState
        //     // based on the history from the database
        
        //     if (historyFromDB.length !== historyFromApp.length) {
        //         return historyFromDB.map(({ id, role, content }) => ({
        //             id,
        //             role,
        //             display: hydrateComponentForContent(content)
        //         }));
        //     }
        // },
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
