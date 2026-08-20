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
  /** 版本叶子节点为 true 时前端才允许选择；省略或 false 均不可选。 */
  enabled?: boolean;
  children?: ProductVersionNode[];
}

export interface CapabilityNode {
  key: string;
  title: string;
  capability?: CapabilityKey;
  /** 安全能力叶子节点为 true 时前端才允许选择；省略或 false 均不可选。 */
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
  independent_build: number;
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

/** 表格分析列的单元格取值。当前多为 Y/N，后续可扩展 NA、PARTIAL 等任意字符串。 */
export type BinaryCellValue = string;

/** 分析列表头定义。可由后端随看板数据下发，缺省时前端使用内置列。 */
export interface BinaryColumnDef {
  key: string;
  title: string;
  width?: number;
}

export interface BinaryRecord {
  id: string;
  name: string;
  component: string;
  owner: string;
  sourcePath: string;
  /** 分析列取值，key 与 BinaryColumnDef.key 对应。 */
  values: Record<string, BinaryCellValue>;
}

export interface DashboardData {
  summary: AnalysisSummary;
  metrics: MetricItem[];
  /** 表格分析列；省略时前端回退到内置列定义。 */
  binaryColumns?: BinaryColumnDef[];
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
