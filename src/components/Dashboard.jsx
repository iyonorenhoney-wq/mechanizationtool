import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  BarChart3,
  Calendar,
  Users
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
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const Dashboard = ({ data, onProjectClick }) => {
  const { projects, settings } = data;

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const stats = {};
    projects.forEach(p => {
      if (p.status === 'invoiced' || p.status === 'completed') {
        const date = p.history.find(h => h.status === 'invoiced')?.date || p.createdAt;
        const month = format(parseISO(date), 'yyyy-MM');
        
        if (!stats[month]) {
          stats[month] = { month, revenue: 0, profit: 0, count: 0 };
        }
        
        const costs = (p.costs?.labor || 0) + (p.costs?.material || 0);
        const profit = (p.revenue || 0) - costs;
        
        stats[month].revenue += p.revenue || 0;
        stats[month].profit += profit;
        stats[month].count += 1;
      }
    });

    return Object.values(stats).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [projects]);

  // Ranking by person
  const staffRanking = useMemo(() => {
    const ranking = {};
    projects.forEach(p => {
      const name = p.staffName || '未設定';
      if (!ranking[name]) ranking[name] = { name, revenue: 0, count: 0 };
      ranking[name].revenue += p.revenue || 0;
      ranking[name].count += 1;
    });
    return Object.values(ranking).sort((a, b) => b.revenue - a.revenue);
  }, [projects]);

  // Low margin alerts
  const lowMarginProjects = projects.filter(p => {
    const costs = (p.costs?.labor || 0) + (p.costs?.material || 0);
    const profit = (p.revenue || 0) - costs;
    const margin = p.revenue > 0 ? (profit / p.revenue) * 100 : 0;
    return p.revenue > 0 && margin < settings.targetProfitMargin;
  });

  const totalRevenue = monthlyStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = monthlyStats.reduce((sum, s) => sum + s.profit, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="fade-in">
      <h1 className="text-xl mb-4">経営ダッシュボード</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div className="text-muted text-sm flex items-center gap-1">
            <TrendingUp size={14} /> 直近6ヶ月売上
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>
            ¥{totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div className="text-muted text-sm flex items-center gap-1">
            <BarChart3 size={14} /> 平均利益率
          </div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            marginTop: '0.5rem',
            color: avgMargin < settings.targetProfitMargin ? 'var(--danger)' : 'var(--success)'
          }}>
            {avgMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm text-muted mb-4">月別推移 (売上・利益)</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} tickFormatter={(val) => val.split('-')[1] + '月'} />
              <YAxis fontSize={12} hide />
              <Tooltip />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="var(--success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {lowMarginProjects.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '1rem' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            利益率アラート ({lowMarginProjects.length}件)
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            {lowMarginProjects.slice(0, 2).map(p => (
              <div key={p.id} onClick={() => onProjectClick(p.id)} style={{ fontSize: '0.875rem', padding: '0.25rem 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                {p.propertyName} <span style={{ color: 'var(--danger)', float: 'right' }}>{( ((p.revenue - (p.costs.labor + p.costs.material)) / p.revenue) * 100 ).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-sm text-muted mb-4">担当者別売上ランキング</h3>
        {staffRanking.map((staff, index) => (
          <div key={staff.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', 
              background: index === 0 ? '#ffd700' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{staff.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{staff.count}件の案件</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
              ¥{staff.revenue.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
