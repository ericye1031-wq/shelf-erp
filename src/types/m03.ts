/** 方案状态 */
export type SchemeStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/** 方案 */
export interface Scheme {
  id: string;
  code: string;
  name: string;
  inquiryId: string | null;
  projectId: string | null;
  customerId: string | null;
  rackType: string | null;
  description: string | null;
  currentVersion: string;
  status: SchemeStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  versions?: SchemeVersion[];
}

/** 方案版本 */
export interface SchemeVersion {
  id: string;
  schemeId: string;
  versionNo: string;
  changeSummary: string;
  attachments: string;
  approvedBy: string | null;
  approvedAt: string | null;
  status: string;
  createdBy: string;
  createdAt: string;
}

/** 图纸分类 */
export type DrawingCategory = 'assembly' | 'component' | 'part' | 'installation' | 'foundation';

/** 图纸状态 */
export type DrawingStatus = 'designing' | 'reviewing' | 'published' | 'obsolete';

/** 图纸 */
export interface Drawing {
  id: string;
  code: string;
  name: string;
  projectId: string | null;
  schemeId: string | null;
  category: DrawingCategory;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null;
  status: DrawingStatus;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
