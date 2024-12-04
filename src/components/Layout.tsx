import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { ScrollArea } from './ui/scroll-area';
import { UserNav } from './UserNav';

export default function Layout() {
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 sidebar">
        <div className="sidebar-logo p-6 pb-4">
          <h1 className="app-title text-2xl">
            Association Al Nour
          </h1>
        </div>
        <Navbar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white px-6 flex items-center justify-end">
          <UserNav />
        </header>
        <ScrollArea className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}