import { useMemo, useState } from "react";
import { Card, Col, Empty, Image, Input, Pagination, Row, Segmented, Select, Space, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import { ProductStatusTag, RiskTag } from "../components/tags";

/**
 * Card grid (Guide 2.3 / 4.3): browsing and picking where the image is the
 * recognition anchor. Cards hold only what's needed for identification and
 * initial screening; full attributes go into the detail view (Guide 4.3).
 */
function cover(text: string, hue: number) {
  const label = text.slice(0, 4);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
    <rect width="100%" height="100%" fill="hsl(${hue}, 32%, 90%)"/>
    <text x="50%" y="54%" text-anchor="middle" font-size="30" font-family="sans-serif"
      fill="hsl(${hue}, 28%, 42%)">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const HUES = [210, 150, 30, 280, 0, 190, 45, 330, 250, 100];

export function ProductGallery() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sort, setSort] = useState<"sales30d" | "price" | "grossMargin">("sales30d");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const list = store.products.filter((p) => {
      if (keyword && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (categoryId && p.categoryId !== categoryId) return false;
      return true;
    });
    return [...list].sort((a, b) => b[sort] - a[sort]);
  }, [keyword, categoryId, sort]);

  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <PageContainer
      title="Card Grid"
      subTitle="Guide 4.3 · Browsing where the image is the anchor; cards hold only ID info"
    >
      {/* Toolbar: search + facets + sort, matching the table page's capabilities */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size={12}>
          <Input.Search
            placeholder="Search by product name, SKU, or brand"
            allowClear
            style={{ width: 300 }}
            onSearch={setKeyword}
            onChange={(e) => !e.target.value && setKeyword("")}
          />
          <Select
            placeholder="Category"
            allowClear
            style={{ width: 160 }}
            value={categoryId}
            onChange={setCategoryId}
            options={store.categories
              .filter((c) => store.products.some((p) => p.categoryId === c.id))
              .map((c) => ({ label: c.name, value: c.id }))}
          />
          <Segmented
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={[
              { label: "By sales", value: "sales30d" },
              { label: "By price", value: "price" },
              { label: "By margin", value: "grossMargin" },
            ]}
          />
          <Typography.Text type="secondary">{filtered.length} products total</Typography.Text>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {shown.map((p, i) => (
          <Col key={p.id} xs={24} sm={12} lg={8} xxl={6}>
            <Card
              hoverable
              cover={
                <Image
                  src={cover(p.name, HUES[i % HUES.length])}
                  alt={`${p.name} product image`}
                  preview={false}
                  height={180}
                  style={{ objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={p.name}
                description={
                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                    <Space size={8} wrap>
                      <Typography.Text strong>${p.price.toFixed(2)}</Typography.Text>
                      <ProductStatusTag status={p.status} />
                      <RiskTag level={p.riskLevel} />
                    </Space>
                    <Typography.Text type="secondary">
                      {p.brand} · {p.sales30d === 0 ? "No sales in 30 days" : `${p.sales30d} sold in 30 days`} · Stock{" "}
                      {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                    </Typography.Text>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {shown.length === 0 && (
        <Card>
          <Empty
            description={
              store.products.length === 0 ? "No products yet." : "No products match the current filters. Try clearing them or a different keyword."
            }
          />
        </Card>
      )}

      <Row justify="end" style={{ marginTop: 16 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filtered.length}
          onChange={setPage}
          showTotal={(t) => `${t} products total`}
        />
      </Row>
    </PageContainer>
  );
}
