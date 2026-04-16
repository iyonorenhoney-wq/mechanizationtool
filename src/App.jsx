import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  Settings, 
  Search,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Award,
  Download,
  Calendar,
  Bell,
  RefreshCw
} from 'lucide-react';
import { DataService } from './services/DataService';
import { NotificationService } from './services/NotificationService';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import ProjectDetail from './components/ProjectDetail';
import SettingsView from './components/SettingsView';
import CalendarView from './components/CalendarView';
import NotificationCenter from './components/NotificationCenter';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [appData, setAppData] = useState(DataService.get());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      const data = DataService.get();
      setAppData(data);
      const alerts = NotificationService.checkNotifications(data.projects);
      setNotifications(alerts);
    };

    handleUpdate(); // Initial check
    window.addEventListener('data_updated', handleUpdate);
    return () => window.removeEventListener('data_updated', handleUpdate);
  }, []);

  const navigateToDetail = (id) => {
    setIsLoading(true);
    setSelectedProjectId(id);
    setCurrentView('detail');
    setTimeout(() => setIsLoading(false), 300); // Simulated loading
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={48} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>読み込み中...</p>
        </div>
      );
    }

    try {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard 
            data={appData} 
            onProjectClick={navigateToDetail} 
            onCalendarClick={() => setCurrentView('calendar')}
            onAddClick={() => setCurrentView('add')}
          />;

        case 'list':
          return <ProjectList data={appData} onProjectClick={navigateToDetail} />;
        case 'add':
          return <ProjectForm onCancel={() => setCurrentView('list')} />;
        case 'calendar':
          return <CalendarView projects={appData.projects} onProjectClick={navigateToDetail} />;
        case 'detail':
          const project = appData.projects.find(p => p.id === selectedProjectId);
          if (!project && selectedProjectId !== null) {
             return (
               <div style={{ padding: '2rem', textAlign: 'center' }}>
                 <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                 <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>案件が見つかりません</h2>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>案件が削除されたか、データに問題があります。</p>
                 <button onClick={() => setCurrentView('list')} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                   案件一覧に戻る
                 </button>
               </div>
             );
          }
          return <ProjectDetail 
            project={project} 
            onBack={() => setCurrentView('list')}
            settings={appData.settings}
          />;
        case 'settings':
          return <SettingsView settings={appData.settings} />;
        default:
          return <Dashboard 
            data={appData} 
            onProjectClick={navigateToDetail} 
            onCalendarClick={() => setCurrentView('calendar')} 
          />;
      }
    } catch (err) {
      console.error('Render Error:', err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>画面の表示中にエラーが発生しました</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>一度ホームに戻るか、ページを再読み込みしてください。</p>
          <button onClick={() => window.location.reload()} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
            再読み込みする
          </button>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <LayoutDashboard size={28} />
          <span>BizFlow</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={20} />
            <span>ダッシュボード</span>
          </button>
          <button className={`sidebar-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}>
            <Calendar size={20} />
            <span>カレンダー</span>
          </button>
          <button className={`sidebar-item ${currentView === 'list' || currentView === 'add' || currentView === 'detail' ? 'active' : ''}`} onClick={() => setCurrentView('list')}>
            <ClipboardList size={20} />
            <span>案件一覧</span>
          </button>
          <button className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
            <Settings size={20} />
            <span>設定</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="header-mobile">
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>
          BizFlow <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>工事管理</span>
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setShowNotifications(true)} style={{ position: 'relative', color: 'var(--text-muted)' }}>
            <Bell size={24} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }} />
            )}
          </button>
        </div>
      </header>

      <main className="main-content" style={{ flex: 1, padding: '1rem', maxWidth: '1000px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
        {renderView()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
          <LayoutDashboard size={20} />
          <span>ホーム</span>
        </button>
        <button className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}>
          <Calendar size={20} />
          <span>カレンダー</span>
        </button>
        <button className={`nav-item ${currentView === 'list' || currentView === 'add' || currentView === 'detail' ? 'active' : ''}`} onClick={() => setCurrentView('list')}>
          <ClipboardList size={20} />
          <span>案件一覧</span>
        </button>
        <button className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
          <Settings size={20} />
          <span>設定</span>
        </button>
      </nav>

      {showNotifications && (
        <NotificationCenter 
          notifications={notifications} 
          onProjectClick={navigateToDetail}
          onClose={() => setShowNotifications(false)} 
        />
      )}
    </div>
  );
};

export default App;
