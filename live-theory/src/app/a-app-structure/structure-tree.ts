/** Folder-tree model used by the A1–A4 lesson pages (visualises a-app-structure/aX-<name>/app). */

export interface FeatureMeta {
  id: string;
  label: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface TreeFile {
  kind: 'file';
  name: string;
  /** Feature the file belongs to; none = app-wide / shared. */
  feature?: string;
  /** Not in repo – only shows how a real app grows. */
  ghost?: boolean;
}

export interface TreeDir {
  kind: 'dir';
  name: string;
  children: TreeEntry[];
  /** Feature folder: it and all its subfolders (data/state/ui) count as ONE place. */
  feature?: string;
}

export type TreeEntry = TreeFile | TreeDir;

export const dir = (name: string, ...children: TreeEntry[]): TreeDir => ({
  kind: 'dir',
  name,
  children,
});

export const featureDir = (name: string, feature: string, ...children: TreeEntry[]): TreeDir => ({
  ...dir(name, ...children),
  feature,
});

export const file = (name: string, feature?: string, ghost = false): TreeFile => ({
  kind: 'file',
  name,
  feature,
  ghost,
});

/** Same feature set across all A-pages (shop domain). */
export const SHOP_FEATURES: FeatureMeta[] = [
  { id: 'products', label: 'Produkty', color: 'primary' },
  { id: 'cart', label: 'Koszyk', color: 'success' },
  { id: 'orders', label: 'Zamówienia', color: 'warning' },
];

/**
 * Folders that contain files, mapped to those files.
 * Subfolders of a feature folder are merged into it (one feature = one place).
 */
export function filesByFolder(
  root: TreeDir,
  path = root.name,
  group?: string,
  result = new Map<string, TreeFile[]>(),
): Map<string, TreeFile[]> {
  const key = group ?? path;
  for (const child of root.children) {
    if (child.kind === 'file') {
      result.set(key, [...(result.get(key) ?? []), child]);
    } else {
      const childPath = `${path}/${child.name}`;
      filesByFolder(child, childPath, group ?? (child.feature ? childPath : undefined), result);
    }
  }
  return result;
}
