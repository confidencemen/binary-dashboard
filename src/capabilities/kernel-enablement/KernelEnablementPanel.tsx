import CapabilityPlaceholder from '../CapabilityPlaceholder';
import type { CapabilityPanelProps } from '../types';

/** 内核态安全能力使能分析（待扩展） */
export default function KernelEnablementPanel(props: CapabilityPanelProps) {
  return <CapabilityPlaceholder capabilityLabel={props.capabilityLabel} />;
}
