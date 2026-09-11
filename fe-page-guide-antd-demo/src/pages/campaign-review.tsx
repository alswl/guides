import { Avatar, Button, Flex, Input, List, Space, Tag, Typography } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { store } from "../data/store";

/**
 * Discussion thread (Guide 2.3): preserves the speaker, time, and reply
 * relationships; system events carry lower visual weight and aren't flattened
 * into undifferentiated text alongside human opinions (Guide 4.6).
 */
export function CampaignReview({ campaignId }: { campaignId: string }) {
  const messages = store.reviewMessages.filter((m) => m.campaignId === campaignId);
  const [draft, setDraft] = useState("");

  const byId = new Map(messages.map((m) => [m.id, m]));
  const ordered = [...messages].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 880 }}>
      <List
        dataSource={ordered}
        renderItem={(m) => {
          const parent = m.replyTo ? byId.get(m.replyTo) : undefined;
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={m.system ? <RobotOutlined /> : <UserOutlined />} />}
                title={
                  <Space size={8}>
                    <Typography.Text type={m.system ? "secondary" : undefined} strong={!m.system}>
                      {m.author}
                    </Typography.Text>
                    {m.system && <Tag>System event</Tag>}
                    {m.resolved && <Tag color="success">Resolved</Tag>}
                    <Typography.Text type="secondary">{m.time}</Typography.Text>
                  </Space>
                }
                description={
                  <>
                    {parent && (
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 4 }}>
                        Replying to <strong>{parent.author}</strong>: {trim(parent.body, 60)}
                      </Typography.Paragraph>
                    )}
                    <Typography.Paragraph style={{ marginBottom: 0 }} type={m.system ? "secondary" : undefined}>
                      {m.body}
                    </Typography.Paragraph>
                  </>
                }
              />
            </List.Item>
          );
        }}
      />

      {/* Input and action sit at the end of the thread (default activity-page region order, Guide 3.2) */}
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Input.TextArea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a review comment… (demo, not persisted)"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
        <Flex justify="flex-end">
          <Button type="primary" disabled={!draft}>
            Post comment
          </Button>
        </Flex>
      </Space>
    </Space>
  );
}

function trim(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
