export type UploadFormatCategoryId = 'documents' | 'images' | 'spreadsheets';

export interface UploadFormatCategory {
  id: UploadFormatCategoryId;
  label: string;
  extensions: readonly string[];
}

export const UPLOAD_FORMAT_CATEGORIES: ReadonlyArray<UploadFormatCategory> = [
  {
    id: 'documents',
    label: 'Documents',
    extensions: ['.pdf', '.doc', '.docx', '.txt']
  },
  {
    id: 'images',
    label: 'Images',
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic']
  },
  {
    id: 'spreadsheets',
    label: 'Spreadsheets',
    extensions: ['.xlsx', '.xls', '.csv']
  }
];

export const UPLOAD_MAX_SIZE_OPTIONS = [2, 5, 10, 25] as const;

export const DEFAULT_UPLOAD_CATEGORIES: UploadFormatCategoryId[] = ['documents', 'images'];

export const DEFAULT_UPLOAD_EXTENSIONS: string[] = [
  '.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.webp', '.heic'
];

export function getExtensionsForCategories(categories?: ReadonlyArray<string>): string[] {
  const list = categories && categories.length ? categories : DEFAULT_UPLOAD_CATEGORIES;
  const exts: string[] = [];
  list.forEach((catId) => {
    const match = UPLOAD_FORMAT_CATEGORIES.find(c => c.id === catId);
    if (match) {
      match.extensions.forEach((ext) => {
        if (!exts.includes(ext)) exts.push(ext);
      });
    }
  });
  return exts.length ? exts : [...DEFAULT_UPLOAD_EXTENSIONS];
}

export function resolveUploadExtensions(source?: {
  allowedExtensions?: ReadonlyArray<string>;
  allowedTypes?: ReadonlyArray<string>;
  allowedCategories?: ReadonlyArray<string>;
}): string[] {
  if (source?.allowedExtensions && source.allowedExtensions.length > 0) {
    return [...source.allowedExtensions];
  }
  if (source?.allowedTypes && source.allowedTypes.length > 0) {
    return [...source.allowedTypes];
  }
  if (source?.allowedCategories && source.allowedCategories.length > 0) {
    return getExtensionsForCategories(source.allowedCategories);
  }
  return [...DEFAULT_UPLOAD_EXTENSIONS];
}

export function toggleUploadCategoryList(
  currentCategories: ReadonlyArray<string> | undefined,
  catId: UploadFormatCategoryId
): UploadFormatCategoryId[] {
  const current = [...((currentCategories?.length ? currentCategories : DEFAULT_UPLOAD_CATEGORIES) as UploadFormatCategoryId[])];
  const idx = current.indexOf(catId);
  if (idx >= 0) {
    if (current.length > 1) {
      current.splice(idx, 1);
    }
  } else {
    current.push(catId);
  }
  return current;
}

export function formatUploadHelperSummary(source?: {
  allowedExtensions?: ReadonlyArray<string>;
  allowedTypes?: ReadonlyArray<string>;
  allowedCategories?: ReadonlyArray<string>;
  maxSizeMb?: number;
}): string {
  const exts = resolveUploadExtensions(source)
    .map(e => e.replace(/^\./, '').toUpperCase())
    .slice(0, 4);
  const maxMb = source?.maxSizeMb || 10;
  const extText = exts.length ? exts.join(', ') : 'PDF, PNG, JPG';
  return `Tap to choose file (${extText} up to ${maxMb}MB)`;
}
