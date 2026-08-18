import { Button, Tree } from 'antd';
import { EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { CapabilityKey, CapabilityNode, ProductVersionNode } from '../types/dashboard';

interface SideNavProps {
  products: ProductVersionNode[];
  capabilities: CapabilityNode[];
  productSelectedKey?: string;
  capabilitySelectedKey?: string;
  canStartAnalysis: boolean;
  canViewResult: boolean;
  starting: boolean;
  viewing: boolean;
  analyzing: boolean;
  actionHint: string;
  onProductSelect: (payload: {
    key: string;
    productLine: string;
    product: string;
    version: string;
  }) => void;
  onCapabilitySelect: (payload: { key: string; capability: CapabilityKey; title: string }) => void;
  onViewResult: () => void;
  onStartAnalysis: () => void;
}

function toProductTree(nodes: ProductVersionNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: node.title,
    selectable: Boolean(node.version),
    children: node.children ? toProductTree(node.children) : undefined,
  }));
}

function toCapabilityTree(nodes: CapabilityNode[]): DataNode[] {
  return nodes.map((node) => {
    const enabled = Boolean(node.capability && node.enabled !== false);
    return {
      key: node.key,
      disabled: Boolean(node.capability) && !enabled,
      selectable: enabled,
      title:
        node.capability && !enabled ? (
          <span className="tree-node--pending">
            {node.title}
            <small>待扩展</small>
          </span>
        ) : (
          node.title
        ),
      children: node.children ? toCapabilityTree(node.children) : undefined,
    };
  });
}

function findProductNode(nodes: ProductVersionNode[], key: string): ProductVersionNode | undefined {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findProductNode(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function findCapabilityNode(nodes: CapabilityNode[], key: string): CapabilityNode | undefined {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findCapabilityNode(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export default function SideNav({
  products,
  capabilities,
  productSelectedKey,
  capabilitySelectedKey,
  canStartAnalysis,
  canViewResult,
  starting,
  viewing,
  analyzing,
  actionHint,
  onProductSelect,
  onCapabilitySelect,
  onViewResult,
  onStartAnalysis,
}: SideNavProps) {
  return (
    <aside className="side-nav">
      <div className="side-nav__body">
        <div className="side-nav__intro">
          <p>请分别选择产品版本与安全能力。当前仅「用户态安全能力使能分析」可选择，其余项为后续扩展。</p>
        </div>

        <section className="side-nav__section">
          <Tree
            blockNode
            defaultExpandAll
            selectedKeys={productSelectedKey ? [productSelectedKey] : []}
            treeData={toProductTree(products)}
            onSelect={(keys) => {
              const key = String(keys[0] ?? '');
              const node = findProductNode(products, key);
              if (node?.version && node.product && node.productLine) {
                onProductSelect({
                  key: node.key,
                  productLine: node.productLine,
                  product: node.product,
                  version: node.version,
                });
              }
            }}
          />
        </section>

        <section className="side-nav__section">
          <Tree
            blockNode
            defaultExpandAll
            selectedKeys={capabilitySelectedKey ? [capabilitySelectedKey] : []}
            treeData={toCapabilityTree(capabilities)}
            onSelect={(keys) => {
              const key = String(keys[0] ?? '');
              const node = findCapabilityNode(capabilities, key);
              if (node?.capability && node.enabled !== false) {
                onCapabilitySelect({
                  key: node.key,
                  capability: node.capability,
                  title: node.title,
                });
              }
            }}
          />
        </section>
      </div>

      <div className="side-nav__actions">
        <div className="side-nav__buttons">
          <Button
            block
            icon={<EyeOutlined />}
            disabled={!canViewResult}
            loading={viewing}
            onClick={onViewResult}
          >
            结果查看
          </Button>
          <Button
            block
            type="primary"
            icon={<PlayCircleOutlined />}
            disabled={!canStartAnalysis}
            loading={starting || analyzing}
            onClick={onStartAnalysis}
          >
            启动分析
          </Button>
        </div>
        <p className="side-nav__hint">{actionHint}</p>
      </div>
    </aside>
  );
}
