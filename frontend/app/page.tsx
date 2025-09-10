"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger} from "@/components/ui/sidebar"

export default function Home() {
  type Message = {
    text: string;
    sender: "user" | "assistant";
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev, 
      { 
        text: input.trim(), sender: "user"
      }]);

    setInput(""); // makes the chat box empty again
  };

  // TODO: Scroll to bottom whenever messages change (Doesnt work yet)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-blue-100">
      {/* Header welcome text */}
      <header className="flex items-center justify-between w-full px-4 py-2 bg-blue-200 shadow-sm">
        <SidebarTrigger className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background gap-4 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium sm:h-12 px-4 sm:w-auto whitespace-nowrap">
          Toggle Sidebar
        </SidebarTrigger>
        <h1 className="sm:text-3xl font-bold text-center flex-1">
          Welcome to <span className="text-[#0070f3]">AI Family Law Helper!</span>
        </h1>
      </header>

      {/* Scrollable chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-2 bg-white">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`inline-block max-w-[70%] p-3 rounded-2xl shadow-md text-sm sm:text-base break-all
                  ${msg.sender === "user" ? "self-end bg-green-200 text-gray-900" : "self-start bg-blue-100 text-gray-800"}`}
                ref={idx === messages.length - 1 ? scrollRef : null}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </ScrollArea>
      </main>

      {/* Footer with message box*/}
      <footer className="flex gap-2 items-center w-full px-4 py-2 bg-white border-t border-gray-200">
        <Input
          type="text"
          placeholder="Type your message here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="rounded-full border border-solid border-gray-300 flex-1 font-medium text-sm sm:text-base h-10 sm:h-12"
        />
        <Button className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 w-auto">
          Send
        </Button>
      </footer>
    </div>
  );
}