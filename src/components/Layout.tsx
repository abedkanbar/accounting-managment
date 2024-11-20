import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { ScrollArea } from './ui/scroll-area';

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
      <div className="flex-1">
        <ScrollArea className="h-screen">
          <main className="p-8">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}