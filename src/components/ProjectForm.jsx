import React, { useState } from 'react';
import { X, Save, MapPin, User, FileText, StickyNote, AlertCircle, Loader2 } from 'lucide-react';
import { DataService } from '../services/DataService';

const ProjectForm = ({ onCancel, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(initialData || {
    propertyName: '',
    requestContent: '',
    address: '',
    clientName: '',
    memo: '',
    staffName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.propertyName.trim()) {
      setError('物件名を入力してください。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (initialData) {
        DataService.updateProject(initialData.id, formData);
      } else {
        DataService.addProject(formData);
      }
      setTimeout(() => {
        onCancel();
      }, 500);
    } catch (err) {
      console.error('Submit Error:', err);
      setError('保存中にエラーが発生しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
            {initialData ? '案件情報の編集' : '新規案件の登録'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            正確な情報を入力して「保存」ボタンを押してください。
          </p>
        </div>
        <button 
          onClick={onCancel} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', color: 'var(--text-muted)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', background: 'white', borderRadius: '20px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              物件名 <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input 
              required
              autoFocus
              className="form-input"
              value={formData.propertyName}
              onChange={e => setFormData({...formData, propertyName: e.target.value})}
              placeholder="例：〇〇マンション 101号室"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              工事・依頼内容
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input"
                value={formData.requestContent}
                onChange={e => setFormData({...formData, requestContent: e.target.value})}
                placeholder="例：排水管つまりの解消、床材の張り替え"
                style={{ width: '100%', padding: '1rem 1rem 1rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '1rem', fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              現場住所
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="現場の所在地を入力"
                style={{ width: '100%', padding: '1rem 1rem 1rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '1rem', fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                依頼者名（施主）
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  placeholder="例：山田 太郎 様"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                自社担当者
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input"
                  value={formData.staffName}
                  onChange={e => setFormData({...formData, staffName: e.target.value})}
                  placeholder="社内の担当者名"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              メモ・備考
            </label>
            <div style={{ position: 'relative' }}>
              <StickyNote size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <textarea 
                className="form-input"
                rows={4}
                value={formData.memo}
                onChange={e => setFormData({...formData, memo: e.target.value})}
                placeholder="特記事項や搬入経路の注意点など"
                style={{ width: '100%', padding: '1rem 1rem 1rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 500 }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="button"
            onClick={onCancel}
            style={{ 
              flex: 1,
              background: 'white', 
              color: 'var(--text)', 
              padding: '1.25rem', 
              borderRadius: '16px', 
              fontWeight: 800,
              fontSize: '1rem',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              flex: 2,
              background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', 
              color: 'white', 
              padding: '1.25rem', 
              borderRadius: '16px', 
              fontWeight: 800,
              fontSize: '1.125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 12px 24px -8px rgba(37, 99, 235, 0.4)',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.3s'
            }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            {initialData ? '変更を保存する' : 'この内容で案件を登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
