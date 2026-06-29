import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import AmbientBackground from '../ui/AmbientBackground';
import { SidebarProvider } from '../../context/SidebarContext';

export default function AppLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <SidebarProvider>
      <AmbientBackground />
      <div className="flex min-h-screen bg-transparent">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SidebarProvider>
  );
}
