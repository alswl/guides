import { Tag } from "antd";
import type {
  CampaignStatus,
  ProductStatus,
  RiskLevel,
  StepStatus,
  StoreHealth,
} from "../data/types";

/** Status is expressed as short text + low-intensity color together; the error color is reserved for states that genuinely need attention (Guide 3.2). */
export const PRODUCT_STATUS: Record<ProductStatus, { text: string; color: string }> = {
  on_sale: { text: "On sale", color: "success" },
  pending: { text: "Pending", color: "gold" },
  off_shelf: { text: "Delisted", color: "default" },
  out_of_stock: { text: "Out of stock", color: "error" },
};

export function ProductStatusTag({ status }: { status: ProductStatus }) {
  const s = PRODUCT_STATUS[status];
  return <Tag color={s.color}>{s.text}</Tag>;
}

export const CAMPAIGN_STATUS: Record<CampaignStatus, { text: string; color: string }> = {
  draft: { text: "Draft", color: "default" },
  pending_approval: { text: "Pending approval", color: "gold" },
  approved: { text: "Approved", color: "cyan" },
  running: { text: "Running", color: "processing" },
  finished: { text: "Finished", color: "success" },
  cancelled: { text: "Cancelled", color: "warning" },
};

export function CampaignStatusTag({ status }: { status: CampaignStatus }) {
  const s = CAMPAIGN_STATUS[status];
  return <Tag color={s.color}>{s.text}</Tag>;
}

/** Business risk: a combined read on margin, return rate, and stock turnover */
export function RiskTag({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { text: string; color: string }> = {
    low: { text: "Low risk", color: "default" },
    medium: { text: "Medium risk", color: "gold" },
    high: { text: "High risk", color: "volcano" },
  };
  const r = map[level];
  return <Tag color={r.color}>{r.text}</Tag>;
}

export const STEP_STATUS_TEXT: Record<StepStatus, string> = {
  succeeded: "Succeeded",
  failed: "Failed",
  running: "Running",
  pending: "Pending",
  skipped: "Skipped",
};

export const STORE_HEALTH: Record<StoreHealth, { text: string; color: string }> = {
  operational: { text: "Operational", color: "success" },
  degraded: { text: "Degraded", color: "warning" },
  outage: { text: "Closed", color: "error" },
  maintenance: { text: "Auditing", color: "processing" },
};

export function StoreHealthTag({ status }: { status: StoreHealth }) {
  const h = STORE_HEALTH[status];
  return <Tag color={h.color}>{h.text}</Tag>;
}
