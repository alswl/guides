import { Layout, Row, Space, Typography } from "antd";

/**
 * App footer: carries secondary global information — version, data scope, external links.
 * Uses antd Layout.Footer's native token styling, no custom appearance.
 */
export function AppFooter() {
  return (
    <Layout.Footer>
      <Row justify="center">
        <Space size={8} split="·">
          <Typography.Text type="secondary">Retail Ops · Page Organization Demo</Typography.Text>
          <Typography.Text type="secondary">Simulated data; writes only mutate memory</Typography.Text>
          <Typography.Text type="secondary">v0.1.0</Typography.Text>
        </Space>
      </Row>
    </Layout.Footer>
  );
}
