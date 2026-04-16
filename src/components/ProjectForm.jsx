import React, { useState } from 'react';
import { X, Save, MapPin, User, FileText, StickyNote } from 'lucide-react';
import { DataService } from '../services/DataService';

const ProjectForm = ({ onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    propertyName: '',
    requestContent: '',
    address: '',
    clientName: '',
    memo: '',
    staffName: '', // Keep for matching list requirements
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      DataService.updateProject(initialData.id, formData);
    } else {
      DataService.addProject(formData);
    }
    onCancel();
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-xl" style={{ fontWeight: 800, color: 'var(--text)' }}>
          {initialData ? '案件情報の編集' : '新規案件登録'}
        </h1>
        <button 
          onClick={onCancel} 
          style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              物件名 <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input 
              required
              className="form-input"
              value={formData.propertyName}
              onChange={e => setFormData({...formData, propertyName: e.target.value})}
              placeholder="例：〇〇マンション 101号室"
              style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              工事依頼内容
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input"
                value={formData.requestContent}
                onChange={e => setFormData({...formData, requestContent: e.target.value})}
                placeholder="例：排水管つまりの解消、床材の張り替え"
                style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              住所
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="現場の所在地を入力"
                style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                依頼者名
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  placeholder="例：山田 太郎 様"
                  style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                自社担当者
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input"
                  value={formData.staffName}
                  onChange={e => setFormData({...formData, staffName: e.target.value})}
                  placeholder="自社の担当者名"
                  style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              メモ
            </label>
            <div style={{ position: 'relative' }}>
              <StickyNote size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <textarea 
                className="form-input"
                rows={4}
                value={formData.memo}
                onChange={e => setFormData({...formData, memo: e.target.value})}
                placeholder="補足事項や注意点など"
                style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', 
            color: 'white', 
            padding: '1.25rem', 
            borderRadius: 'var(--radius)', 
            fontWeight: 800,
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 12px 24px -8px rgba(37, 99, 235, 0.4)',
            border: 'none',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          <Save size={22} />
          {initialData ? '変更を保存する' : 'この案件を登録する'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
