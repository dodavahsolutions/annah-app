import { useState, useCallback } from 'react';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { ToolsPanel } from './components/ToolsPanel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import './App.css';

function App() {
  const isDesktop = useIsDesktop();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navPrompt, setNavPrompt] = useState<string | undefined>();
  const [exportTrigger, setExportTrigger] = useState(0);

  const handleNavClick = useCallback((prompt: string) => {
    setNavPrompt(prompt);
    setSidebarOpen(false);
  }, []);

  const handleNavHandled = useCallback(() => setNavPrompt(undefined), []);

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden' }}>

      {isDesktop && <Sidebar onNavClick={handleNavClick} />}

      {!isDesktop && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px] border-r border-border">
            <Sidebar onNavClick={handleNavClick} />
          </SheetContent>
        </Sheet>
      )}

      {/* centre column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <Header onMenuClick={() => setSidebarOpen(true)} onExport={() => setExportTrigger(t => t+1)} />

        {/* chat + tools row */}
        <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>
          <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
            <ChatArea externalMessage={navPrompt} onExternalHandled={handleNavHandled} exportTrigger={exportTrigger} />
          </main>

          {isDesktop && (
            <div style={{ width:'360px', flexShrink:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <ToolsPanel />
            </div>
          )}
        </div>
      </div>

      {!isDesktop && (
        <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.5 }} className="fixed bottom-6 right-6 z-50">
          <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600">
                <Calculator className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full sm:w-[400px] border-l border-border">
              <ToolsPanel />
            </SheetContent>
          </Sheet>
        </motion.div>
      )}
    </div>
  );
}

export default App;
