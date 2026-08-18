import CapabilityPlaceholder from '../CapabilityPlaceholder';
import type { CapabilityPanelProps } from '../types';

/** 用户态函数粒度安全分析（待扩展） */
export default function UserFunctionPanel(props: CapabilityPanelProps) {
  return <CapabilityPlaceholder capabilityLabel={props.capabilityLabel} />;
}
