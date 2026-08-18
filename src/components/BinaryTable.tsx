import { useMemo, useState } from 'react';
import { Input, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { BinaryRecord } from '../types/dashboard';

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
}

function YnTag({ value }: { value: boolean }) {
  return value ? <Tag color="success">Y</Tag> : <Tag color="error">N</Tag>;
}

const FLAG_COLUMNS: Array<{ title: string; dataIndex: keyof BinaryRecord }> = [
  { title: 'Clang-cfi', dataIndex: 'clangCfi' },
  { title: 'PAC-be', dataIndex: 'pacBe' },
  { title: 'PAC前向CFI分析', dataIndex: 'pacForwardCfi' },
  { title: 'BTI分析', dataIndex: 'bti' },
  { title: '栈保护分析', dataIndex: 'stackProtect' },
  { title: 'retGuard后向CFI分析', dataIndex: 'retGuard' },
  { title: 'PAC-DFI分析', dataIndex: 'pacDfi' },
  { title: 'UBSAN分析', dataIndex: 'ubsan' },
  { title: '缓冲区溢出分析', dataIndex: 'bufferOverflow' },
  { title: '整数溢出分析', dataIndex: 'integerOverflow' },
  { title: 'PIE覆盖率分析', dataIndex: 'pie' },
  { title: 'RELRO分析', dataIndex: 'relro' },
];

const META_COLUMNS: ColumnsType<BinaryRecord> = [
  {
    title: '所属部件',
    dataIndex: 'component',
    width: 150,
    ellipsis: true,
  },
  {
    title: '业务owner',
    dataIndex: 'owner',
    width: 150,
    ellipsis: true,
  },
  {
    title: '源码路径',
    dataIndex: 'sourcePath',
    width: 280,
    ellipsis: true,
  },
];

export default function BinaryTable({
  data,
  loading,
  keyProcessOptions,
  keyProcess,
  onKeyProcessChange,
}: BinaryTableProps) {
  const [keyword, setKeyword] = useState('');

  const columns: ColumnsType<BinaryRecord> = useMemo(
    () => [
      {
        title: '二进制列表',
        dataIndex: 'name',
        fixed: 'left',
        width: 180,
        ellipsis: true,
      },
      ...(SHOW_BINARY_META_COLUMNS ? META_COLUMNS : []),
      ...FLAG_COLUMNS.map((column) => ({
        title: column.title,
        dataIndex: column.dataIndex,
        width: 140,
        align: 'center' as const,
        render: (value: boolean) => <YnTag value={value} />,
      })),
    ],
    [],
  );

  const tableScrollX = SHOW_BINARY_META_COLUMNS ? 2100 : 1520;

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) {
      return data;
    }
    return data.filter((item) => item.name.toLowerCase().includes(text));
  }, [data, keyword]);

  return (
    <section className="table-panel">
      <div className="table-panel__toolbar">
        <Input.Search
          allowClear
          className="table-panel__search"
          placeholder="搜索二进制名称"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <div className="table-panel__filter">
          <span>关键进程安全分析</span>
          <Select
            className="table-panel__select"
            value={keyProcess}
            options={keyProcessOptions.map((item) => ({ label: item, value: item }))}
            onChange={onKeyProcessChange}
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
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </section>
  );
}
