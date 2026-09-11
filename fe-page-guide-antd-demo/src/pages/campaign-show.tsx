import { useState } from "react";
import { Button, Card, Descriptions, Modal, Space, Tabs, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import type { Campaign } from "../data/types";
import { CampaignStatusTag, RiskTag } from "../components/tags";
import { CampaignRunDrillDown } from "./campaign-run";
import { CampaignReview } from "./campaign-review";

/**
 * Sectioned detail (Guide 2.3): identity/status/primary action in the header,
 * core attributes grouped below; the execution chain and review discussion are
 * peer facets of the same object, expressed with Tabs (Guide 3.1).
 */
export function CampaignShow() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useOne<Campaign>({ resource: "campaigns", id });
  const [stopping, setStopping] = useState(false);

  if (isLoading || !data) {
    return <PageContainer title="Loading…" />;
  }
  const c = data.data;

  /** Primary button = the highest-value next step for the current state; dangerous actions never take the primary slot (Guide 3.2) */
  const primaryAction =
    c.status === "draft"
      ? { label: "Submit for approval" }
      : c.status === "running"
        ? null
        : { label: "Duplicate this campaign" };

  return (
    <PageContainer
      title="Sectioned Detail"
      subTitle="Guide 4.4 · Identity, status, and the main action sit in the header; peer facets use Tabs"
      extra={[
        ...(c.status === "pending_approval" ? [<Button key="urge">Nudge approver</Button>] : []),
        ...(c.status === "running"
          ? [
              <Button key="stop" danger onClick={() => setStopping(true)}>
                Stop campaign
              </Button>,
            ]
          : []),
        ...(primaryAction ? [<Button key="main" type="primary">{primaryAction.label}</Button>] : []),
      ]}
      content={
        <Typography.Paragraph type="secondary" style={{ maxWidth: 880, marginBottom: 0 }}>
          {c.changeSummary}
        </Typography.Paragraph>
      }
    >
      <Card>
        {/* Object identity: this demo cedes the page-title slot to the skeleton name — in a real project this region IS the title region (Guide 3.1) */}
        <Space direction="vertical" size={4} style={{ marginBottom: 20 }}>
          <Space size={8}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {c.title}
            </Typography.Title>
            <CampaignStatusTag status={c.status} />
            <RiskTag level={c.riskLevel} />
          </Space>
          <Typography.Text type="secondary">{c.id}</Typography.Text>
        </Space>

        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <Descriptions
                  bordered
                  column={2}
                  size="small"
                  items={[
                    { key: "type", label: "Campaign type", children: c.type },
                    { key: "discount", label: "Discount", children: c.discount },
                    { key: "window", label: "Campaign window", children: c.planWindow },
                    { key: "owner", label: "Owner", children: `${c.ownerName} (${c.owner})` },
                    { key: "scope", label: "Scope", children: c.scope.join(", ") },
                    { key: "skus", label: "SKUs affected", children: `${c.affectedSkus}` },
                    { key: "uplift", label: "Expected impact", children: c.expectedUplift },
                    { key: "created", label: "Created", children: c.createdAt },
                    { key: "stop", label: "Stop plan", children: c.stopPlan || "-", span: 2 },
                  ]}
                />
              ),
            },
            { key: "run", label: "Execution Chain", children: <CampaignRunDrillDown campaignId={c.id} /> },
            { key: "review", label: "Review Discussion", children: <CampaignReview campaignId={c.id} /> },
          ]}
        />
      </Card>

      <Modal
        open={stopping}
        title="Stop this campaign?"
        okText="Stop campaign"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        onOk={() => setStopping(false)}
      >
        <Typography.Paragraph>
          This immediately takes <strong>{c.title}</strong> offline and restores list price, affecting {c.affectedSkus} SKUs; orders already placed during the campaign are honored at the original discount and won't change.
        </Typography.Paragraph>
      </Modal>
    </PageContainer>
  );
}
