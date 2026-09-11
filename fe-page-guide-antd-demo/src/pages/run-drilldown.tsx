import { useState } from "react";
import { Card, Select, Space, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import { CampaignRunDrillDown } from "./campaign-run";

/**
 * Trace drill-down (Guide 2.3 / 4.6): stage summary → per-step result →
 * progressive disclosure of the raw record. This page is a standalone entry
 * point for the skeleton, for easy side-by-side reference against other layouts.
 */
export function RunDrilldown() {
  const [campaignId, setCampaignId] = useState("CMP-2026-0912");
  const campaign = store.campaigns.find((c) => c.id === campaignId);

  return (
    <PageContainer
      title="Trace Drill-Down"
      subTitle="Guide 4.6 · Stage summary → step result → raw record, failures surfaced first"
      extra={
        <Select
          value={campaignId}
          onChange={setCampaignId}
          style={{ width: 280 }}
          options={store.campaigns.map((c) => ({ label: c.title, value: c.id }))}
        />
      }
    >
      <Card>
        {campaign && (
          <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
            <Typography.Text strong>{campaign.title}</Typography.Text>
            <Typography.Text type="secondary">
              {campaign.id} · {campaign.type} · {campaign.planWindow}
            </Typography.Text>
          </Space>
        )}
        <CampaignRunDrillDown campaignId={campaignId} />
      </Card>
    </PageContainer>
  );
}
