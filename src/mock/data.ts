import type {
  AnalysisProgress,
  AnalysisStartResult,
  AnalysisStatus,
  DashboardData,
  DashboardQuery,
  NavTreeData,
} from '../types/dashboard';
import { CAPABILITY_DEFINITIONS, isCapabilityEnabled } from '../capabilities/definitions';
import { getMockDashboardData } from './results';

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

const KEY_PROCESS_SET: Record<string, string[]> = {
  关键系统进程: ['init', 'appspawn', 'nativespawn', 'samgr', 'foundation', 'servicemanager'],
  相机服务进程: ['camera_server', 'libcamera_host.so', 'vendor.camera.hal'],
  通信服务进程: [
    'libtelephony.so',
    'telephony_service',
    'libwifi_manager.so',
    'wifi_manager_service',
    'libbluetooth.so',
    'bluetooth_service',
    'libnetstack.so',
  ],
  支付安全进程: ['libhuks.so', 'libaccess_token.so', 'libdevice_auth.so', 'libcrypto.so', 'libssl.so'],
  锁屏认证进程: ['libaccess_token.so', 'libhuks.so', 'libdevice_auth.so', 'multimodalinput'],
};

export async function mockFetchNavTree(): Promise<NavTreeData> {
  await delay(120);
  return {
    products: [
      {
        key: 'product-root',
        title: '产品与版本管理',
        children: [
          {
            key: 'line-phone',
            title: '手机',
            productLine: '手机',
            children: [
              {
                key: 'prod-CMM',
                title: 'CMM(CosmosU)',
                productLine: '手机',
                product: 'CMM(CosmosU)',
                children: [
                  {
                    key: 'ver-phone-CMM-HO7.0.0.37',
                    title: 'HO7.0.0.37',
                    productLine: '手机',
                    product: 'CMM(CosmosU)',
                    version: 'HO7.0.0.37',
                    enabled: true,
                  },
                  {
                    key: 'ver-phone-CMM-HO7.0.0.21',
                    title: 'HO7.0.0.21',
                    productLine: '手机',
                    product: 'CMM(CosmosU)',
                    version: 'HO7.0.0.21',
                    enabled: true,
                  },
                ],
              },
              {
                key: 'prod-ALN',
                title: 'ALN(Allen)',
                productLine: '手机',
                product: 'ALN(Allen)',
                children: [
                  {
                    key: 'ver-phone-ALN-HO7.0.0.37',
                    title: 'HO7.0.0.37',
                    productLine: '手机',
                    product: 'ALN(Allen)',
                    version: 'HO7.0.0.37',
                    enabled: false,
                  },
                  {
                    key: 'ver-phone-ALN-HO6.1.0.135',
                    title: 'HO6.1.0.135',
                    productLine: '手机',
                    product: 'ALN(Allen)',
                    version: 'HO6.1.0.135',
                    enabled: false,
                  },
                ],
              },
            ],
          },
          {
            key: 'line-pc',
            title: 'PC',
            productLine: 'PC',
            children: [
              {
                key: 'prod-HAD',
                title: 'HAD(Harden)',
                productLine: 'PC',
                product: 'HAD(Harden)',
                children: [
                  {
                    key: 'ver-pc-HAD-HO7.0.0.37',
                    title: 'HO7.0.0.37',
                    productLine: 'PC',
                    product: 'HAD(Harden)',
                    version: 'HO7.0.0.37',
                    enabled: true,
                  },
                  {
                    key: 'ver-pc-HAD-HO6.1.0.135',
                    title: 'HO6.1.0.135',
                    productLine: 'PC',
                    product: 'HAD(Harden)',
                    version: 'HO6.1.0.135',
                    enabled: false,
                  },
                ],
              },
              {
                key: 'prod-HPR',
                title: 'HPR(Hopper)',
                productLine: 'PC',
                product: 'HPR(Hopper)',
                children: [
                  {
                    key: 'ver-pc-HPR-HO7.0.0.38',
                    title: 'HO7.0.0.38',
                    productLine: 'PC',
                    product: 'HPR(Hopper)',
                    version: 'HO7.0.0.38',
                    enabled: false,
                  },
                  {
                    key: 'ver-pc-HPR-HO6.1.0.135',
                    title: 'HO6.1.0.135',
                    productLine: 'PC',
                    product: 'HPR(Hopper)',
                    version: 'HO6.1.0.135',
                    enabled: false,
                  },
                ],
              },
            ],
          },
          {
            key: 'line-tablet',
            title: '平板',
            productLine: '平板',
            children: [
              {
                key: 'prod-DAL',
                title: 'DAL(Dail)',
                productLine: '平板',
                product: 'DAL(Dail)',
                children: [
                  {
                    key: 'ver-tablet-DAL-HO7.0.0.34',
                    title: 'HO7.0.0.34',
                    productLine: '平板',
                    product: 'DAL(Dail)',
                    version: 'HO7.0.0.34',
                    enabled: false,
                  },
                  {
                    key: 'ver-tablet-DAL-HO6.1.0.135',
                    title: 'HO6.1.0.135',
                    productLine: '平板',
                    product: 'DAL(Dail)',
                    version: 'HO6.1.0.135',
                    enabled: false,
                  },
                ],
              },
            ],
          },
          {
            key: 'line-wear',
            title: '穿戴',
            productLine: '穿戴',
            children: [
              {
                key: 'prod-NIZ',
                title: 'NIZ(Niz)',
                productLine: '穿戴',
                product: 'NIZ(Niz)',
                children: [
                  {
                    key: 'ver-wear-NIZ-HO7.0.0.35',
                    title: 'HO7.0.0.35',
                    productLine: '穿戴',
                    product: 'NIZ(Niz)',
                    version: 'HO7.0.0.35',
                    enabled: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    capabilities: [
      {
        key: 'capability-root',
        title: '安全能力管理',
        children: CAPABILITY_DEFINITIONS.map((item) => ({
          key: `cap-${item.key}`,
          title: item.title,
          capability: item.key,
          enabled: item.enabled,
        })),
      },
    ],
    keyProcessOptions: ['全部进程', '关键系统进程', '相机服务进程', '通信服务进程', '支付安全进程', '锁屏认证进程'],
  };
}

const ANALYSIS_STAGES = [
  '采集二进制清单',
  '解析编译与链接选项',
  'Clang 前向 CFI 扫描',
  'PAC / BTI 能力检测',
  '栈保护与 retGuard 分析',
  '汇总统计结果',
];

const ANALYSIS_DURATION_MS = 1000;

interface MockAnalysisJob {
  jobId: string;
  queryKey: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: number;
}

const analysisJobs = new Map<string, MockAnalysisJob>();

export function toAnalysisKey(query: Pick<DashboardQuery, 'productLine' | 'product' | 'version' | 'capability'>): string {
  return `${query.productLine}|${query.product}|${query.version}|${query.capability}`;
}

function buildProgressSnapshot(job: MockAnalysisJob): AnalysisProgress {
  const elapsed = Date.now() - job.startedAt;
  let progress = job.status === 'completed' ? 100 : Math.min(99, Math.floor((elapsed / ANALYSIS_DURATION_MS) * 100));
  if (job.status === 'running' && elapsed >= ANALYSIS_DURATION_MS) {
    job.status = 'completed';
    progress = 100;
  }
  if (job.status === 'completed') {
    progress = 100;
  }

  const stageIndex =
    progress >= 100 ? ANALYSIS_STAGES.length - 1 : Math.min(ANALYSIS_STAGES.length - 1, Math.floor((progress / 100) * ANALYSIS_STAGES.length));

  return {
    jobId: job.jobId,
    status: job.status,
    progress,
    stage: ANALYSIS_STAGES[stageIndex],
    message:
      job.status === 'completed'
        ? '分析已完成，请点击「结果查看」查看统计结果。'
        : `正在执行：${ANALYSIS_STAGES[stageIndex]}`,
    stages: ANALYSIS_STAGES.map((name, index) => ({
      name,
      status: index < stageIndex ? 'done' : index === stageIndex ? (progress >= 100 ? 'done' : 'running') : 'pending',
    })),
  };
}

const ANALYZABLE_PRODUCTS: Array<Pick<DashboardQuery, 'productLine' | 'product' | 'version'>> = [
  { productLine: '手机', product: 'CMM(CosmosU)', version: 'HO7.0.0.37' },
  { productLine: '手机', product: 'CMM(CosmosU)', version: 'HO7.0.0.21' },
  { productLine: 'PC', product: 'HAD(Harden)', version: 'HO7.0.0.37' },
];

export async function mockStartAnalysis(query: DashboardQuery): Promise<AnalysisStartResult> {
  await delay(220);
  if (!isCapabilityEnabled(query.capability)) {
    throw new Error('该安全能力尚未开放，暂不支持启动分析');
  }
  const productAllowed = ANALYZABLE_PRODUCTS.some(
    (item) =>
      item.productLine === query.productLine && item.product === query.product && item.version === query.version,
  );
  if (!productAllowed) {
    throw new Error('该产品版本尚未开放，暂不支持启动分析');
  }
  const queryKey = toAnalysisKey(query);
  const job: MockAnalysisJob = {
    jobId: `job-${queryKey}-${Date.now()}`,
    queryKey,
    status: 'running',
    startedAt: Date.now(),
  };
  analysisJobs.set(queryKey, job);
  return {
    jobId: job.jobId,
    status: 'running',
    message: '分析任务已启动',
  };
}

export async function mockCheckAnalysisStatus(query: DashboardQuery): Promise<AnalysisStatus> {
  await delay(160);
  const job = analysisJobs.get(toAnalysisKey(query));
  if (!job) {
    return {
      completed: false,
      status: 'idle',
      progress: 0,
      message: '当前选项尚未进行分析',
    };
  }
  const snapshot = buildProgressSnapshot(job);
  return {
    completed: snapshot.status === 'completed',
    status: snapshot.status,
    progress: snapshot.progress,
    message: snapshot.message,
  };
}

export async function mockFetchAnalysisProgress(query: DashboardQuery): Promise<AnalysisProgress> {
  await delay(140);
  const job = analysisJobs.get(toAnalysisKey(query));
  if (!job) {
    return {
      jobId: '',
      status: 'not_found',
      progress: 0,
      stage: '',
      message: '未找到对应的分析任务',
      stages: ANALYSIS_STAGES.map((name) => ({ name, status: 'pending' })),
    };
  }
  return buildProgressSnapshot(job);
}

export async function mockFetchDashboard(query: DashboardQuery): Promise<DashboardData> {
  await delay(360);
  const status = await mockCheckAnalysisStatus(query);
  if (!status.completed) {
    throw new Error(status.message || '当前选项的分析尚未完成，无法查看结果');
  }

  const data = getMockDashboardData(query);
  if (!data) {
    throw new Error(`未找到 ${query.productLine} / ${query.product} / ${query.version} 对应的结果数据文件`);
  }

  if (!query.keyProcess || query.keyProcess === '全部进程') {
    return data;
  }

  const allow = new Set(KEY_PROCESS_SET[query.keyProcess] ?? []);
  return {
    ...data,
    binaries: data.binaries.filter((row) => allow.has(row.name)),
  };
}
