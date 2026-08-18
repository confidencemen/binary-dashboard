import { useEffect, useState } from 'react';
import { fetchDashboard } from '../../api/dashboard';
import BinaryTable from '../../components/BinaryTable';
import InfoBanner from '../../components/InfoBanner';
import MetricCards from '../../components/MetricCards';
import type { DashboardData } from '../../types/dashboard';
import type { CapabilityPanelProps } from '../types';

/**
 * 用户态安全能力使能分析 — 当前唯一已开放的内容区。
 * 后续请优先在本目录内扩展，避免与其他分析页耦合。
 */
export default function UserEnablementPanel({
  productLine,
  product,
  version,
  capability,
  keyProcessOptions,
}: CapabilityPanelProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyProcess, setKeyProcess] = useState('全部进程');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchDashboard({
      productLine,
      product,
      version,
      capability,
      keyProcess,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productLine, product, version, capability, keyProcess]);

  return (
    <>
      {error ? <div className="app-error">{error}</div> : null}
      <InfoBanner summary={data?.summary} loading={loading} />
      <MetricCards metrics={data?.metrics ?? []} loading={loading} />
      <BinaryTable
        data={data?.binaries ?? []}
        loading={loading}
        keyProcessOptions={keyProcessOptions}
        keyProcess={keyProcess}
        onKeyProcessChange={setKeyProcess}
      />
    </>
  );
}
