import { createAI } from "ai/rsc";
import type { ClientMessage, ServerMessage, ServerMessageContent } from "~/app/action"
import { continueConversation, loadMessagesFromDB, resolvePromisesSequentially, saveMessagesToDB, selectComponentForContent } from "~/app/action"

export default async function AIProviderWrapperLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode, params: { id: string } }>) {
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
    initialUIState: await resolvePromisesSequentially(
      (await loadMessagesFromDB(conversationId)).map(async ({ id, role, content }: ServerMessage) => ({
        id,
        role,
        display: await selectComponentForContent(JSON.parse(content) as ServerMessageContent)
      }))
    ),
  });

  return (
    <AI>
      {children}
    </AI>
  );
}
