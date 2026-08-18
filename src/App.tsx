import { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntdApp, ConfigProvider, Spin, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  checkAnalysisStatus,
  fetchAnalysisProgress,
  fetchNavTree,
  startAnalysis,
} from './api/dashboard';
import {
  AnalysisProgressPanel,
  HeaderBar,
  SideNav,
  WelcomePage,
} from './components';
import { CapabilityResultView, isCapabilityEnabled } from './capabilities';
import type {
  AnalysisProgress,
  CapabilityKey,
  NavTreeData,
} from './types/dashboard';
import './index.css';

type ViewMode = 'welcome' | 'analyzing' | 'results';

function formatClock(date: Date): string {
  return date.toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function DashboardApp() {
  const { message } = AntdApp.useApp();
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [nav, setNav] = useState<NavTreeData | null>(null);
  const [loadingNav, setLoadingNav] = useState(true);
  const [error, setError] = useState('');
  const [productKey, setProductKey] = useState<string>();
  const [capabilityKey, setCapabilityKey] = useState<string>();
  const [productLine, setProductLine] = useState('');
  const [product, setProduct] = useState('');
  const [version, setVersion] = useState('');
  const [capability, setCapability] = useState<CapabilityKey>();
  const [capabilityLabel, setCapabilityLabel] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [analysisReady, setAnalysisReady] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [starting, setStarting] = useState(false);
  const [viewing, setViewing] = useState(false);

  const selectionReady = Boolean(
    productLine && product && version && capability && isCapabilityEnabled(capability),
  );
  const productLabel = selectionReady ? `${productLine} → ${product} → ${version}` : '';
  const analyzing = viewMode === 'analyzing' && progress?.status !== 'completed';

  const analysisQuery = useMemo(() => {
    if (!selectionReady || !capability) {
      return null;
    }
    return {
      productLine,
      product,
      version,
      capability,
    };
  }, [selectionReady, productLine, product, version, capability]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingNav(true);
    fetchNavTree()
      .then((data) => {
        if (!cancelled) {
          setNav(data);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingNav(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setProgress(null);
    setAnalysisReady(false);
    setError('');
    setViewMode('welcome');

    if (!analysisQuery) {
      return;
    }

    let cancelled = false;
    checkAnalysisStatus(analysisQuery)
      .then((status) => {
        if (cancelled) {
          return;
        }
        setAnalysisReady(status.completed);
        if (status.status === 'running') {
          setViewMode('analyzing');
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [analysisQuery]);

  useEffect(() => {
    if (viewMode !== 'analyzing' || !analysisQuery) {
      return;
    }

    let cancelled = false;
    let timer = 0;
    const tick = async () => {
      try {
        const snapshot = await fetchAnalysisProgress(analysisQuery);
        if (cancelled) {
          return;
        }
        setProgress(snapshot);
        if (snapshot.status === 'completed') {
          setAnalysisReady(true);
          window.clearInterval(timer);
        }
        if (snapshot.status === 'failed' || snapshot.status === 'not_found') {
          setError(snapshot.message);
          setViewMode('welcome');
          window.clearInterval(timer);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '获取分析进度失败');
        }
      }
    };

    void tick();
    timer = window.setInterval(() => {
      void tick();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [viewMode, analysisQuery]);

  const handleStartAnalysis = useCallback(async () => {
    if (!analysisQuery) {
      message.warning('请先选择产品版本和已开放的安全能力后再启动分析');
      return;
    }
    setStarting(true);
    setError('');
    try {
      await startAnalysis(analysisQuery);
      setAnalysisReady(false);
      setProgress(null);
      setViewMode('analyzing');
      message.success('分析任务已启动');
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动分析失败');
    } finally {
      setStarting(false);
    }
  }, [analysisQuery, message]);

  const handleViewResult = useCallback(async () => {
    if (!analysisQuery) {
      message.warning('请先选择产品版本和安全能力');
      return;
    }
    setViewing(true);
    setError('');
    try {
      const status = await checkAnalysisStatus(analysisQuery);
      setAnalysisReady(status.completed);
      if (!status.completed) {
        message.warning(status.message || '当前选项的分析尚未完成，暂无法查看结果');
        return;
      }
      setViewMode('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查分析状态失败');
    } finally {
      setViewing(false);
    }
  }, [analysisQuery, message]);

  const keyProcessOptions = useMemo(() => nav?.keyProcessOptions ?? ['全部进程'], [nav]);

  return (
    <div className="app-shell">
      <HeaderBar clock={clock} />
      <div className="app-body">
        {loadingNav && !nav ? (
          <aside className="side-nav side-nav--loading">
            <Spin tip="加载导航目录…" />
          </aside>
        ) : (
          <SideNav
            products={nav?.products ?? []}
            capabilities={nav?.capabilities ?? []}
            productSelectedKey={productKey}
            capabilitySelectedKey={capabilityKey}
            canStartAnalysis={selectionReady && !analyzing && !starting}
            canViewResult={selectionReady && analysisReady && !viewing}
            starting={starting}
            viewing={viewing}
            analyzing={analyzing}
            actionHint={
              !selectionReady
                ? '请先选择产品版本与安全能力'
                : analyzing
                  ? '分析进行中，完成后可查看结果'
                  : analysisReady
                    ? '分析已完成，可查看结果或重新分析'
                    : '选项已就绪，请启动分析'
            }
            onProductSelect={(payload) => {
              setProductKey(payload.key);
              setProductLine(payload.productLine);
              setProduct(payload.product);
              setVersion(payload.version);
            }}
            onCapabilitySelect={(payload) => {
              setCapabilityKey(payload.key);
              setCapability(payload.capability);
              setCapabilityLabel(payload.title);
            }}
            onViewResult={() => {
              void handleViewResult();
            }}
            onStartAnalysis={() => {
              void handleStartAnalysis();
            }}
          />
        )}
        <main className="app-content">
          {error ? <div className="app-error">{error}</div> : null}
          {viewMode === 'welcome' ? (
            <WelcomePage productLabel={productLabel} capabilityLabel={capabilityLabel} />
          ) : null}
          {viewMode === 'analyzing' ? (
            <AnalysisProgressPanel
              productLabel={productLabel}
              capabilityLabel={capabilityLabel}
              progress={progress}
            />
          ) : null}
          {viewMode === 'results' && analysisQuery ? (
            <>
              <div className="param-strip">
                <span>当前输入参数</span>
                <em>{productLabel}</em>
                <i />
                <em>{capabilityLabel}</em>
              </div>
              <CapabilityResultView
                productLine={analysisQuery.productLine}
                product={analysisQuery.product}
                version={analysisQuery.version}
                capability={analysisQuery.capability}
                capabilityLabel={capabilityLabel}
                keyProcessOptions={keyProcessOptions}
              />
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0b63e5',
          colorBgBase: '#f3f6fb',
          colorBorder: '#c5d4e8',
          colorText: '#102033',
          borderRadius: 10,
          fontSize: 14,
        },
      }}
    >
      <AntdApp>
        <DashboardApp />
      </AntdApp>
    </ConfigProvider>
  );
}
