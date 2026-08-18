import type { ComponentType } from 'react';
import type { CapabilityKey } from '../types/dashboard';
import KernelEnablementPanel from './kernel-enablement/KernelEnablementPanel';
import KernelTrendPanel from './kernel-trend/KernelTrendPanel';
import type { CapabilityPanelProps } from './types';
import UserEnablementPanel from './user-enablement/UserEnablementPanel';
import UserFunctionPanel from './user-function/UserFunctionPanel';
import UserGadgetPanel from './user-gadget/UserGadgetPanel';
import UserTrendPanel from './user-trend/UserTrendPanel';

const CAPABILITY_PANELS: Record<CapabilityKey, ComponentType<CapabilityPanelProps>> = {
  'user-enablement': UserEnablementPanel,
  'user-function': UserFunctionPanel,
  'user-gadget': UserGadgetPanel,
  'user-trend': UserTrendPanel,
  'kernel-enablement': KernelEnablementPanel,
  'kernel-trend': KernelTrendPanel,
};

interface CapabilityResultViewProps extends CapabilityPanelProps {}

/**
 * 按当前选中的安全能力，隔离渲染对应内容区。
 * 新增分析页时：补齐 definitions、独立目录组件，并在此注册即可。
 */
export default function CapabilityResultView(props: CapabilityResultViewProps) {
  const Panel = CAPABILITY_PANELS[props.capability];
  return <Panel {...props} />;
}
