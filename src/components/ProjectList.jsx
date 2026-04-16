import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Calendar, User, ArrowRight, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { STATUS_ORDER, STATUS_LABELS, STATUS_COLORS } from '../services/DataService';

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

  const getNextAction = (status) => {
    const index = STATUS_ORDER.indexOf(status);
    if (index === -1 || index === STATUS_ORDER.length - 1) return '完了';
    return `次：${STATUS_LABELS[STATUS_ORDER[index + 1]]}`;
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 className="text-xl" style={{ fontWeight: 800 }}>案件一覧</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          全 {data.projects.length} 件
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="物件名・担当者で検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 0.875rem 0.875rem 2.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.925rem',
              background: 'var(--surface-alt)'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setStatusFilter('all')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.75rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: statusFilter === 'all' ? 'var(--primary)' : 'var(--surface-alt)',
              color: statusFilter === 'all' ? 'white' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            すべて
          </button>
          {STATUS_ORDER.filter(s => ['received', 'survey', 'ordered', 'construction', 'completed', 'invoiced'].includes(s)).map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: statusFilter === status ? 'var(--primary)' : 'var(--surface-alt)',
                color: statusFilter === status ? 'white' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map(p => (
            <div 
              key={p.id} 
              className="card" 
              onClick={() => onProjectClick(p.id)}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                position: 'relative', 
                border: '1px solid var(--border)',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontWeight: 800, 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  background: `${STATUS_COLORS[p.status]}15`,
                  color: STATUS_COLORS[p.status],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {STATUS_LABELS[p.status]}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span style={{ marginRight: '0.5rem' }}>{p.staffName || '未設定'}</span>
                  {format(parseISO(p.createdAt), 'yyyy/MM/dd')}
                </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)' }}>
                {p.propertyName}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                  <ArrowRight size={14} />
                  {getNextAction(p.status)}
                </div>
                <ChevronRight size={18} className="text-muted" />
              </div>
            </div>
          )).reverse()
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
            <ClipboardList size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>該当する案件がありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
