"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Spinner } from '@/components/ui/shadcn-io/spinner';

  type Message = {
    text: string;
    sender: "user" | "assistant";
  }

  type Conversation = {
    id: number;
    title: string;
  }

export default function Home() {

  const [conversations, setConversations] = useState<Conversation[]>([])

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

  // Organise messages by conversation ID
  const [conversationMessages, setConversationMessages] = useState<{ [key: number]: Message[] }>({});

  const [isTyping, setTyping] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isLoadingConversations, setLoadingConversations] = useState(false);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get messages for the active conversation
  const messages = useMemo(() => {
    return activeConversationId != null
      ? (conversationMessages[activeConversationId] || [])
      : [];
  }, [conversationMessages, activeConversationId]);

  const loadConversationTitles = async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch(`https://ai-family-law-helper.onrender.com/conversations`, {
        method: "GET",
        headers: { "Content-Type": "application/json"},
      });
      if(!res.ok) {
        throw new Error("Error fetching conversation titles");
      }

      const data = await res.json();

      setConversations(data);
    }
    catch (error){
      console.error("Failure fetching conversations from API", error);
    }
    finally {
      setLoadingConversations(false);
    }
  }

  const handleSelectConversation =  async (id: number) => {
    setActiveConversationId(id);
    // Fetch messages from the backend
    setLoading(true)
    try {
      const res = await fetch(`https://ai-family-law-helper.onrender.com/conversations/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json"},
      });
      if(!res.ok) {
        throw new Error("Error fetching conversation" + id);
      }

      const data = await res.json();
     
      setConversationMessages(prev => ({
        ...prev,
        [id]: data.length > 0 ? data : [
          { text: "Hello, how can I assist you with family law today?", sender: "assistant" }
        ]
      }));
    }
    catch (error) {
      console.log(error);
      // If it fails, just say error fetching:
      setConversationMessages(prev => ({
        ...prev,
        [id]: [{text: "Error fetching conversation history", sender: "assistant"}]
      }));
    }
    finally
    {
      setLoading(false)
    }
  }

  const handleNewConversation = async (): Promise<number | null> => {
    // Call API and create the conversation in the database. I feel this data flow is wrong. If this was production I would probably change it.
    const number = conversations.length + 1
    try {
      const res = await fetch("https://ai-family-law-helper.onrender.com/newConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Conversation " + number
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();

      const newConversationId = data.conversation_id;

      const newConversation: Conversation = { id: newConversationId, title: "Conversation " + number };
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationId(newConversationId);
      setConversationMessages(prev => ({
        ...prev,
        [newConversationId]: [
          { text: "Hello, how can I assist you with family law today?", sender: "assistant" }
        ]
      }));
      return newConversationId;
    }
    catch (error) {
      console.log(error)
      return null
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const sentMessage: Message = { text: input.trim(), sender: "user" };

    let conversationId = activeConversationId;

    if(activeConversationId === null) {
      conversationId = await handleNewConversation();
      console.log(conversationId)
    }

    console.log(conversationId);
    if(conversationId === null) return; // Safety check
    console.log("THERE")

    // Add user message to current conversation
    setConversationMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), sentMessage],
    }))

    if(conversations[conversationId - 1]?.title === "New Conversation") {
      // Update title of conversation based on first user message
      setConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, title: input.trim().slice(0, 20) + (input.trim().length > 20 ? "..." : "") } : conv));
    }

    setInput(""); // makes the chat box empty again
    setTyping(true);

    // call API here to get response from assistant
    try {
      const res = await fetch("https://ai-family-law-helper.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input.trim(),
          conversation_id: conversationId
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      setConversationMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), { text: data.answer, sender: "assistant" }],
      }))
    }
    catch (error) {
      console.error("Error fetching assistant response:", error);
            setConversationMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), { text: "Sorry, there was an issue retrieving your message", sender: "assistant" }],
      }))
    }
    finally {
      setTyping(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Load the conversation from API
  useEffect(() => {
    loadConversationTitles();
  }, []);

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="transition-all duration-300 overflow-hidden">
        <AppSidebar
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        >
          {isLoadingConversations && <div className="flex justify-center">
            <Spinner variant="circle" />
          </div>}
        </AppSidebar>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between w-full px-4 py-2 bg-gray-200 shadow-sm">
          <SidebarTrigger
            className="rounded-full px-4 py-2 bg-gray-800 text-white"
          >
            Sidebar
          </SidebarTrigger>
          <h1 className="sm:text-3xl font-bold text-center flex-1 p-2">
            Welcome to <span className="text-[#0070f3]">AI Family Law Helper!</span>
          </h1>
        </header>

        {/* Scrollable chat area */}
        <main className="flex-1 overflow-y-auto px-4 py-2 bg-white">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-3">
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
              {/* Shows when it is waiting for a response */}
              {isTyping && <div className="assistant-msg self-start bg-blue-100 text-gray-800 inline-block max-w-[70%] p-3 rounded-2xl shadow-md text-sm sm:text-base break-all">Typing...</div>}
              {/* Shows when loading chat messages */}
              {isLoading && <div className= "p-4"> 
                <Spinner variant="circle" className="mx-auto"/>
              </div>}
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
          <Button 
            className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 w-auto"
            onClick={handleSend}
          >
            Send
          </Button>
        </footer>
      </div>
    </div>

  )
}