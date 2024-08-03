import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Balloon, BalloonProps } from "./balloon"
import { Textarea } from "./textarea"
import { Button } from "./button"


export interface ConvoProps {
  title: string,
  messages: BalloonProps[]
}

const Convo = React.forwardRef<HTMLDivElement, ConvoProps>(
  ({ title, messages }, ref) => {
    return (
      <div className="flex flex-col">
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border">
              <AvatarImage src="/placeholder-user.jpg" alt="Image" />
              <AvatarFallback>OA</AvatarFallback>
            </Avatar>
            <div className="font-medium">{title}</div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-4">
            {messages.map((m) => <Balloon isUser={m.isUser} who={m.who} text={m.text} />)}
          </div>
        </div>
        <div className="sticky bottom-0 bg-background py-2 px-4">
          <div className="relative">
            <Textarea
              placeholder="Message ChatGPT..."
              name="message"
              id="message"
              rows={2}
              className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
            />
            <Button type="submit" size="icon" className="absolute w-8 h-8 top-3 right-3">
              <ArrowUpIcon className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }
)
Convo.displayName = "Convo"


function ArrowUpIcon(props) {
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
  

export { Convo }
