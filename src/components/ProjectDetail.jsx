import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Plus, 
  FileDown,
  MoreVertical,
  Check,
  Calendar,
  Undo2,
  ArrowRight,
  Upload,
  CreditCard,
  Building,
  Info
} from 'lucide-react';
import { format, parseISO, isBefore, startOfToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DataService, STATUS_ORDER, STATUS_LABELS, STATUS_COLORS } from '../services/DataService';
import { jsPDF } from 'jspdf';

const ProjectDetail = ({ project, onBack, settings }) => {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, info, documents, tasks
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editBilling, setEditBilling] = useState(false);

  if (!project) return <div style={{ padding: '2rem', textAlign: 'center' }}>案件が見つかりません</div>;

  const currentStatusIndex = STATUS_ORDER.indexOf(project.status);
  const today = startOfToday();

  const handleUpdateStatus = (status) => {
    // Basic validation
    if (status === 'quote') {
      const hasReport = project.history.some(h => h.status === 'report');
      if (!hasReport) {
        alert('見積書を作成する前に、報告書を完了させてください。');
        return;
      }
    }
    DataService.updateProject(project.id, { status });
  };

  const handleGoBack = () => {
    if (currentStatusIndex > 0) {
      handleUpdateStatus(STATUS_ORDER[currentStatusIndex - 1]);
    }
  };

  const handleUpdateField = (field, value) => {
    DataService.updateProject(project.id, { [field]: value });
  };

  const handleUpdateBilling = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const billingInfo = {
      name: formData.get('name'),
      address: formData.get('address'),
      paymentTerms: formData.get('paymentTerms'),
      closingTerms: formData.get('closingTerms'),
    };
    DataService.updateProject(project.id, { billingInfo });
    setEditBilling(false);
  };

  const handleFileUpload = (type) => {
    const name = prompt('書類名を入力してください:', `${STATUS_LABELS[type]}_書類`);
    if (name) {
      const newDoc = {
        id: crypto.randomUUID(),
        type,
        name,
        date: new Date().toISOString(),
        url: '#' // Simulated
      };
      DataService.updateProject(project.id, { 
        documents: [...(project.documents || []), newDoc] 
      });
    }
  };

  const generatePDF = (type) => {
    const doc = new jsPDF();
    const title = type === 'quote' ? '御見積書' : '御請求書';
    doc.setFont('helvetica', 'normal');
    doc.text(title, 105, 30, { align: 'center' });
    doc.text(`${project.propertyName} 様`, 15, 60);
    doc.text(settings.companyName, 195, 60, { align: 'right' });
    doc.line(15, 70, 195, 70);
    doc.text(`案件: ${project.requestContent || '工事一式'}`, 15, 80);
    doc.save(`${title}_${project.propertyName}.pdf`);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: STATUS_COLORS[project.status], textTransform: 'uppercase', letterSpacing: '0.05rem' }}>
            {STATUS_LABELS[project.status]}
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{project.propertyName}</h1>
        </div>
        <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={20} /></button>
      </div>

      <div className="card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem', background: 'var(--surface-alt)', borderRadius: '16px' }}>
        {[
          { id: 'timeline', label: '進捗', icon: <Clock size={16} /> },
          { id: 'info', label: '詳細', icon: <Info size={16} /> },
          { id: 'documents', label: '書類', icon: <FileText size={16} /> },
          { id: 'tasks', label: 'ToDo', icon: <CheckCircle2 size={16} /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === tab.id ? 'white' : 'transparent',
              borderRadius: '12px',
              border: 'none',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>工程ステータス</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {currentStatusIndex > 0 && (
                  <button 
                    onClick={handleGoBack}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--surface-alt)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Undo2 size={14} /> 戻す
                  </button>
                )}
                {currentStatusIndex < STATUS_ORDER.length - 1 && (
                  <button 
                    onClick={() => handleUpdateStatus(STATUS_ORDER[currentStatusIndex + 1])}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    次へ <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#f1f5f9' }} />
              {STATUS_ORDER.map((status, index) => {
                const isDone = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isPending = index > currentStatusIndex;
                const historyItem = project.history.find(h => h.status === status);
                
                return (
                  <div key={status} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div 
                      onClick={() => handleUpdateStatus(status)}
                      style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', 
                        background: isDone || isCurrent ? STATUS_COLORS[status] : 'white',
                        border: isDone || isCurrent ? 'none' : '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: isCurrent ? `0 0 0 4px ${STATUS_COLORS[status]}20` : 'none'
                      }}
                    >
                      {isDone ? <Check size={14} color="white" /> : isCurrent ? <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: isCurrent ? 800 : 600,
                        color: isPending ? 'var(--text-muted)' : 'var(--text)'
                      }}>
                        {STATUS_LABELS[status]}
                        {isCurrent && status === 'survey' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <input 
                              type="date" 
                              value={project.surveyDate || ''} 
                              onChange={(e) => handleUpdateField('surveyDate', e.target.value)}
                              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%' }}
                            />
                          </div>
                        )}
                        {isCurrent && status === 'construction' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <input 
                              type="date" 
                              value={project.constructionDate || ''} 
                              onChange={(e) => handleUpdateField('constructionDate', e.target.value)}
                              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%' }}
                            />
                          </div>
                        )}
                        {isCurrent && status === 'ordered' && (
                          <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--surface-alt)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>受注情報の入力が必要です</p>
                            <button onClick={() => {setActiveTab('info'); setEditBilling(true)}} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'white', border: '1px solid var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                              請求情報を入力する
                            </button>
                          </div>
                        )}
                      </div>
                      {historyItem && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {format(parseISO(historyItem.date), 'yyyy/MM/dd HH:mm')}
                        </div>
                      )}
                    </div>
                    {(status === 'proposal' || status === 'report' || status === 'quote' || status === 'invoiced') && (
                      <button 
                        onClick={() => handleFileUpload(status)}
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} className="text-primary" />
              物件・依頼情報
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>住所</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem', fontWeight: 600 }}>
                  <MapPin size={14} className="text-muted" /> {project.address || '未登録'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>依頼者名</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem', fontWeight: 600 }}>
                  <User size={14} className="text-muted" /> {project.clientName || '未登録'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>依頼内容</label>
                <div style={{ fontSize: '0.925rem', fontWeight: 500, background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.25rem' }}>
                  {project.requestContent || '内容なし'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} className="text-primary" />
                請求・支払い情報
              </h3>
              {!editBilling && (
                <button onClick={() => setEditBilling(true)} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>編集</button>
              )}
            </div>

            {editBilling ? (
              <form onSubmit={handleUpdateBilling} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>請求先名</label>
                  <input name="name" defaultValue={project.billingInfo?.name} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>請求先住所</label>
                  <input name="address" defaultValue={project.billingInfo?.address} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>支払い条件</label>
                    <input name="paymentTerms" defaultValue={project.billingInfo?.paymentTerms} placeholder="例：振込" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>締め支払い条件</label>
                    <input name="closingTerms" defaultValue={project.billingInfo?.closingTerms} placeholder="例：月末締め翌月末払い" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 700 }}>保存</button>
                  <button type="button" onClick={() => setEditBilling(false)} style={{ flex: 1, background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 700 }}>キャンセル</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>請求先</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{project.billingInfo?.name || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>支払い条件</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{project.billingInfo?.paymentTerms || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>締め支払い</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{project.billingInfo?.closingTerms || '-'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="fade-in card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>関連書類</h3>
            <button onClick={() => handleFileUpload('other')} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(37,99,235,0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none' }}>
              <Plus size={16} /> 書類を追加
            </button>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(project.documents || []).length > 0 ? project.documents.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(parseISO(doc.date), 'yyyy/MM/dd')} • {STATUS_LABELS[doc.type] || 'その他'}</div>
                </div>
                <button 
                  onClick={() => generatePDF(doc.type)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', background: 'white' }}
                >
                  <FileDown size={18} />
                </button>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>書類はまだありません</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="fade-in">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (newTaskTitle) {
                DataService.updateProject(project.id, { 
                  tasks: [...(project.tasks || []), { id: crypto.randomUUID(), title: newTaskTitle, completed: false }] 
                });
                setNewTaskTitle('');
              }
            }} 
            style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
          >
            <input 
              placeholder="新しいタスクを入力..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.925rem' }}
            />
            <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.875rem', borderRadius: '12px', border: 'none' }}>
              <Plus size={20} />
            </button>
          </form>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(project.tasks || []).map(task => (
              <div 
                key={task.id} 
                className="card" 
                onClick={() => {
                  const newTasks = project.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                  DataService.updateProject(project.id, { tasks: newTasks });
                }}
                style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: task.completed ? 'var(--surface-alt)' : 'white' }}
              >
                {task.completed ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} className="text-muted" />}
                <span style={{ 
                  fontSize: '0.925rem', 
                  fontWeight: 600,
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
