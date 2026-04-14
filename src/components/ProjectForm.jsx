import React, { useState } from 'react';
import { X, Save, FileText, MapPin, User, Calendar } from 'lucide-react';
import { DataService } from '../services/DataService';

const ProjectForm = ({ onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    propertyName: '',
    address: '',
    description: '',
    staffName: '',
    revenue: 0,
    costs: {
      labor: 0,
      material: 0
    }
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
        <h1 className="text-xl">{initialData ? '案件編集' : '新規案件登録'}</h1>
        <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}><X /></button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <h3 className="text-sm text-muted mb-3">基本情報</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>物件名（必須）</label>
            <input 
              required
              className="form-input"
              value={formData.propertyName}
              onChange={e => setFormData({...formData, propertyName: e.target.value})}
              placeholder="例：〇〇ビル 大規模修繕"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>住所</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <MapPin size={16} color="var(--text-muted)" />
              <input 
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="物件の所在地"
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>担当者名</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <User size={16} color="var(--text-muted)" />
              <input 
                className="form-input"
                value={formData.staffName}
                onChange={e => setFormData({...formData, staffName: e.target.value})}
                placeholder="担当者の氏名"
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>依頼内容・メモ</label>
            <textarea 
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="工事の概要、特記事項など"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <h3 className="text-sm text-muted mb-3">収支計画 (概算)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>売上金額</label>
              <input 
                type="number"
                className="form-input"
                value={formData.revenue}
                onChange={e => setFormData({...formData, revenue: Number(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>工事原価 (労務費)</label>
              <input 
                type="number"
                className="form-input"
                value={formData.costs.labor}
                onChange={e => setFormData({...formData, costs: {...formData.costs, labor: Number(e.target.value)}})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>材料費・交通費</label>
              <input 
                type="number"
                className="form-input"
                value={formData.costs.material}
                onChange={e => setFormData({...formData, costs: {...formData.costs, material: Number(e.target.value)}})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: 'var(--radius)', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Save size={20} />
          {initialData ? '更新する' : '案件を登録する'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
