import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Plus, 
  TrendingUp,
  FileDown,
  Trash2,
  MoreVertical,
  Check,
  Send
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DataService } from '../services/DataService';
import { jsPDF } from 'jspdf';

const STATUS_ORDER = [
  'received', 
  'investigating', 
  'proposed', 
  'estimated', 
  'ordered', 
  'construction', 
  'completed', 
  'report_submitted', 
  'invoiced'
];

const STATUS_LABELS = {
  received: '依頼受領',
  investigating: '調査中',
  proposed: '提案書提出',
  estimated: '見積提出',
  ordered: '受注',
  construction: '工事日',
  completed: '工事完了',
  report_submitted: '完了報告',
  invoiced: '請求書発行'
};

const ProjectDetail = ({ project, onBack, settings }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, documents, tasks
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!project) return <div>案件が見つかりません</div>;

  const currentStatusIndex = STATUS_ORDER.indexOf(project.status);
  const costs = (project.costs?.labor || 0) + (project.costs?.material || 0);
  const profit = (project.revenue || 0) - costs;
  const margin = project.revenue > 0 ? (profit / project.revenue) * 100 : 0;
  const isLowMargin = project.revenue > 0 && margin < settings.targetProfitMargin;

  const handleUpdateStatus = (status) => {
    DataService.updateProject(project.id, { status });
  };

  const handleToggleTask = (taskId) => {
    const newTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    DataService.updateProject(project.id, { tasks: newTasks });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const newTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };
    DataService.updateProject(project.id, { tasks: [...(project.tasks || []), newTask] });
    setNewTaskTitle('');
  };

  const handleSaveNote = () => {
    DataService.updateProject(project.id, { notes: newNote || project.notes });
    setNewNote('');
  };

  const generatePDF = (type) => { // type: 'estimate' or 'invoice'
    const doc = new jsPDF();
    const title = type === 'estimate' ? '御見積書' : '御請求書';
    
    // Add Logo if available
    if (settings.logo) {
      try {
        doc.addImage(settings.logo, 'PNG', 15, 10, 30, 30);
      } catch (e) {
        console.error('Logo failed', e);
      }
    }

    doc.setFont('helvetica', 'normal');
    doc.text(title, 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`発行日: ${format(new Date(), 'yyyy/MM/dd')}`, 195, 20, { align: 'right' });
    doc.text(`案件番号: ${project.id.slice(0, 8)}`, 195, 25, { align: 'right' });

    doc.setFontSize(14);
    doc.text(`${project.propertyName} 様`, 15, 60);
    
    doc.setFontSize(10);
    doc.text(settings.companyName || '株式会社 〇〇工事', 195, 60, { align: 'right' });
    
    doc.line(15, 70, 195, 70);
    
    doc.setFontSize(12);
    doc.text('項目', 15, 80);
    doc.text('金額', 195, 80, { align: 'right' });
    
    doc.line(15, 85, 195, 85);
    
    doc.text(project.description || '工事一式', 15, 95);
    doc.text(`¥${(project.revenue || 0).toLocaleString()}`, 195, 95, { align: 'right' });
    
    doc.line(15, 120, 195, 120);
    doc.setFont(undefined, 'bold');
    doc.text('合計金額', 130, 130);
    doc.text(`¥${(project.revenue || 0).toLocaleString()}`, 195, 130, { align: 'right' });

    doc.save(`${title}_${project.propertyName}.pdf`);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={onBack} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={24} /></button>
        <h1 style={{ fontSize: '1.25rem', flex: 1 }}>案件詳細</h1>
        <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={20} /></button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--surface) 0%, #f1f5f9 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>案件名</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
            {STATUS_LABELS[project.status]}
          </div>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{project.propertyName}</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="text-sm text-muted flex items-center gap-1"><MapPin size={14} /> {project.address || '住所未登録'}</div>
          <div className="text-sm text-muted flex items-center gap-1"><User size={14} /> {project.staffName || '担当未設定'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
        {['overview', 'timeline', 'tasks'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none'
            }}
          >
            {tab === 'overview' ? '収支' : tab === 'timeline' ? '工程' : 'ToDo'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="fade-in">
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div className="text-muted text-sm">売上</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>¥{(project.revenue || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted text-sm">利益率</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: isLowMargin ? 'var(--danger)' : 'var(--success)' }}>
                {margin.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm text-muted mb-3">原価詳細</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-sm">労務費</span>
              <span className="text-sm font-bold">¥{(project.costs?.labor || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-sm">材料・経費</span>
              <span className="text-sm font-bold">¥{(project.costs?.material || 0).toLocaleString()}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-sm font-bold">粗利合計</span>
              <span className="text-sm font-bold text-success">¥{profit.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button 
              onClick={() => generatePDF('estimate')}
              className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', border: 'none' }}
            >
              <FileDown size={24} />
              <span className="text-sm font-bold">見積書出力</span>
            </button>
            <button 
              onClick={() => generatePDF('invoice')}
              className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', color: '#15803d', border: 'none' }}
            >
              <FileText size={24} />
              <span className="text-sm font-bold">請求書出力</span>
            </button>
          </div>

          <div className="card">
            <h3 className="text-sm text-muted mb-2">思考整理・メモ</h3>
            <textarea 
              placeholder="気づき、顧客対応、注意点..."
              value={newNote || project.notes}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', minHeight: '100px', fontSize: '0.875rem' }}
            />
            <button 
              onClick={handleSaveNote}
              style={{ width: '100%', marginTop: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}
            >
              メモを保存
            </button>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="fade-in card">
          <h3 className="text-sm text-muted mb-4">進行ステータス</h3>
          <div style={{ display: 'grid', gap: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }} />
            {STATUS_ORDER.map((status, index) => {
              const isDone = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const historyItem = project.history.find(h => h.status === status);
              
              return (
                <div key={status} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div 
                    onClick={() => handleUpdateStatus(status)}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: isDone ? 'var(--primary)' : 'white',
                      border: isDone ? 'none' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {isDone && <Check size={14} color="white" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: isCurrent ? 700 : 500,
                      color: isDone ? 'var(--text)' : 'var(--text-muted)'
                    }}>
                      {STATUS_LABELS[status]}
                    </div>
                    {historyItem && (
                      <div className="text-sm" style={{ opacity: 0.6 }}>{format(parseISO(historyItem.date), 'yyyy/MM/dd')}</div>
                    )}
                  </div>
                  {isCurrent && index < STATUS_ORDER.length - 1 && (
                    <button 
                      onClick={() => handleUpdateStatus(STATUS_ORDER[index + 1])}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        background: 'var(--primary)', 
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      次へ進める
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="fade-in">
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              placeholder="新しいタスクを追加..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
            />
            <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
              <Plus size={20} />
            </button>
          </form>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {(project.tasks || []).map(task => (
              <div 
                key={task.id} 
                className="card" 
                onClick={() => handleToggleTask(task.id)}
                style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                {task.completed ? <CheckCircle2 size={20} color="var(--success)" /> : <Circle size={20} color="var(--border)" />}
                <span style={{ 
                  fontSize: '0.875rem', 
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text-muted)' : 'var(--text)'
                }}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
