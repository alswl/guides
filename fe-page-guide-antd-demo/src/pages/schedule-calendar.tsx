import { useState } from "react";
import { Alert, Badge, Calendar, Card, Flex, Space, Tag, Typography } from "antd";
import type { Dayjs } from "dayjs";
import { PageContainer } from "@ant-design/pro-components";
import { store } from "../data/store";
import type { Schedule } from "../data/types";

/**
 * Calendar / scheduling (Guide 2.3 / 4.9): time × resource, judging "when is it
 * occupied, does it conflict." Different from a timeline: a timeline reads order,
 * a calendar reads occupancy and conflicts (Guide 2.4).
 */
const TYPE_COLOR: Record<Schedule["type"], string> = {
  Campaign: "blue",
  "Store Audit": "orange",
  "Product Launch": "green",
  Livestream: "purple",
};

/** Whether an event covers a given day (including multi-day spans) */
function covers(s: Schedule, day: Dayjs) {
  const d = day.format("YYYY-MM-DD");
  return d >= s.start && d <= s.end;
}

export function ScheduleCalendar() {
  const [value, setValue] = useState<Dayjs | null>(null);
  const conflicts = store.schedules.filter((s) => s.conflictWith);

  return (
    <PageContainer
      title="Calendar / Scheduling"
      subTitle="Guide 4.9 · Whether a slot is occupied and whether it conflicts"
      extra={
        <Space size={8} wrap>
          {(Object.keys(TYPE_COLOR) as Schedule["type"][]).map((t) => (
            <Tag key={t} color={TYPE_COLOR[t]}>
              {t}
            </Tag>
          ))}
        </Space>
      }
    >
      {/* Conflicts are surfaced proactively, not left for the user to cross-check */}
      {conflicts.length > 0 && (
        <Alert
          style={{ marginBottom: 16 }}
          type="warning"
          showIcon
          message={`${conflicts.length} resource conflict${conflicts.length === 1 ? "" : "s"} detected`}
          description={conflicts
            .map((c) => {
              const other = store.schedules.find((s) => s.id === c.conflictWith);
              return `${c.resource}: ${c.title} (${c.start} ~ ${c.end}) overlaps with ${other?.title ?? c.conflictWith}`;
            })
            .join("; ")}
        />
      )}

      <Card size="small">
        <Calendar
          value={value ?? undefined}
          onSelect={(d) => setValue(d)}
          cellRender={(date, info) => {
            if (info.type !== "date") return info.originNode;
            const items = store.schedules.filter((s) => covers(s, date));
            return (
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                {items.slice(0, 3).map((s) => (
                  // Badge's text slot doesn't constrain width; a long title pushes text to the
                  // next line under the dot. Splitting into "dot + truncatable text" keeps
                  // the event block on a single line (Guide 4.9)
                  <Flex key={s.id} align="center" gap={6} style={{ width: "100%" }}>
                    <Badge color={TYPE_COLOR[s.type]} />
                    <Typography.Text
                      ellipsis={{ tooltip: `${s.title} · ${s.resource} · ${s.owner}` }}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      {s.title}
                    </Typography.Text>
                  </Flex>
                ))}
                {items.length > 3 && (
                  <Typography.Text type="secondary">
                    +{items.length - 3} more
                  </Typography.Text>
                )}
              </Space>
            );
          }}
        />
      </Card>

      <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
        This is the month view, for seeing distribution and conflicts; switch to a week/day view to adjust a specific time (Guide 4.9). A multi-day event covers every day in its actual span — it isn't marked only on the start date.
      </Typography.Paragraph>
    </PageContainer>
  );
}
