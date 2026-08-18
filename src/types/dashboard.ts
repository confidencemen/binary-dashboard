export type CapabilityKey =
  | 'user-enablement'
  | 'user-function'
  | 'user-gadget'
  | 'user-trend'
  | 'kernel-enablement'
  | 'kernel-trend';

export type AnalysisMode = '用户态' | '内核态';

export interface ProductVersionSelection {
  productLine: string;
  product: string;
  version: string;
}

export interface DashboardQuery {
  productLine: string;
  product: string;
  version: string;
  capability: CapabilityKey;
  keyProcess?: string;
}

export interface ProductVersionNode {
  key: string;
  title: string;
  productLine?: string;
  product?: string;
  version?: string;
  children?: ProductVersionNode[];
}

export interface CapabilityNode {
  key: string;
  title: string;
  capability?: CapabilityKey;
  enabled?: boolean;
  children?: CapabilityNode[];
}

export interface NavTreeData {
  products: ProductVersionNode[];
  capabilities: CapabilityNode[];
  keyProcessOptions: string[];
}

export interface MetricBreakdown {
  system_lib64: number;
  system_bin: number;
  vendor_lib64: number;
  vendor_bin: number;
}

export type MetricUnit = 'count' | 'percent';

export interface MetricItem {
  key: string;
  title: string;
  value: number;
  unit: MetricUnit;
  breakdown: MetricBreakdown;
}

export interface AnalysisSummary {
  product: string;
  version: string;
  mode: AnalysisMode;
  chip: string;
  hardwareCfiSupported: boolean;
}

export interface BinaryRecord {
  id: string;
  name: string;
  component: string;
  owner: string;
  sourcePath: string;
  clangCfi: boolean;
  pacBe: boolean;
  pacForwardCfi: boolean;
  bti: boolean;
  stackProtect: boolean;
  retGuard: boolean;
  pacDfi: boolean;
  ubsan: boolean;
  bufferOverflow: boolean;
  integerOverflow: boolean;
  pie: boolean;
  relro: boolean;
}

export interface DashboardData {
  summary: AnalysisSummary;
  metrics: MetricItem[];
  binaries: BinaryRecord[];
}

export type AnalysisJobStatus = 'idle' | 'running' | 'completed' | 'failed' | 'not_found';

export type AnalysisStageStatus = 'pending' | 'running' | 'done';

export interface AnalysisStage {
  name: string;
  status: AnalysisStageStatus;
}

export interface AnalysisStatus {
  completed: boolean;
  status: AnalysisJobStatus;
  progress: number;
  message?: string;
}

export interface AnalysisStartResult {
  jobId: string;
  status: AnalysisJobStatus;
  message: string;
}

export interface AnalysisProgress {
  jobId: string;
  status: AnalysisJobStatus;
  progress: number;
  stage: string;
  message: string;
  stages: AnalysisStage[];
}
