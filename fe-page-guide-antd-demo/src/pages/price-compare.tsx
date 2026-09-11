import { useMemo, useState } from "react";
import { Alert, Card, Select, Space, Statistic, Table, Tag, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";

/**
 * Side-by-side comparison (Guide 2.3): comparison scope → diff summary → diff
 * body → processing action. Puts before/after directly side by side instead of
 * making the user remember a comparison across two plans (Guide 4.8).
 */
export function PriceCompare() {
  const [productId, setProductId] = useState("P-88012");
  const versions = store.priceVersions.filter((v) => v.productId === productId);
  const [beforeId, setBeforeId] = useState(versions[1]?.id ?? versions[0]?.id ?? "");
  const [afterId, setAfterId] = useState(versions[0]?.id ?? "");

  const before = store.priceVersions.find((v) => v.id === beforeId);
  const after = store.priceVersions.find((v) => v.id === afterId);
  const product = store.products.find((p) => p.id === productId);

  const rows = useMemo(() => {
    if (!before || !after) return [];
    const keys = Array.from(new Set([...Object.keys(before.items), ...Object.keys(after.items)])).sort();
    return keys.map((key) => {
      const b = before.items[key];
      const a = after.items[key];
      const change = b === undefined ? "added" : a === undefined ? "removed" : a === b ? "unchanged" : "modified";
      return { key, before: b, after: a, change };
    });
  }, [before, after]);

  const modified = rows.filter((r) => r.change === "modified");
  const added = rows.filter((r) => r.change === "added");
  const removed = rows.filter((r) => r.change === "removed");

  const switchProduct = (v: string) => {
    setProductId(v);
    const vs = store.priceVersions.filter((x) => x.productId === v);
    setBeforeId(vs[1]?.id ?? vs[0]?.id ?? "");
    setAfterId(vs[0]?.id ?? "");
  };

  return (
    <PageContainer title="Side-by-Side Comparison" subTitle="Guide 4.8 · Scope and summary first, then diff side by side — no cross-page memory">
      <Card
        title="Comparison Scope"
        extra={
          <Space size={8}>
            <Select value={productId} onChange={switchProduct} style={{ width: 180 }} options={store.products.map((p) => ({ label: p.name, value: p.id }))} />
            <Select value={beforeId} onChange={setBeforeId} style={{ width: 200 }} options={versions.map((v) => ({ label: `${v.version} (${v.publishedAt})`, value: v.id }))} />
            <Typography.Text type="secondary">→</Typography.Text>
            <Select value={afterId} onChange={setAfterId} style={{ width: 200 }} options={versions.map((v) => ({ label: `${v.version} (${v.publishedAt})`, value: v.id }))} />
          </Space>
        }
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Diff summary */}
          <Space size={48} wrap>
            <Statistic title="Modified" value={modified.length} suffix="" />
            <Statistic title="Added" value={added.length} suffix="" />
            <Statistic title="Removed" value={removed.length} suffix="" />
            <Statistic title="Unchanged" value={rows.length - modified.length - added.length - removed.length} suffix="" />
          </Space>

          <Alert
            type="info"
            showIcon
            message={`${before?.note ?? ""} → ${after?.note ?? ""}`}
            description={`${product?.name ?? ""}: published by ${before?.publisher} on ${before?.publishedAt}, changed to ${after?.publisher} on ${after?.publishedAt}.`}
          />

          {/* Diff body: stable row anchors (rowKey = plan item) */}
          <Table<{ key: string; before?: string; after?: string; change: string }>
            rowKey="key"
            size="small"
            pagination={false}
            dataSource={rows.filter((r) => r.change !== "unchanged").concat(rows.filter((r) => r.change === "unchanged"))}
            columns={[
              {
                title: "Item",
                dataIndex: "key",
                key: "key",
                width: 240,
                render: (k: string) => (
                  <Typography.Text code id={`price-${k}`}>
                    {k}
                  </Typography.Text>
                ),
              },
              {
                title: before?.version ?? "Before",
                dataIndex: "before",
                key: "before",
                render: (v?: string) =>
                  v === undefined ? <Tag>Not present</Tag> : <Typography.Text delete type="secondary">{v}</Typography.Text>,
              },
              {
                title: after?.version ?? "After",
                dataIndex: "after",
                key: "after",
                render: (v?: string) => (v === undefined ? <Tag>Removed</Tag> : v),
              },
              {
                title: "Change",
                dataIndex: "change",
                key: "change",
                width: 90,
                render: (c: string) =>
                  c === "modified" ? (
                    <Tag color="orange">Modified</Tag>
                  ) : c === "added" ? (
                    <Tag color="green">Added</Tag>
                  ) : c === "removed" ? (
                    <Tag color="red">Removed</Tag>
                  ) : (
                    <Tag>Unchanged</Tag>
                  ),
              },
            ]}
          />
        </Space>
      </Card>
    </PageContainer>
  );
}
