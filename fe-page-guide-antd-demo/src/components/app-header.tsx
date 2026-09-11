import { useState } from "react";
import { Avatar, Badge, Button, Col, Layout, Row, Select, Space, Typography, theme } from "antd";
import { BellOutlined } from "@ant-design/icons";

/**
 * App header: carries cross-page global context and global actions.
 * Per Guide 3.5, a frequently switched work context (here: environment) gets a
 * selector that keeps showing the current value.
 *
 * Styling comes from ConfigProvider's Design Tokens (antd's official styling
 * approach, not a custom look); refine's built-in ThemedHeaderV2 renders null
 * without an authProvider, so this is hand-built instead.
 */
export function AppHeader() {
  const { token } = theme.useToken();
  const [env, setEnv] = useState("prod");

  return (
    <Layout.Header
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        paddingInline: token.paddingLG,
      }}
    >
      <Row align="middle" justify="space-between" wrap={false}>
        {/* Left: global work context, current value always visible */}
        <Col>
          <Space size={8}>
            <Typography.Text type="secondary">Environment</Typography.Text>
            <Select
              value={env}
              onChange={setEnv}
              style={{ width: 140 }}
              options={[
                { label: "Production", value: "prod" },
                { label: "Staging", value: "pre" },
                { label: "Test", value: "staging" },
              ]}
            />
          </Space>
        </Col>

        {/* Right: global actions and the current user */}
        <Col>
          <Space size={16}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} aria-label="Notifications" />
            </Badge>
            <Space size={8}>
              <Avatar size="small">I</Avatar>
              <Typography.Text>Ivy Wang</Typography.Text>
            </Space>
          </Space>
        </Col>
      </Row>
    </Layout.Header>
  );
}
