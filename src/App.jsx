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
  Calendar
} from 'lucide-react';
import { DataService } from './services/DataService';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import ProjectDetail from './components/ProjectDetail';
import SettingsView from './components/SettingsView';
import CalendarView from './components/CalendarView';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, list, add, detail, settings, calendar
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [appData, setAppData] = useState(DataService.get());

  useEffect(() => {
    const handleUpdate = () => setAppData(DataService.get());
    window.addEventListener('data_updated', handleUpdate);
    return () => window.removeEventListener('data_updated', handleUpdate);
  }, []);

  const navigateToDetail = (id) => {
    setSelectedProjectId(id);
    setCurrentView('detail');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          data={appData} 
          onProjectClick={navigateToDetail} 
          onCalendarClick={() => setCurrentView('calendar')}
        />;
      case 'list':
        return <ProjectList data={appData} onProjectClick={navigateToDetail} />;
      case 'add':
        return <ProjectForm onCancel={() => setCurrentView('list')} />;
      case 'calendar':
        return <CalendarView projects={appData.projects} onProjectClick={navigateToDetail} />;
      case 'detail':
        return <ProjectDetail 
          project={appData.projects.find(p => p.id === selectedProjectId)} 
          onBack={() => setCurrentView('list')}
          settings={appData.settings}
        />;
      case 'settings':
        return <SettingsView settings={appData.settings} />;
      default:
        return <Dashboard data={appData} onCalendarClick={() => setCurrentView('calendar')} />;
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
          <button 
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>ダッシュボード</span>
          </button>
          <button 
            className={`sidebar-item ${currentView === 'calendar' ? 'active' : ''}`} 
            onClick={() => setCurrentView('calendar')}
          >
            <Calendar size={20} />
            <span>カレンダー</span>
          </button>
          <button 
            className={`sidebar-item ${currentView === 'list' || currentView === 'add' || currentView === 'detail' ? 'active' : ''}`} 
            onClick={() => setCurrentView('list')}
          >
            <ClipboardList size={20} />
            <span>案件一覧</span>
          </button>
          <button 
            className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`} 
            onClick={() => setCurrentView('settings')}
          >
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {currentView === 'list' && (
            <button onClick={() => setCurrentView('add')} style={{ color: 'var(--primary)', background: 'none', border: 'none' }}>
              <PlusCircle size={24} />
            </button>
          )}
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
    </div>
  );
};

export default App;
