import { useState } from 'react';
import { TabBar, type TabKey } from './components/TabBar';
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

  return (
    <div className="app-shell">
      <main className="app-content">
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
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
