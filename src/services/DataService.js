const STORAGE_KEY = 'bizflow_mock_firestore';

export const STATUS_ORDER = [
  'received', 
  'survey', 
  'report_proposal', // 提案書・報告書を統合
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
  report_proposal: '報告書（提案書）作成',
  budget: '予算書作成',
  quote: '見積書作成',
  ordered: '受注',
  construction: '工事日',
  completed: '工事完了',
  invoiced: '請求書発行',
  // 後方互換: 旧ステータスのラベル
  proposal: '提案書作成',
  report: '報告書作成',
};

export const STATUS_COLORS = {
  received: '#94a3b8',
  survey: '#6366f1',
  report_proposal: '#d946ef',
  budget: '#f59e0b',
  quote: '#10b981',
  ordered: '#0ea5e9',
  construction: '#2563eb',
  completed: '#059669',
  invoiced: '#475569',
  // 後方互換
  proposal: '#8b5cf6',
  report: '#d946ef',
};

// 旧ステータスを新ステータスに変換（後方互換）
export const migrateStatus = (status) => {
  if (status === 'proposal' || status === 'report') return 'report_proposal';
  return status;
};

const INITIAL_DATA = {
  projects: [],
  settings: {
    logo: null,
    companyName: '株式会社 住宅建設',
    address: '',
    phone: '',
    isAdmin: true,
  },
};

export const DataService = {
  get: async (companyId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_DATA;
      const parsed = JSON.parse(data);
      
      const projects = (parsed.projects || []).map(p => ({
        ...p,
        // 後方互換: 旧ステータスを自動マイグレーション
        status: migrateStatus(p.status),
        history: (p.history || []).map(h => ({
          ...h,
          status: migrateStatus(h.status),
        })),
      }));

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('data_updated', { detail: data }));
  },

  addProject: async (project, companyId) => {
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
      quoteData: null,      // 最新見積データ（請求書連動用）
      invoiceDraft: null,   // 請求書ドラフト
      ...project,
    };
    
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
        fullData.projects[index].history = fullData.projects[index].history || [];
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
  },

  // 見積データを請求書ドラフトに自動連動
  createInvoiceFromQuote: async (projectId, quoteDoc) => {
    const fullData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DATA));
    const index = fullData.projects.findIndex(p => p.id === projectId);
    if (index === -1) throw new Error('Project not found');

    const project = fullData.projects[index];
    const quoteFormData = quoteDoc?.formData || {};

    const invoiceDraft = {
      id: crypto.randomUUID(),
      status: 'draft',
      linkedQuoteId: quoteDoc?.id || null,
      linkedQuoteDocName: quoteDoc?.name || null,
      propertyName: project.propertyName,
      clientName: quoteFormData.clientName || project.clientName || '',
      billingName: quoteFormData.clientName || project.billingInfo?.name || '',
      billingAddress: project.billingInfo?.address || project.address || '',
      items: quoteFormData.items || [],
      totalAmount: quoteFormData.totalAmount || 0,
      paymentTerms: project.billingInfo?.paymentTerms || '',
      closingTerms: project.billingInfo?.closingTerms || '',
      invoiceDate: null,
      dueDate: null,
      memo: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fullData.projects[index].invoiceDraft = invoiceDraft;
    fullData.projects[index].updatedAt = new Date().toISOString();
    await DataService.save(fullData);
    return invoiceDraft;
  },

  // 請求書ドラフトを更新
  updateInvoiceDraft: async (projectId, updates) => {
    const fullData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DATA));
    const index = fullData.projects.findIndex(p => p.id === projectId);
    if (index === -1) throw new Error('Project not found');

    fullData.projects[index].invoiceDraft = {
      ...(fullData.projects[index].invoiceDraft || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    fullData.projects[index].updatedAt = new Date().toISOString();
    await DataService.save(fullData);
  },

  // 見積書ドキュメントを取得
  getLatestQuoteDoc: (project) => {
    if (!project?.documents) return null;
    const quoteDocs = project.documents.filter(d => d.category === 'quote');
    if (quoteDocs.length === 0) return null;
    return quoteDocs.sort((a, b) => new Date(b.generatedAt || b.uploadedAt) - new Date(a.generatedAt || a.uploadedAt))[0];
  },
};
