import * as React from "react"

import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"


export interface BalloonProps {
  children: React.ReactNode,
  isUser: boolean,
  who: string,
}

const Balloon = ({ children, isUser, who }: BalloonProps) => {
  return (
    <div className={"flex items-start gap-4" + (isUser ? " justify-end" : "")}>
      {!isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarImage src="/placeholder-user.jpg" alt="Image" />
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
      )}
      <div className={(isUser ? "bg-primary text-primary-foreground" : "bg-muted") + " p-3 max-w-[80%] rounded-2xl"}>
        <div className="font-medium">{who}</div>
        <div className="prose text-muted-foreground">
          {children}
        </div>
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarImage src="/placeholder-user.jpg" alt="Image" />
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
      )}
    </div>    
  )
}

Balloon.displayName = "Balloon"

export { Balloon }
