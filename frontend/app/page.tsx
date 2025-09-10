"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar";

  type Message = {
    text: string;
    sender: "user" | "assistant";
  }

  type Conversation = {
    id: number;
    title: string;
  }

export default function Home() {

  const [conversations, setConversations] = useState<Conversation[]>([
    // Example conversation names
    { id: 1, title: "Divorce Process" },
    { id: 2, title: "Child Custody" },
    { id: 3, title: "Property Division" },
  ])

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

  // Organise messages by conversation ID
  const [conversationMessages, setConversationMessages] = useState<{ [key: number]: Message[] }>({});

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get messages for the active conversation
  const messages = activeConversationId != null ? (conversationMessages[activeConversationId] || []) : [];

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
    // TODO: Fetch messages for this conversation from backend if needed
    // For now, we use placeholder messages
    setConversationMessages(prev => ({
      ...prev,
      [id]: prev[id] || [
        { text: "Hello, how can I assist you with family law today?", sender: "assistant" }
      ]
    }));
  }

  const handleNewConversation = () => {
    const newConversationId = conversations.length + 1;
    const newConversation: Conversation = { id: newConversationId, title: "New Conversation" };
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversationId);
    setConversationMessages(prev => ({
      ...prev,
      [newConversationId]: [
        { text: "Hello, how can I assist you with family law today?", sender: "assistant" }
      ]
    }));
  }


  const handleSend = async () => {
    if (!input.trim()) return;

    const sentMessage: Message = { text: input.trim(), sender: "user" };

    if(activeConversationId === null) {
      handleNewConversation();
    }

    if(activeConversationId === null) return; // Safety check

    // Add user message to current conversation
    setConversationMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), sentMessage],
    }))

    if(conversations[activeConversationId - 1]?.title === "New Conversation") {
      // Update title of conversation based on first user message
      setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, title: input.trim().slice(0, 20) + (input.trim().length > 20 ? "..." : "") } : conv));
    }

    setInput(""); // makes the chat box empty again

    // call API here to get response from assistant
      try {
        const res = await fetch("http://127.0.0.1:8000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: input.trim(),
            conversationId: activeConversationId
          }),
        });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      setConversationMessages((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), { text: data.answer, sender: "assistant" }],
      }))
    }
    catch (error) {
      console.error("Error fetching assistant response:", error);
            setConversationMessages((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), { text: "Sorry, there was an issue retrieving your message", sender: "assistant" }],
      }))
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden`}>
        <AppSidebar
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between w-full px-4 py-2 bg-gray-200 shadow-sm">
          <SidebarTrigger
            onClick={() => setSidebarOpen(prev => !prev)}
            className="rounded-full px-4 py-2 bg-gray-800 text-white"
          >
            {sidebarOpen ? "Close" : "Open"} Sidebar
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

        {/* Footer */}
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
    </div>

  )
}