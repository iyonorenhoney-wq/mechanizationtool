/**
 * Mock Storage Service
 * Simulates Firebase Storage functionality.
 */

const STORAGE_KEY = 'bizflow_mock_storage';

export const StorageService = {
  // Simulate file upload
  uploadFile: async (projectId, file, category = 'others') => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileData = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      category,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file), // Local preview URL
      version: 1
    };

    // In a real app, we'd save the file to cloud storage.
    // For the mock, we store the metadata in localStorage.
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!storage[projectId]) storage[projectId] = [];
    storage[projectId].push(fileData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

    return fileData;
  },

  getFiles: async (projectId) => {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return storage[projectId] || [];
  },

  // Standard Templates
  getTemplates: () => {
    return [
      { id: 'template-report', name: '報告書テンプレート', type: 'xlsx', category: 'report' },
      { id: 'template-quote', name: '見積書テンプレート', type: 'xlsx', category: 'quote' },
      { id: 'template-budget', name: '予算書テンプレート', type: 'xlsx', category: 'budget' },
      { id: 'template-proposal', name: '提案書テンプレート', type: 'xlsx', category: 'proposal' },
      { id: 'template-complete', name: '完了報告書テンプレート', type: 'xlsx', category: 'complete' },
    ];
  },

  createFromTemplate: async (projectId, templateId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const templates = StorageService.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) throw new Error('Template not found');

    const newFile = {
      id: crypto.randomUUID(),
      name: `${template.name.replace('テンプレート', '')}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.xlsx`,
      category: template.category,
      uploadedAt: new Date().toISOString(),
      url: '#', // Simulate a link
      version: 1,
      isTemplateCopy: true
    };

    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!storage[projectId]) storage[projectId] = [];
    storage[projectId].push(newFile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

    return newFile;
  }
};
