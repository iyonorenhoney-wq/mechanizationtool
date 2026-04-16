import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Save, 
  Info,
  ShieldCheck,
  ShieldAlert,
  Database,
  Download,
  MapPin,
  Lock
} from 'lucide-react';
import { DataService } from '../services/DataService';
import { format } from 'date-fns';

const SettingsView = ({ settings }) => {
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(settings.isAdmin);

  const handleLogoUpload = (e) => {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    DataService.updateSettings({ ...formData, isAdmin });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggleAdmin = () => {
    const newState = !isAdmin;
    setIsAdmin(newState);
    DataService.updateSettings({ ...formData, isAdmin: newState });
  };


  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-xl" style={{ fontWeight: 800 }}>システム設定</h1>
        <div 
          onClick={handleToggleAdmin}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            borderRadius: '2rem', 
            background: isAdmin ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: isAdmin ? '#059669' : '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            border: `1px solid ${isAdmin ? '#05966930' : '#ef444430'}`,
            transition: 'all 0.2s'
          }}
        >
          {isAdmin ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {isAdmin ? '管理者モード' : '一般ユーザー'}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        {!isAdmin && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(255, 255, 255, 0.6)', 
            backdropFilter: 'blur(2px)', 
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            color: 'var(--text-muted)'
          }}>
            <Lock size={32} />
            <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>編集には管理者権限が必要です</p>
          </div>
        )}

        <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} className="text-primary" />
          会社基本情報
        </h3>
        
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>会社名</label>
            <input 
              readOnly={!isAdmin}
              className="form-input"
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', background: isAdmin ? 'white' : 'var(--surface-alt)', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>住所</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                readOnly={!isAdmin}
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: isAdmin ? 'white' : 'var(--surface-alt)', fontWeight: 600 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>会社ロゴ</label>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '16px', 
                border: '1px solid var(--border)', 
                background: 'white',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={32} color="var(--border)" />
                )}
              </div>
              {isAdmin && (
                <label style={{ 
                  padding: '0.75rem 1.25rem', 
                  background: 'white', 
                  border: '1px solid var(--primary)', 
                  borderRadius: '12px', 
                  fontSize: '0.8125rem', 
                  fontWeight: 700,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Upload size={16} />
                  ロゴを変更
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={handleSave}
            style={{ 
              width: '100%', 
              background: isSaved ? 'var(--success)' : 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', 
              color: 'white', 
              padding: '1.125rem', 
              borderRadius: '12px', 
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
              border: 'none',
              marginTop: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <Save size={20} />
            {isSaved ? '保存しました' : '設定を更新する'}
          </button>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} className="text-primary" />
          データ管理
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
          現在のシステム内にある全案件データをCSV形式で書き出します。<br />
          バックアップや外部ツール（Excelなど）での分析にご利用ください。
        </p>
        <button 
          style={{ 
            width: '100%', 
            background: 'var(--surface-alt)', 
            border: '1px solid var(--border)', 
            color: 'var(--text)', 
            padding: '1rem', 
            borderRadius: '12px', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <Download size={18} />
          CSVデータをエクスポート
        </button>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <Info size={16} />
          管理者の方へ
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          一般ユーザー（従業員）は会社情報の編集ができないように設定されています。<br />
          SaaS導入時の権限管理はこの設定をベースに構築されます。
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
