import { useState } from 'react';
import { AdminRegister } from './components/AdminRegister';
import { AppGate } from './components/AppGate';
import { TabBar, type TabKey } from './components/TabBar';
import { ToastProvider } from './components/Toast';
import { useMe } from './api/hooks';
import { getStartParam } from './telegram/init';
import { Cabinet } from './screens/Cabinet';
import { Chat } from './screens/Chat';
import { Conferences } from './screens/Conferences';
import { Documents } from './screens/Documents';
import { Home } from './screens/Home';
import './App.css';
import './screens/screens.css';

const TABS: TabKey[] = ['home', 'documents', 'chat', 'conferences', 'cabinet'];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  // Shares the same cached resource AppGate reads internally (see
  // api/hooks.ts) — this doesn't trigger an extra fetch, just lets the tab
  // bar know whether onboarding (registration/anketa) is still in progress.
  const { data } = useMe();
  const ready = data?.registered && data.screening_completed;

  const startParam = getStartParam();
  if (startParam?.startsWith('confadmin_')) {
    return <AdminRegister code={startParam.slice('confadmin_'.length)} panel="conferences" />;
  }
  if (startParam?.startsWith('admin_')) {
    return <AdminRegister code={startParam.slice('admin_'.length)} panel="documents" />;
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <main className="app-content">
          <AppGate>
            {/* All screens stay mounted (never unmount on tab switch) — hidden
                panels just get display:none. Switching used to unmount +
                remount the whole screen every time, refetching /api/me or
                /api/documents from scratch and showing a full-screen loading
                state even when the data had just been fetched seconds earlier. */}
            {TABS.map((tab) => (
              <div key={tab} className="tab-panel" hidden={tab !== activeTab}>
                {tab === 'home' && <Home onNavigate={setActiveTab} />}
                {tab === 'documents' && <Documents />}
                {tab === 'chat' && <Chat />}
                {tab === 'conferences' && <Conferences />}
                {tab === 'cabinet' && <Cabinet />}
              </div>
            ))}
          </AppGate>
        </main>

        {ready && <TabBar active={activeTab} onChange={setActiveTab} />}
      </div>
    </ToastProvider>
  );
}

export default App;
