import type {
  AnalysisProgress,
  AnalysisStartResult,
  AnalysisStatus,
  CapabilityKey,
  DashboardData,
  DashboardQuery,
  NavTreeData,
} from '../types/dashboard';
import {
  mockCheckAnalysisStatus,
  mockFetchAnalysisProgress,
  mockFetchDashboard,
  mockFetchNavTree,
  mockStartAnalysis,
} from '../mock/data';

/**
 * 后端接口开关。
 * - true：使用本地 mock，便于前端独立开发
 * - false：请求真实后端（默认走 Vite 代理 /api -> localhost:8080）
 */
export const USE_MOCK_API = true;

export const API_BASE_URL = '/api';

export const DEFAULT_SELECTION = {
  productLine: '手机',
  product: 'Mate80Pro',
  version: 'HO7.0',
  capability: 'user-enablement' as CapabilityKey,
  capabilityLabel: '用户态安全能力使能分析',
};

function toQueryString(query: DashboardQuery): string {
  const params = new URLSearchParams({
    productLine: query.productLine,
    product: query.product,
    version: query.version,
    capability: query.capability,
  });
  if (query.keyProcess && query.keyProcess !== '全部进程') {
    params.set('keyProcess', query.keyProcess);
  }
  return params.toString();
}

/**
 * 获取导航树：产品/版本 + 安全能力 + 关键进程选项。
 * GET /api/nav
 */
export async function fetchNavTree(): Promise<NavTreeData> {
  if (USE_MOCK_API) {
    return mockFetchNavTree();
  }
  const response = await fetch(`${API_BASE_URL}/nav`);
  if (!response.ok) {
    throw new Error(`获取导航数据失败：${response.status}`);
  }
  return response.json() as Promise<NavTreeData>;
}

/**
 * 获取看板主体数据（提示信息、6 项指标、明细表格）。
 * GET /api/dashboard?productLine=&product=&version=&capability=&keyProcess=
 * 仅在对应分析已完成后返回数据。
 */
export async function fetchDashboard(query: DashboardQuery): Promise<DashboardData> {
  if (USE_MOCK_API) {
    return mockFetchDashboard(query);
  }
  const response = await fetch(`${API_BASE_URL}/dashboard?${toQueryString(query)}`);
  if (!response.ok) {
    throw new Error(`获取看板数据失败：${response.status}`);
  }
  return response.json() as Promise<DashboardData>;
}

function toJson(response: Response, fallback: string): Promise<never> {
  return response.text().then((text) => {
    throw new Error(text || fallback);
  });
}

/**
 * 检查指定产品/版本/安全能力的分析是否已经完成。
 * GET /api/analysis/status?productLine=&product=&version=&capability=
 */
export async function checkAnalysisStatus(query: DashboardQuery): Promise<AnalysisStatus> {
  if (USE_MOCK_API) {
    return mockCheckAnalysisStatus(query);
  }
  const response = await fetch(`${API_BASE_URL}/analysis/status?${toQueryString(query)}`);
  if (!response.ok) {
    return toJson(response, `检查分析状态失败：${response.status}`);
  }
  return response.json() as Promise<AnalysisStatus>;
}

/**
 * 启动分析任务。
 * POST /api/analysis/start
 */
export async function startAnalysis(query: DashboardQuery): Promise<AnalysisStartResult> {
  if (USE_MOCK_API) {
    return mockStartAnalysis(query);
  }
  const response = await fetch(`${API_BASE_URL}/analysis/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!response.ok) {
    return toJson(response, `启动分析失败：${response.status}`);
  }
  return response.json() as Promise<AnalysisStartResult>;
}

/**
 * 实时获取分析进度。
 * GET /api/analysis/progress?productLine=&product=&version=&capability=
 */
export async function fetchAnalysisProgress(query: DashboardQuery): Promise<AnalysisProgress> {
  if (USE_MOCK_API) {
    return mockFetchAnalysisProgress(query);
  }
  const response = await fetch(`${API_BASE_URL}/analysis/progress?${toQueryString(query)}`);
  if (!response.ok) {
    return toJson(response, `获取分析进度失败：${response.status}`);
  }
  return response.json() as Promise<AnalysisProgress>;
}
