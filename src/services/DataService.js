const STORAGE_KEY = 'bizflow_mock_firestore';

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
    companyName: '株式会社 住宅建設',
    address: '',
    isAdmin: true,
  },
};

export const DataService = {
  get: async (companyId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_DATA;
      const parsed = JSON.parse(data);
      
      // Filter projects by companyId if provided
      const projects = parsed.projects || [];
      const filteredProjects = companyId 
        ? projects.filter(p => p.companyId === companyId)
        : projects;

      return {
        projects: filteredProjects,
        settings: { ...INITIAL_DATA.settings, ...(parsed.settings || {}) },
      };
    } catch (e) {
      console.error('Data loading error', e);
      return INITIAL_DATA;
    }
  },

  save: async (data) => {
    // In a real app, this would be per-document updates.
    // Here we simulate the whole state for simplicity in the mock.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('data_updated', { detail: data }));
  },

  addProject: async (project, companyId) => {
    const data = await DataService.get(); // Get all for simulation
    const newProject = {
      id: crypto.randomUUID(),
      companyId: companyId || 'company-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'received',
      history: [{ status: 'received', date: new Date().toISOString() }],
      tasks: [],
      notes: '',
      documents: [],
      propertyName: '',
      requestContent: '',
      address: '',
      clientName: '',
      memo: '',
      surveyDate: null,
      constructionDate: null,
      budget: {
        labor: 0,
        materials: 0,
        others: 0,
        history: []
      },
      ...project,
    };
    
    // In mock, we update the local whole object
    const fullData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DATA));
    fullData.projects.push(newProject);
    await DataService.save(fullData);
    return newProject;
  },

  updateProject: async (id, updates) => {
    const fullData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DATA));
    const index = fullData.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldStatus = fullData.projects[index].status;
      fullData.projects[index] = { 
        ...fullData.projects[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      if (updates.status && updates.status !== oldStatus) {
        fullData.projects[index].history.push({
          status: updates.status,
          date: new Date().toISOString()
        });
      }
      
      await DataService.save(fullData);
    }
  },

  deleteProject: async (id) => {
    const fullData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DATA));
    fullData.projects = fullData.projects.filter(p => p.id !== id);
    await DataService.save(fullData);
  },

  updateSettings: async (settings) => {
    const fullData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DATA));
    fullData.settings = { ...fullData.settings, ...settings };
    await DataService.save(fullData);
  }
};
