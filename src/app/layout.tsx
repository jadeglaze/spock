import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ConvoLink } from "~/components/ui/convolink"
import Link from "next/link";
import { db } from "~/server/db";
import { NewConvoButton } from "~/components/ui/newconvobutton";
import { newConversation } from "./action";

export const metadata: Metadata = {
  title: "Kirk",
  description: "An emotional robot.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const dateFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
  };

  const convos = await db.query.conversations.findMany();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <div className="flex flex-row min-h-screen w-full bg-background">
          <div className="w-1/5 border-r bg-muted/40 max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-input flex items-center justify-between px-4 py-3 border-b">
              <div className="text-lg font-medium">
                <Link href="/" prefetch={false}>Conversations</Link>
              </div>
              <NewConvoButton newConversation={newConversation} />
            </div>
            <div className="flex-1 overflow-auto">
              <div className="grid gap-2 p-4">
                {convos.map(({ id, createdAt }) => (
                  <ConvoLink
                    key={id.toString()}
                    href={`/convo/${id.toString()}`}
                    title={`#${id.toString()} from ${createdAt.toLocaleString(undefined, dateFormat)}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
