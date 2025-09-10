import { Button } from "@/components/ui/button";
import { SidebarTrigger} from "@/components/ui/sidebar"

export default function Home() {
  return (
    <div className="flex flex-col items-center py-2 px-4 sm:px-6 lg:px-8 gap-[48px] bg-blue-100 min-h-screen w-screen">
      <main className="flex flex-1 flex-col gap-[36px] min-h-screen w-screen">
        <div className="flex items-center justify-between w-full px-4 py-2">
          <SidebarTrigger className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background gap-4 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium sm:h-12 px-4 sm:w-auto whitespace-nowrap">
            Toggle Sidebar
          </SidebarTrigger>
          <h1 className="sm:text-3xl font-bold text-center flex-1">
            Welcome to <a className="text-[#0070f3]">AI Family Law Helper!</a>
          </h1>
        </div>
        <div className="flex-1 w-full px-4 py-2 overflow-y-auto bg-white">
          Chat messages!
        </div>
        <footer className="sticky bottom-0 left-0 right-0 flex gap-2 items-center mb-8 w-full px-4">
          <input
            className="rounded-full border border-solid border-transparent flex-1 bg-foreground text-background font-medium text-sm sm:text-base h-10 sm:h-12 px-4 py-4"
            type="text"
            placeholder="Type Message here..."
          />
          <Button className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 w-auto">
            Send
          </Button>
        </footer>
      </main>
    </div>
  );
}