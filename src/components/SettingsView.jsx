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
  Lock,
  UserPlus,
  Mail,
  Send
} from 'lucide-react';
import { DataService } from '../services/DataService';
import { AuthService } from '../services/AuthService';

const SettingsView = ({ settings, isAdmin, user }) => {
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState(null);

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

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    setInviteMessage(null);
    try {
      const res = await AuthService.inviteUser(inviteEmail);
      setInviteMessage({ type: 'success', text: res.message });
      setInviteEmail('');
    } catch (err) {
      setInviteMessage({ type: 'error', text: '招待に失敗しました。' });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-xl" style={{ fontWeight: 800 }}>システム設定</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.companyName || 'ゲスト'} の設定</p>
        </div>
        <div 
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
            border: `1px solid ${isAdmin ? '#05966930' : '#ef444430'}`,
          }}
        >
          {isAdmin ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {isAdmin ? '管理者モード' : '一般ユーザー'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
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
                    value={formData.address || ''}
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
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} className="text-primary" />
              メンバー招待
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              メールアドレスを入力して、チームメンバーを招待します。招待されたユーザーは同じ案件データを共有できます。
            </p>
            
            <form onSubmit={handleInvite} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  readOnly={!isAdmin}
                  style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: isAdmin ? 'white' : 'var(--surface-alt)', fontWeight: 600 }}
                />
              </div>
              <button 
                type="submit"
                disabled={!isAdmin || isInviting}
                style={{ 
                  width: '100%', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  padding: '0.875rem', 
                  borderRadius: '12px', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isAdmin ? 1 : 0.5
                }}
              >
                <Send size={16} /> {isInviting ? '送信中...' : '招待を送る'}
              </button>
            </form>

            {inviteMessage && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: inviteMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: inviteMessage.type === 'success' ? '#059669' : '#ef4444'
              }}>
                {inviteMessage.text}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} className="text-primary" />
              データ管理
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              現在のチーム内にある全案件データをエクスポートできます。
            </p>
            <button 
              style={{ 
                width: '100%', 
                background: 'var(--surface-alt)', 
                border: '1px solid var(--border)', 
                color: 'var(--text)', 
                padding: '0.875rem', 
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
              CSVエクスポート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
