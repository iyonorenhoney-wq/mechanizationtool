const STORAGE_KEY = 'construction_management_data';

const INITIAL_DATA = {
  projects: [],
  settings: {
    logo: null,
    targetProfitMargin: 20,
    companyName: '株式会社 〇〇工事',
  },
  lastExported: null,
};

export const DataService = {
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_DATA;
      const parsed = JSON.parse(data);
      // Ensure basic structure exists
      return {
        projects: parsed.projects || [],
        settings: { ...INITIAL_DATA.settings, ...(parsed.settings || {}) },
        lastExported: parsed.lastExported || null
      };
    } catch (e) {
      console.error('Data loading error', e);
      return INITIAL_DATA;
    }
  },

  save: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Trigger external event for "Automation Ready" (simulated)
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
      documents: [],
      revenue: 0,
      costs: {
        labor: 0,
        material: 0,
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
      
      // Automatic status handling: if status changed, add to history
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
