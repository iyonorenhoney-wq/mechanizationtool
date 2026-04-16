import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  Lock, 
  ArrowRight, 
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AuthService } from '../../services/AuthService';

const LoginView = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await AuthService.login(email, password);
      } else {
        if (!companyName) throw new Error('会社名を入力してください');
        user = await AuthService.signup(email, password, companyName);
      }
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || '認証に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '1.5rem'
    }}>
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'white',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--primary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
          }}>
            <LayoutDashboard size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
            BizFlow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isLogin ? 'アカウントにログインして業務を開始' : '新しいチームのアカウントを作成'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          {!isLogin && (
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                会社名
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="株式会社 住宅建設"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#f8fafc'
                  }}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              メールアドレス
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  background: '#f8fafc'
                }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              パスワード
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  background: '#f8fafc'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '1rem',
              transition: 'all 0.2s',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)'
            }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'ログイン' : 'アカウント作成'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            {isLogin ? '新しいチームを作成する' : '既にアカウントをお持ちですか？ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
