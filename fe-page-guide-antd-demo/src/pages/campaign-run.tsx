import { Alert, Collapse, Space, Steps, Tag, Typography } from "antd";
import { getRunByCampaign } from "../data/store";
import type { StepStatus } from "../data/types";

/**
 * Trace drill-down (Guide 2.3): stage summary → per-step result → progressive
 * disclosure of the raw record, surfacing what's needed to locate a failure
 * first by default (Guide 4.6).
 */
export function CampaignRunDrillDown({ campaignId }: { campaignId: string }) {
  const run = getRunByCampaign(campaignId);

  if (!run) {
    return <Typography.Text type="secondary">This campaign hasn't started executing yet — no execution chain available.</Typography.Text>;
  }

  const stageIndex = run.stages.findIndex((s) => s.status === "failed" || s.status === "running");
  const failedStage = run.stages.find((s) => s.status === "failed");

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {run.status === "failed" && (
        <Alert
          type="error"
          showIcon
          message="The campaign failed at “Go Live · Batch 2/3”; the remaining SKUs are paused"
          description={failedStage?.summary}
          action={<a>What to do: pull the low-stock SKUs and continue, or stop the campaign</a>}
        />
      )}

      {/* Top layer: the expected flow and current position — Steps, not Timeline */}
      <Steps
        direction="vertical"
        size="small"
        current={stageIndex === -1 ? run.stages.length : stageIndex}
        status={run.status === "failed" ? "error" : "process"}
        items={run.stages.map((s) => ({
          title: s.name,
          description: s.summary,
          status:
            s.status === "failed"
              ? "error"
              : s.status === "succeeded"
                ? "finish"
                : s.status === "running"
                  ? "process"
                  : "wait",
        }))}
      />

      {/* Middle layer: per-step results within a stage; bottom layer: raw records tucked into a Collapse */}
      <Collapse
        defaultActiveKey={failedStage ? [failedStage.key] : run.stages.slice(0, 1).map((s) => s.key)}
        items={run.stages.map((stage) => ({
          key: stage.key,
          label: (
            <Space>
              <StageTag status={stage.status} />
              <span>{stage.name}</span>
              <Typography.Text type="secondary">
                {stage.startedAt === "-" ? "Not started" : `since ${stage.startedAt} · ${stage.durationSec}s`}
              </Typography.Text>
            </Space>
          ),
          children: (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {stage.steps.map((step) => (
                <div key={step.name}>
                  <Space>
                    <StageTag status={step.status} />
                    <strong>{step.name}</strong>
                    {step.durationSec > 0 && <Typography.Text type="secondary">{step.durationSec}s</Typography.Text>}
                  </Space>
                  {step.logs.length > 0 && (
                    <pre style={{ maxHeight: 220, overflow: "auto" }}>{step.logs.join("\n")}</pre>
                  )}
                </div>
              ))}
            </Space>
          ),
        }))}
      />
    </Space>
  );
}

function StageTag({ status }: { status: StepStatus }) {
  const map: Record<StepStatus, { text: string; color: string }> = {
    succeeded: { text: "Succeeded", color: "success" },
    failed: { text: "Failed", color: "error" },
    running: { text: "Running", color: "processing" },
    pending: { text: "Pending", color: "default" },
    skipped: { text: "Skipped", color: "default" },
  };
  const m = map[status];
  return <Tag color={m.color}>{m.text}</Tag>;
}
