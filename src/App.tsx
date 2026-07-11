import { useState } from 'react';
import { TabBar, type TabKey } from './components/TabBar';
import { Cabinet } from './screens/Cabinet';
import { Chat } from './screens/Chat';
import { Conferences } from './screens/Conferences';
import { Documents } from './screens/Documents';
import { Home } from './screens/Home';
import './App.css';
import './screens/screens.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  return (
    <div className="app-shell">
      <main className="app-content">
        <div key={activeTab} className="tab-transition">
          {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
          {activeTab === 'documents' && <Documents />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'conferences' && <Conferences />}
          {activeTab === 'cabinet' && <Cabinet />}
        </div>
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
