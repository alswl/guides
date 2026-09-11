import { Alert, Card, Col, Row, Space, Table, Tag, Timeline, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import { StoreHealthTag } from "../components/tags";

/**
 * Status wall (Guide 2.3): a global Alert + a store status list + an event Timeline.
 * A normal state doesn't get a screen full of green emphasis — only anomalies
 * claim attention (Guide 3.2).
 */
export function StoreStatus() {
  const abnormal = store.storeStatuses.filter((s) => s.status === "outage" || s.status === "degraded");
  const events = [...store.incidentEvents].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <PageContainer title="Status Wall" subTitle="Guide 3.2 · Only anomalies claim attention; a normal state isn't blanketed in green">
      {abnormal.length > 0 && (
        <Alert
          style={{ marginBottom: 16 }}
          type="error"
          showIcon
          message={`${abnormal.length} stores are abnormal: ${abnormal.map((s) => s.name).join(", ")}`}
          description="Overall status = the worst store's status; ongoing events are in the timeline below."
        />
      )}

      <Row gutter={16}>
        <Col span={14}>
          <Card title="Store Status" styles={{ body: { paddingBlock: 0 } }}>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={store.storeStatuses}
              columns={[
                {
                  title: "Store",
                  dataIndex: "name",
                  key: "name",
                  render: (name: string, s) => (
                    <Space>
                      <Typography.Text strong={s.status !== "operational"}>{name}</Typography.Text>
                      {s.status === "maintenance" && <Tag>Planned</Tag>}
                    </Space>
                  ),
                },
                { title: "Status", dataIndex: "status", key: "status", width: 110, render: (s) => <StoreHealthTag status={s} /> },
                { title: "Last updated", dataIndex: "updatedAt", key: "updatedAt", width: 160 },
              ]}
            />
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Event Timeline" styles={{ body: { maxHeight: 560, overflowY: "auto" } }}>
            <Timeline
              mode="left"
              items={events.map((ev) => ({
                color:
                  ev.severity === "error"
                    ? "red"
                    : ev.severity === "warning"
                      ? "orange"
                      : ev.severity === "resolved"
                        ? "green"
                        : "blue",
                children: (
                  <Space direction="vertical" size={2} style={{ maxWidth: 360 }}>
                    <Space size={8} wrap>
                      <Typography.Text strong>
                        {ev.title}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {ev.time}
                      </Typography.Text>
                    </Space>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {ev.body}
                    </Typography.Paragraph>
                  </Space>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
        Status legend: Operational / Degraded (category stockout or abnormal foot traffic) / Closed (can't take orders) / Auditing (planned). "Last updated" is the store's most recent report.
      </Typography.Paragraph>
    </PageContainer>
  );
}
