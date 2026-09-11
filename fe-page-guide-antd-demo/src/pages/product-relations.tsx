import { useState } from "react";
import { Alert, Card, Select, Space, Table, Tag } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { useSearchParams } from "react-router-dom";
import { productName, store } from "../data/store";
import type { ProductRelation } from "../data/types";

/**
 * Relationship list (Guide 2.3): "pairs with" (complementary) and "substitute for"
 * (competing) shown as two separate semantics. Users mainly look up product names
 * and price bands, so this uses an adjacency list instead of a relationship graph
 * (Guide 4.5).
 */
export function ProductRelations() {
  const [params, setParams] = useSearchParams();
  const [productId, setProductId] = useState(params.get("product") ?? "P-88012");

  const product = store.products.find((p) => p.id === productId);
  const pairings = store.productRelations.filter((r) => r.type === "Pairs With" && (r.from === productId || r.to === productId));
  const substitutes = store.productRelations.filter((r) => r.type === "Substitute For" && (r.from === productId || r.to === productId));

  const otherId = (r: ProductRelation) => (r.from === productId ? r.to : r.from);
  const priceOf = (id: string) => store.products.find((p) => p.id === id)?.price;

  const columns = [
    {
      title: "Product",
      key: "name",
      render: (_: unknown, r: ProductRelation) => (
        <Space>
          <span>{productName(otherId(r))}</span>
          <Tag>{store.products.find((p) => p.id === otherId(r))?.brand ?? "-"}</Tag>
        </Space>
      ),
    },
    {
      title: "Price ($)",
      key: "price",
      width: 120,
      align: "right" as const,
      render: (_: unknown, r: ProductRelation) => {
        const p = priceOf(otherId(r));
        return p === undefined ? "-" : p.toFixed(2);
      },
    },
    { title: "Relationship", dataIndex: "desc", key: "desc" },
  ];

  return (
    <PageContainer
      title={product?.name ?? productId}
      subTitle="Guide 4.5 · A list beats a graph unless topology drives the judgment"
      breadcrumb={{ items: [{ title: "Products" }, { title: "Product Relations" }, { title: product?.name ?? productId }] }}
      extra={
        <Select
          value={productId}
          onChange={(v) => {
            setProductId(v);
            setParams({ product: v });
          }}
          style={{ width: 240 }}
          options={store.products.map((p) => ({ label: p.name, value: p.id }))}
        />
      }
    >
      {/* The operational meaning of a substitute relationship needs to be explained at the decision point */}
      {substitutes.length > 0 && (
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          showIcon
          message={`${substitutes.length} same-category substitute${substitutes.length === 1 ? "" : "s"}`}
          description={`${substitutes.map((r) => productName(otherId(r))).join(", ")} share this product's price band; avoid scheduling them in the same campaign slot — stagger them or bundle them as a recommendation instead.`}
        />
      )}

      <Card title={`Pairs With · Frequently bought together (${pairings.length})`} style={{ marginBottom: 16 }}>
        <Table<ProductRelation>
          rowKey={(r) => `${r.from}->${r.to}`}
          columns={columns}
          dataSource={pairings}
          pagination={false}
          size="small"
        />
      </Card>

      <Card title={`Substitute For · Same-category competition (${substitutes.length})`}>
        <Table<ProductRelation>
          rowKey={(r) => `${r.from}->${r.to}`}
          columns={columns}
          dataSource={substitutes}
          pagination={false}
          size="small"
        />
      </Card>
    </PageContainer>
  );
}
