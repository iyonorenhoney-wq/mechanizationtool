import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, Calendar, User, ArrowRight, ClipboardList, TrendingUp } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { STATUS_ORDER, STATUS_LABELS, STATUS_COLORS } from '../services/DataService';

const ProjectList = ({ data, onProjectClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = useMemo(() => {
    return data.projects.filter(p => {
      const matchesSearch = 
        (p.propertyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.staffName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).reverse();
  }, [data.projects, searchTerm, statusFilter]);

  const getNextAction = (status) => {
    const index = STATUS_ORDER.indexOf(status);
    if (index === -1) return '不明なフロー';
    if (index === STATUS_ORDER.length - 1) return '完了済み';
    return `次：${STATUS_LABELS[STATUS_ORDER[index + 1]]}`;
  };

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'yyyy/MM/dd') : '';
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>案件一覧</h1>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900 }}>
          {filteredProjects.length} <span style={{ fontWeight: 500 }}>件</span>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="案件名、担当者、顧客名で検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 0.875rem 0.875rem 2.75rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              fontSize: '0.925rem',
              background: 'var(--background)',
              fontWeight: 600
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          <button 
            onClick={() => setStatusFilter('all')}
            style={{ 
              padding: '0.625rem 1.25rem', 
              borderRadius: '2rem', 
              fontSize: '0.75rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              background: statusFilter === 'all' ? 'var(--primary)' : 'var(--surface-alt)',
              color: statusFilter === 'all' ? 'white' : 'var(--text-muted)',
              border: statusFilter === 'all' ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            すべて
          </button>
          {['received', 'survey', 'ordered', 'construction', 'completed'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{ 
                padding: '0.625rem 1.25rem', 
                borderRadius: '2rem', 
                fontSize: '0.75rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                background: statusFilter === status ? STATUS_COLORS[status] : 'var(--surface-alt)',
                color: statusFilter === status ? 'white' : 'var(--text-muted)',
                border: statusFilter === status ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', paddingBottom: '2rem' }}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map(p => (
            <div 
              key={p.id} 
              className="card" 
              onClick={() => onProjectClick(p.id)}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                border: '1px solid var(--border)',
                background: 'white',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  fontSize: '0.625rem', 
                  fontWeight: 900, 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  background: `${STATUS_COLORS[p.status] || '#64748b'}15`,
                  color: STATUS_COLORS[p.status] || '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {STATUS_LABELS[p.status] || '不明'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <User size={12} />
                   </div>
                   {p.staffName || '未設定'}
                </div>
              </div>

              <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text)', lineHeight: '1.4' }}>
                {p.propertyName}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--surface-alt)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem' }}>
                  <TrendingUp size={16} />
                  {getNextAction(p.status)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  登録: {safeFormatDate(p.createdAt)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface-alt)', borderRadius: '24px', color: 'var(--text-muted)' }}>
            <ClipboardList size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)', marginBottom: '0.5rem' }}>案件が見つかりません</h3>
            <p style={{ fontSize: '0.875rem' }}>検索条件を変えるか、新しく案件を登録してください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
