import { Link } from "react-router-dom";
import { Button, Card, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTable, getDefaultSortOrder, getDefaultFilter } from "@refinedev/antd";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import type { Product } from "../data/types";
import { PRODUCT_STATUS, ProductStatusTag, RiskTag } from "../components/tags";
import { categoryName } from "../data/store";

/**
 * 2D comparison table (Guide 2.3): a table exists for comparison, not to lay out
 * every field (Guide 4.2). Query / sort / pagination sync to the URL and survive
 * a refresh or a shared link.
 */
export function ProductList() {
  const { tableProps, sorter, filters } = useTable<Product>({
    resource: "products",
    syncWithLocation: true,
    sorters: { initial: [{ field: "sales30d", order: "desc" }] },
  });

  return (
    <PageContainer
      title="2D Comparison Table"
      subTitle="Guide 4.2 · A table exists for comparison, not to lay out every field"
      extra={
        <Link to="/campaigns/new">
          <Button type="primary" icon={<PlusOutlined />}>
            New Campaign
          </Button>
        </Link>
      }
    >
      <Card>
        <ProTable<Product>
          {...tableProps}
          rowKey="id"
          search={false}
          scroll={{ x: 1000 }}
          options={{ density: true, setting: true, reload: false }}
          columns={[
            {
              title: "Product",
              dataIndex: "name",
              key: "name",
              width: 220,
              render: (_, p) => (
                <Space direction="vertical" size={0}>
                  <Link to={`/relations?product=${p.id}`}>{p.name}</Link>
                  <Typography.Text type="secondary">
                    {p.id} · {p.sku}
                  </Typography.Text>
                </Space>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              width: 100,
              align: "center",
              valueEnum: Object.fromEntries(Object.entries(PRODUCT_STATUS).map(([k, v]) => [k, { text: v.text }])),
              filters: true,
              filteredValue: getDefaultFilter("status", filters) as string[] | undefined,
              render: (_, p) => <ProductStatusTag status={p.status} />,
            },
            {
              title: "Risk",
              dataIndex: "riskLevel",
              key: "riskLevel",
              width: 100,
              align: "center",
              render: (_, p) => <RiskTag level={p.riskLevel} />,
            },
            {
              title: "Category",
              dataIndex: "categoryId",
              key: "categoryId",
              width: 110,
              renderText: (id: string) => categoryName(id),
            },
            {
              title: "Price ($)",
              dataIndex: "price",
              key: "price",
              width: 100,
              align: "right",
              sorter: true,
              sortOrder: getDefaultSortOrder("price", sorter),
              renderText: (v: number) => v.toFixed(2),
            },
            {
              title: "Margin",
              dataIndex: "grossMargin",
              key: "grossMargin",
              width: 96,
              align: "right",
              sorter: true,
              sortOrder: getDefaultSortOrder("grossMargin", sorter),
              renderText: (v: number) => `${v}%`,
            },
            {
              title: "Stock",
              dataIndex: "stock",
              key: "stock",
              width: 100,
              align: "right",
              sorter: true,
              sortOrder: getDefaultSortOrder("stock", sorter),
              renderText: (v: number) => (v === 0 ? "Out of stock" : `${v} units`),
            },
            {
              title: "30-day sales",
              dataIndex: "sales30d",
              key: "sales30d",
              width: 110,
              align: "right",
              sorter: true,
              sortOrder: getDefaultSortOrder("sales30d", sorter),
              renderText: (v: number) => (v === 0 ? "-" : `${v} units`),
            },
            {
              title: "Return rate",
              dataIndex: "returnRate",
              key: "returnRate",
              width: 100,
              align: "right",
              renderText: (v: number) => (v === 0 ? "-" : `${v}%`),
            },
          ]}
          pagination={{ ...tableProps.pagination, showTotal: (t) => `${t} products total` }}
        />
      </Card>
    </PageContainer>
  );
}
