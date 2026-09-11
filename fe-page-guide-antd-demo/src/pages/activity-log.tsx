import { useMemo, useState } from "react";
import { Alert, Button, Card, Collapse, Space, Statistic, Timeline, Typography, theme } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";

/**
 * Event timeline (Guide 2.3): a Statistic summary + Timeline + type filter +
 * a collapsible raw record. The original order stays recoverable after
 * filtering (Guide 4.6).
 */
export function ActivityLog() {
  const { token } = theme.useToken();
  const [typeFilter, setTypeFilter] = useState<"all" | "user" | "system" | "failed">("all");

  // The authoritative view stays reverse-chronological; filtering only narrows the set, it never changes the order semantics
  const logs = useMemo(() => {
    const all = [...store.activityLogs].sort((a, b) => b.time.localeCompare(a.time));
    if (typeFilter === "user") return all.filter((l) => l.actorType === "user");
    if (typeFilter === "system") return all.filter((l) => l.actorType === "system");
    if (typeFilter === "failed") return all.filter((l) => l.result !== "Succeeded");
    return all;
  }, [typeFilter]);

  const failedCount = store.activityLogs.filter((l) => l.result !== "Succeeded").length;
  const systemCount = store.activityLogs.filter((l) => l.actorType === "system").length;

  return (
    <PageContainer title="Event Timeline" subTitle="Guide 4.6 · A timeline shows what happened; filtering keeps order recoverable">
      <Card styles={{ body: { maxWidth: 960 } }}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Summary + filters: the filter buttons double as a count entry point */}
          <Space size={48} wrap>
            <Statistic title="Total events (7 days)" value={store.activityLogs.length} suffix="" />
            <Statistic title="Automated system events" value={systemCount} suffix="" />
            <Statistic
              title="Failed / rejected"
              value={failedCount}
              suffix=""
              valueStyle={failedCount ? { color: token.colorError } : undefined}
            />
          </Space>

          <Space>
            {(
              [
                ["all", "All"],
                ["user", "Manual"],
                ["system", "System"],
                ["failed", "Failed / rejected"],
              ] as const
            ).map(([key, label]) => (
              <Button key={key} size="small" type={typeFilter === key ? "primary" : "default"} onClick={() => setTypeFilter(key)}>
                {label}
              </Button>
            ))}
            {typeFilter !== "all" && (
              <Button type="link" size="small" onClick={() => setTypeFilter("all")}>
                Restore original order
              </Button>
            )}
          </Space>

          <Timeline
            mode="left"
            items={logs.map((l) => ({
              color: l.result === "Failed" ? "red" : l.result === "Rejected" ? "gray" : l.actorType === "system" ? "blue" : "green",
              children: (
                <Space direction="vertical" size={2} style={{ maxWidth: 760 }}>
                  <Space size={8} wrap>
                    <Typography.Text strong>{l.action}</Typography.Text>
                    <Typography.Text type="secondary">{l.time}</Typography.Text>
                    <Typography.Text type="secondary">
                      {l.actorType === "system" ? "System" : "Manual"} · {l.actor}
                    </Typography.Text>
                    <Typography.Text code>{l.object}</Typography.Text>
                    {l.result !== "Succeeded" && <Typography.Text type="danger">{l.result}</Typography.Text>}
                  </Space>
                  <Typography.Paragraph style={{ marginBottom: 0 }} type={l.actorType === "system" ? "secondary" : undefined}>
                    {l.detail}
                  </Typography.Paragraph>
                  {/* The raw event body expands on demand, not competing with the summary for the first screen (Guide 3.1) */}
                  <Collapse
                    ghost
                    size="small"
                    items={[
                      {
                        key: "raw",
                        label: <Typography.Text type="secondary">Raw event</Typography.Text>,
                        children: <pre style={{ margin: 0 }}>{JSON.stringify(l, null, 2)}</pre>,
                      },
                    ]}
                  />
                </Space>
              ),
            }))}
          />

          <Alert
            type="info"
            showIcon
            message="The operation log is read-only"
            description="No one, including ops admins, can modify the log; a campaign that misses its GMV target or triggers an escalated complaint must reference the corresponding event in its retrospective report."
          />
        </Space>
      </Card>
    </PageContainer>
  );
}
