import type { BinaryColumnDef } from '../types/dashboard';

/**
 * 用户态使能分析表格的默认列。
 * 增列：在此追加定义，并在 binaries[].values 中补上对应 key。
 * 新取值（如 NA）：只需在数据里写入该字符串；筛选会自动出现，颜色可在 CELL_VALUE_TONES 登记。
 */
export const DEFAULT_BINARY_COLUMNS: BinaryColumnDef[] = [
  { key: 'clangCfi', title: 'Clang-cfi', width: 140 },
  { key: 'pacBe', title: 'PAC后向CFI', width: 140 },
  { key: 'pacForwardCfi', title: 'PAC前向CFI', width: 140 },
  { key: 'bti', title: 'BTI', width: 140 },
  { key: 'stackProtect', title: '栈保护', width: 140 },
  { key: 'retGuard', title: 'retGuard后向CFI', width: 140 },
  { key: 'pacDfi', title: 'PAC-DFI', width: 140 },
  { key: 'ubsan', title: 'UBSAN', width: 140 },
  { key: 'bufferOverflow', title: '缓冲区溢出', width: 140 },
  { key: 'integerOverflow', title: '整数溢出', width: 140 },
  { key: 'pie', title: 'PIE覆盖率', width: 140 },
  { key: 'relro', title: 'RELRO', width: 140 },
];

/** 已知取值的展示色。未登记的值走 default，不影响表格渲染。 */
export const CELL_VALUE_TONES: Record<string, 'success' | 'error' | 'warning' | 'processing' | 'default'> = {
  Y: 'success',
  N: 'error',
  NA: 'default',
  PARTIAL: 'warning',
};
