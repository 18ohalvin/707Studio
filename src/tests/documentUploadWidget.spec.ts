import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import { formatValue } from '../components/hub/hubUtils.ts';

describe('Document Upload Widget & Field Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('1. Option A: addWidget adds DocumentUpload with full default props and opens sidebar', () => {
    const store = useEditorStore();
    expect(store.isDocumentSidebarOpen).toBe(false);

    const widget = store.addWidget('DocumentUpload');
    expect(widget).toBeDefined();
    expect(widget.type).toBe('DocumentUpload');
    expect(widget.props.title).toBe('UPLOAD DOCUMENT');
    expect(widget.props.subtitle).toContain('PDF');
    expect(widget.props.maxSizeMb).toBe(10);
    expect(widget.props.allowedCategories).toContain('documents');
    expect(widget.props.allowedCategories).toContain('images');
    expect(widget.props.allowedExtensions).toContain('.pdf');
    expect(widget.props.allowedExtensions).toContain('.png');
    expect(widget.props.allowMultiple).toBe(false);
    expect(widget.props.uploadedFiles).toEqual([]);

    // Auto-opens Document sidebar
    expect(store.isDocumentSidebarOpen).toBe(true);
    expect(store.selectedWidgetId).toBe(widget.id);

    // Closing sidebar
    store.closeDocumentSidebar();
    expect(store.isDocumentSidebarOpen).toBe(false);

    // Toggling sidebar
    store.toggleDocumentSidebar();
    expect(store.isDocumentSidebarOpen).toBe(true);

    // closeAllSidebars closes Document sidebar
    store.closeAllSidebars();
    expect(store.isDocumentSidebarOpen).toBe(false);
  });

  it('2. Option B: RegistrationForm accepts file-type field and stores file metadata', () => {
    const store = useEditorStore();
    const regForm = store.addWidget('RegistrationForm', undefined, {
      title: 'KYC VERIFICATION FORM',
      fields: [
        { id: 'f_name', name: 'Full Name', type: 'text', required: true, value: 'John Doe' },
        { id: 'f_doc', name: 'National ID / KTP', type: 'file', required: true, value: '/uploads/documents/doc_123.pdf', fileData: { url: '/uploads/documents/doc_123.pdf', name: 'ktp_john.pdf', size: 1048576, type: 'application/pdf' } }
      ]
    });

    expect(regForm).toBeDefined();
    expect(regForm.props.fields).toHaveLength(2);
    expect(regForm.props.fields[1].type).toBe('file');
    expect(regForm.props.fields[1].fileData?.name).toBe('ktp_john.pdf');
    expect(regForm.props.fields[1].fileData?.url).toBe('/uploads/documents/doc_123.pdf');
  });

  it('3. hubUtils formatValue properly formats uploaded document objects', () => {
    const singleDoc = {
      url: '/uploads/documents/doc_ktp.pdf',
      name: 'ktp_alvin.pdf',
      size: 512000,
      type: 'application/pdf'
    };

    const formatted = formatValue(singleDoc);
    expect(formatted).toBe('ktp_alvin.pdf (/uploads/documents/doc_ktp.pdf)');

    const multiDocs = [
      { url: '/uploads/documents/doc_1.pdf', name: 'doc1.pdf' },
      { url: '/uploads/documents/doc_2.png', name: 'doc2.png' }
    ];

    const formattedMulti = formatValue(multiDocs);
    expect(formattedMulti).toContain('doc1.pdf (/uploads/documents/doc_1.pdf)');
    expect(formattedMulti).toContain('doc2.png (/uploads/documents/doc_2.png)');
  });

  it('4. DocumentUpload qualifies as a valid form input for pass prerequisite validation', () => {
    const store = useEditorStore();
    // DocumentUpload allows adding GuestEPass without blocking
    store.addWidget('DocumentUpload');
    const epassCheck = store.canAddWidget('GuestEPass');
    expect(epassCheck.allowed).toBe(true);
  });
});
