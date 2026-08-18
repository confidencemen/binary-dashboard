import type { CapabilityKey } from '../types/dashboard';

export interface CapabilityDefinition {
  key: CapabilityKey;
  title: string;
  enabled: boolean;
  description: string;
}

/**
 * 安全能力目录的单一数据源。
 * 目前仅「用户态安全能力使能分析」可选择，其余项保留目录与独立展示文件，供后续扩展。
 */
export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    key: 'user-enablement',
    title: '用户态安全能力使能分析',
    enabled: true,
    description: '展示用户态二进制安全能力使能统计与明细。',
  },
  {
    key: 'user-function',
    title: '用户态函数粒度安全分析',
    enabled: false,
    description: '后续扩展：函数粒度防护覆盖与缺口分析。',
  },
  {
    key: 'user-gadget',
    title: '用户态高风险gadget分析',
    enabled: false,
    description: '后续扩展：高风险 gadget 识别与分布分析。',
  },
  {
    key: 'user-trend',
    title: '用户态安全趋势图谱',
    enabled: false,
    description: '后续扩展：用户态安全能力趋势可视化。',
  },
  {
    key: 'kernel-enablement',
    title: '内核态安全能力使能分析',
    enabled: false,
    description: '后续扩展：内核态安全能力使能统计。',
  },
  {
    key: 'kernel-trend',
    title: '内核态安全趋势图谱',
    enabled: false,
    description: '后续扩展：内核态安全能力趋势可视化。',
  },
];

export function getCapabilityDefinition(key: CapabilityKey): CapabilityDefinition | undefined {
  return CAPABILITY_DEFINITIONS.find((item) => item.key === key);
}

export function isCapabilityEnabled(key: CapabilityKey): boolean {
  return getCapabilityDefinition(key)?.enabled === true;
}

export function isKernelCapability(key: CapabilityKey): boolean {
  return key.startsWith('kernel-');
}
