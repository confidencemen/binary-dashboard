import { DEFAULT_BINARY_COLUMNS } from '../../constants/binaryColumns';
import type {
  AnalysisSummary,
  BinaryCellValue,
  BinaryColumnDef,
  BinaryRecord,
  DashboardData,
  MetricItem,
} from '../../types/dashboard';

/**
 * mock 行数据。
 * - flags：按 DEFAULT_BINARY_COLUMNS 顺序，每位一个单字符取值（当前多为 Y/N）。
 * - values：显式列 key → 取值，适合多字符结果（如 NA、PARTIAL）；会覆盖 flags 中的同名列。
 */
export interface BinaryDraft {
  name: string;
  component: string;
  owner: string;
  sourcePath: string;
  flags?: string;
  values?: Record<string, BinaryCellValue>;
}

export interface DashboardDraft {
  summary: AnalysisSummary;
  metrics: MetricItem[];
  binaryColumns?: BinaryColumnDef[];
  binaries: BinaryDraft[];
}

function parseCompactFlags(flags: string): Record<string, BinaryCellValue> {
  const chars = flags.replace(/\s/g, '');
  if (chars.length !== DEFAULT_BINARY_COLUMNS.length) {
    throw new Error(
      `flags 长度须为 ${DEFAULT_BINARY_COLUMNS.length}（按默认列顺序，每位一个取值）：${flags}`,
    );
  }
  return Object.fromEntries(
    DEFAULT_BINARY_COLUMNS.map((column, index) => [column.key, chars[index].toUpperCase()]),
  );
}

function resolveValues(item: BinaryDraft): Record<string, BinaryCellValue> {
  const fromFlags = item.flags ? parseCompactFlags(item.flags) : {};
  return { ...fromFlags, ...item.values };
}

export function assembleDashboard(draft: DashboardDraft): DashboardData {
  return {
    summary: draft.summary,
    metrics: draft.metrics,
    binaryColumns: draft.binaryColumns ?? DEFAULT_BINARY_COLUMNS,
    binaries: draft.binaries.map((item, index) => ({
      id: `${draft.summary.product}-${draft.summary.version}-${index}`,
      name: item.name,
      component: item.component,
      owner: item.owner,
      sourcePath: item.sourcePath,
      values: resolveValues(item),
    } satisfies BinaryRecord)),
  };
}
