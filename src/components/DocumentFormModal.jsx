import React, { useState } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { StorageService, DOC_CATEGORY_LABELS, DOC_CATEGORY_COLORS } from '../services/StorageService';
import { DataService } from '../services/DataService';

const DOC_TYPES = [
  { id: 'report_proposal', label: '報告書（提案書）', icon: '📋', desc: '調査結果・提案内容をまとめた書類' },
  { id: 'quote', label: '見積書', icon: '💰', desc: '工事費用の見積もり' },
  { id: 'budget', label: '予算書', icon: '📊', desc: '実行予算の管理書類' },
  { id: 'complete', label: '完了報告書', icon: '✅', desc: '工事完了後の報告書類' },
  { id: 'invoice', label: '請求書', icon: '🧾', desc: '請求金額をまとめた書類' },
];

// 明細行の初期値
const newItem = () => ({ id: crypto.randomUUID(), name: '', qty: 1, unit: '式', amount: '' });

const DocumentFormModal = ({ project, settings, onClose, onSaved, initialCategory, initialFormData }) => {
  const [step, setStep] = useState(initialCategory ? 'form' : 'select');
  const [category, setCategory] = useState(initialCategory || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);

  // フォームデータ
  const [form, setForm] = useState(initialFormData || {
    // 共通
    clientName: project?.clientName || '',
    staffName: project?.staffName || '',
    // report_proposal
    content: '',
    remarks: '',
    // quote
    items: [newItem()],
    validUntil: '',
    // budget
    labor: project?.budget?.labor || 0,
    materials: project?.budget?.materials || 0,
    others: project?.budget?.others || 0,
    laborMemo: '',
    materialsMemo: '',
    othersMemo: '',
    // complete
    constructionDate: project?.constructionDate || '',
    workContent: '',
    checkItems: '',
    // invoice
    billingName: project?.billingInfo?.name || project?.clientName || '',
    billingAddress: project?.billingInfo?.address || project?.address || '',
    paymentTerms: project?.billingInfo?.paymentTerms || '',
    closingTerms: project?.billingInfo?.closingTerms || '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    memo: '',
  });

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // 明細行操作
  const addItem = () => setField('items', [...form.items, newItem()]);
  const removeItem = (id) => setField('items', form.items.filter(it => it.id !== id));
  const updateItem = (id, key, val) =>
    setField('items', form.items.map(it => it.id === id ? { ...it, [key]: val } : it));

  const totalAmount = form.items.reduce((s, it) => s + (parseInt(it.amount) || 0), 0);
  const taxAmount = Math.floor(totalAmount * 0.1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const formDataWithTotal = {
        ...form,
        totalAmount: ['quote', 'invoice'].includes(category) ? totalAmount : undefined,
      };

      const docMeta = await StorageService.generateExcel(category, formDataWithTotal, project, settings);

      // 案件のdocumentsに追加
      const updatedDocs = [...(project.documents || []), docMeta];

      // 見積書の場合はquoteDataも更新
      const extraUpdates = {};
      if (category === 'quote') {
        extraUpdates.quoteData = {
          items: form.items,
          totalAmount,
          clientName: form.clientName,
          createdAt: new Date().toISOString(),
          linkedDocId: docMeta.id,
        };
      }

      await DataService.updateProject(project.id, { documents: updatedDocs, ...extraUpdates });

      onSaved && onSaved(docMeta);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Excel生成に失敗しました: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1.5px solid var(--border)',
    fontSize: '0.9rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    outline: 'none',
    background: 'white',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ padding: '2.5rem 2rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>Excel生成完了！</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <strong>{DOC_CATEGORY_LABELS[category]}</strong> が生成され、<br />ダウンロードされました。
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setDone(false); setStep('select'); setCategory(''); }}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--surface-alt, #f8fafc)', border: '1px solid var(--border)', fontWeight: 800, fontSize: '0.875rem' }}
              >
                別の書類を作成
              </button>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem' }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            {step === 'form' && (
              <button onClick={() => { setStep('select'); setCategory(''); }} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem', display: 'block' }}>
                ← 書類選択に戻る
              </button>
            )}
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, margin: 0 }}>
              {step === 'select' ? '📄 書類を作成' : `${DOC_TYPES.find(t => t.id === category)?.icon} ${DOC_CATEGORY_LABELS[category]}`}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 140px)', padding: '1.5rem' }}>
          {/* Step 1: 書類種別選択 */}
          {step === 'select' && (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                作成する書類を選択してください
              </p>
              {DOC_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setCategory(type.id); setStep('form'); }}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.15s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = DOC_CATEGORY_COLORS[type.id]; e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{type.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{type.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.125rem' }}>{type.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '1.25rem', color: 'var(--text-muted)' }}>›</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: フォーム入力 */}
          {step === 'form' && (
            <div style={sectionStyle}>
              {/* 案件情報（読み取り専用） */}
              <div style={{ background: 'rgba(37,99,235,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.12)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>案件情報（自動入力）</div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{project?.propertyName}</div>
              </div>

              {/* 報告書（提案書） */}
              {category === 'report_proposal' && (
                <>
                  <div>
                    <label style={labelStyle}>顧客名</label>
                    <input style={inputStyle} value={form.clientName} onChange={e => setField('clientName', e.target.value)} placeholder="例：山田 太郎" />
                  </div>
                  <div>
                    <label style={labelStyle}>担当者名</label>
                    <input style={inputStyle} value={form.staffName} onChange={e => setField('staffName', e.target.value)} placeholder="例：田中 花子" />
                  </div>
                  <div>
                    <label style={labelStyle}>調査内容・提案詳細</label>
                    <textarea
                      style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                      value={form.content}
                      onChange={e => setField('content', e.target.value)}
                      placeholder="調査結果や提案内容を入力してください..."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>所見・備考</label>
                    <textarea
                      style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                      value={form.remarks}
                      onChange={e => setField('remarks', e.target.value)}
                      placeholder="所見や備考があれば入力してください..."
                    />
                  </div>
                </>
              )}

              {/* 見積書 */}
              {category === 'quote' && (
                <>
                  <div>
                    <label style={labelStyle}>顧客名</label>
                    <input style={inputStyle} value={form.clientName} onChange={e => setField('clientName', e.target.value)} placeholder="例：山田 太郎" />
                  </div>
                  <div>
                    <label style={labelStyle}>有効期限</label>
                    <input type="date" style={inputStyle} value={form.validUntil} onChange={e => setField('validUntil', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>工事内容・明細</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {form.items.map((item, idx) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <input
                            style={{ ...inputStyle, fontSize: '0.85rem' }}
                            value={item.name}
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                            placeholder={`内容 ${idx + 1}`}
                          />
                          <input
                            type="number"
                            style={{ ...inputStyle, width: '90px', fontSize: '0.85rem' }}
                            value={item.amount}
                            onChange={e => updateItem(item.id, 'amount', e.target.value)}
                            placeholder="金額"
                          />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>円</span>
                          {form.items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} style={{ color: 'var(--danger)', padding: '0.25rem', borderRadius: '6px', background: 'rgba(239,68,68,0.07)', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addItem}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px dashed var(--border)', background: 'white', color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        <Plus size={16} /> 明細を追加
                      </button>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.06)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700 }}>小計</span>
                      <span style={{ fontWeight: 800 }}>¥{totalAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700 }}>消費税（10%）</span>
                      <span style={{ fontWeight: 800 }}>¥{taxAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(16,185,129,0.2)' }}>
                      <span style={{ fontWeight: 900, color: '#10b981' }}>合計金額</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>¥{(totalAmount + taxAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}

              {/* 予算書 */}
              {category === 'budget' && (
                <>
                  <div>
                    <label style={labelStyle}>工事費（労務費）</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="number" style={{ ...inputStyle, flex: 1 }} value={form.labor} onChange={e => setField('labor', e.target.value)} placeholder="0" />
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>円</span>
                    </div>
                    <input style={{ ...inputStyle, marginTop: '0.5rem', fontSize: '0.8125rem' }} value={form.laborMemo} onChange={e => setField('laborMemo', e.target.value)} placeholder="備考（任意）" />
                  </div>
                  <div>
                    <label style={labelStyle}>材料費</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="number" style={{ ...inputStyle, flex: 1 }} value={form.materials} onChange={e => setField('materials', e.target.value)} placeholder="0" />
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>円</span>
                    </div>
                    <input style={{ ...inputStyle, marginTop: '0.5rem', fontSize: '0.8125rem' }} value={form.materialsMemo} onChange={e => setField('materialsMemo', e.target.value)} placeholder="備考（任意）" />
                  </div>
                  <div>
                    <label style={labelStyle}>その他費用</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="number" style={{ ...inputStyle, flex: 1 }} value={form.others} onChange={e => setField('others', e.target.value)} placeholder="0" />
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>円</span>
                    </div>
                    <input style={{ ...inputStyle, marginTop: '0.5rem', fontSize: '0.8125rem' }} value={form.othersMemo} onChange={e => setField('othersMemo', e.target.value)} placeholder="備考（任意）" />
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.06)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 900, color: '#f59e0b' }}>合計予算</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>
                        ¥{(parseInt(form.labor)||0 + parseInt(form.materials)||0 + parseInt(form.others)||0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* 完了報告書 */}
              {category === 'complete' && (
                <>
                  <div>
                    <label style={labelStyle}>顧客名</label>
                    <input style={inputStyle} value={form.clientName} onChange={e => setField('clientName', e.target.value)} placeholder="例：山田 太郎" />
                  </div>
                  <div>
                    <label style={labelStyle}>工事実施日</label>
                    <input type="date" style={inputStyle} value={form.constructionDate} onChange={e => setField('constructionDate', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>工事内容</label>
                    <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.workContent} onChange={e => setField('workContent', e.target.value)} placeholder="実施した工事内容を入力..." />
                  </div>
                  <div>
                    <label style={labelStyle}>完了確認事項</label>
                    <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.checkItems} onChange={e => setField('checkItems', e.target.value)} placeholder="完了確認した項目を入力..." />
                  </div>
                  <div>
                    <label style={labelStyle}>備考</label>
                    <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.remarks} onChange={e => setField('remarks', e.target.value)} placeholder="備考があれば..." />
                  </div>
                </>
              )}

              {/* 請求書 */}
              {category === 'invoice' && (
                <>
                  <div>
                    <label style={labelStyle}>請求先名（宛名）</label>
                    <input style={inputStyle} value={form.billingName} onChange={e => setField('billingName', e.target.value)} placeholder="例：山田 太郎" />
                  </div>
                  <div>
                    <label style={labelStyle}>請求先住所</label>
                    <input style={inputStyle} value={form.billingAddress} onChange={e => setField('billingAddress', e.target.value)} placeholder="例：東京都渋谷区..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>請求日</label>
                      <input type="date" style={inputStyle} value={form.invoiceDate} onChange={e => setField('invoiceDate', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>支払い期日</label>
                      <input type="date" style={inputStyle} value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>支払い条件</label>
                    <input style={inputStyle} value={form.paymentTerms} onChange={e => setField('paymentTerms', e.target.value)} placeholder="例：月末締翌末払・銀行振込" />
                  </div>
                  <div>
                    <label style={labelStyle}>請求内容・明細</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {form.items.map((item, idx) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <input
                            style={{ ...inputStyle, fontSize: '0.85rem' }}
                            value={item.name}
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                            placeholder={`内容 ${idx + 1}`}
                          />
                          <input
                            type="number"
                            style={{ ...inputStyle, width: '90px', fontSize: '0.85rem' }}
                            value={item.amount}
                            onChange={e => updateItem(item.id, 'amount', e.target.value)}
                            placeholder="金額"
                          />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>円</span>
                          {form.items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} style={{ color: 'var(--danger)', padding: '0.25rem', borderRadius: '6px', background: 'rgba(239,68,68,0.07)', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addItem}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px dashed var(--border)', background: 'white', color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        <Plus size={16} /> 明細を追加
                      </button>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(14,165,233,0.06)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700 }}>小計</span>
                      <span style={{ fontWeight: 800 }}>¥{totalAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700 }}>消費税（10%）</span>
                      <span style={{ fontWeight: 800 }}>¥{taxAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(14,165,233,0.2)' }}>
                      <span style={{ fontWeight: 900, color: '#0ea5e9' }}>合計請求金額</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0ea5e9' }}>¥{(totalAmount + taxAmount).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>備考</label>
                    <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.memo} onChange={e => setField('memo', e.target.value)} placeholder="振込先口座情報など..." />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f1f5f9', border: '1px solid var(--border)', fontWeight: 800, fontSize: '0.875rem' }}>
              キャンセル
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                flex: 2,
                padding: '0.875rem',
                borderRadius: '12px',
                background: isGenerating ? '#93c5fd' : 'var(--primary)',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isGenerating ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> 生成中...</>
              ) : (
                <><Download size={18} /> Excelを生成・保存</>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const modalStyle = {
  background: 'white',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '560px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
  overflow: 'hidden',
};

export default DocumentFormModal;
