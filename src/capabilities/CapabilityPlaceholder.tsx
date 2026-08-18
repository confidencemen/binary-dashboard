import type { CapabilityPanelProps } from './types';

export default function CapabilityPlaceholder({ capabilityLabel }: Pick<CapabilityPanelProps, 'capabilityLabel'>) {
  return (
    <section className="capability-placeholder">
      <h2>{capabilityLabel}</h2>
      <p>该分析能力尚在规划中，当前不可选择。后续请在对应目录下独立完成本页展示内容。</p>
    </section>
  );
}
