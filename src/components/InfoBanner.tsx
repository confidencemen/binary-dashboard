import type { AnalysisSummary } from '../types/dashboard';

interface InfoBannerProps {
  summary?: AnalysisSummary;
  loading: boolean;
}

export default function InfoBanner({ summary, loading }: InfoBannerProps) {
  if (loading && !summary) {
    return <section className="info-banner info-banner--loading">正在加载分析提示信息…</section>;
  }

  if (!summary) {
    return <section className="info-banner">请在左侧选择产品版本与安全能力后查看分析信息。</section>;
  }

  return (
    <section className="info-banner">
      <span className="info-banner__dot" />
      <p>
        <strong>{summary.product}</strong>产品<strong>{summary.version}</strong>版本
        <strong>{summary.mode}</strong>细化分析信息：使用<strong>{summary.chip}</strong>芯片，
        {summary.hardwareCfiSupported ? (
          <b className="info-banner__status is-on">支持硬件CFI能力</b>
        ) : (
          <b className="info-banner__status is-off">不支持硬件CFI能力</b>
        )}
        。
      </p>
    </section>
  );
}
