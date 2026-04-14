import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Target, 
  Download, 
  Save, 
  Info,
  ExternalLink,
  Table
} from 'lucide-react';
import { DataService } from '../services/DataService';
import { format, parseISO } from 'date-fns';

const SettingsView = ({ settings }) => {
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    DataService.updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const exportToCSV = () => {
    const data = DataService.get();
    const headers = ['物件名', '担当者', 'ステータス', '売上', '原価', '利益', '利益率', '登録日'];
    
    const rows = data.projects.map(p => {
      const costs = (p.costs?.labor || 0) + (p.costs?.material || 0);
      const profit = (p.revenue || 0) - costs;
      const margin = p.revenue > 0 ? ((profit / p.revenue) * 100).toFixed(1) : 0;
      
      return [
        p.propertyName,
        p.staffName || '',
        p.status,
        p.revenue || 0,
        costs,
        profit,
        `${margin}%`,
        format(parseISO(p.createdAt), 'yyyy/MM/dd')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `工事案件データ_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  return (
    <div className="fade-in">
      <h1 className="text-xl mb-4">設定・管理</h1>

      <div className="card">
        <h3 className="text-sm text-muted mb-4 flex items-center gap-2">
          <Building2 size={16} /> 会社基本情報
        </h3>
        
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>会社名（書類反映用）</label>
          <input 
            className="form-input"
            value={formData.companyName}
            onChange={e => setFormData({...formData, companyName: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>会社ロゴ</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {formData.logo ? (
              <img src={formData.logo} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '4px', border: '1px solid var(--border)', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '4px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} color="#94a3b8" />
              </div>
            )}
            <label style={{ 
              padding: '0.5rem 1rem', 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              fontSize: '0.875rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Upload size={16} />
              変更する
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>目標利益率 (%)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Target size={18} color="var(--primary)" />
            <input 
              type="number"
              className="form-input"
              value={formData.targetProfitMargin}
              onChange={e => setFormData({...formData, targetProfitMargin: Number(e.target.value)})}
              style={{ width: '80px', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>※この値を下回るとダッシュボードでアラートが表示されます</p>
        </div>

        <button 
          onClick={handleSave}
          style={{ 
            width: '100%', 
            background: isSaved ? 'var(--success)' : 'var(--primary)', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: 'var(--radius)', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background 0.3s'
          }}
        >
          <Save size={20} />
          {isSaved ? '保存しました！' : '設定を保存する'}
        </button>
      </div>

      <div className="card">
        <h3 className="text-sm text-muted mb-4 flex items-center gap-2">
          <Table size={16} /> データ連携
        </h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>会計ソフトや外部ツール連携用に、現在の全案件データをCSV形式で出力します。将来的なZapier/Make連携のプロトタイプとして活用可能です。</p>
        <button 
          onClick={exportToCSV}
          style={{ 
            width: '100%', 
            background: 'white', 
            border: '2px solid var(--primary)', 
            color: 'var(--primary)', 
            padding: '1rem', 
            borderRadius: 'var(--radius)', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Download size={20} />
          全案件データをCSV出力
        </button>
      </div>

      <div className="card" style={{ background: '#eff6ff', border: 'none' }}>
        <h3 className="text-sm text-muted mb-2 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
          <Info size={16} /> 自動化連携のヒント
        </h3>
        <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
          <p style={{ marginBottom: '0.5rem' }}>このアプリは「ステータス変更」をイベントとして管理しています。将来的に以下が可能です：</p>
          <ul style={{ paddingLeft: '1.25rem' }}>
            <li>受注時に自動でサンクスメール送信</li>
            <li>請求書発行時にチャットツールへ通知</li>
            <li>月間利益のGoogleスプレッドシート自動同期</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
