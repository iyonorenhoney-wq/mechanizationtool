import React from 'react';
import { Bell, Calendar, X, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const NotificationCenter = ({ notifications, onProjectClick, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: '320px',
      height: '100vh',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} className="text-primary" />
          通知
        </h2>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {notifications.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => {
                  onProjectClick(n.projectId);
                  onClose();
                }}
                className="card" 
                style={{ 
                  padding: '1rem', 
                  cursor: 'pointer', 
                  background: n.type === 'warning' ? '#fffbeb' : 'white',
                  borderLeft: `4px solid ${n.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {n.type === 'warning' ? <AlertTriangle size={18} color="#f59e0b" /> : <Info size={18} color="#3b82f6" />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      詳細を見る <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.875rem' }}>新しい通知はありません</p>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button onClick={onClose} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--surface-alt)', fontWeight: 700, fontSize: '0.875rem' }}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
