import { useState } from "react";
import { Alert, App, Card, Divider, Select, Space, Tag, Typography } from "antd";
import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
} from "@ant-design/pro-components";
import { store } from "../data/store";

/**
 * Configuration form (Guide 2.3): groups express business concepts + an impact
 * preview. Form groups are expressed with headings and dividers, not nested
 * Cards (Guide 2.5); defaults are safe and transparent, and the impact of a
 * change is visible before submitting (Guide 4.10 / 4.11).
 */
export function RuleForm() {
  const { message } = App.useApp();
  const [ruleId, setRuleId] = useState(store.rules[0].id);
  const rule = store.rules.find((r) => r.id === ruleId)!;
  const [draft, setDraft] = useState(rule);

  const switchRule = (id: string) => {
    setRuleId(id);
    setDraft(store.rules.find((r) => r.id === id)!);
  };

  return (
    <PageContainer
      title="Configuration Form"
      subTitle="Guide 4.10/4.11 · Groups express business concepts; impact is visible before submit"
      extra={
        <Select
          value={ruleId}
          onChange={switchRule}
          style={{ width: 220 }}
          options={store.rules.map((r) => ({ label: r.name, value: r.id }))}
        />
      }
    >
      <Card style={{ maxWidth: 720 }}>
        <ProForm
          initialValues={draft}
          onValuesChange={(_, all) => setDraft((d) => ({ ...d, ...(all as typeof d) }))}
          submitter={{
            searchConfig: { submitText: "Save rule", resetText: "Restore saved value" },
            onReset: () => setDraft(rule),
          }}
          onFinish={async (values) => {
            Object.assign(rule, values);
            setDraft({ ...rule });
            message.success(`Rule "${rule.name}" saved, now in effect for ${rule.scopes.length} categor${rule.scopes.length === 1 ? "y" : "ies"}`);
            return true;
          }}
        >
          <Alert
            type={draft.autoStop ? "success" : "warning"}
            showIcon
            message="Current effective combination"
            description={
              draft.autoStop
                ? `Auto-stop: when a campaign's return rate exceeds 10% or margin drops below threshold, it stops immediately and restores list price with no manual confirmation needed; max discount ${draft.maxDiscount}%.`
                : `Manual confirmation: a campaign pauses once it trips a risk threshold, waiting for ops to choose continue or stop — on-call must respond, otherwise the campaign keeps selling at an abnormal price. Max discount ${draft.maxDiscount}%.`
            }
          />

          <Divider orientation="left" plain>
            Scope
          </Divider>
          <ProFormText name="name" label="Rule name" rules={[{ required: true }]} />
          <ProFormSelect
            name="scopes"
            label="Applicable categories"
            mode="multiple"
            rules={[{ required: true, message: "Select at least one category" }]}
            options={[
              "Women's Apparel",
              "Men's Apparel",
              "Footwear",
              "Bedding",
              "Kitchenware",
              "Audio & Video",
              "Charging Accessories",
              "Snacks",
              "All Categories",
            ].map((s) => ({ label: s, value: s }))}
            extra="When a rule matches multiple categories, the strictest constraint wins."
          />

          <Divider orientation="left" plain>
            Approval & Risk Control
          </Divider>
          <ProFormSwitch name="needApproval" label="Requires approval" extra="When off, only logged — suited to clearance campaigns." />
          <ProFormSwitch
            name="autoStop"
            label="Auto-stop on threshold breach"
            extra="Recommended on for key categories; when off, relies on manual confirmation from ops."
          />

          <Divider orientation="left" plain>
            Discount Limits
          </Divider>
          <ProFormSlider
            name="maxDiscount"
            label="Max discount (%)"
            min={10}
            max={70}
            marks={{ 10: "10%", 40: "40%", 70: "70%" }}
            extra="A campaign price may not go below the price floor calculated at this discount."
          />
          <ProFormDigit
            name="maxCampaignsPerSku"
            label="Max campaigns per SKU"
            min={1}
            max={10}
            fieldProps={{ precision: 0 }}
            extra="Prevents the same product from stacking across multiple campaigns and breaking through its cost line."
          />
          <ProFormText name="forbiddenWindows" label="Blackout window" placeholder="e.g. No new campaigns after 18:00 Friday" />

          <Divider orientation="left" plain>
            Notification Channels
          </Divider>
          <ProFormSelect
            name="notifyChannels"
            label="Notification channels"
            mode="multiple"
            options={[
              { label: "Ops Channel", value: "Ops Channel" },
              { label: "SMS", value: "SMS" },
              { label: "Email", value: "Email" },
            ]}
          />

          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">Currently saved value:</Typography.Text>
            <Space size={4} wrap>
              <Tag>{rule.name}</Tag>
              <Tag>Approval: {rule.needApproval ? "Required" : "Exempt"}</Tag>
              <Tag>Auto-stop: {rule.autoStop ? "On" : "Off"}</Tag>
              <Tag>Max discount {rule.maxDiscount}%</Tag>
              <Tag>Up to {rule.maxCampaignsPerSku} campaigns per SKU</Tag>
            </Space>
          </Space>
        </ProForm>
      </Card>
    </PageContainer>
  );
}
