import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Descriptions, Modal, Result, Space, Steps, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import type { Dayjs } from "dayjs";
import { store } from "../data/store";
import type { Campaign } from "../data/types";

/**
 * Step wizard (Guide 2.3): steps and progress → current step → result confirmation
 * (Guide 3.2). The high-risk action gets a Modal double-confirmation on the final
 * step, stating the object and consequence (Guide 4.11).
 */
type FormValues = {
  title: string;
  type: Campaign["type"];
  scope: string[];
  discount: string;
  planWindow?: [Dayjs, Dayjs];
  expectedUplift: string;
  changeSummary: string;
  stopPlan: string;
};

function windowText(w: FormValues["planWindow"]): string {
  if (!w) return "TBD";
  return `${w[0].format("MM-DD HH:mm")} ~ ${w[1].format("MM-DD HH:mm")}`;
}

export function CampaignCreate() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Partial<FormValues>>({ type: "Spend & Save" });
  const [confirming, setConfirming] = useState(false);
  const [created, setCreated] = useState<Campaign | null>(null);

  const scopeOptions = [
    "Women's Apparel",
    "Men's Apparel",
    "Footwear",
    "Bedding",
    "Kitchenware",
    "Audio & Video",
    "Charging Accessories",
    "Snacks",
    "All Categories",
  ].map((s) => ({ label: s, value: s }));

  const formProps = {
    submitter: false as const,
    initialValues: values,
    onValuesChange: (_: unknown, all: Partial<FormValues>) => setValues((v) => ({ ...v, ...all })),
    onFinish: async () => true,
  };

  /** Lazily render by current step: instantiating multiple ProForm at once triggers a useForm-not-connected warning */
  const renderStep = () => {
    if (current === 0) {
      return (
        <ProForm<FormValues> {...formProps}>
          <ProFormText
            name="title"
            label="Campaign name"
            placeholder="e.g. Autumn/Winter Refresh · $50 off $300"
            rules={[{ required: true, message: "Please enter a campaign name" }]}
          />
          <ProFormRadio.Group
            name="type"
            label="Campaign type"
            rules={[{ required: true }]}
            options={[
              { label: "Spend & Save", value: "Spend & Save" },
              { label: "Discount", value: "Discount" },
              { label: "Flash Sale", value: "Flash Sale" },
              { label: "Free Gift", value: "Free Gift" },
            ]}
          />
          <ProFormSelect
            name="scope"
            label="Applicable categories"
            mode="multiple"
            rules={[{ required: true, message: "Please select at least one category" }]}
            options={scopeOptions}
            extra="Selecting “All Categories” automatically excludes products from suppliers on probation."
          />
        </ProForm>
      );
    }
    if (current === 1) {
      return (
        <ProForm<FormValues> {...formProps}>
          <ProFormText
            name="discount"
            label="Discount"
            placeholder="e.g. Spend $300, save $50 — stacks with member pricing"
            rules={[{ required: true, message: "Please describe the discount" }]}
          />
          <ProFormDateRangePicker
            name="planWindow"
            label="Campaign window"
            fieldProps={{ showTime: { format: "HH:mm" }, format: "YYYY-MM-DD HH:mm" }}
            tooltip="Flash-sale campaigns must avoid the evening traffic peak overlapping with the customer-service staffing low point"
          />
          <ProFormTextArea
            name="changeSummary"
            label="Campaign description"
            placeholder="Explain the goal of this campaign — the approver uses this to assess risk"
            rules={[{ required: true, message: "Please describe the campaign" }]}
          />
          <ProFormTextArea
            name="stopPlan"
            label="Stop plan"
            placeholder="How to stop the campaign if it misbehaves, and how to handle orders already placed (required by policy)"
            rules={[{ required: true, message: "Policy requires a stop plan" }]}
            help="See “Campaign Operations Policy · Price & Inventory Protection”"
          />
        </ProForm>
      );
    }
    return null;
  };

  if (created) {
    return (
      <PageContainer title="Step Wizard"
      subTitle="Guide 4.10/4.11 · Steps track progress; risky actions need double confirmation">
        <Card>
          <Result
            status="success"
            title={`Campaign ${created.id} created`}
            subTitle="Now in the approval flow; it will go live automatically at the scheduled time once approved, still subject to a price and inventory check before going live."
            extra={
              <Space>
                <Button type="primary" onClick={() => navigate("/products")}>
                  Back to product list
                </Button>
                <Button onClick={() => navigate(`/campaigns/${created.id}`)}>View campaign</Button>
              </Space>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="New Campaign" subTitle="A dependent task advanced step by step; each step asks only what it needs">
      <Card style={{ maxWidth: 760 }}>
        <Steps
          current={current}
          items={[{ title: "Campaign scope" }, { title: "Discount & risk" }, { title: "Confirm & submit" }]}
          style={{ marginBottom: 32 }}
        />

        {renderStep()}

        {current === 2 && (
          <>
            <Alert
              style={{ marginBottom: 16 }}
              type="warning"
              showIcon
              message="Submitting enters the approval flow"
              description="High-risk campaigns (discounted margin below 20%, or a limited-quantity flash sale) require two levels of approval with a 2-hour SLA; low-risk campaigns are exempt and only logged."
            />
            <Descriptions
              bordered
              column={1}
              size="small"
              items={[
                { key: "title", label: "Campaign name", children: values.title ?? "-" },
                { key: "type", label: "Type", children: values.type ?? "-" },
                { key: "scope", label: "Applicable categories", children: values.scope?.join(", ") ?? "-" },
                { key: "discount", label: "Discount", children: values.discount ?? "-" },
                { key: "window", label: "Campaign window", children: windowText(values.planWindow) },
                { key: "summary", label: "Description", children: values.changeSummary ?? "-" },
                { key: "stop", label: "Stop plan", children: values.stopPlan ?? "-" },
              ]}
            />
          </>
        )}

        <Space style={{ marginTop: 24 }}>
          {current > 0 && <Button onClick={() => setCurrent(current - 1)}>Back</Button>}
          {current < 2 && (
            <Button type="primary" onClick={() => setCurrent(current + 1)}>
              Next
            </Button>
          )}
          {current === 2 && (
            <Button type="primary" onClick={() => setConfirming(true)}>
              Submit for approval
            </Button>
          )}
        </Space>
      </Card>

      <Modal
        open={confirming}
        title="Submit for approval?"
        okText="Submit"
        cancelText="Let me double-check"
        onOk={() => {
          const id = `CMP-2026-09${13 + (store.campaigns.length % 10)}`;
          const campaign: Campaign = {
            id,
            title: values.title ?? "Untitled campaign",
            type: (values.type as Campaign["type"]) ?? "Spend & Save",
            status: "pending_approval",
            riskLevel: "medium",
            owner: "me",
            ownerName: "Current user",
            createdAt: "2026-09-12 10:00",
            planWindow: windowText(values.planWindow),
            affectedSkus: 0,
            discount: values.discount ?? "",
            expectedUplift: "To be assessed",
            scope: values.scope ?? [],
            changeSummary: values.changeSummary ?? "",
            stopPlan: values.stopPlan ?? "",
          };
          store.campaigns.unshift(campaign);
          setConfirming(false);
          setCreated(campaign);
        }}
      >
        <Typography.Paragraph>
          This creates the campaign <strong>{values.title}</strong> ({values.type} · {values.scope?.join(", ")}) and notifies the approver.
          Once submitted, the discount and stop plan are logged; changing them requires voiding and resubmitting.
        </Typography.Paragraph>
      </Modal>
    </PageContainer>
  );
}
