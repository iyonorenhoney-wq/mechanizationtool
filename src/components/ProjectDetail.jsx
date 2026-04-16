import React, { useState, useEffect } from 'react';
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
  Info,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DataService, STATUS_ORDER, STATUS_LABELS, STATUS_COLORS } from '../services/DataService';
import { jsPDF } from 'jspdf';

const ProjectDetail = ({ project, onBack, settings }) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [editBilling, setEditBilling] = useState(false);
  const [internalError, setInternalError] = useState(null);

  // Safety first: If no project, return fallback early
  if (!project) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>案件データが見つかりません</h2>
        <button onClick={onBack} style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 700 }}>
          一覧に戻る
        </button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(project.status || STATUS_ORDER[0]);

  const handleUpdateStatus = (status) => {
    try {
      if (status === 'quote') {
        const hasReport = (project.history || []).some(h => h.status === 'report');
        if (!hasReport) {
          alert('見積書を作成する前に、報告書を完了させてください。');
          return;
        }
      }
      DataService.updateProject(project.id, { status });
    } catch (err) {
      console.error('Status Update Error:', err);
      setInternalError('ステータスの更新に失敗しました。');
    }
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
    const name = prompt('書類名を入力してください:', `${STATUS_LABELS[type] || 'その他'}_書類`);
    if (name) {
      const newDoc = {
        id: crypto.randomUUID(),
        type,
        name,
        date: new Date().toISOString(),
        url: '#'
      };
      DataService.updateProject(project.id, { 
        documents: [...(project.documents || []), newDoc] 
      });
    }
  };

  const generatePDF = (type) => {
    try {
      const doc = new jsPDF();
      const title = type === 'quote' ? '御見積書' : '御請求書';
      doc.setFont('helvetica', 'normal');
      doc.text(title, 105, 30, { align: 'center' });
      doc.text(`${project.propertyName || 'お客様'} 様`, 15, 60);
      doc.text(settings?.companyName || '当社', 195, 60, { align: 'right' });
      doc.line(15, 70, 195, 70);
      doc.text(`案件: ${project.requestContent || '工事一式'}`, 15, 80);
      doc.save(`${title}_${project.propertyName}.pdf`);
    } catch (err) {
      alert('PDFの生成中にエラーが発生しました。');
    }
  };

  const safeFormatDate = (dateStr, formatStr = 'yyyy/MM/dd HH:mm') => {
    if (!dateStr) return '-/--/--';
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr, { locale: ja }) : '無効な日付';
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {internalError && (
        <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', marginBottom: '1rem', fontWeight: 700 }}>
          {internalError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: STATUS_COLORS[project.status] || 'var(--primary)', textTransform: 'uppercase' }}>
            {STATUS_LABELS[project.status] || '不明なステータス'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{project.propertyName}</h1>
        </div>
      </div>

      <div className="card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem', background: 'var(--surface-alt)', borderRadius: '16px', border: 'none' }}>
        {[
          { id: 'timeline', label: '進捗', icon: <Clock size={16} /> },
          { id: 'info', label: '詳細情報', icon: <Info size={16} /> },
          { id: 'documents', label: '関連書類', icon: <FileText size={16} /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              fontSize: '0.875rem',
              fontWeight: 800,
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
            <span style={{ display: 'inline' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>工程ワークフロー</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {currentStatusIndex > 0 && (
                  <button 
                    onClick={handleGoBack}
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text)' }}
                  >
                    <Undo2 size={16} /> 一つ戻す
                  </button>
                )}
                {currentStatusIndex < STATUS_ORDER.length - 1 && (
                  <button 
                    onClick={() => handleUpdateStatus(STATUS_ORDER[currentStatusIndex + 1])}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', background: 'var(--primary)', border: 'none', color: 'white', fontSize: '0.8125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                  >
                    進める <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', position: 'relative', paddingLeft: '0.5rem' }}>
              <div style={{ position: 'absolute', left: '16px', top: '10px', bottom: '10px', width: '2px', background: '#f1f5f9' }} />
              {STATUS_ORDER.map((status, index) => {
                const isDone = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isPending = index > currentStatusIndex;
                const historyItem = (project.history || []).find(h => h.status === status);
                
                return (
                  <div key={status} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
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
                    <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: isCurrent ? 800 : 700,
                        color: isPending ? 'var(--text-muted)' : 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        {STATUS_LABELS[status]}
                        {isCurrent && <span style={{ fontSize: '0.625rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--primary)', color: 'white', fontWeight: 900 }}>NOW</span>}
                      </div>
                      
                      {isCurrent && status === 'survey' && (
                        <div style={{ marginTop: '0.75rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>調査予定日を設定</label>
                          <input 
                            type="date" 
                            value={project.surveyDate || ''} 
                            onChange={(e) => handleUpdateField('surveyDate', e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%', fontWeight: 600 }}
                          />
                        </div>
                      )}

                      {isCurrent && status === 'construction' && (
                        <div style={{ marginTop: '0.75rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>工事予定日を設定</label>
                          <input 
                            type="date" 
                            value={project.constructionDate || ''} 
                            onChange={(e) => handleUpdateField('constructionDate', e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%', fontWeight: 600 }}
                          />
                        </div>
                      )}

                      {isCurrent && status === 'ordered' && (
                        <div style={{ marginTop: '0.75rem', padding: '1.25rem', background: 'rgba(37,99,235,0.05)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
                          <p style={{ fontSize: '0.8125rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CreditCard size={14} /> 請求情報の入力が必要です
                          </p>
                          <button onClick={() => {setActiveTab('info'); setEditBilling(true)}} style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'white', background: 'var(--primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(37,99,235,0.2)' }}>
                            請求情報を設定する
                          </button>
                        </div>
                      )}

                      {historyItem && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                          完了: {safeFormatDate(historyItem.date)}
                        </div>
                      )}
                    </div>
                    {isCurrent && (status === 'proposal' || status === 'report' || status === 'quote' || status === 'invoiced') && (
                      <button 
                        onClick={() => handleFileUpload(status)}
                        style={{ color: 'var(--primary)', background: 'white', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}
                      >
                        <Upload size={18} />
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
          <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={20} color="var(--primary)" />
              物件・依頼の基本情報
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>所在地・住所</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  <MapPin size={16} className="text-muted" /> {project.address || '未設定'}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>お客様名</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                    <User size={16} className="text-muted" /> {project.clientName || '未設定'}
                  </div>
                </div>
                <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>自社担当者</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                    <User size={16} className="text-muted" /> {project.staffName || '未設定'}
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>依頼内容・詳細</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: '1.6', marginTop: '0.25rem' }}>
                  {project.requestContent || '具体的な内容はまだありません。'}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                請求・支払い条件
              </h3>
              {!editBilling && (
                <button onClick={() => setEditBilling(true)} style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(37,99,235,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none' }}>情報を編集</button>
              )}
            </div>

            {editBilling ? (
              <form onSubmit={handleUpdateBilling} style={{ display: 'grid', gap: '1.125rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>請求先名（宛名）</label>
                  <input name="name" defaultValue={project.billingInfo?.name} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>請求先住所</label>
                  <input name="address" defaultValue={project.billingInfo?.address} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>支払い方法</label>
                    <input name="paymentTerms" defaultValue={project.billingInfo?.paymentTerms} placeholder="例：銀行振込" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>締め支払い条件</label>
                    <input name="closingTerms" defaultValue={project.billingInfo?.closingTerms} placeholder="例：月末締翌末払" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ flex: 2, background: 'var(--primary)', color: 'white', padding: '0.875rem', borderRadius: '12px', border: 'none', fontWeight: 800 }}>保存する</button>
                  <button type="button" onClick={() => setEditBilling(false)} style={{ flex: 1, background: 'var(--surface-alt)', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800 }}>キャンセル</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>請求先</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{project.billingInfo?.name || '-'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>支払い方法</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{project.billingInfo?.paymentTerms || '-'}</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>締め支払い</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{project.billingInfo?.closingTerms || '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="fade-in card" style={{ borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem' }}>プロジェクト関連書類</h3>
            <button onClick={() => handleFileUpload('other')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(37,99,235,0.05)', padding: '0.5rem 1rem', borderRadius: '10px', border: 'none' }}>
              <Plus size={18} /> 新規アップロード
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {(project.documents || []).length > 0 ? project.documents.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'var(--surface-alt)', borderRadius: '16px', border: '1px solid var(--border)', transition: 'transform 0.2s' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <FileText size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--text)' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>{safeFormatDate(doc.date, 'yyyy年MM月dd日')} • {STATUS_LABELS[doc.type] || 'その他'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(doc.type === 'quote' || doc.type === 'invoiced') && (
                    <button 
                      onClick={() => generatePDF(doc.type)}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', background: 'white', border: '1px solid var(--border)' }}
                    >
                      <FileDown size={20} />
                    </button>
                  )}
                  <button style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'var(--surface-alt)', borderRadius: '20px', border: '2px dashed var(--border)' }}>
                <FileText size={56} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>保存された書類はありません</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>見積書や完了報告書をアップロード・管理できます。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
