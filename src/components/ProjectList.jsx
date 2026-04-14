import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Calendar, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const STATUS_LABELS = {
  received: { label: '依頼受領', color: '#64748b' },
  investigating: { label: '調査中', color: '#3b82f6' },
  proposed: { label: '提案済', color: '#8b5cf6' },
  estimated: { label: '見積提出済', color: '#f59e0b' },
  ordered: { label: '受注', color: '#10b981' },
  construction: { label: '工事中', color: '#fbbf24' },
  completed: { label: '工事完了', color: '#059669' },
  report_submitted: { label: '完了報告済', color: '#0d9488' },
  invoiced: { label: '請求済', color: '#2563eb' }
};

const ProjectList = ({ data, onProjectClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = data.projects.filter(p => {
    const matchesSearch = 
      p.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="text-xl">案件一覧</h1>
      </div>

      <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="物件名・担当者で検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <button 
            onClick={() => setStatusFilter('all')}
            style={{ 
              padding: '0.4rem 0.8rem', 
              borderRadius: '2rem', 
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              background: statusFilter === 'all' ? 'var(--primary)' : 'transparent',
              color: statusFilter === 'all' ? 'white' : 'var(--text-muted)',
              border: `1px solid ${statusFilter === 'all' ? 'var(--primary)' : 'var(--border)'}`
            }}
          >
            すべて
          </button>
          {['received', 'investigating', 'ordered', 'construction', 'invoiced'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '2rem', 
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                background: statusFilter === status ? 'var(--primary)' : 'transparent',
                color: statusFilter === status ? 'white' : 'var(--text-muted)',
                border: `1px solid ${statusFilter === status ? 'var(--primary)' : 'var(--border)'}`
              }}
            >
              {STATUS_LABELS[status].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map(p => (
            <div 
              key={p.id} 
              className="card" 
              onClick={() => onProjectClick(p.id)}
              style={{ padding: '1rem', cursor: 'pointer', position: 'relative', transition: 'transform 0.1s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '1rem', 
                  background: `${STATUS_LABELS[p.status]?.color}20`,
                  color: STATUS_LABELS[p.status]?.color
                }}>
                  {STATUS_LABELS[p.status]?.label}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  <ChevronRight size={18} />
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{p.propertyName}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="text-muted text-sm flex items-center gap-1">
                  <User size={14} /> {p.staffName || '未設定'}
                </div>
                <div className="text-muted text-sm flex items-center gap-1">
                  <Calendar size={14} /> {format(parseISO(p.createdAt), 'MM/dd')}
                </div>
              </div>
              {p.revenue > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontWeight: 600, textAlign: 'right' }}>
                  ¥{p.revenue.toLocaleString()}
                </div>
              )}
            </div>
          )).reverse()
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            該当する案件が見つかりません
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
