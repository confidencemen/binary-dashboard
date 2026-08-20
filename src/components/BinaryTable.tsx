import { useMemo, useState, type Key } from 'react';
import { Input, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CELL_VALUE_TONES, DEFAULT_BINARY_COLUMNS } from '../constants/binaryColumns';
import type { BinaryCellValue, BinaryColumnDef, BinaryRecord } from '../types/dashboard';

/**
 * 控制表格是否显示「所属部件 / 业务owner / 源码路径」。
 * false：前端暂时隐藏这三列；后端数据与接口不变。
 * 需要恢复显示时改为 true 即可。
 */
export const SHOW_BINARY_META_COLUMNS = false;

interface BinaryTableProps {
  data: BinaryRecord[];
  loading: boolean;
  keyProcessOptions: string[];
  keyProcess: string;
  onKeyProcessChange: (value: string) => void;
  binaryColumns?: BinaryColumnDef[];
}

function uniqueValueFilters(values: BinaryCellValue[]) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((value) => ({ text: value, value }));
}

function CellTag({ value }: { value?: BinaryCellValue }) {
  const text = value?.trim() ? value : '-';
  const tone = CELL_VALUE_TONES[text.toUpperCase()] ?? 'default';
  return <Tag color={tone}>{text}</Tag>;
}

export default function BinaryTable({
  data,
  loading,
  keyProcessOptions,
  keyProcess,
  onKeyProcessChange,
  binaryColumns,
}: BinaryTableProps) {
  const [keyword, setKeyword] = useState('');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const analysisColumns = binaryColumns?.length ? binaryColumns : DEFAULT_BINARY_COLUMNS;

  const columns: ColumnsType<BinaryRecord> = useMemo(() => {
    const textColumn = (
      title: string,
      dataIndex: keyof Pick<BinaryRecord, 'component' | 'owner' | 'sourcePath'>,
      extra: Partial<ColumnsType<BinaryRecord>[number]> = {},
    ): ColumnsType<BinaryRecord>[number] => ({
      title,
      dataIndex,
      ellipsis: true,
      filters: uniqueValueFilters(data.map((item) => item[dataIndex] ?? '')),
      filterSearch: true,
      onFilter: (value, record) => record[dataIndex] === String(value),
      ...extra,
    });

    return [
      {
        title: '二进制列表',
        dataIndex: 'name',
        fixed: 'left',
        width: 280,
        ellipsis: true,
      },
      ...(SHOW_BINARY_META_COLUMNS
        ? [
            textColumn('所属部件', 'component', { width: 150 }),
            textColumn('业务owner', 'owner', { width: 150 }),
            textColumn('源码路径', 'sourcePath', { width: 280 }),
          ]
        : []),
      ...analysisColumns.map((column) => ({
        title: column.title,
        key: column.key,
        dataIndex: ['values', column.key],
        width: column.width ?? 140,
        align: 'center' as const,
        filters: uniqueValueFilters(data.map((item) => item.values?.[column.key] ?? '')),
        filterMultiple: true,
        onFilter: (value: boolean | Key, record: BinaryRecord) =>
          (record.values?.[column.key] ?? '') === String(value),
        render: (value: BinaryCellValue) => <CellTag value={value} />,
      })),
    ];
  }, [analysisColumns, data]);

  const tableScrollX =
    (SHOW_BINARY_META_COLUMNS ? 860 : 280) + analysisColumns.reduce((sum, column) => sum + (column.width ?? 140), 0);

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) {
      return data;
    }
    return data.filter((item) => item.name.toLowerCase().includes(text));
  }, [data, keyword]);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrent(1);
  };

  return (
    <section className="table-panel">
      <div className="table-panel__toolbar">
        <Input.Search
          allowClear
          className="table-panel__search"
          placeholder="搜索二进制名称"
          value={keyword}
          onChange={(event) => handleKeywordChange(event.target.value)}
          onSearch={(value) => handleKeywordChange(value)}
        />
        <div className="table-panel__filter">
          <span>关键进程安全分析</span>
          <Select
            className="table-panel__select"
            value={keyProcess}
            options={keyProcessOptions.map((item) => ({ label: item, value: item }))}
            onChange={(value) => {
              onKeyProcessChange(value);
              setCurrent(1);
            }}
          />
        </div>
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={filtered}
        scroll={{ x: tableScrollX, y: 360 }}
        pagination={{
          current,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(pagination, _filters, _sorter, extra) => {
          if (extra.action === 'filter') {
            setCurrent(1);
            return;
          }
          setCurrent(pagination.current ?? 1);
          setPageSize(pagination.pageSize ?? pageSize);
        }}
      />
    </section>
  );
}
