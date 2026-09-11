import { useMemo, useState } from "react";
import { Button, Card, Col, Descriptions, Empty, Input, Modal, Row, Space, Tag, Typography } from "antd";
import { PageContainer, ProList } from "@ant-design/pro-components";
import { store } from "../data/store";
import type { Ticket } from "../data/types";
import { RiskTag } from "../components/tags";

/**
 * Master-detail workspace (Guide 2.3): a left queue + right detail split, no
 * overlay obscuring the queue. The queue expresses "what to work on next";
 * results write back to in-memory state.
 */
export function TicketInbox() {
  const tickets = useMemo(() => store.tickets, []);
  const open = tickets.filter((t) => t.status === "pending" || t.status === "processing");
  const [selectedId, setSelectedId] = useState<string>(open[0]?.id ?? "");
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [closing, setClosing] = useState(false);
  const [closeReason, setCloseReason] = useState("");

  const shown = filter === "open" ? open : tickets;
  const selected = tickets.find((t) => t.id === selectedId);

  const resolve = (t: Ticket) => {
    t.status = "resolved";
    t.decision = { by: "Current user", at: "2026-09-12 10:00", comment: closeReason || "Resolved." };
    setClosing(false);
    setCloseReason("");
    const next = store.tickets.find((x) => (x.status === "pending" || x.status === "processing") && x.id !== t.id);
    setSelectedId(next?.id ?? t.id);
  };

  return (
    <PageContainer title="Master-Detail Workspace" subTitle="Guide 4.2/4.12 · Queue + detail split, no overlay obscuring the queue">
      <Row gutter={16}>
        {/* Left: queue */}
        <Col flex="380px">
          <Card
            size="small"
            title={
              <Space.Compact>
                <Button size="small" type={filter === "open" ? "primary" : "default"} onClick={() => setFilter("open")}>
                  Open {open.length}
                </Button>
                <Button size="small" type={filter === "all" ? "primary" : "default"} onClick={() => setFilter("all")}>
                  All {tickets.length}
                </Button>
              </Space.Compact>
            }
          >
            <ProList<Ticket>
              rowKey="id"
              dataSource={shown}
              onItem={(record) => ({ onClick: () => setSelectedId(record.id) })}
              metas={{
                title: {
                  render: (_, t) => (
                    <Space size={8}>
                      <Typography.Text strong={t.id === selectedId}>{t.title}</Typography.Text>
                      <RiskTag level={t.priority} />
                    </Space>
                  ),
                },
                description: {
                  render: (_, t) => (
                    <Typography.Text type="secondary">
                      <Tag style={{ marginRight: 4 }}>{t.type}</Tag>
                      {t.customer} · {t.submittedAt}
                    </Typography.Text>
                  ),
                },
              }}
            />
          </Card>
        </Col>

        {/* Right: detail (keeps the queue context visible, no overlay) */}
        <Col flex="auto">
          <Card
            title={
              selected ? (
                <Space size={8}>
                  <span>{selected.title}</span>
                  <Typography.Text type="secondary">
                    {selected.id}
                  </Typography.Text>
                </Space>
              ) : (
                "Ticket Detail"
              )
            }
            extra={
              (selected?.status === "pending" || selected?.status === "processing") && (
                <Space>
                  <Button onClick={() => setClosing(true)}>Reassign</Button>
                  <Button type="primary" onClick={() => selected && resolve(selected)}>
                    Mark resolved
                  </Button>
                </Space>
              )
            }
          >
            {selected ? (
              <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <Space size={8} wrap>
                  <Tag
                    color={
                      selected.status === "pending"
                        ? "gold"
                        : selected.status === "processing"
                          ? "processing"
                          : selected.status === "resolved"
                            ? "success"
                            : "default"
                    }
                  >
                    {selected.status === "pending"
                      ? "Pending"
                      : selected.status === "processing"
                        ? "Processing"
                        : selected.status === "resolved"
                          ? "Resolved"
                          : "Closed"}
                  </Tag>
                  <RiskTag level={selected.priority} />
                  <Typography.Text type="secondary">
                    {selected.status === "pending" || selected.status === "processing"
                      ? `SLA ${selected.slaHours}h · Submitted ${selected.submittedAt}`
                      : ""}
                  </Typography.Text>
                </Space>

                <Typography.Paragraph style={{ marginBottom: 0, maxWidth: 720 }}>{selected.summary}</Typography.Paragraph>

                <Descriptions
                  bordered
                  column={2}
                  size="small"
                  style={{ maxWidth: 880 }}
                  items={[
                    { key: "customer", label: "Customer", children: selected.customer },
                    { key: "order", label: "Order #", children: selected.orderNo },
                    { key: "type", label: "Ticket type", children: selected.type },
                    { key: "sku", label: "Product", children: selected.sku },
                    ...(selected.decision
                      ? ([
                          {
                            key: "decision",
                            label: "Resolution",
                            children: `${selected.decision.by} · ${selected.decision.at} · ${selected.decision.comment}`,
                            span: 2,
                          },
                        ] as const)
                      : []),
                  ]}
                />
              </Space>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a ticket from the queue to view its detail." />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        open={closing}
        title="Reassign ticket"
        okText="Reassign"
        cancelText="Cancel"
        okButtonProps={{ disabled: !closeReason }}
        onOk={() => selected && resolve(selected)}
        onCancel={() => setClosing(false)}
      >
        <Typography.Paragraph type="secondary">A reassignment must state a reason and the new owner, so the ticket doesn't bounce between queues.</Typography.Paragraph>
        <Input.TextArea
          value={closeReason}
          onChange={(e) => setCloseReason(e.target.value)}
          placeholder="e.g. Involves a quality issue, reassigning to QA — Zhang"
        />
      </Modal>
    </PageContainer>
  );
}
