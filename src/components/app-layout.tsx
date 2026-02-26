import React, { useState } from 'react';
import { LogOut, Bell, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

export interface Notification {
    id: string;
    text: string;
    targetTab: string;
    type: 'info' | 'warning' | 'success';
}

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications?: Notification[];
  onClearNotification?: (id: string) => void;
  onNavigateWithContext?: (tab: string, contextId?: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, notifications = [] }) => {
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={24} />
          <span className="font-bold text-slate-800 tracking-tight">Vett & Venture</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
