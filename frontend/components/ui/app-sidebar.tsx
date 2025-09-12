import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Plus } from "lucide-react"

type Conversation = {
  id: number
  title: string
}

export function AppSidebar({
  conversations,
  onSelectConversation,
  onNewConversation,
  children,
}: {
  conversations: Conversation[]
  onSelectConversation: (id: number) => void
  onNewConversation: () => void
  children?: React.ReactNode;
}) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Past Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton asChild>
                    <button
                      className="flex items-center gap-2 w-full text-left"
                      onClick={() => onSelectConversation(conv.id)}
                    >
                      <span>{conv.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Loading circle */}
              {children}

              {/* New Chat button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    className="flex items-center gap-2 w-full text-left text-blue-600 hover:text-blue-800"
                    onClick={onNewConversation}
                  >
                    <Plus size={16} />
                    <span>New Chat</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
