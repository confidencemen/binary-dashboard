import { useMemo, useState, type Key } from 'react';
import { Input, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { BinaryRecord } from '../types/dashboard';

/**
 * 控制表格是否显示「所属部件 / 业务owner / 源码路径」。
 * false：前端暂时隐藏这三列；后端数据与接口不变。
 * 需要恢复显示时改为 true 即可。
 */
export const SHOW_BINARY_META_COLUMNS = false;

const YN_FILTERS = [
  { text: 'Y', value: 'Y' },
  { text: 'N', value: 'N' },
];

interface BinaryTableProps {
  data: BinaryRecord[];
  loading: boolean;
  keyProcessOptions: string[];
  keyProcess: string;
  onKeyProcessChange: (value: string) => void;
}

function YnTag({ value }: { value: boolean }) {
  return value ? <Tag color="success">Y</Tag> : <Tag color="error">N</Tag>;
}

function uniqueTextFilters(values: string[]) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((value) => ({ text: value, value }));
}

function matchesYnFilter(flag: boolean, value: boolean | Key) {
  return value === 'Y' ? flag : !flag;
}

const FLAG_COLUMNS: Array<{ title: string; dataIndex: keyof BinaryRecord }> = [
  { title: 'Clang-cfi', dataIndex: 'clangCfi' },
  { title: 'PAC后向CFI', dataIndex: 'pacBe' },
  { title: 'PAC前向CFI', dataIndex: 'pacForwardCfi' },
  { title: 'BTI', dataIndex: 'bti' },
  { title: '栈保护', dataIndex: 'stackProtect' },
  { title: 'retGuard后向CFI', dataIndex: 'retGuard' },
  { title: 'PAC-DFI', dataIndex: 'pacDfi' },
  { title: 'UBSAN', dataIndex: 'ubsan' },
  { title: '缓冲区溢出', dataIndex: 'bufferOverflow' },
  { title: '整数溢出', dataIndex: 'integerOverflow' },
  { title: 'PIE覆盖率', dataIndex: 'pie' },
  { title: 'RELRO', dataIndex: 'relro' },
];

export default function BinaryTable({
  data,
  loading,
  keyProcessOptions,
  keyProcess,
  onKeyProcessChange,
}: BinaryTableProps) {
  const [keyword, setKeyword] = useState('');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns: ColumnsType<BinaryRecord> = useMemo(() => {
    const textColumn = (
      title: string,
      dataIndex: keyof BinaryRecord,
      extra: Partial<ColumnsType<BinaryRecord>[number]> = {},
    ): ColumnsType<BinaryRecord>[number] => ({
      title,
      dataIndex,
      ellipsis: true,
      filters: uniqueTextFilters(data.map((item) => String(item[dataIndex] ?? ''))),
      filterSearch: true,
      onFilter: (value, record) => String(record[dataIndex] ?? '') === String(value),
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
      ...FLAG_COLUMNS.map((column) => ({
        title: column.title,
        dataIndex: column.dataIndex,
        width: 140,
        align: 'center' as const,
        filters: YN_FILTERS,
        filterMultiple: true,
        onFilter: (value: boolean | Key, record: BinaryRecord) =>
          matchesYnFilter(Boolean(record[column.dataIndex]), value),
        render: (value: boolean) => <YnTag value={value} />,
      })),
    ];
  }, [data]);

  const tableScrollX = SHOW_BINARY_META_COLUMNS ? 2100 : 1520;

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
