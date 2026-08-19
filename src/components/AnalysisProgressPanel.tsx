import { Progress } from 'antd';
import type { AnalysisProgress } from '../types/dashboard';

interface AnalysisProgressPanelProps {
  productLabel: string;
  capabilityLabel: string;
  progress?: AnalysisProgress | null;
}

export default function AnalysisProgressPanel({
  productLabel,
  capabilityLabel,
  progress,
}: AnalysisProgressPanelProps) {
  const percent = progress?.progress ?? 0;
  const completed = progress?.status === 'completed';

  return (
    <section className="progress-page">
      <div className="progress-page__card">
        <p className="progress-page__eyebrow">{completed ? '分析完成' : '分析进行中'}</p>
        <h2>{completed ? '本轮分析已完成' : '正在执行二进制安全能力分析'}</h2>
        <p className="progress-page__meta">
          {productLabel} · {capabilityLabel}
        </p>

        <div className="progress-page__bar">
          <Progress
            percent={percent}
            status={completed ? 'success' : 'active'}
            strokeColor={completed ? 'var(--stage-done)' : { from: 'var(--accent)', to: 'var(--accent-2)' }}
          />
          <p className="progress-page__message">{progress?.message || '正在连接分析服务…'}</p>
        </div>

        <ul className="progress-page__stages">
          {(progress?.stages ?? []).map((stage) => (
            <li key={stage.name} className={`is-${stage.status}`}>
              <span className="progress-page__stage-dot" />
              <em>{stage.name}</em>
              <strong>
                {stage.status === 'done' ? '已完成' : stage.status === 'running' ? '进行中' : '等待中'}
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
