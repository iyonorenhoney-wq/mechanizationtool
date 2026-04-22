import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  FileText, 
  Plus, 
  FileDown,
  Check,
  Calendar,
  Undo2,
  ArrowRight,
  Upload,
  CreditCard,
  Building,
  Info,
  AlertTriangle,
  Clock,
  TrendingUp,
  Link2,
  RefreshCw,
  FilePlus2,
  Badge,
  Sparkles,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DataService, STATUS_ORDER, STATUS_LABELS, STATUS_COLORS } from '../services/DataService';
import { StorageService, DOC_CATEGORY_LABELS, DOC_CATEGORY_COLORS } from '../services/StorageService';
import DocumentFormModal from './DocumentFormModal';
import InvoiceAutoLinkModal from './InvoiceAutoLinkModal';

const ProjectDetail = ({ project, onBack, settings, user }) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [editBilling, setEditBilling] = useState(false);
  const [internalError, setInternalError] = useState(null);

  // モーダル制御
  const [showDocModal, setShowDocModal] = useState(false);
  const [docModalCategory, setDocModalCategory] = useState(null);
  const [docModalInitialData, setDocModalInitialData] = useState(null);
  const [showInvoiceLinkModal, setShowInvoiceLinkModal] = useState(false);
  const [invoiceLinkIsRegen, setInvoiceLinkIsRegen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpdateStatus = async (status) => {
    try {
      await DataService.updateProject(project.id, { status });

      // 受注ステータスへ変更した場合、請求書連動モーダルを自動表示
      if (status === 'ordered') {
        setShowInvoiceLinkModal(true);
        setInvoiceLinkIsRegen(false);
      }
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

  const handleUpdateField = async (field, value) => {
    await DataService.updateProject(project.id, { [field]: value });
  };

  const handleUpdateBilling = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const billingInfo = {
      name: formData.get('name'),
      address: formData.get('address'),
      paymentTerms: formData.get('paymentTerms'),
      closingTerms: formData.get('closingTerms'),
    };
    await DataService.updateProject(project.id, { billingInfo });
    setEditBilling(false);
  };

  const handleFileUpload = async (e, category = 'other') => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileData = await StorageService.uploadFile(project.id, file, category);
      const updatedDocs = [...(project.documents || []), fileData];
      await DataService.updateProject(project.id, { documents: updatedDocs });
    } catch (err) {
      alert('ファイルのアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const exportBudgetToExcel = async () => {
    // 予算書フォームを自動で開く（既存予算データ自動入力済み）
    setDocModalCategory('budget');
    setDocModalInitialData({
      labor: project.budget?.labor || 0,
      materials: project.budget?.materials || 0,
      others: project.budget?.others || 0,
    });
    setShowDocModal(true);
  };

  const safeFormatDate = (dateStr, formatStr = 'yyyy/MM/dd HH:mm') => {
    if (!dateStr) return '-/--/--';
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr, { locale: ja }) : '無効な日付';
  };

  const openDocModal = (category = null, initialData = null) => {
    setDocModalCategory(category);
    setDocModalInitialData(initialData);
    setShowDocModal(true);
  };

  const openInvoiceRegen = () => {
    setInvoiceLinkIsRegen(true);
    setShowInvoiceLinkModal(true);
  };

  const handleDocSaved = () => {
    // data_updatedイベントで自動リロードされる
  };

  // 見積書ドキュメントを取得
  const latestQuoteDoc = DataService.getLatestQuoteDoc(project);
  const hasInvoiceDraft = !!project.invoiceDraft;

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {internalError && (
        <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', marginBottom: '1rem', fontWeight: 700 }}>
          {internalError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', flexShrink: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: STATUS_COLORS[project.status] || 'var(--primary)', textTransform: 'uppercase' }}>
            {STATUS_LABELS[project.status] || '不明なステータス'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.propertyName}</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem', background: 'var(--surface-alt, #f8fafc)', borderRadius: '16px', border: 'none' }}>
        {[
          { id: 'timeline', label: '進捗', icon: <Clock size={16} /> },
          { id: 'info', label: '詳細・予算', icon: <Info size={16} /> },
          { id: 'documents', label: '書類管理', icon: <FileText size={16} /> },
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
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {tab.icon}
            <span style={{ display: 'inline' }}>{tab.label}</span>
            {/* 書類タブのバッジ */}
            {tab.id === 'documents' && (project.documents || []).length > 0 && (
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '16px', height: '16px', background: 'var(--primary)', color: 'white', borderRadius: '50%', fontSize: '0.625rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(project.documents || []).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========== TIMELINE TAB ========== */}
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
                      
                      {/* 調査日設定 */}
                      {isCurrent && status === 'survey' && (
                        <div style={{ marginTop: '0.75rem', background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>調査予定日を設定</label>
                          <input 
                            type="date" 
                            value={project.surveyDate || ''} 
                            onChange={(e) => handleUpdateField('surveyDate', e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%', fontWeight: 600 }}
                          />
                        </div>
                      )}

                      {/* 報告書（提案書）書類作成ボタン */}
                      {isCurrent && status === 'report_proposal' && (
                        <div style={{ marginTop: '0.75rem', background: 'rgba(217,70,239,0.04)', padding: '1rem', borderRadius: '12px', border: '1px dashed rgba(217,70,239,0.3)' }}>
                          <p style={{ fontSize: '0.8125rem', marginBottom: '0.75rem', color: '#9d174d', fontWeight: 700 }}>📋 報告書（提案書）を作成しましょう</p>
                          <button
                            onClick={() => { openDocModal('report_proposal'); setActiveTab('documents'); }}
                            style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'white', background: '#d946ef', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(217,70,239,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <FilePlus2 size={14} /> 書類を作成する
                          </button>
                        </div>
                      )}

                      {/* 工事日設定 */}
                      {isCurrent && status === 'construction' && (
                        <div style={{ marginTop: '0.75rem', background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>工事予定日を設定</label>
                          <input 
                            type="date" 
                            value={project.constructionDate || ''} 
                            onChange={(e) => handleUpdateField('constructionDate', e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%', fontWeight: 600 }}
                          />
                        </div>
                      )}

                      {/* 受注：請求書連動 */}
                      {isCurrent && status === 'ordered' && (
                        <div style={{ marginTop: '0.75rem', padding: '1.25rem', background: 'rgba(14,165,233,0.05)', borderRadius: '12px', border: '1px dashed #0ea5e9' }}>
                          <p style={{ fontSize: '0.8125rem', marginBottom: '0.75rem', color: '#0369a1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Link2 size={14} /> 請求書の作成が必要です
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {latestQuoteDoc ? (
                              <>
                                <button
                                  onClick={() => { setShowInvoiceLinkModal(true); setInvoiceLinkIsRegen(false); }}
                                  style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'white', background: '#0ea5e9', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                  <Sparkles size={14} /> 見積から自動生成
                                </button>
                                {hasInvoiceDraft && (
                                  <button
                                    onClick={openInvoiceRegen}
                                    style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0ea5e9', background: 'white', border: '1px solid #0ea5e9', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                  >
                                    <RefreshCw size={14} /> 再生成
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => { openDocModal('invoice'); setActiveTab('documents'); }}
                                style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'white', background: '#0ea5e9', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              >
                                <FilePlus2 size={14} /> 請求書を作成する
                              </button>
                            )}
                            <button onClick={() => { setEditBilling(true); setActiveTab('info'); }} style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', background: 'white', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <CreditCard size={14} /> 請求情報を設定
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 見積書ステータス：「請求書を作成」ボタン */}
                      {isCurrent && status === 'quote' && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => { openDocModal('quote'); setActiveTab('documents'); }}
                            style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'white', background: '#10b981', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <FilePlus2 size={14} /> 見積書を作成
                          </button>
                          {latestQuoteDoc && (
                            <button
                              onClick={() => { setShowInvoiceLinkModal(true); setInvoiceLinkIsRegen(false); }}
                              style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0ea5e9', background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <Link2 size={14} /> 請求書を作成
                            </button>
                          )}
                        </div>
                      )}

                      {historyItem && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                          完了: {safeFormatDate(historyItem.date)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== INFO TAB ========== */}
      {activeTab === 'info' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={20} color="var(--primary)" />
              物件・依頼の基本情報
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>所在地・住所</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  <MapPin size={16} className="text-muted" /> {project.address || '未設定'}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>お客様名</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                    <User size={16} /> {project.clientName || '未設定'}
                  </div>
                </div>
                <div style={{ background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>自社担当者</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                    <User size={16} /> {project.staffName || '未設定'}
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>依頼内容・詳細</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: '1.6', marginTop: '0.25rem' }}>
                  {project.requestContent || '具体的な内容はまだありません。'}
                </div>
              </div>
            </div>
          </div>

          {/* 請求・支払い条件 */}
          <div className="card" style={{ borderRadius: '24px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                請求・支払い条件
              </h3>
              {!editBilling && (
                <button onClick={() => setEditBilling(true)} style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(37,99,235,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>情報を編集</button>
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
                  <button type="submit" style={{ flex: 2, background: 'var(--primary)', color: 'white', padding: '0.875rem', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>保存する</button>
                  <button type="button" onClick={() => setEditBilling(false)} style={{ flex: 1, background: 'var(--surface-alt, #f8fafc)', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer' }}>キャンセル</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-alt, #f8fafc)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>請求先</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{project.billingInfo?.name || '-'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-alt, #f8fafc)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>支払い方法</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{project.billingInfo?.paymentTerms || '-'}</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface-alt, #f8fafc)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>締め支払い</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{project.billingInfo?.closingTerms || '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 実行予算管理 */}
          <div className="card" style={{ borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="var(--primary)" />
                実行予算管理
              </h3>
              <button 
                onClick={exportBudgetToExcel}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer' }}
              >
                <FileDown size={16} /> Excel出力
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { key: 'labor', label: '工事費（労務費）' },
                { key: 'materials', label: '材料費' },
                { key: 'others', label: 'その他' },
              ].map(({ key, label }) => (
                <div key={key} style={{ background: 'var(--surface-alt, #f8fafc)', padding: '1rem', borderRadius: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</label>
                  <input 
                    type="number" 
                    value={project.budget?.[key] || 0}
                    onChange={(e) => DataService.updateProject(project.id, { budget: { ...(project.budget || {}), [key]: parseInt(e.target.value) || 0 } })}
                    style={{ width: '100%', background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: 800, outline: 'none', color: 'var(--text)' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--surface-alt, #f8fafc)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>合計予算</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                ¥ {((project?.budget?.labor || 0) + (project?.budget?.materials || 0) + (project?.budget?.others || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== DOCUMENTS TAB ========== */}
      {activeTab === 'documents' && (
        <div className="fade-in card" style={{ borderRadius: '24px' }}>
          {/* アクションボタン */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => openDocModal()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                transition: 'all 0.2s',
              }}
            >
              <FilePlus2 size={18} /> 書類を作成
            </button>

            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="upload-doc"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'other')}
                accept=".xlsx,.xls,.pdf,.docx,.doc,.png,.jpg"
              />
              <label 
                htmlFor="upload-doc"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '12px', 
                  background: 'white', 
                  border: '1.5px solid var(--border)', 
                  fontWeight: 800, 
                  fontSize: '0.875rem', 
                  color: 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                <Upload size={18} color="var(--text-muted)" />
                {isUploading ? 'アップロード中...' : 'ファイルをアップロード'}
              </label>
            </div>
          </div>

          {/* 請求書ドラフト（連動で生成されたもの） */}
          {hasInvoiceDraft && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={14} color="#0ea5e9" /> 自動生成した請求書ドラフト
              </div>
              <InvoiceDraftCard
                draft={project.invoiceDraft}
                project={project}
                settings={settings}
                onRegenerate={openInvoiceRegen}
                onEdit={() => openDocModal('invoice', {
                  billingName: project.invoiceDraft?.billingName || '',
                  billingAddress: project.invoiceDraft?.billingAddress || '',
                  paymentTerms: project.invoiceDraft?.paymentTerms || '',
                  items: project.invoiceDraft?.items || [],
                  invoiceDate: project.invoiceDraft?.invoiceDate || new Date().toISOString().split('T')[0],
                  memo: project.invoiceDraft?.memo || '',
                })}
              />
            </div>
          )}

          {/* 書類一覧 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>保存済み書類</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {(project.documents || []).length} 件
            </span>
          </div>

          {/* カテゴリ別グループ表示 */}
          {(project.documents || []).length > 0 ? (
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {[...project.documents].reverse().map(doc => (
                <DocCard key={doc.id} doc={doc} safeFormatDate={safeFormatDate} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'var(--surface-alt, #f8fafc)', borderRadius: '20px', border: '2px dashed var(--border)' }}>
              <FileText size={56} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>書類はまだありません</p>
              <p style={{ fontSize: '0.8125rem' }}>「書類を作成」または「ファイルをアップロード」から追加できます。</p>
            </div>
          )}
        </div>
      )}

      {/* ========== MODALS ========== */}
      {showDocModal && (
        <DocumentFormModal
          project={project}
          settings={settings}
          initialCategory={docModalCategory}
          initialFormData={docModalInitialData}
          onClose={() => { setShowDocModal(false); setDocModalCategory(null); setDocModalInitialData(null); }}
          onSaved={handleDocSaved}
        />
      )}

      {showInvoiceLinkModal && (
        <InvoiceAutoLinkModal
          project={project}
          settings={settings}
          isRegenerate={invoiceLinkIsRegen}
          onClose={() => setShowInvoiceLinkModal(false)}
          onGenerated={() => {}}
          onManualCreate={() => { setShowInvoiceLinkModal(false); openDocModal('invoice'); }}
        />
      )}
    </div>
  );
};

// ---- サブコンポーネント ----

const DocCard = ({ doc, safeFormatDate }) => {
  const categoryColor = DOC_CATEGORY_COLORS[doc.category] || '#94a3b8';
  const categoryLabel = DOC_CATEGORY_LABELS[doc.category] || doc.category || '書類';
  const isExcel = doc.name?.endsWith('.xlsx') || doc.name?.endsWith('.xls');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--surface-alt, #f8fafc)', borderRadius: '16px', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '12px', 
        background: `${categoryColor}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: categoryColor,
        flexShrink: 0,
      }}>
        {isExcel ? <FileDown size={24} /> : <FileText size={24} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {doc.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: `${categoryColor}15`, color: categoryColor }}>
            {categoryLabel}
          </span>
          {doc.sourceType === 'generated' && (
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>
              アプリ内作成
            </span>
          )}
          {doc.status === 'draft' && (
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
              下書き
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {safeFormatDate(doc.generatedAt || doc.uploadedAt, 'yyyy年MM月dd日')}
          </span>
        </div>
      </div>
      <button 
        onClick={() => {
          if (doc.url === '#') alert('クラウド同期機能は準備中です。');
          else window.open(doc.url, '_blank');
        }}
        title="ダウンロード"
        style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', background: 'white', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0 }}
      >
        <FileDown size={18} />
      </button>
    </div>
  );
};

const InvoiceDraftCard = ({ draft, project, settings, onRegenerate, onEdit }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await StorageService.generateExcel('invoice', {
        billingName: draft.billingName,
        billingAddress: draft.billingAddress,
        paymentTerms: draft.paymentTerms,
        invoiceDate: draft.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: draft.dueDate || '',
        items: draft.items || [],
        memo: draft.memo || '',
      }, project, settings);
    } catch (err) {
      alert('Excel生成に失敗しました: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const items = draft.items || [];
  const totalAmount = draft.totalAmount || items.reduce((s, it) => s + (parseInt(it.amount)||0), 0);

  return (
    <div style={{ background: 'rgba(14,165,233,0.04)', border: '1.5px solid rgba(14,165,233,0.2)', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#d97706' }}>下書き</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>見積から自動生成</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>請求書ドラフト</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
            請求先：{draft.billingName || '-'} ／ 金額：¥{((totalAmount + Math.floor(totalAmount * 0.1))).toLocaleString()}（税込）
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onRegenerate} title="再生成" style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', background: 'white', border: '1px solid rgba(14,165,233,0.3)', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={handleExport} disabled={isExporting} title="Excel出力" style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#0ea5e9', border: 'none', cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.7 : 1 }}>
            <FileDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
