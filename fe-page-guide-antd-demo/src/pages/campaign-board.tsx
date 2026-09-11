import { useState } from "react";
import { Alert, App, Card, Col, Empty, Row, Space, Tag, Typography, theme } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import { RiskTag } from "../components/tags";
import type { Campaign, CampaignStatus } from "../data/types";

/**
 * Kanban (Guide 2.3 / 4.6): a column is a stage; dragging writes a state change.
 * Boundary: if columns are just filter conditions, this isn't the right skeleton
 * (Guide 4.6).
 */
const COLUMNS: { key: CampaignStatus; title: string; hint: string }[] = [
  { key: "draft", title: "Draft", hint: "Not submitted" },
  { key: "pending_approval", title: "Pending Approval", hint: "Waiting on approver" },
  { key: "approved", title: "Approved", hint: "Waiting to go live" },
  { key: "running", title: "Running", hint: "Within campaign window" },
  { key: "finished", title: "Finished", hint: "Archived" },
  { key: "cancelled", title: "Cancelled", hint: "Not executed" },
];

/** Allowed advancement paths: moving a card is a state change; an illegal move must be blocked (Guide 4.6) */
const ALLOWED: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["pending_approval"],
  pending_approval: ["draft", "approved"],
  approved: ["pending_approval", "running"],
  running: ["finished", "cancelled"],
  finished: [],
  cancelled: [],
};

export function CampaignBoard() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [dragging, setDragging] = useState<Campaign | null>(null);
  const [hover, setHover] = useState<CampaignStatus | null>(null);
  const [, forceRender] = useState(0);

  const move = (campaign: Campaign, target: CampaignStatus) => {
    if (campaign.status === target) return;
    if (!ALLOWED[campaign.status].includes(target)) {
      message.warning(`"${campaign.title}" can't move directly from "${label(campaign.status)}" to "${label(target)}"`);
      return;
    }
    campaign.status = target;
    forceRender((n) => n + 1);
    message.success(`Moved "${campaign.title}" to "${label(target)}"`);
  };

  return (
    <PageContainer
      title="Kanban"
      subTitle="Guide 4.6 · Columns are stages; dragging is the action, not a filter"
      extra={
        <Typography.Text type="secondary">
          Drag a card to advance its stage · {store.campaigns.length} campaigns total
        </Typography.Text>
      }
    >
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="Dragging isn't the only path"
        description="Keyboard users need an equivalent action (right-click the card, or a “move to…” option), and a cross-column move should warn about its impact first — this demo uses the illegal-move block to illustrate that rule."
      />

      <Row gutter={12} wrap={false} style={{ overflowX: "auto" }}>
        {COLUMNS.map((col) => {
          const items = store.campaigns.filter((c) => c.status === col.key);
          return (
            <Col key={col.key} flex="1 1 160px">
              <Card
                size="small"
                title={
                  <Space size={6}>
                    <span>{col.title}</span>
                    <Tag>{items.length}</Tag>
                  </Space>
                }
                extra={<Typography.Text type="secondary">{col.hint}</Typography.Text>}
                styles={{
                  body: {
                    minHeight: 360,
                    background: hover === col.key ? token.colorPrimaryBg : undefined,
                  },
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHover(col.key);
                }}
                onDragLeave={() => setHover((h) => (h === col.key ? null : h))}
                onDrop={() => {
                  if (dragging) move(dragging, col.key);
                  setDragging(null);
                  setHover(null);
                }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {items.length === 0 && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing here" />
                  )}
                  {items.map((c) => (
                    <Card
                      key={c.id}
                      size="small"
                      hoverable
                      draggable
                      onDragStart={() => setDragging(c)}
                      onDragEnd={() => {
                        setDragging(null);
                        setHover(null);
                      }}
                      style={{ cursor: "grab" }}
                    >
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Typography.Text strong>
                          {c.title}
                        </Typography.Text>
                        <Space size={4} wrap>
                          <RiskTag level={c.riskLevel} />
                          <Tag>{c.type}</Tag>
                        </Space>
                        <Typography.Text type="secondary">
                          {c.ownerName} · {c.affectedSkus} SKUs affected
                        </Typography.Text>
                        {c.status === "running" && (
                          <Typography.Text>Ends {c.planWindow.split("~")[1]?.trim()}</Typography.Text>
                        )}
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </PageContainer>
  );
}

function label(status: CampaignStatus) {
  return COLUMNS.find((c) => c.key === status)?.title ?? status;
}
