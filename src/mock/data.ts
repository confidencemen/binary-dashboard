import type {
  AnalysisMode,
  AnalysisProgress,
  AnalysisStartResult,
  AnalysisStatus,
  BinaryRecord,
  DashboardData,
  DashboardQuery,
  MetricBreakdown,
  MetricItem,
  NavTreeData,
} from '../types/dashboard';
import { CAPABILITY_DEFINITIONS, isCapabilityEnabled, isKernelCapability } from '../capabilities/definitions';

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: number) {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function chance(rng: () => number, probability: number): boolean {
  return rng() < probability;
}

const CHIP_MAP: Record<string, { chip: string; hardwareCfi: boolean }> = {
  'CMM(CosmosU)': { chip: 'Kirin 9030', hardwareCfi: true },
  'ALN(Allen)': { chip: 'Kirin 9010', hardwareCfi: true },
  'HAD(Harden)': { chip: 'Kirin 9000C', hardwareCfi: true },
  'HPR(Hopper)': { chip: 'Kirin 9000C', hardwareCfi: true },
  'DAL(Dail)': { chip: 'Kirin 9000S', hardwareCfi: true },
  'NIZ(Niz)': { chip: 'Kirin A2', hardwareCfi: false },
};

const BINARY_POOL = [
  { name: 'libhwui.so', component: 'graphic', owner: '张伟 00381234', path: 'foundation/graphic/graphic_2d' },
  { name: 'libbinder.so', component: 'ipc', owner: '李娜 00384567', path: 'foundation/communication/ipc' },
  { name: 'libc.so', component: 'musl', owner: '王强 00382301', path: 'third_party/musl' },
  { name: 'libutils.so', component: 'utils', owner: '赵敏 00386712', path: 'commonlibrary/c_utils' },
  { name: 'libseccomp.so', component: 'security', owner: '刘洋 00389021', path: 'base/security/selinux' },
  { name: 'libcrypto.so', component: 'crypto', owner: '陈晨 00380119', path: 'base/security/crypto_framework' },
  { name: 'libssl.so', component: 'crypto', owner: '陈晨 00380119', path: 'base/security/crypto_framework' },
  { name: 'libhilog.so', component: 'hiview', owner: '周杰 00385640', path: 'base/hiviewdfx/hilog' },
  { name: 'libhitrace.so', component: 'hiview', owner: '周杰 00385640', path: 'base/hiviewdfx/hitrace' },
  { name: 'libace_engine.so', component: 'arkui', owner: '吴倩 00387890', path: 'foundation/arkui/ace_engine' },
  { name: 'libace_napi.so', component: 'arkui', owner: '吴倩 00387890', path: 'foundation/arkui/napi' },
  { name: 'libwindow.so', component: 'window', owner: '孙浩 00383456', path: 'foundation/window/window_manager' },
  { name: 'libsurface.so', component: 'graphic', owner: '张伟 00381234', path: 'foundation/graphic/graphic_2d' },
  { name: 'libmedia.so', component: 'multimedia', owner: '郑华 00380987', path: 'foundation/multimedia/player_framework' },
  { name: 'libcamera_host.so', component: 'camera', owner: '冯雪 00382210', path: 'foundation/multimedia/camera_framework' },
  { name: 'libaudio_client.so', component: 'audio', owner: '韩磊 00384111', path: 'foundation/multimedia/audio_framework' },
  { name: 'libnetstack.so', component: 'netstack', owner: '曹丽 00385502', path: 'foundation/communication/netstack' },
  { name: 'libwifi_manager.so', component: 'wifi', owner: '邓凯 00386630', path: 'foundation/communication/wifi' },
  { name: 'libbluetooth.so', component: 'bluetooth', owner: '彭涛 00387741', path: 'foundation/communication/bluetooth' },
  { name: 'libtelephony.so', component: 'telephony', owner: '萧然 00388852', path: 'foundation/communication/telephony' },
  { name: 'libdistributeddata.so', component: 'distributeddatamgr', owner: '何敏 00381163', path: 'foundation/distributeddatamgr/kv_store' },
  { name: 'libfilemgmt.so', component: 'filemanagement', owner: '罗成 00382474', path: 'foundation/filemanagement/app_file_service' },
  { name: 'libability.so', component: 'ability', owner: '高圆 00383385', path: 'foundation/ability/ability_runtime' },
  { name: 'libbundlefwk.so', component: 'bundlemanager', owner: '梁静 00384496', path: 'foundation/bundlemanager/bundle_framework' },
  { name: 'libaccess_token.so', component: 'access_token', owner: '宋宁 00385507', path: 'base/security/access_token' },
  { name: 'libhuks.so', component: 'huks', owner: '唐雪 00386618', path: 'base/security/huks' },
  { name: 'libdevice_auth.so', component: 'device_auth', owner: '许峰 00387729', path: 'base/security/device_auth' },
  { name: 'libdlp.so', component: 'dlp', owner: '沈悦 00388830', path: 'base/security/dlp_permission_service' },
  { name: 'init', component: 'startup', owner: '马超 00380941', path: 'base/startup/init' },
  { name: 'ueventd', component: 'startup', owner: '马超 00380941', path: 'base/startup/init' },
  { name: 'servicemanager', component: 'ipc', owner: '李娜 00384567', path: 'foundation/communication/ipc' },
  { name: 'samgr', component: 'systemabilitymgr', owner: '蒋欣 00381252', path: 'foundation/systemabilitymgr/samgr' },
  { name: 'foundation', component: 'systemabilitymgr', owner: '蒋欣 00381252', path: 'foundation/systemabilitymgr/safwk' },
  { name: 'appspawn', component: 'startup', owner: '马超 00380941', path: 'base/startup/appspawn' },
  { name: 'nativespawn', component: 'startup', owner: '马超 00380941', path: 'base/startup/appspawn' },
  { name: 'render_service', component: 'graphic', owner: '张伟 00381234', path: 'foundation/graphic/graphic_2d' },
  { name: 'window_manager', component: 'window', owner: '孙浩 00383456', path: 'foundation/window/window_manager' },
  { name: 'audio_server', component: 'audio', owner: '韩磊 00384111', path: 'foundation/multimedia/audio_framework' },
  { name: 'camera_server', component: 'camera', owner: '冯雪 00382210', path: 'foundation/multimedia/camera_framework' },
  { name: 'multimodalinput', component: 'multimodalinput', owner: '崔宁 00383321', path: 'foundation/multimodalinput/input' },
  { name: 'wifi_manager_service', component: 'wifi', owner: '邓凯 00386630', path: 'foundation/communication/wifi' },
  { name: 'bluetooth_service', component: 'bluetooth', owner: '彭涛 00387741', path: 'foundation/communication/bluetooth' },
  { name: 'telephony_service', component: 'telephony', owner: '萧然 00388852', path: 'foundation/communication/telephony' },
  { name: 'time_service', component: 'time', owner: '姚蕾 00384432', path: 'base/time/time_service' },
  { name: 'power_manager', component: 'powermgr', owner: '汪洋 00385543', path: 'base/powermgr/power_manager' },
  { name: 'battery_service', component: 'powermgr', owner: '汪洋 00385543', path: 'base/powermgr/battery_manager' },
  { name: 'thermal_service', component: 'powermgr', owner: '汪洋 00385543', path: 'base/powermgr/thermal_manager' },
  { name: 'vendor.camera.hal', component: 'vendor_camera', owner: '冯雪 00382210', path: 'vendor/huawei/camera' },
  { name: 'vendor.audio.hal', component: 'vendor_audio', owner: '韩磊 00384111', path: 'vendor/huawei/audio' },
  { name: 'libvendor_display.so', component: 'vendor_display', owner: '张伟 00381234', path: 'vendor/huawei/display' },
  { name: 'libvendor_sensor.so', component: 'vendor_sensor', owner: '崔宁 00383321', path: 'vendor/huawei/sensor' },
  { name: 'libvendor_nfc.so', component: 'vendor_nfc', owner: '曹丽 00385502', path: 'vendor/huawei/nfc' },
];

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

function buildBreakdown(rng: () => number, total: number): MetricBreakdown {
  const systemLib = Math.round(total * (0.42 + rng() * 0.08));
  const systemBin = Math.round(total * (0.18 + rng() * 0.05));
  const vendorLib = Math.round(total * (0.22 + rng() * 0.05));
  const vendorBin = Math.max(total - systemLib - systemBin - vendorLib, 0);
  return {
    system_lib64: systemLib,
    system_bin: systemBin,
    vendor_lib64: vendorLib,
    vendor_bin: vendorBin,
  };
}

function scaleBreakdown(source: MetricBreakdown, ratio: number): MetricBreakdown {
  return {
    system_lib64: Math.round(source.system_lib64 * ratio),
    system_bin: Math.round(source.system_bin * ratio),
    vendor_lib64: Math.round(source.vendor_lib64 * ratio),
    vendor_bin: Math.round(source.vendor_bin * ratio),
  };
}

function buildMetrics(rng: () => number, kernel: boolean): MetricItem[] {
  const baseTotal = kernel ? randInt(rng, 420, 680) : randInt(rng, 1800, 3200);
  const totalBreakdown = buildBreakdown(rng, baseTotal);

  const clang = 0.72 + rng() * 0.18;
  const pac = 0.61 + rng() * 0.22;
  const bti = 0.58 + rng() * 0.24;
  const stack = 0.81 + rng() * 0.14;
  const retGuard = 0.55 + rng() * 0.25;

  const percent = (ratio: number) => Number((ratio * 100).toFixed(1));

  return [
    {
      key: 'total',
      title: '二进制总数',
      value: baseTotal,
      unit: 'count',
      breakdown: totalBreakdown,
    },
    {
      key: 'clangCfi',
      title: 'Clang 前向 CFI 使能比例',
      value: percent(clang),
      unit: 'percent',
      breakdown: scaleBreakdown(totalBreakdown, clang),
    },
    {
      key: 'pacCfi',
      title: 'PAC 后向 CFI 使能比例',
      value: percent(pac),
      unit: 'percent',
      breakdown: scaleBreakdown(totalBreakdown, pac),
    },
    {
      key: 'bti',
      title: 'BTI 使能比例',
      value: percent(bti),
      unit: 'percent',
      breakdown: scaleBreakdown(totalBreakdown, bti),
    },
    {
      key: 'stackProtect',
      title: '栈保护使能比例',
      value: percent(stack),
      unit: 'percent',
      breakdown: scaleBreakdown(totalBreakdown, stack),
    },
    {
      key: 'retGuard',
      title: 'retGuard 使能比例',
      value: percent(retGuard),
      unit: 'percent',
      breakdown: scaleBreakdown(totalBreakdown, retGuard),
    },
  ];
}

function buildBinaries(rng: () => number, query: DashboardQuery): BinaryRecord[] {
  const kernelBoost = isKernelCapability(query.capability) ? 0.08 : 0;
  const rows = BINARY_POOL.map((item, index) => {
    const vendor = item.component.startsWith('vendor');
    return {
      id: `${query.product}-${query.version}-${index}`,
      name: item.name,
      component: item.component,
      owner: item.owner,
      sourcePath: item.path,
      clangCfi: chance(rng, 0.78 - (vendor ? 0.12 : 0) + kernelBoost),
      pacBe: chance(rng, 0.7 - (vendor ? 0.1 : 0) + kernelBoost),
      pacForwardCfi: chance(rng, 0.66 - (vendor ? 0.14 : 0) + kernelBoost),
      bti: chance(rng, 0.64 - (vendor ? 0.12 : 0)),
      stackProtect: chance(rng, 0.88 - (vendor ? 0.08 : 0)),
      retGuard: chance(rng, 0.62 - (vendor ? 0.16 : 0)),
      pacDfi: chance(rng, 0.48 - (vendor ? 0.1 : 0)),
      ubsan: chance(rng, 0.41),
      bufferOverflow: chance(rng, 0.73),
      integerOverflow: chance(rng, 0.69),
      pie: chance(rng, 0.93),
      relro: chance(rng, 0.86),
    };
  });

  if (!query.keyProcess || query.keyProcess === '全部进程') {
    return rows;
  }
  const allow = new Set(KEY_PROCESS_SET[query.keyProcess] ?? []);
  return rows.filter((row) => allow.has(row.name));
}

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

const ANALYSIS_DURATION_MS = 9000;

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

export async function mockStartAnalysis(query: DashboardQuery): Promise<AnalysisStartResult> {
  await delay(220);
  if (!isCapabilityEnabled(query.capability)) {
    throw new Error('该安全能力尚未开放，暂不支持启动分析');
  }
  const productAllowed =
    (query.productLine === '手机' && query.product === 'CMM(CosmosU)' && query.version === 'HO7.0.0.37') ||
    (query.productLine === 'PC' && query.product === 'HAD(Harden)' && query.version === 'HO7.0.0.37');
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

  const seed = hashString(`${query.product}|${query.version}|${query.capability}|${query.keyProcess ?? ''}`);
  const rng = createRng(seed);
  const chipInfo = CHIP_MAP[query.product] ?? { chip: 'Kirin 9000', hardwareCfi: false };
  const mode: AnalysisMode = isKernelCapability(query.capability) ? '内核态' : '用户态';

  return {
    summary: {
      product: query.product,
      version: query.version,
      mode,
      chip: chipInfo.chip,
      hardwareCfiSupported: chipInfo.hardwareCfi,
    },
    metrics: buildMetrics(rng, isKernelCapability(query.capability)),
    binaries: buildBinaries(rng, query),
  };
}
