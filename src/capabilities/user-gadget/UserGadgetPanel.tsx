import CapabilityPlaceholder from '../CapabilityPlaceholder';
import type { CapabilityPanelProps } from '../types';

/** 用户态高风险 gadget 分析（待扩展） */
export default function UserGadgetPanel(props: CapabilityPanelProps) {
  return <CapabilityPlaceholder capabilityLabel={props.capabilityLabel} />;
}
