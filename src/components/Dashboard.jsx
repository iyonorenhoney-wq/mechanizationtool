import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { format, startOfDay, isSameDay, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

const Dashboard = ({ data, onProjectClick, onCalendarClick, onAddClick }) => {
  const { projects, settings } = data;
  const today = startOfDay(new Date());

  // Upcoming schedule
  const upcomingSchedule = useMemo(() => {
    return projects.filter(p => {
      const sDate = p.surveyDate ? parseISO(p.surveyDate) : null;
      const cDate = p.constructionDate ? parseISO(p.constructionDate) : null;
      return (sDate && (isSameDay(sDate, today) || isAfter(sDate, today))) || 
             (cDate && (isSameDay(cDate, today) || isAfter(cDate, today)));
    }).map(p => {
      if (!p) return null;
      const sDate = p.surveyDate ? parseISO(p.surveyDate) : null;
      const cDate = p.constructionDate ? parseISO(p.constructionDate) : null;
      const isSurvey = sDate && (isSameDay(sDate, today) || isAfter(sDate, today));
      const targetDate = isSurvey ? sDate : cDate;
      return { ...p, targetDate, type: isSurvey ? 'survey' : 'construction' };
    }).filter(item => item !== null && item.targetDate !== null)
      .sort((a, b) => a.targetDate - b.targetDate).slice(0, 5);
  }, [projects, today]);

  // Project status summary
  const statusSummary = useMemo(() => {
    const counts = { active: 0, completed: 0, received: 0 };
    projects.forEach(p => {
      if (p.status === 'completed' || p.status === 'invoiced') counts.completed++;
      else if (p.status === 'received') counts.received++;
      else counts.active++;
    });
    return counts;
  }, [projects]);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 800, color: 'var(--text)' }}>BizFlow Dashboard</h1>
          <p className="text-sm text-muted">今日もお疲れ様です。本日の状況を確認しましょう。</p>
        </div>
        <button 
          onClick={onCalendarClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            borderRadius: 'var(--radius)', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
            color: 'white',
            fontWeight: 700,
            border: 'none',
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)',
            cursor: 'pointer'
          }}
        >
          <CalendarIcon size={18} />
          カレンダー
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--border)' }}>
          <div className="text-muted text-xs font-bold uppercase tracking-wider mb-2">依頼中</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{statusSummary.received} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>件</span></div>
        </div>
        <div className="card" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--border)' }}>
          <div className="text-muted text-xs font-bold uppercase tracking-wider mb-2">進行中</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{statusSummary.active} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>件</span></div>
        </div>
        <div className="card" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--border)' }}>
          <div className="text-muted text-xs font-bold uppercase tracking-wider mb-2">完了済み</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{statusSummary.completed} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>件</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} className="text-primary" />
              直近の予定
            </h3>
            <button onClick={onCalendarClick} style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              すべて見る
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {upcomingSchedule.length > 0 ? upcomingSchedule.map(item => (
              <div 
                key={`${item.id}-${item.type}`}
                onClick={() => onProjectClick(item.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: 'var(--surface-alt)', 
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  hover: { transform: 'translateX(4px)' }
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: item.type === 'survey' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                  color: item.type === 'survey' ? '#6366f1' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  {item.type === 'survey' ? <CalendarIcon size={24} /> : <Briefcase size={24} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{item.propertyName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: item.type === 'survey' ? '#6366f1' : '#2563eb', 
                      color: 'white',
                      fontSize: '0.625rem',
                      fontWeight: 700
                    }}>
                      {item.type === 'survey' ? '調査' : '工事'}
                    </span>
                    {format(item.targetDate, 'M/d (E)', { locale: ja })}
                  </div>
                </div>
                <ArrowRight size={18} className="text-muted" />
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>直近の予定はありません</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', border: 'none' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              クイックアクション
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button 
                onClick={() => onCalendarClick()}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
                予定を確認する
              </button>
              <button 
                onClick={onAddClick}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'white', border: 'none', color: '#4f46e5', fontWeight: 800, textAlign: 'left', cursor: 'pointer' }}>
                案件を登録する
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.25rem' }}>会社情報</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', background: 'var(--surface-alt)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} className="text-muted" />
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{settings.companyName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{settings.address || '住所未設定'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
