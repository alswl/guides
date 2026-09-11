import { useState } from "react";
import { Card, Select, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import { CampaignReview } from "./campaign-review";

/**
 * Discussion thread (Guide 2.3 / 4.6): preserves the speaker, time, and reply
 * relationships; system events carry lower visual weight and aren't flattened
 * into undifferentiated text alongside human opinions.
 */
export function ReviewThread() {
  const [campaignId, setCampaignId] = useState("CMP-2026-0912");

  return (
    <PageContainer
      title="Discussion Thread"
      subTitle="Guide 4.6 · Preserves speaker and reply relationships; system events are muted"
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
        <Typography.Paragraph type="secondary">
          The discussion thread preserves the referenced object and reply relationships; system events (Campaign Engine) render at secondary weight, making it easy to tell "someone said this" from "the system logged this."
        </Typography.Paragraph>
        <CampaignReview campaignId={campaignId} />
      </Card>
    </PageContainer>
  );
}
