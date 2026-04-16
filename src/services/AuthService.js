/**
 * Mock Authentication Service
 * Simulates Firebase Auth functionality for development.
 */

const STORAGE_KEY = 'bizflow_mock_auth';

const INITIAL_STATE = {
  user: null, // { id, email, name, role, companyId, companyName }
  isLoading: false,
};

// Mock data for initial team
const MOCK_COMPANY = {
  id: 'company-123',
  name: '株式会社 住宅建設',
  logo: null
};

export const AuthService = {
  getCurrentUser: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  login: async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock logic
    const user = {
      id: 'user-001',
      email: email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user',
      companyId: MOCK_COMPANY.id,
      companyName: MOCK_COMPANY.name,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: user }));
    return user;
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: null }));
  },

  signup: async (email, password, companyName) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      role: 'admin',
      companyId: crypto.randomUUID(),
      companyName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: user }));
    return user;
  },

  inviteUser: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // In a real app, this sends an email. Here we just return success.
    return { success: true, message: `招待メールを ${email} に送信しました。` };
  }
};
