"use client";
import * as React from "react"
import { Button } from "./button"


const NewConvoButton = ({ newConversation }: { newConversation: any }) => {
  return (
    <Button className="w-8 h-8" variant="ghost" size="icon"
      onClick={async () => {
        newConversation();
      }}
    >
      <PlusIcon className="w-5 h-5" />
      <span className="sr-only">New Conversation</span>
    </Button>
  )
}
NewConvoButton.displayName = "NewConvoButton"

function PlusIcon(props: any) {
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

export { NewConvoButton }
