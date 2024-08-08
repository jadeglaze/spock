"use client";

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Balloon } from "~/components/ui/balloon"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { useState } from "react"
import { useActions, useUIState } from "ai/rsc"
import type { ClientMessage } from "~/app/action"
import { nanoid } from "nanoid"


export default function Page({ params }: { params: { id: string } }) {
    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useUIState();
    const { continueConversation } = useActions();

    return (
        <div className="flex flex-col">
            <div className="sticky top-0 bg-input flex items-center justify-between px-4 py-3 border-b bg-background">
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                        <AvatarFallback>OA</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{params.id}</div>
                </div>
            </div>
            <div className="max-w-[1200px] flex-1 overflow-auto p-4">
                <div className="grid gap-4">
                    {conversation.map((message: ClientMessage) => (
                        <div key={message.id}>
                            <Balloon isUser={message.role == "user"} who={message.role}>
                                {message.display}
                            </Balloon>
                        </div>
                    ))}
                </div>
            </div>
            <div className="max-w-[1200px] sticky bottom-0 bg-background py-2 px-4">
                <form
                    onSubmit={async (e) => {
                        const newUserId = nanoid();
                        e.preventDefault();
                        setInput("");
                        setConversation((currentConversation: ClientMessage[]) => [
                            ...currentConversation,
                            { id: newUserId, role: "user", display: input },
                        ]);

                        const message = await continueConversation(newUserId, input) as Promise<ClientMessage>;

                        setConversation((currentConversation: ClientMessage[]) => [
                            ...currentConversation,
                            message,
                        ] as ClientMessage[]);
                    }}
                >
                    <div className="relative">
                        <Textarea
                            placeholder="Message to Kirk..."
                            value={input}
                            name="message"
                            id="message"
                            rows={2}
                            className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
                            onChange={(event) => {
                                setInput(event.target.value);
                            }}
                        />
                        <Button type="submit" size="icon" className="absolute w-8 h-8 top-3 right-3">
                            <ArrowUpIcon className="w-4 h-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}


function ArrowUpIcon<T>(props: T) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
        </svg>
    )
}
