import { Button } from "~/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Convo } from "./ui/convo"

export function Spock() {
  return (
    <div className="grid md:grid-cols-[300px_1fr] min-h-screen w-full bg-background">
      <div className="flex flex-col border-r bg-muted/40">
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b">
          <div className="text-lg font-medium">Conversations</div>
          <Button variant="ghost" size="icon">
            <PlusIcon className="w-5 h-5" />
            <span className="sr-only">New Conversation</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="grid gap-2 p-4">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
              prefetch={false}
            >
              <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">Airplane Turbulence</div>
                <div className="text-sm text-muted-foreground truncate">
                  Explaining turbulence to a first-time flyer...
                </div>
              </div>
              <div className="text-xs text-muted-foreground">2h</div>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
              prefetch={false}
            >
              <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">Chat App Development</div>
                <div className="text-sm text-muted-foreground truncate">How to build a chat app with React...</div>
              </div>
              <div className="text-xs text-muted-foreground">1d</div>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
              prefetch={false}
            >
              <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">Cooking Disaster</div>
                <div className="text-sm text-muted-foreground truncate">A recipe for disaster in the kitchen...</div>
              </div>
              <div className="text-xs text-muted-foreground">3d</div>
            </Link>
          </div>
        </div>
      </div>
      <Convo 
        title="Conversation" 
        messages={[
          {isUser: true, who: "You", text: "Can you explain airplane turbulence?"}, 
          {isUser: false, who: "Jippity", text: "Sure! I'm overly enthusiastic about everything!"}, 
        ]}
      />
    </div>
  )
}


function MoveVerticalIcon(props) {
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
      <polyline points="8 18 12 22 16 18" />
      <polyline points="8 6 12 2 16 6" />
      <line x1="12" x2="12" y1="2" y2="22" />
    </svg>
  )
}


function PlusIcon(props) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
