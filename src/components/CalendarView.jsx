import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, HardHat, Search } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isBefore,
  startOfToday,
  parseISO
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { STATUS_COLORS } from '../services/DataService';

const CalendarView = ({ projects, onProjectClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayProjects = (day) => {
    return projects.filter(p => {
      const isSurvey = p.surveyDate && isSameDay(parseISO(p.surveyDate), day);
      const isConstruction = p.constructionDate && isSameDay(parseISO(p.constructionDate), day);
      return isSurvey || isConstruction;
    }).map(p => ({
      ...p,
      type: p.surveyDate && isSameDay(parseISO(p.surveyDate), day) ? 'survey' : 'construction'
    }));
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-xl" style={{ fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={24} className="text-primary" />
          予定カレンダー
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <button onClick={prevMonth} className="p-1 hover:text-primary transition-colors"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 700, minWidth: '100px', textAlign: 'center' }}>
            {format(currentMonth, 'yyyy年 MM月', { locale: ja })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:text-primary transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Calendar Grid Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div key={day} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? 'var(--danger)' : i === 6 ? 'var(--primary)' : 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((day, i) => {
            const dayProjects = getDayProjects(day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div 
                key={day.toString()} 
                style={{ 
                  minHeight: '100px', 
                  borderRight: i % 7 === 6 ? 'none' : '1px solid var(--border)', 
                  borderBottom: '1px solid var(--border)',
                  background: isToday ? 'rgba(37, 99, 235, 0.03)' : isCurrentMonth ? 'var(--surface)' : 'var(--surface-alt)',
                  padding: '0.5rem',
                  position: 'relative',
                  opacity: isCurrentMonth ? 1 : 0.4
                }}
              >
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: isToday ? 800 : 500, 
                  color: isToday ? 'var(--primary)' : 'inherit',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isToday ? 'var(--primary)' : 'transparent',
                  color: isToday ? 'white' : 'inherit'
                }}>
                  {format(day, 'd')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayProjects.map(p => {
                    const isHistory = isBefore(day, today);
                    return (
                      <div 
                        key={`${p.id}-${p.type}`}
                        onClick={() => onProjectClick(p.id)}
                        style={{ 
                          fontSize: '0.625rem', 
                          padding: '2px 4px', 
                          borderRadius: '2px', 
                          background: p.type === 'survey' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                          color: p.type === 'survey' ? '#4f46e5' : '#1d4ed8',
                          borderLeft: `2px solid ${p.type === 'survey' ? '#6366f1' : '#2563eb'}`,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          opacity: isHistory ? 0.6 : 1,
                          fontWeight: 600
                        }}
                      >
                        {p.type === 'survey' ? ' [調] ' : ' [工] '}
                        {p.propertyName}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#6366f1' }} />
          <span>調査日</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#2563eb' }} />
          <span>工事日</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--text-muted)' }} />
          <span>過去の履歴</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
