import { Alert, Card, Col, List, Row, Statistic, Tag, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { Line } from "@ant-design/plots";
import { Link } from "react-router-dom";
import { store } from "../data/store";

/**
 * Dashboard / Overview (Guide 2.3): summary → pending/anomalies → trend.
 * Metric cards carry a definition and time range (Guide 4.7); the chart is paired
 * with a text summary.
 */
export function Dashboard() {
  const pending = store.campaigns.filter((c) => c.status === "pending_approval");
  const abnormal = store.storeStatuses.filter((s) => s.status !== "operational" && s.status !== "maintenance");
  const running = store.campaigns.filter((c) => c.status === "running");
  const pendingTickets = store.tickets.filter((t) => t.status === "pending" || t.status === "processing");

  const gmvTotal = store.salesTrend.reduce((s, d) => s + d.gmv, 0);
  const refundTotal = store.salesTrend.reduce((s, d) => s + d.refunds, 0);
  const lastGmv = store.salesTrend[store.salesTrend.length - 1].gmv;
  const prevGmv = store.salesTrend[store.salesTrend.length - 2].gmv;
  const dod = (((lastGmv - prevGmv) / prevGmv) * 100).toFixed(1);

  return (
    <PageContainer title="Dashboard / Overview" subTitle="Guide 3.2/4.7 · Summary → pending & anomalies → trend, with a text alternative">
      {abnormal.length > 0 && (
        <Alert
          style={{ marginBottom: 16 }}
          type="error"
          showIcon
          message={`${abnormal.length} stores are in an abnormal state, including the Manhattan Fifth Avenue Flagship, which is closed`}
          action={<Link to="/stores">View store status</Link>}
        />
      )}

      {/* Summary */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[48, 24]}>
          <Col span={6}>
            <Statistic title="GMV, last 14 days" value={gmvTotal} suffix="$K" />
            <Typography.Text type="secondary">Yesterday ${lastGmv}K, {dod}% vs. prior day</Typography.Text>
          </Col>
          <Col span={6}>
            <Statistic title="Returns, last 14 days" value={refundTotal} suffix="orders" />
            <Typography.Text type="secondary">Concentrated on 09-09 (silk collection flash sale)</Typography.Text>
          </Col>
          <Col span={6}>
            <Statistic title="Running campaigns" value={running.length} suffix="" />
            <Link to="/campaigns/CMP-2026-0912">View current campaign</Link>
          </Col>
          <Col span={6}>
            <Statistic title="Pending approvals / tickets" value={pending.length + pendingTickets.length} suffix="" />
            <Link to="/campaigns/CMP-2026-0911">Go to approvals</Link>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Trend + text summary (the chart's alternative expression) */}
        <Col span={16}>
          <Card title="GMV and return count (last 14 days)" styles={{ body: { paddingBottom: 8 } }}>
            <Line
              height={260}
              data={store.salesTrend.flatMap((d) => [
                { date: d.date, type: "GMV ($K)", value: d.gmv },
                { date: d.date, type: "Returns (orders)", value: d.refunds },
              ])}
              xField="date"
              yField="value"
              seriesField="type"
              yAxis={{ label: { formatter: (v: string) => (Number.isInteger(Number(v)) ? v : "") } }}
              legend={{ position: "top" }}
              smooth
            />
          </Card>
        </Col>

        {/* Pending items: shown only when they have real action value */}
        <Col span={8}>
          <Card title="Needs attention" styles={{ body: { paddingBlock: 0 } }}>
            <List
              dataSource={store.todos}
              renderItem={(t) => (
                <List.Item
                  actions={[
                    <Link key="go" to={t.href}>
                      Handle
                    </Link>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Typography.Text strong>
                        {t.title}
                      </Typography.Text>
                    }
                    description={
                      <Typography.Text type="secondary">
                        <Tag style={{ marginRight: 4 }}>{t.type}</Tag>
                        Due {t.due}
                      </Typography.Text>
                    }
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
