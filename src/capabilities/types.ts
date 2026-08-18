import type { CapabilityKey } from '../types/dashboard';

/**
 * 各安全能力内容区的公共入参。
 * 后续新增分析页时，按自身需要取用，不必强依赖用户态使能分析的数据结构。
 */
export interface CapabilityPanelProps {
  productLine: string;
  product: string;
  version: string;
  capability: CapabilityKey;
  capabilityLabel: string;
  keyProcessOptions: string[];
}
