import { headers } from "next/headers"
import Link from "next/link"
import * as React from "react"

import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"


export interface ConvoLinkProps {
  href: string,
  title: string,
}

const ConvoLink = ({ href, title }: ConvoLinkProps) => {
  const heads = headers()
  const pathname = heads.get('next-url') 
  const isActive = (href == pathname)

  return (
    <Link
        href={href}
        className={"flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors" + (isActive ? " bg-muted" : "")}
        prefetch={false}
    >
        <Avatar className="w-8 h-8 border">
            <AvatarImage src="/placeholder-user.jpg" alt="Image" />
            <AvatarFallback>YO</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
            <div className="font-medium truncate">{title}</div>
            <div className="text-sm text-muted-foreground truncate">
                ...Insert ChatGPT convo summary here...
            </div>
        </div>
    </Link>
  )
}

ConvoLink.displayName = "ConvoLink"

export { ConvoLink }
