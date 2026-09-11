import { Affix, Anchor, Card, Col, Row, Space, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { Link, useParams } from "react-router-dom";
import { store } from "../data/store";

/**
 * Continuous document (Guide 2.3): title/metadata → table of contents → body →
 * related content. Keeps a continuous-reading structure, doesn't break
 * paragraphs into Cards (Guide 4.8).
 */
export function DocView() {
  const { slug } = useParams<{ slug: string }>();
  const doc = store.docPages.find((d) => d.slug === slug) ?? store.docPages[0];

  return (
    <PageContainer
      title="Continuous Document"
      subTitle="Guide 4.8 · Continuous reading; sections use anchors, not split Cards or Tabs"
      breadcrumb={{ items: [{ title: <Link to="/docs/campaign-handbook">Operations Policy</Link> }, { title: doc.title }] }}
    >
      <Row gutter={24} wrap={false}>
        {/* Body: continuous typography, constrained line length (Guide 3.4) */}
        <Col flex="auto">
          <Card
            title={
              <Space direction="vertical" size={0}>
                <span>{doc.title}</span>
                <Typography.Text type="secondary">
                  {doc.owner} · Updated {doc.updatedAt}
                </Typography.Text>
              </Space>
            }
          >
            <article style={{ maxWidth: 760 }}>
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id}>
                  <Typography.Title level={3} style={{ marginTop: 32 }}>
                    {s.heading}
                  </Typography.Title>
                  {s.paragraphs.map((p, i) => (
                    <Typography.Paragraph key={i}>{p}</Typography.Paragraph>
                  ))}
                </section>
              ))}

              <Typography.Title level={4} style={{ marginTop: 48 }}>
                Related Content
              </Typography.Title>
              <ul>
                {store.docPages
                  .filter((d) => d.slug !== doc.slug)
                  .map((d) => (
                    <li key={d.slug}>
                      <Link to={`/docs/${d.slug}`}>{d.title}</Link>
                    </li>
                  ))}
                <li>
                  <Link to="/campaigns/CMP-2026-0912">Campaign detail (an instance applying this policy)</Link>
                </li>
              </ul>
            </article>
          </Card>
        </Col>

        {/* Table of contents: sections within long content use anchors, not Tabs (Guide 3.1) */}
        <Col flex="200px">
          <Affix offsetTop={88}>
            <Anchor affix={false} items={doc.sections.map((s) => ({ key: s.id, href: `#${s.id}`, title: s.heading }))} />
          </Affix>
        </Col>
      </Row>
    </PageContainer>
  );
}
