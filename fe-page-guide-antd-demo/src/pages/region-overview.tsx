import { useState } from "react";
import { Alert, Card, Col, List, Row, Space, Tag, Typography, theme } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import { StoreHealthTag } from "../components/tags";
import type { Region } from "../data/types";

/**
 * Map / canvas (Guide 2.3 / 4.5): where an object is, and what its boundaries
 * and distribution look like. The canvas only carries position and distribution;
 * names and status still come from the list on the right. It's a purpose-built
 * view drawn only because the information substance has no native expression —
 * the shell, cards, and Tags all remain native components (Guide 2.4 / 4.7).
 */

/** Canvas size (viewBox units); blocks are placed by relative position, not real geo scale */
const VIEW_W = 100;
const VIEW_H = 70;
const BLOCK_W = 26;
const BLOCK_H = 15;

const healthOf = { normal: "operational", warning: "degraded", error: "outage" } as const;

/** A region's overall status is its worst store's status */
function regionStatus(region: Region): Region["stores"][number]["status"] {
  if (region.stores.some((s) => s.status === "error")) return "error";
  if (region.stores.some((s) => s.status === "warning")) return "warning";
  return "normal";
}

export function RegionOverview() {
  const { token } = theme.useToken();
  const [selectedId, setSelectedId] = useState(store.regions[0].id);
  const selected = store.regions.find((r) => r.id === selectedId)!;

  const abnormal = store.regions.flatMap((r) =>
    r.stores.filter((s) => s.status !== "normal").map((s) => `${r.name} · ${s.name}`),
  );

  const statusColor: Record<Region["stores"][number]["status"], string> = {
    normal: token.colorSuccess,
    warning: token.colorWarning,
    error: token.colorError,
  };

  return (
    <PageContainer
      title="Map / Canvas"
      subTitle="Guide 2.3 · Distribution and boundaries first, then a point's name and status"
    >
      {abnormal.length > 0 && (
        <Alert
          style={{ marginBottom: 16 }}
          type="warning"
          showIcon
          message={`Abnormal stores: ${abnormal.join(", ")}`}
          description="See the event timeline on the store status page for recovery progress; out-of-stock stores have triggered a cross-store transfer."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            title="Store Distribution"
            extra={<Typography.Text type="secondary">Illustrative position, not geographic scale</Typography.Text>}
          >
            {/* Custom-drawn canvas: expresses only position and distribution; its semantics and keyboard behavior are equivalent to the list on the right */}
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              width="100%"
              role="group"
              aria-label="Store distribution canvas, grouped by region, use Tab to select a region"
              style={{ display: "block", background: token.colorFillQuaternary, borderRadius: token.borderRadius }}
            >
              {store.regions.map((region) => {
                const active = region.id === selectedId;
                const status = regionStatus(region);
                return (
                  <g
                    key={region.id}
                    tabIndex={0}
                    role="button"
                    aria-pressed={active}
                    aria-label={`${region.name}, ${region.province}, ${region.stores.length} stores, status ${
                      status === "normal" ? "normal" : status === "warning" ? "degraded" : "closed"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedId(region.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(region.id);
                      }
                    }}
                  >
                    <rect
                      x={region.x}
                      y={region.y}
                      width={BLOCK_W}
                      height={BLOCK_H}
                      rx={2}
                      fill={active ? token.colorPrimaryBg : token.colorBgContainer}
                      stroke={active ? token.colorPrimary : token.colorBorder}
                      strokeWidth={active ? 0.8 : 0.4}
                    />
                    <text
                      x={region.x + 2}
                      y={region.y + 5}
                      fontSize={3.4}
                      fill={token.colorText}
                    >
                      {region.name}
                    </text>
                    <text
                      x={region.x + 2}
                      y={region.y + 9}
                      fontSize={2.6}
                      fill={token.colorTextTertiary}
                    >
                      {region.stores.length} stores
                    </text>
                    {/* One marker per store: position expresses membership, color expresses status */}
                    {region.stores.map((s, i) => (
                      <circle
                        key={s.name}
                        cx={region.x + 3 + i * 5}
                        cy={region.y + 12}
                        r={1.5}
                        fill={statusColor[s.status]}
                      >
                        <title>{`${s.name} (${s.skus} SKUs listed)`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </svg>

            <Space size={8} wrap style={{ marginTop: 12 }}>
              <Typography.Text type="secondary">Status legend:</Typography.Text>
              <Tag color="success">Operational</Tag>
              <Tag color="warning">Degraded</Tag>
              <Tag color="error">Closed</Tag>
              <Typography.Text type="secondary">SKU count is the number of products listed at that store.</Typography.Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          {/* The canvas's text equivalent: look up names, status, and figures here (Guide 4.7) */}
          <Card
            title={selected.name}
            extra={<Typography.Text type="secondary">{selected.province}</Typography.Text>}
          >
            <List
              size="small"
              dataSource={selected.stores}
              renderItem={(s) => (
                <List.Item actions={[<StoreHealthTag key="status" status={healthOf[s.status]} />]}>
                  <List.Item.Meta title={s.name} description={`${s.skus} SKUs listed`} />
                </List.Item>
              )}
            />
          </Card>

          <Card size="small" title="All Regions" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={store.regions}
              renderItem={(r) => (
                <List.Item
                  actions={[<StoreHealthTag key="status" status={healthOf[regionStatus(r)]} />]}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedId(r.id)}
                >
                  <List.Item.Meta
                    title={r.name}
                    description={`${r.province} · ${r.stores.length} stores`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
