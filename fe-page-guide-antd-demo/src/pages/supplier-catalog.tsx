import { useMemo, useState } from "react";
import { Button, Card, Checkbox, Col, Flex, Input, Row, Select, Space, Tag, Typography, theme } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { store } from "../data/store";
import type { Supplier } from "../data/types";

/**
 * Catalog & discovery (Guide 2.3): search/faceted filters → resource results → favorites.
 * High-frequency filters are expanded by default; favorites write to in-memory state (Guide 3.5).
 */
export function SupplierCatalog() {
  const { token } = theme.useToken();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyStarred, setOnlyStarred] = useState(false);

  const filtered = useMemo(() => {
    return store.suppliers.filter((s) => {
      if (keyword && !`${s.name} ${s.description} ${s.contacts.join(" ")}`.toLowerCase().includes(keyword.toLowerCase()))
        return false;
      if (category.length && !category.includes(s.category)) return false;
      if (onlyActive && s.status !== "Active") return false;
      if (onlyStarred && !store.starredSupplierIds.has(s.id)) return false;
      return true;
    });
  }, [keyword, category, onlyActive, onlyStarred]);

  const toggleStar = (s: Supplier) => {
    if (store.starredSupplierIds.has(s.id)) store.starredSupplierIds.delete(s.id);
    else store.starredSupplierIds.add(s.id);
    setCategory((c) => [...c]); // trigger a re-render
  };

  const hasFilter = keyword || category.length || onlyActive || onlyStarred;

  return (
    <PageContainer
      title="Catalog & Discovery"
      subTitle="Guide 3.5 · Search and faceted filters; “no data” differs from “no match”"
      extra={
        <Typography.Text type="secondary">
          {filtered.length === 0 && store.suppliers.length > 0 ? "No suppliers match the current filters — try clearing them" : `${filtered.length} suppliers total`}
        </Typography.Text>
      }
    >
      {/* Filter toolbar: laid out on one row */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size={12}>
          <Input.Search
            placeholder="Search by supplier name, description, or contact"
            allowClear
            style={{ width: 320 }}
            onSearch={setKeyword}
            onChange={(e) => !e.target.value && setKeyword("")}
          />
          <Select
            mode="multiple"
            placeholder="Primary category"
            style={{ minWidth: 200 }}
            value={category}
            onChange={setCategory}
            allowClear
            maxTagCount={2}
            options={[
              { label: "Apparel", value: "Apparel" },
              { label: "Home", value: "Home" },
              { label: "Electronics", value: "Electronics" },
              { label: "Food", value: "Food" },
            ]}
          />
          <Checkbox checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)}>
            Active only
          </Checkbox>
          <Checkbox checked={onlyStarred} onChange={(e) => setOnlyStarred(e.target.checked)}>
            Starred only
          </Checkbox>
          {hasFilter && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setKeyword("");
                setCategory([]);
                setOnlyActive(false);
                setOnlyStarred(false);
              }}
            >
              Clear all filters
            </Button>
          )}
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {filtered.map((s) => (
          <Col key={s.id} xs={24} md={12} xxl={8}>
            <Card>
              {/* Title row: name + status + favorite */}
              <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                <Space size={8}>
                  <Typography.Text strong>
                    {s.name}
                  </Typography.Text>
                  {s.status === "Probation" && <Tag color="orange">Probation</Tag>}
                  {s.status === "Terminated" && <Tag>Terminated</Tag>}
                </Space>
                <Button
                  type="text"
                  size="small"
                  icon={store.starredSupplierIds.has(s.id) ? <StarFilled style={{ color: token.colorWarning }} /> : <StarOutlined />}
                  onClick={() => toggleStar(s)}
                  aria-label={store.starredSupplierIds.has(s.id) ? "Unstar" : "Star"}
                />
              </Flex>

              <Typography.Paragraph type="secondary">
                {s.description}
              </Typography.Paragraph>

              <Space size={4} wrap>
                  <Tag>{s.category}</Tag>
                  <Tag color="blue">{s.cooperationLevel}</Tag>
                  <Tag>{s.settlement}</Tag>
                <Tag color={s.onTimeRate >= 95 ? "success" : "warning"}>{s.onTimeRate}% on-time</Tag>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}
