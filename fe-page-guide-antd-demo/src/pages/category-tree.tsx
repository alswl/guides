import { useMemo, useState, type Key } from "react";
import { Breadcrumb, Card, Col, Row, Space, Statistic, Table, Tree, theme } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import type { DataNode } from "antd/es/tree";
import { store } from "../data/store";
import { ProductStatusTag, RiskTag } from "../components/tags";

/**
 * Hierarchy tree (Guide 2.3): Tree expresses category containment + breadcrumb
 * expresses current location + a master-detail Table. No node mixes in a
 * relationship type other than "contains"; category metrics and the product
 * list sit on the right (Guide 4.5).
 */
export function CategoryTree() {
  const { token } = theme.useToken();
  const [categoryId, setCategoryId] = useState("c-women");
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(["c-root", "c-home", "c-digital"]);

  const category = store.categories.find((c) => c.id === categoryId);
  const path = useMemo(() => {
    const chain: string[] = [];
    let cur = category;
    while (cur) {
      chain.unshift(cur.name);
      cur = store.categories.find((c) => c.id === cur!.parentId);
    }
    return chain;
  }, [category]);

  // Includes subcategories: selecting a parent category shows all products under it
  const descendantIds = useMemo(() => {
    const ids = new Set<string>([categoryId]);
    let added = true;
    while (added) {
      added = false;
      store.categories.forEach((c) => {
        if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
          ids.add(c.id);
          added = true;
        }
      });
    }
    return ids;
  }, [categoryId]);

  const products = store.products.filter((p) => descendantIds.has(p.categoryId));
  const gmv = products.reduce((s, p) => s + p.price * p.sales30d, 0);
  const avgMargin = products.length
    ? (products.reduce((s, p) => s + p.grossMargin, 0) / products.length).toFixed(1)
    : "0";
  const risky = products.filter((p) => p.riskLevel === "high").length;

  const toTreeNodes = (parentId: string | null): DataNode[] =>
    store.categories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        key: c.id,
        title: `${c.name} (${store.products.filter((p) => p.categoryId === c.id).length})`,
        children: toTreeNodes(c.id),
      }));

  return (
    <PageContainer title="Hierarchy Tree" subTitle="Guide 4.5 · Tree shows containment, breadcrumb shows location — not interchangeable">
      <Row gutter={16}>
        <Col flex="300px">
          <Card styles={{ body: { maxHeight: 640, overflowY: "auto" } }}>
            <Tree
              blockNode
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              selectedKeys={[categoryId]}
              onSelect={(keys) => keys[0] && setCategoryId(String(keys[0]))}
              treeData={toTreeNodes(null)}
            />
          </Card>
        </Col>

        <Col flex="auto">
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title={
                <Space direction="vertical" size={0}>
                  <span>{category?.name} overview</span>
                  <Breadcrumb items={path.map((p) => ({ title: p }))} />
                </Space>
              }
            >
              <Row gutter={[32, 16]}>
                <Col span={6}>
                  <Statistic title="Products (incl. subcategories)" value={products.length} suffix="" />
                </Col>
                <Col span={6}>
                  <Statistic title="GMV, last 30 days" value={(gmv / 1000).toFixed(1)} suffix="$K" />
                </Col>
                <Col span={6}>
                  <Statistic title="Average margin" value={avgMargin} suffix="%" />
                </Col>
                <Col span={6}>
                  <Statistic title="High-risk products" value={risky} suffix="" valueStyle={risky ? { color: token.colorError } : undefined} />
                </Col>
              </Row>
            </Card>

            <Card title={`Products (${products.length})`}>
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 8, showTotal: (t) => `${t} products total` }}
                dataSource={products}
                columns={[
                  { title: "Product", dataIndex: "name", key: "name" },
                  { title: "Status", dataIndex: "status", key: "status", width: 100, render: (s) => <ProductStatusTag status={s} /> },
                  { title: "Risk", dataIndex: "riskLevel", key: "riskLevel", width: 100, render: (l) => <RiskTag level={l} /> },
                  {
                    title: "Price ($)",
                    dataIndex: "price",
                    key: "price",
                    width: 110,
                    align: "right",
                    render: (v: number) => v.toFixed(2),
                  },
                  {
                    title: "Margin",
                    dataIndex: "grossMargin",
                    key: "grossMargin",
                    width: 100,
                    align: "right",
                    render: (v: number) => `${v}%`,
                  },
                  { title: "Owner", dataIndex: "ownerName", key: "ownerName", width: 90 },
                ]}
                locale={{ emptyText: "No products in this category." }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </PageContainer>
  );
}
