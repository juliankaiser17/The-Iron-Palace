import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  BarChart3, 
  Activity, 
  Stethoscope, 
  Dna, 
  Swords, 
  Castle, 
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { Dashboard } from '../views/Dashboard';
import { Tracks } from '../views/Tracks';
import { Recovery } from '../views/Recovery';
import { Injuries } from '../views/Injuries';
import { PalaceState } from '../views/PalaceState';
import { Legion } from '../views/Legion';
import { PalaceHub } from '../views/PalaceHub';
import { cn } from '../../lib/utils';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface ShellProps {
  user: User;
  profile: UserProfile | null;
}

type ViewId = 'dashboard' | 'tracks' | 'recovery' | 'injuries' | 'palace-state' | 'legion' | 'palace-hub';

export const Shell: React.FC<ShellProps> = ({ user, profile }) => {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap },
    { id: 'tracks', label: 'Tracks', icon: BarChart3 },
    { id: 'recovery', label: 'Recovery', icon: Activity },
    { id: 'injuries', label: 'Injuries', icon: Stethoscope },
    { id: 'palace-state', label: 'Palace State', icon: Dna },
    { id: 'legion', label: 'Legion', icon: Swords, coachOnly: true },
    { id: 'palace-hub', label: 'Palace Hub', icon: Castle },
  ];

  const filteredNavItems = navItems.filter(item => !item.coachOnly || profile?.role === 'coach');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard profile={profile} />;
      case 'tracks': return <Tracks profile={profile} />;
      case 'recovery': return <Recovery profile={profile} />;
      case 'injuries': return <Injuries />;
      case 'palace-state': return <PalaceState profile={profile} />;
      case 'legion': return <Legion profile={profile} />;
      case 'palace-hub': return <PalaceHub profile={profile} />;
      default: return <Dashboard profile={profile} />;
    }
  };

  return (
    <div className="flex h-screen bg-bg text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-black/40 border-r border-white/5 backdrop-blur-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="font-display text-sm tracking-[0.4em] text-white">
            IRON PALACE
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewId)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all group relative overflow-hidden",
                activeView === item.id 
                  ? "bg-accent/10 border-l-2 border-accent text-white" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              <item.icon size={18} className={cn("transition-colors", activeView === item.id ? "text-accent" : "group-hover:text-white")} />
              <span className="font-mono text-[11px] uppercase tracking-widest">{item.label}</span>
              {activeView === item.id && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm">
            <div className="w-8 h-8 bg-accent text-black flex items-center justify-center font-display text-xs font-bold shrink-0">
              {profile?.name?.[0] || user.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider truncate">
                {profile?.name || user.email?.split('@')[0]}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{profile?.role || 'User'}</div>
            </div>
          </div>
          
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all font-mono text-[10px] uppercase tracking-widest"
          >
            <LogOut size={12} />
            Terminent Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-black border-b border-white/5 z-50">
          <div className="font-display text-xs tracking-[0.3em]">IRON PALACE</div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* View Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 md:p-10 max-w-7xl mx-auto w-full"
            >
              <ErrorBoundary>
                {renderActiveView()}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-40 bg-bg md:hidden p-8 flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center gap-4">
                {filteredNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ViewId);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-6 py-4 text-left border-b border-white/5",
                      activeView === item.id ? "text-accent border-accent/20" : "text-zinc-500"
                    )}
                  >
                    <item.icon size={24} />
                    <span className="font-display text-lg tracking-[0.2em] uppercase">{item.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => auth.signOut()}
                className="mt-8 flex items-center justify-center gap-3 py-6 bg-red-500/10 text-red-500 font-display text-sm tracking-[0.3em] uppercase"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
