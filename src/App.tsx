import React, { useState, useEffect } from 'react';
import Layout, { Notification } from './components/layout';
import Login from './pages/Login';
import Dashboard from './pages/founder/Dashboard';
import PitchList from './pages/founder/PitchList';
import PitchDeck from './pages/founder/PitchDeck';
import Meetings from './pages/founder/Meetings';
import Resources from './pages/founder/Resources';
import Roadmap from './pages/founder/Roadmap';
import Projections from './pages/founder/Projections';
import Contract from './pages/founder/Contract';
import Bootcamp from './pages/founder/Bootcamp';
import DueDiligence from './pages/founder/DueDiligence';
import AnalystVentures from './pages/investor/AnalystVentures';
import AnalystAnalysis from './pages/investor/AnalystAnalysis';
import AnalystDiligence from './pages/investor/AnalystDiligence';
import AnalystContracts from './pages/investor/AnalystContracts';
import AnalystVentureDashboard from './pages/investor/AnalystVentureDashboard';
import AnalystPortfolio from './pages/investor/AnalystPortfolio';
import { User, UserRole, PitchData } from './types';
import { getSamplePitch } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('venta_user') || 'null');
    } catch { return null; }
  });
  
  const [pitches, setPitches] = useState<PitchData[]>(() => {
    try {
      const saved = localStorage.getItem('venta_pitches');
      if (saved && saved !== '[]') return JSON.parse(saved);
      return []; 
    } catch { return []; }
  });

  const [currentPitchId, setCurrentPitchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pitch-list');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  const [userRegistry, setUserRegistry] = useState<User[]>(() => {
      try {
          const saved = localStorage.getItem('venta_users_db');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('venta_pitches', JSON.stringify(pitches));
    localStorage.setItem('venta_users_db', JSON.stringify(userRegistry));
    generateNotifications();
  }, [pitches, user, currentPitchId, dismissedNotifs, userRegistry]);

  const currentPitch = pitches.find(p => p.id === currentPitchId) || null;

  const generateNotifications = () => {
    const notifs: Notification[] = [];
    if (user?.role === 'founder' && currentPitch) {
        if (currentPitch.stage === 'contract' && !currentPitch.contractSignature) {
            notifs.push({ id: 'contract-1', text: 'Legal contract ready for your signature.', targetTab: 'contract', type: 'warning' });
        }
    }
    setNotifications(notifs);
  };

  const handleDismissNotification = (id: string) => {
      setDismissedNotifs(prev => new Set(prev).add(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = (role: UserRole, name: string, email: string, isRegistering: boolean, companyName?: string) => {
    const activeUser = { id: crypto.randomUUID(), name, email, role };
    setUser(activeUser);
    localStorage.setItem('venta_user', JSON.stringify(activeUser));
    if (role === 'founder' && isRegistering && companyName) {
        const newPitch: PitchData = { id: crypto.randomUUID(), companyName, stage: 'idea', lastUpdated: new Date().toISOString() } as any;
        setPitches(prev => [...prev, newPitch]);
        setCurrentPitchId(newPitch.id);
        setActiveTab('dashboard');
    }
  };

  const updatePitch = (d: Partial<PitchData> & { id: string }) => {
      setPitches(prev => prev.map(p => p.id === d.id ? { ...p, ...d } : p));
  };

  const handleNavigateWithContext = (tab: string, contextId?: string) => {
      if (contextId) setCurrentPitchId(contextId);
      setActiveTab(tab);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Layout 
        user={user} 
        onLogout={() => { setUser(null); localStorage.removeItem('venta_user'); }} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        notifications={notifications}
        onClearNotification={handleDismissNotification}
        onNavigateWithContext={handleNavigateWithContext}
    >
      <div className="p-4">
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Vett & Venture</h1>
          <p className="text-slate-500">Your professional workspace is ready.</p>
      </div>
    </Layout>
  );
};

export default App;
