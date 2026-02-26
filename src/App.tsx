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
  // Check for existing user in localStorage
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

  // Mock "Database" for registered users
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

  useEffect(() => {
     if (notifications.length > 0) {
         setNotifications(prev => prev.filter(n => n.targetTab !== activeTab));
     }
  }, [activeTab]);

  const currentPitch = pitches.find(p => p.id === currentPitchId) || null;

  const generateNotifications = () => {
    const notifs: Notification[] = [];
    
    if (user?.role === 'founder' && currentPitch) {
        const unconfirmedMeetings = currentPitch.meetings?.filter(m => m.status === 'scheduled');
        if (unconfirmedMeetings && unconfirmedMeetings.length > 0) {
            notifs.push({ id: 'meet-1', text: 'You have a new meeting request to confirm.', targetTab: 'meetings', type: 'info' });
        }
        
        const updatedAgenda = currentPitch.meetings?.some(m => m.agenda && m.agendaLastUpdated && new Date(m.agendaLastUpdated) > new Date(Date.now() - 86400000));
        if (updatedAgenda) {
            notifs.push({ id: 'agenda-upd', text: 'Analyst updated the meeting agenda.', targetTab: 'meetings', type: 'info' });
        }

        if (currentPitch.stage === 'contract' && !currentPitch.contractSignature) {
            notifs.push({ id: 'contract-1', text: 'Legal contract ready for your signature.', targetTab: 'contract', type: 'warning' });
        }
        
        const approvedMtg = currentPitch.meetings?.some(m => m.status === 'approved');
        if (approvedMtg && !currentPitch.physicalDetails?.verifiedAt) {
            notifs.push({ id: 'dil-1', text: 'Meeting approved. Please complete due diligence.', targetTab: 'diligence', type: 'success' });
        }

        if (currentPitch.stage === 'bootcamp' && currentPitch.analystSignature && currentPitch.contractSignature) {
            if(currentPitch.bootcampCurrentWeek === 1) {
                notifs.push({ id: 'boot-1', text: 'Bootcamp access granted. Start Week 1.', targetTab: 'bootcamp', type: 'success' });
            }
        }
    } else if (user?.role === 'investor' || user?.role === 'analyst') {
        const newVentures = pitches.filter(p => (p.analysis?.overallScore || 0) > 0 && p.stage === 'idea');
        if(newVentures.length > 0) {
             notifs.push({ id: 'inv-ven', text: `${newVentures.length} new qualified ventures in pipeline.`, targetTab: 'analyst-ventures', type: 'info' });
        }

        const pendingContracts = pitches.filter(p => p.stage === 'contract' && p.contractSignature && !p.analystSignature);
        pendingContracts.forEach(p => {
             const id = `inv-con-${p.id}`;
             if (!dismissedNotifs.has(id)) {
                notifs.push({ id, text: `Contract ready for ${p.companyName}`, targetTab: 'analyst-contracts', contextData: p.id, type: 'warning' });
             }
        });

        const pendingDiligence = pitches.filter(p => p.physicalDetails?.verifiedAt && p.stage !== 'contract' && p.stage !== 'bootcamp');
        pendingDiligence.forEach(p => {
            const id = `inv-dil-${p.id}`;
            if (!dismissedNotifs.has(id)) {
                notifs.push({ id, text: `Diligence ready for ${p.companyName}`, targetTab: 'analyst-diligence', contextData: p.id, type: 'info' });
            }
        });
    }
    
    setNotifications(prev => {
        const pStr = JSON.stringify(prev);
        const nStr = JSON.stringify(notifs);
        return pStr !== nStr ? notifs : prev;
    });
  };

  const handleDismissNotification = (id: string) => {
      setDismissedNotifs(prev => new Set(prev).add(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = (role: UserRole, name: string, email: string, isRegistering: boolean, companyName?: string) => {
    let activeUser: User;

    if (isRegistering) {
        // Create new user
        activeUser = { 
            id: crypto.randomUUID(), 
            name: name, 
            email: email, 
            role: role 
        };
        // Save to registry
        setUserRegistry(prev => {
            const filtered = prev.filter(u => u.email !== email);
            return [...filtered, activeUser];
        });
    } else {
        const existingUser = userRegistry.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
            activeUser = existingUser;
        } else {
            let defaultName = 'User';
            if (role === 'founder') defaultName = 'Founder User';
            else if (role === 'analyst') defaultName = 'Analyst User';
            else if (role === 'investor') defaultName = 'Investor User';

            activeUser = {
                id: crypto.randomUUID(),
                name: name || defaultName,
                email: email,
                role: role
            };
        }
    }

    setUser(activeUser);
    localStorage.setItem('venta_user', JSON.stringify(activeUser));
    
    if (activeUser.role === 'investor' || activeUser.role === 'analyst') { 
        setCurrentPitchId(null); 
        setActiveTab('analyst-ventures'); 
    } else { 
        if (isRegistering && companyName && activeUser.role === 'founder') {
            const newPitch: PitchData = {
                id: crypto.randomUUID(),
                companyName: companyName,
                tagline: '',
                problem: '',
                solution: '',
                marketSize: '',
                businessModel: '',
                team: '',
                stage: 'idea',
                meetings: [],
                lastUpdated: new Date().toISOString()
            };
            setPitches(prev => [...prev, newPitch]);
            setCurrentPitchId(newPitch.id);
            setActiveTab('dashboard');
        } else {
            setCurrentPitchId(null); 
            setActiveTab('pitch-list');
        }
    }
  };

  const updatePitch = (d: Partial<PitchData> & { id: string }) => {
      setPitches(prev => prev.map(p => p.id === d.id ? { ...p, ...d } : p));
  };

  const populateSample = () => {
      const sample = getSamplePitch();
      sample.id = crypto.randomUUID();
      setPitches(prev => [...prev, sample]);
  };

  const handleNavigateWithContext = (tab: string, contextId?: string) => {
      if (contextId) setCurrentPitchId(contextId);
      setActiveTab(tab);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    if (user.role === 'founder') {
      if (!currentPitchId || activeTab === 'pitch-list') {
          return <PitchList pitches={pitches} onSelect={p => { setCurrentPitchId(p.id); setActiveTab('dashboard'); }} onCreate={() => { const n = { id: crypto.randomUUID(), companyName: 'Untitled Venture', tagline: '', problem: '', solution: '', marketSize: '', businessModel: '', team: '', stage: 'idea' as const }; setPitches([...pitches, n]); setCurrentPitchId(n.id); setActiveTab('pitch'); }} onPopulateSample={populateSample} />;
      }
      const p = currentPitch || { id: 'temp', companyName: 'Loading...', tagline: '', problem: '', solution: '', marketSize: '', businessModel: '', team: '', stage: 'idea' as const };
      
      switch (activeTab) {
        case 'dashboard': return <Dashboard pitchData={p} setPitchData={updatePitch} onNavigateToPitch={() => setActiveTab('pitch')} onNavigateToTab={setActiveTab} onPopulateSample={populateSample} onReset={() => { setCurrentPitchId(null); setActiveTab('pitch-list'); }} />;
        case 'pitch': return <PitchDeck pitchData={p} setPitchData={updatePitch} onSave={() => setActiveTab('dashboard')} onExit={() => setActiveTab('dashboard')} />;
        case 'meetings': return <Meetings pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} />;
        case 'diligence': return <DueDiligence pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} />;
        case 'resources': return <Resources pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} />;
        case 'roadmap': return <Roadmap pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} />;
        case 'projections': return <Projections pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} />;
        case 'contract': return <Contract pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} onSignComplete={() => setActiveTab('bootcamp')} />;
        case 'bootcamp': return <Bootcamp pitchData={p} setPitchData={updatePitch} onExit={() => setActiveTab('dashboard')} onNavigateToTab={setActiveTab} />;
        default: return <Dashboard pitchData={p} setPitchData={updatePitch} onNavigateToPitch={() => setActiveTab('pitch')} onNavigateToTab={setActiveTab} onPopulateSample={populateSample} />;
      }
    } else {
        if (currentPitchId && currentPitch) {
            switch (activeTab) {
                case 'analyst-dashboard': return <AnalystVentureDashboard pitch={currentPitch} onNavigate={setActiveTab} onBack={() => { setCurrentPitchId(null); setActiveTab('analyst-ventures'); }} />;
                case 'analyst-analysis': return <AnalystAnalysis pitches={pitches} onUpdatePitch={updatePitch} focusedPitchId={currentPitchId} onBack={() => setActiveTab('analyst-dashboard')} />;
                case 'analyst-diligence': return <AnalystDiligence pitches={pitches} onUpdatePitch={updatePitch} focusedPitchId={currentPitchId} onBack={() => setActiveTab('analyst-dashboard')} />;
                case 'analyst-contracts': return <AnalystContracts pitches={pitches} onUpdatePitch={updatePitch} focusedPitchId={currentPitchId} onBack={() => setActiveTab('analyst-dashboard')} />;
                default: return <AnalystVentureDashboard pitch={currentPitch} onNavigate={setActiveTab} onBack={() => { setCurrentPitchId(null); setActiveTab('analyst-ventures'); }} />;
            }
        } else {
            switch(activeTab) {
                case 'analyst-ventures': return <AnalystVentures pitches={pitches} onUpdatePitch={updatePitch} onNavigate={setActiveTab} onSelectVenture={(id) => { setCurrentPitchId(id); setActiveTab('analyst-dashboard'); }} />;
                case 'analyst-analysis': return <AnalystAnalysis pitches={pitches} onUpdatePitch={updatePitch} />;
                case 'analyst-diligence': return <AnalystDiligence pitches={pitches} onUpdatePitch={updatePitch} />;
                case 'analyst-contracts': return <AnalystContracts pitches={pitches} onUpdatePitch={updatePitch} />;
                case 'dashboard': return <AnalystPortfolio pitches={pitches} onSelectVenture={(id) => { setCurrentPitchId(id); setActiveTab('analyst-dashboard'); }} />;
                default: return <AnalystVentures pitches={pitches} onUpdatePitch={updatePitch} onNavigate={setActiveTab} onSelectVenture={(id) => { setCurrentPitchId(id); setActiveTab('analyst-dashboard'); }} />;
            }
        }
    }
  };

  return (
    <Layout 
        user={user} 
        onLogout={() => { setUser(null); localStorage.removeItem('venta_user'); setCurrentPitchId(null); }} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        notifications={notifications}
        onClearNotification={handleDismissNotification}
        onNavigateWithContext={handleNavigateWithContext}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
