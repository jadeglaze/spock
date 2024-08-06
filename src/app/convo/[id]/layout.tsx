import { createAI, getAIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { ClientMessage, continueConversation, loadChatFromDB, saveChatToDB, ServerMessage } from "~/app/action"

export default async function AIProviderWrapperLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode, params: {id: string} }>) {
    console.log(`AIProviderWrapperLayout with id=${params.id}`)
    const conversationId = parseInt(params.id)!;

    // TODO: Can get the conversation ID param here so
    //  - can load the appopriate convo from the DB
    //  - can pass functions to the AI provider that close around the ID
    const AI = createAI<ServerMessage[], ClientMessage[]>({
        actions: {
          continueConversation,
        },
        onSetAIState: async ({ state, done }: {state: any, done: any}) => {
            'use server';
        
            if (done) {
              saveChatToDB(conversationId, state);
            }
        },
        onGetUIState: async () => {
            'use server';
        
            console.log("onGetUIState");
            const historyFromDB: ServerMessage[] = await loadChatFromDB(conversationId);
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

    return (
        <AI>
            {children}
        </AI>
    );
}
