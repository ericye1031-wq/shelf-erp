export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TreeNode<T = Record<string, unknown>> {
  id: string;
  name: string;
  parentId: string | null;
  children?: TreeNode<T>[];
  extra?: T;
}

export interface AuditFields {
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export type StatusType = 'draft' | 'active' | 'completed' | 'cancelled';

export interface ProjectLinked {
  projectId: string;
}
