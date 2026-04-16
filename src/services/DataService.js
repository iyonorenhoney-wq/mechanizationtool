const STORAGE_KEY = 'construction_management_data';

export const STATUS_ORDER = [
  'received', 
  'survey', 
  'proposal', 
  'report', 
  'budget', 
  'quote', 
  'ordered', 
  'construction', 
  'completed', 
  'invoiced'
];

export const STATUS_LABELS = {
  received: '依頼受領',
  survey: '調査日',
  proposal: '提案書作成',
  report: '報告書作成',
  budget: '予算書作成',
  quote: '見積書作成',
  ordered: '受注',
  construction: '工事日',
  completed: '工事完了',
  invoiced: '請求書発行'
};

export const STATUS_COLORS = {
  received: '#94a3b8',
  survey: '#6366f1',
  proposal: '#8b5cf6',
  report: '#d946ef',
  budget: '#f59e0b',
  quote: '#10b981',
  ordered: '#0ea5e9',
  construction: '#2563eb',
  completed: '#059669',
  invoiced: '#475569'
};

const INITIAL_DATA = {
  projects: [],
  settings: {
    logo: null,
    companyName: '株式会社 〇〇工事',
    address: '',
    isAdmin: true, // For simulation
  },
};

export const DataService = {
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_DATA;
      const parsed = JSON.parse(data);
      return {
        projects: parsed.projects || [],
        settings: { ...INITIAL_DATA.settings, ...(parsed.settings || {}) },
      };
    } catch (e) {
      console.error('Data loading error', e);
      return INITIAL_DATA;
    }
  },

  save: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('data_updated', { detail: data }));
  },

  addProject: (project) => {
    const data = DataService.get();
    const newProject = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'received',
      history: [{ status: 'received', date: new Date().toISOString() }],
      tasks: [],
      notes: '',
      documents: [], // { type, name, date, url }
      // Fields from registration
      propertyName: '',
      requestContent: '',
      address: '',
      clientName: '',
      memo: '',
      // Dynamic fields filled during flow
      surveyDate: null,
      constructionDate: null,
      billingInfo: {
        name: '',
        address: '',
        paymentTerms: '',
        closingTerms: '',
      },
      ...project,
    };
    data.projects.push(newProject);
    DataService.save(data);
    return newProject;
  },

  updateProject: (id, updates) => {
    const data = DataService.get();
    const index = data.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldStatus = data.projects[index].status;
      data.projects[index] = { ...data.projects[index], ...updates };
      
      if (updates.status && updates.status !== oldStatus) {
        data.projects[index].history.push({
          status: updates.status,
          date: new Date().toISOString()
        });
      }
      
      DataService.save(data);
    }
  },

  deleteProject: (id) => {
    const data = DataService.get();
    data.projects = data.projects.filter(p => p.id !== id);
    DataService.save(data);
  },

  updateSettings: (settings) => {
    const data = DataService.get();
    data.settings = { ...data.settings, ...settings };
    DataService.save(data);
  }
};
