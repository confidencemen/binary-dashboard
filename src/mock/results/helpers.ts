import type { BinaryRecord, DashboardData, MetricItem, AnalysisSummary } from '../../types/dashboard';

/**
 * flags 共 12 位，按表格列从左到右：
 * Clang-cfi / PAC-be / PAC前向CFI / BTI / 栈保护 / retGuard /
 * PAC-DFI / UBSAN / 缓冲区溢出 / 整数溢出 / PIE / RELRO
 * Y = 使能，N = 未使能
 */
export interface BinaryDraft {
  name: string;
  component: string;
  owner: string;
  sourcePath: string;
  flags: string;
}

export interface DashboardDraft {
  summary: AnalysisSummary;
  metrics: MetricItem[];
  binaries: BinaryDraft[];
}

const FLAG_KEYS: Array<keyof Omit<BinaryRecord, 'id' | 'name' | 'component' | 'owner' | 'sourcePath'>> = [
  'clangCfi',
  'pacBe',
  'pacForwardCfi',
  'bti',
  'stackProtect',
  'retGuard',
  'pacDfi',
  'ubsan',
  'bufferOverflow',
  'integerOverflow',
  'pie',
  'relro',
];

function parseFlags(flags: string): Pick<BinaryRecord, (typeof FLAG_KEYS)[number]> {
  const chars = flags.replace(/\s/g, '');
  if (chars.length !== FLAG_KEYS.length || /[^YNyn]/.test(chars)) {
    throw new Error(`flags 必须是 ${FLAG_KEYS.length} 位 Y/N：${flags}`);
  }
  const record = {} as Pick<BinaryRecord, (typeof FLAG_KEYS)[number]>;
  FLAG_KEYS.forEach((key, index) => {
    record[key] = chars[index].toUpperCase() === 'Y';
  });
  return record;
}

export function assembleDashboard(draft: DashboardDraft): DashboardData {
  return {
    summary: draft.summary,
    metrics: draft.metrics,
    binaries: draft.binaries.map((item, index) => ({
      id: `${draft.summary.product}-${draft.summary.version}-${index}`,
      name: item.name,
      component: item.component,
      owner: item.owner,
      sourcePath: item.sourcePath,
      ...parseFlags(item.flags),
    })),
  };
}
