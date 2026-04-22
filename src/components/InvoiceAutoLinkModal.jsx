import React, { useState } from 'react';
import {
  X,
  FileText,
  Link2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { DataService } from '../services/DataService';
import { DOC_CATEGORY_LABELS } from '../services/StorageService';

/**
 * InvoiceAutoLinkModal
 * 受注ステータスへ変更したとき、または「請求書を作成」ボタン押下時に表示。
 * 見積データを確認し、請求書ドラフトを自動生成する。
 */
const InvoiceAutoLinkModal = ({
  project,
  settings,
  onClose,
  onGenerated,
  onManualCreate,  // 「フォームから作成」ボタン押下時
  isRegenerate,    // 再生成モードかどうか
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  // 最新の見積書ドキュメントを取得
  const quoteDoc = DataService.getLatestQuoteDoc(project);
  const hasQuoteData = quoteDoc && quoteDoc.formData;
  const quoteFormData = quoteDoc?.formData || {};

  // 既存の請求書ドラフト
  const existingDraft = project.invoiceDraft;

  const handleGenerate = async () => {
    // 再生成かつ既存ドラフトがある場合は確認を求める
    if (isRegenerate && existingDraft && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }

    if (!hasQuoteData) {
      alert('見積書のデータが見つかりません。先に見積書を作成してください。');
      return;
    }

    setIsGenerating(true);
    try {
      await DataService.createInvoiceFromQuote(project.id, quoteDoc);
      setDone(true);
      onGenerated && onGenerated();
    } catch (err) {
      console.error(err);
      alert('請求書の自動生成に失敗しました: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const items = quoteFormData.items || [];
  const totalAmount = quoteFormData.totalAmount || items.reduce((s, it) => s + (parseInt(it.amount) || 0), 0);
  const taxAmount = Math.floor(totalAmount * 0.1);

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, maxWidth: '400px' }}>
          <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} color="#0ea5e9" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              {isRegenerate ? '請求書を再生成しました' : '請求書の下書きを作成しました'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              見積データから請求書の下書きを自動作成しました。<br />
              「書類タブ」から編集・確定できます。
            </p>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              閉じる
            </button>
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
            <h2 style={{ fontSize: '1.125rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link2 size={20} color="var(--primary)" />
              {isRegenerate ? '請求書を再生成' : '見積 → 請求書 自動連動'}
            </h2>
            {!isRegenerate && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
                見積書のデータを請求書に自動反映できます
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
          {/* 上書き確認ダイアログ */}
          {confirmOverwrite && (
            <div style={{ padding: '1.25rem', background: 'rgba(239,68,68,0.06)', borderRadius: '14px', border: '1.5px solid rgba(239,68,68,0.2)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#b91c1c', marginBottom: '0.25rem' }}>既存の請求書ドラフトを上書きします</div>
                  <p style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 600 }}>
                    現在の請求書ドラフトのデータは削除されます。最新の見積データで再生成してよろしいですか？
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button onClick={() => setConfirmOverwrite(false)} style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}>
                  キャンセル
                </button>
                <button
                  onClick={() => { setConfirmOverwrite(false); handleGenerate(); }}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  上書きする
                </button>
              </div>
            </div>
          )}

          {/* 見積データが存在しない場合 */}
          {!hasQuoteData ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(245,158,11,0.06)', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={36} color="#f59e0b" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>見積書データが見つかりません</p>
              <p style={{ fontSize: '0.8125rem', color: '#92400e', fontWeight: 600, marginBottom: '1.5rem' }}>
                自動連動するには先に「見積書」を書類作成機能で作成してください。
              </p>
              <button
                onClick={onManualCreate}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={16} /> 見積書を作成する
              </button>
            </div>
          ) : (
            <>
              {/* 見積書データプレビュー */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                  見積書から引き継がれるデータ
                </div>
                <div style={{ background: 'rgba(16,185,129,0.04)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <DataRow label="物件名" value={project.propertyName} />
                  <DataRow label="顧客名 / 請求先" value={quoteFormData.clientName || project.clientName} />
                  {items.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>工事内容・明細</div>
                      {items.slice(0, 3).map((it, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.375rem 0', borderBottom: i < Math.min(items.length, 3) - 1 ? '1px dashed var(--border)' : 'none' }}>
                          <span style={{ fontWeight: 600 }}>{it.name || `項目 ${i+1}`}</span>
                          <span style={{ fontWeight: 800 }}>¥{(parseInt(it.amount)||0).toLocaleString()}</span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.375rem' }}>他 {items.length - 3} 件</div>
                      )}
                    </div>
                  )}
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 900, color: '#10b981' }}>合計金額（税込）</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#10b981' }}>¥{(totalAmount + taxAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 編集可能項目の案内 */}
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>生成後に編集できる項目</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['請求日', '支払い期日', '支払い条件', '請求先住所', '備考'].map(item => (
                    <span key={item} style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '0.25rem 0.625rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px' }}>{item}</span>
                  ))}
                </div>
              </div>

              {/* 見積書の紐付け情報 */}
              {quoteDoc?.name && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1rem' }}>
                  <FileText size={14} />
                  <span>参照見積書：{quoteDoc.name}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f1f5f9', border: '1px solid var(--border)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            {isRegenerate ? 'キャンセル' : 'あとで作成'}
          </button>
          {hasQuoteData && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || confirmOverwrite}
              style={{
                flex: 2,
                padding: '0.875rem',
                borderRadius: '12px',
                background: isGenerating ? '#93c5fd' : '#0ea5e9',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: isGenerating || confirmOverwrite ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isGenerating ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> 生成中...</>
              ) : isRegenerate ? (
                <><RefreshCw size={18} /> 請求書を再生成</>
              ) : (
                <><Link2 size={18} /> 請求書を自動生成</>
              )}
            </button>
          )}
          {!hasQuoteData && onManualCreate && (
            <button
              onClick={onManualCreate}
              style={{ flex: 2, padding: '0.875rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <FileText size={18} /> 手動で作成 <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const DataRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{value || '-'}</span>
  </div>
);

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
  maxWidth: '520px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
  overflow: 'hidden',
};

export default InvoiceAutoLinkModal;
