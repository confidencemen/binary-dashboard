import type { MetricItem } from '../types/dashboard';

interface MetricCardsProps {
  metrics: MetricItem[];
  loading: boolean;
}

const BREAKDOWN_LABELS: Array<{ key: keyof MetricItem['breakdown']; label: string }> = [
  { key: 'system_lib64', label: 'system_lib64' },
  { key: 'system_bin', label: 'system_bin' },
  { key: 'vendor_lib64', label: 'vendor_lib64' },
  { key: 'vendor_bin', label: 'vendor_bin' },
  { key: 'independent_build', label: 'independent_build' },
];

function RingChart({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100);
  const tone = percent >= 85 ? 'high' : percent >= 70 ? 'mid' : 'low';

  return (
    <svg className={`metric-ring is-${tone}`} viewBox="0 0 108 108" aria-hidden="true">
      <circle className="metric-ring__track" cx="54" cy="54" r={radius} />
      <circle
        className="metric-ring__bar"
        cx="54"
        cy="54"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text className="metric-ring__value" x="54" y="50">
        {percent.toFixed(1)}
      </text>
      <text className="metric-ring__unit" x="54" y="68">
        %
      </text>
    </svg>
  );
}

function CountChart({ value }: { value: number }) {
  return (
    <div className="metric-count">
      <span className="metric-count__value">{value.toLocaleString()}</span>
      <span className="metric-count__unit">个</span>
    </div>
  );
}

export default function MetricCards({ metrics, loading }: MetricCardsProps) {
  if (loading && metrics.length === 0) {
    return (
      <section className="metric-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="metric-card metric-card--skeleton" />
        ))}
      </section>
    );
  }

  return (
    <section className="metric-grid">
      {metrics.map((metric) => (
        <article key={metric.key} className={`metric-card metric-card--${metric.key}`}>
          <h3 className="metric-card__title">{metric.title}</h3>
          <div className="metric-card__chart">
            {metric.unit === 'percent' ? <RingChart percent={metric.value} /> : <CountChart value={metric.value} />}
          </div>
          <ul className="metric-card__breakdown">
            {BREAKDOWN_LABELS.map((item) => (
              <li key={item.key}>
                <span>{item.label}</span>
                <strong>{metric.breakdown[item.key].toLocaleString()}</strong>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
