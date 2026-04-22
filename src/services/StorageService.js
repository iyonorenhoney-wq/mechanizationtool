import * as XLSX from 'xlsx';

/**
 * Mock Storage Service
 * Simulates Firebase Storage functionality.
 */

const STORAGE_KEY = 'bizflow_mock_storage';

// 書類カテゴリラベル
export const DOC_CATEGORY_LABELS = {
  report_proposal: '報告書（提案書）',
  quote: '見積書',
  budget: '予算書',
  complete: '完了報告書',
  invoice: '請求書',
  other: 'その他',
};

export const DOC_CATEGORY_COLORS = {
  report_proposal: '#d946ef',
  quote: '#10b981',
  budget: '#f59e0b',
  complete: '#059669',
  invoice: '#0ea5e9',
  other: '#94a3b8',
};

export const StorageService = {
  // Simulate file upload
  uploadFile: async (projectId, file, category = 'other') => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileData = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      category,
      sourceType: 'uploaded',
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
      version: 1
    };

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

  // 書類テンプレート一覧（統合済み）
  getTemplates: () => {
    return [
      { id: 'template-report_proposal', name: '報告書（提案書）', type: 'xlsx', category: 'report_proposal' },
      { id: 'template-quote', name: '見積書', type: 'xlsx', category: 'quote' },
      { id: 'template-budget', name: '予算書', type: 'xlsx', category: 'budget' },
      { id: 'template-complete', name: '完了報告書', type: 'xlsx', category: 'complete' },
      { id: 'template-invoice', name: '請求書', type: 'xlsx', category: 'invoice' },
    ];
  },

  /**
   * フォームデータからExcelファイルを生成しダウンロード、かつ書類メタデータを返す
   * @param {string} category - 書類カテゴリ
   * @param {object} formData - フォーム入力データ
   * @param {object} project - 案件データ
   * @param {object} settings - 会社設定
   * @returns {object} - 生成された書類メタデータ
   */
  generateExcel: async (category, formData, project, settings) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const wb = XLSX.utils.book_new();
    const companyName = settings?.companyName || '株式会社 住宅建設';
    const companyAddress = settings?.address || '';
    const companyPhone = settings?.phone || '';
    const propertyName = project?.propertyName || '';
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const displayDate = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;

    let ws;
    let fileName;

    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'D6E4F0' } } };

    switch (category) {
      case 'report_proposal': {
        const rows = [
          ['', '', '', ''],
          ['', `報告書（提案書）`, '', ''],
          ['', '', '', ''],
          ['作成日', displayDate, '', ''],
          ['物件名', propertyName, '', ''],
          ['顧客名', formData.clientName || '', '', ''],
          ['担当者', formData.staffName || '', '', ''],
          ['', '', '', ''],
          ['【調査内容・提案詳細】', '', '', ''],
          [formData.content || '', '', '', ''],
          ['', '', '', ''],
          ['【所見・備考】', '', '', ''],
          [formData.remarks || '', '', '', ''],
          ['', '', '', ''],
          ['', '', '', companyName],
          ['', '', '', companyAddress],
          ['', '', '', companyPhone],
        ];
        ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 14 }, { wch: 40 }, { wch: 20 }, { wch: 30 }];
        fileName = `報告書（提案書）_${propertyName}_${dateStr}.xlsx`;
        break;
      }

      case 'quote': {
        const items = formData.items || [];
        const total = items.reduce((sum, it) => sum + (parseInt(it.amount) || 0), 0);
        const rows = [
          ['', '', '', '', ''],
          ['', '御見積書', '', '', ''],
          ['', '', '', '', ''],
          ['見積日', displayDate, '', '', ''],
          ['物件名', propertyName, '', '', ''],
          ['顧客名', (formData.clientName || '') + ' 様', '', '', ''],
          ['有効期限', formData.validUntil || '', '', '', ''],
          ['', '', '', '', ''],
          ['No.', '工事内容・品目', '数量', '単位', '金額（円）'],
          ...items.map((it, i) => [
            i + 1,
            it.name || '',
            it.qty || 1,
            it.unit || '式',
            parseInt(it.amount) || 0,
          ]),
          ['', '', '', '', ''],
          ['', '', '', '小計', total],
          ['', '', '', '消費税（10%）', Math.floor(total * 0.1)],
          ['', '', '', '合計金額', total + Math.floor(total * 0.1)],
          ['', '', '', '', ''],
          ['', '', '', '', companyName],
          ['', '', '', '', companyAddress],
          ['', '', '', '', companyPhone],
        ];
        ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 6 }, { wch: 35 }, { wch: 8 }, { wch: 8 }, { wch: 16 }];
        fileName = `見積書_${propertyName}_${dateStr}.xlsx`;
        break;
      }

      case 'budget': {
        const labor = parseInt(formData.labor) || 0;
        const materials = parseInt(formData.materials) || 0;
        const others = parseInt(formData.others) || 0;
        const total = labor + materials + others;
        const rows = [
          ['', '', ''],
          ['', '実行予算書', ''],
          ['', '', ''],
          ['作成日', displayDate, ''],
          ['物件名', propertyName, ''],
          ['', '', ''],
          ['項目', '金額（円）', '備考'],
          ['工事費（労務費）', labor, formData.laborMemo || ''],
          ['材料費', materials, formData.materialsMemo || ''],
          ['その他費用', others, formData.othersMemo || ''],
          ['', '', ''],
          ['合計', total, ''],
          ['', '', ''],
          ['', '', companyName],
        ];
        ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 30 }];
        fileName = `予算書_${propertyName}_${dateStr}.xlsx`;
        break;
      }

      case 'complete': {
        const rows = [
          ['', '', ''],
          ['', '完了報告書', ''],
          ['', '', ''],
          ['報告日', displayDate, ''],
          ['物件名', propertyName, ''],
          ['顧客名', formData.clientName || '', ''],
          ['工事日', formData.constructionDate || '', ''],
          ['', '', ''],
          ['【工事内容】', '', ''],
          [formData.workContent || '', '', ''],
          ['', '', ''],
          ['【完了確認事項】', '', ''],
          [formData.checkItems || '', '', ''],
          ['', '', ''],
          ['【備考】', '', ''],
          [formData.remarks || '', '', ''],
          ['', '', ''],
          ['', '', companyName],
          ['', '', companyAddress],
        ];
        ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 16 }, { wch: 45 }, { wch: 30 }];
        fileName = `完了報告書_${propertyName}_${dateStr}.xlsx`;
        break;
      }

      case 'invoice': {
        const items = formData.items || [];
        const subtotal = items.reduce((sum, it) => sum + (parseInt(it.amount) || 0), 0);
        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;
        const rows = [
          ['', '', '', '', ''],
          ['', '御請求書', '', '', ''],
          ['', '', '', '', ''],
          ['請求日', formData.invoiceDate || displayDate, '', '', ''],
          ['請求先', (formData.billingName || '') + ' 御中', '', '', ''],
          ['住所', formData.billingAddress || '', '', '', ''],
          ['支払い条件', formData.paymentTerms || '', '', '', ''],
          ['支払い期日', formData.dueDate || '', '', '', ''],
          ['物件名', propertyName, '', '', ''],
          ['', '', '', '', ''],
          ['No.', '内容', '数量', '単位', '金額（円）'],
          ...items.map((it, i) => [
            i + 1,
            it.name || '',
            it.qty || 1,
            it.unit || '式',
            parseInt(it.amount) || 0,
          ]),
          ['', '', '', '', ''],
          ['', '', '', '小計', subtotal],
          ['', '', '', '消費税（10%）', tax],
          ['', '', '', '合計請求金額', total],
          ['', '', '', '', ''],
          ['【備考】', formData.memo || '', '', '', ''],
          ['', '', '', '', ''],
          ['', '', '', '', companyName],
          ['', '', '', '', companyAddress],
          ['', '', '', '', companyPhone],
        ];
        ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 6 }, { wch: 35 }, { wch: 8 }, { wch: 14 }, { wch: 16 }];
        fileName = `請求書_${propertyName}_${dateStr}.xlsx`;
        break;
      }

      default:
        throw new Error('Unknown document category: ' + category);
    }

    // Excelファイルをダウンロード
    XLSX.utils.book_append_sheet(wb, ws, DOC_CATEGORY_LABELS[category] || category);
    const wbBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const blobUrl = URL.createObjectURL(blob);

    // 自動ダウンロード
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // メタデータを返す
    const docMeta = {
      id: crypto.randomUUID(),
      name: fileName,
      category,
      sourceType: 'generated',
      status: 'draft',
      formData,
      generatedAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      url: blobUrl,
      version: 1,
    };

    return docMeta;
  },

  createFromTemplate: async (projectId, templateId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const templates = StorageService.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) throw new Error('Template not found');

    const newFile = {
      id: crypto.randomUUID(),
      name: `${template.name}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.xlsx`,
      category: template.category,
      sourceType: 'generated',
      status: 'draft',
      uploadedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      url: '#',
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
