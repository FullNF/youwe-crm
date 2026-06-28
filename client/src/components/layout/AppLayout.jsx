import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarProvider } from '../../context/SidebarContext';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-base">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
