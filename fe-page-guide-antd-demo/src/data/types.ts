/**
 * Domain type definitions — a minimal domain model for a "retail ops platform."
 * The same domain objects play different information-model roles on different pages:
 * a campaign is a collection on the list page, a single object on the detail page,
 * a process/state on the creation wizard, a queue in the ticket inbox, and a
 * discussion thread on the review tab.
 */

export type RiskLevel = "low" | "medium" | "high";

/* -------------------------------- Products -------------------------------- */

export type ProductStatus = "on_sale" | "pending" | "off_shelf" | "out_of_stock";

/** Product (collection / single object) */
export interface Product {
  id: string;
  /** Product name, e.g. Lightweight Down Jacket — Women's */
  name: string;
  sku: string;
  categoryId: string;
  brand: string;
  supplierId: string;
  /** Sale price (USD) */
  price: number;
  /** Cost price (USD) */
  cost: number;
  stock: number;
  status: ProductStatus;
  /** Business risk: margin too thin, return rate too high, or abnormal stock turnover */
  riskLevel: RiskLevel;
  owner: string;
  ownerName: string;
  createdAt: string;
  /** Units sold in the last 30 days */
  sales30d: number;
  /** Return rate (%) */
  returnRate: number;
  /** Gross margin (%), derived from price and cost, shown directly so users don't have to do mental math */
  grossMargin: number;
}

/* -------------------------------- Campaigns -------------------------------- */

export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "running"
  | "finished"
  | "cancelled";

/** Campaign (collection / single object / process & state) */
export interface Campaign {
  id: string;
  title: string;
  type: "Spend & Save" | "Discount" | "Flash Sale" | "Free Gift";
  status: CampaignStatus;
  riskLevel: RiskLevel;
  owner: string;
  ownerName: string;
  createdAt: string;
  /** Campaign time window */
  planWindow: string;
  /** Number of SKUs affected */
  affectedSkus: number;
  /** Discount description */
  discount: string;
  /** Expected uplift */
  expectedUplift: string;
  scope: string[];
  changeSummary: string;
  /** Stop plan if the campaign misbehaves */
  stopPlan: string;
}

/** Campaign execution chain: stage → step → raw record (trace drill-down) */
export type StepStatus = "succeeded" | "failed" | "running" | "pending" | "skipped";

export interface ExecutionStep {
  name: string;
  status: StepStatus;
  durationSec: number;
  logs: string[];
}

export interface ExecutionStage {
  key: string;
  name: string;
  status: StepStatus;
  startedAt: string;
  durationSec: number;
  summary: string;
  steps: ExecutionStep[];
}

export interface CampaignRun {
  id: string;
  campaignId: string;
  startedAt: string;
  status: "running" | "succeeded" | "failed" | "cancelled";
  stages: ExecutionStage[];
}

/* ------------------------------ Support tickets ----------------------------- */

export type TicketStatus = "pending" | "processing" | "resolved" | "closed";

/** Support ticket (queue) */
export interface Ticket {
  id: string;
  title: string;
  type: "Return" | "Exchange" | "Complaint" | "Inquiry";
  customer: string;
  orderNo: string;
  sku: string;
  priority: RiskLevel;
  submittedAt: string;
  /** SLA (hours) */
  slaHours: number;
  status: TicketStatus;
  summary: string;
  decision?: { by: string; at: string; comment: string };
}

/* --------------------------------- Suppliers -------------------------------- */

/** Supplier catalog (catalog & discovery) */
export interface Supplier {
  id: string;
  name: string;
  category: "Apparel" | "Home" | "Electronics" | "Food";
  cooperationLevel: "Strategic" | "Core" | "Standard";
  settlement: "Prepaid" | "Net 30" | "Net 60";
  status: "Active" | "Probation" | "Terminated";
  /** On-time delivery rate (%) */
  onTimeRate: number;
  rating: number;
  description: string;
  contacts: string[];
}

/** Product relation (relationship list) */
export interface ProductRelation {
  from: string;
  to: string;
  type: "Pairs With" | "Substitute For";
  desc: string;
}

/* ---------------------------------- Categories --------------------------------- */

/** Product category (hierarchy tree) */
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

/* ------------------------------ Activity log (timeline) ----------------------------- */

export interface ActivityLog {
  id: string;
  time: string;
  actor: string;
  actorType: "user" | "system";
  action: string;
  object: string;
  result: "Succeeded" | "Failed" | "Rejected";
  detail: string;
}

/* --------------------------------- Reviews -------------------------------- */

/** Campaign review / ticket discussion (discussion thread) */
export interface ReviewMessage {
  id: string;
  campaignId: string;
  author: string;
  system: boolean;
  time: string;
  body: string;
  replyTo?: string;
  resolved: boolean;
}

/* ---------------------------------- Documents ---------------------------------- */

export interface DocSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export interface DocPage {
  slug: string;
  title: string;
  owner: string;
  updatedAt: string;
  sections: DocSection[];
}

/* ------------------------------ Price plans (side-by-side comparison) ------------------------------ */

export interface PriceVersion {
  id: string;
  productId: string;
  version: string;
  publisher: string;
  publishedAt: string;
  note: string;
  items: Record<string, string>;
}

/* ------------------------------ Store regions (space & location) ----------------------------- */

export interface Region {
  id: string;
  name: string;
  province: string;
  /** Canvas coordinates (viewBox percentage): relative position only, not real geo coordinates */
  x: number;
  y: number;
  stores: { name: string; status: "normal" | "warning" | "error"; skus: number }[];
}

/* ------------------------------- Campaign rules (configuration form) ------------------------------ */

export interface Rule {
  id: string;
  name: string;
  scopes: string[];
  needApproval: boolean;
  autoStop: boolean;
  maxDiscount: number;
  maxCampaignsPerSku: number;
  forbiddenWindows: string;
  notifyChannels: string[];
}

/* --------------------------------- Store status wall -------------------------------- */

export type StoreHealth = "operational" | "degraded" | "outage" | "maintenance";

export interface StoreStatus {
  id: string;
  name: string;
  status: StoreHealth;
  updatedAt: string;
}

export interface IncidentEvent {
  id: string;
  time: string;
  severity: "info" | "warning" | "error" | "resolved";
  title: string;
  body: string;
}

/* --------------------------------- To-dos ---------------------------------- */

export interface TodoItem {
  id: string;
  title: string;
  type: "Campaign Approval" | "Product Review" | "Ticket";
  href: string;
  due: string;
}

/* ------------------------------- Schedule (calendar) ------------------------------ */

/** Resource schedule: who occupies a given time slot (calendar skeleton) */
export interface Schedule {
  id: string;
  title: string;
  /** Start date YYYY-MM-DD */
  start: string;
  /** End date YYYY-MM-DD; same as start for a single-day event */
  end: string;
  type: "Campaign" | "Store Audit" | "Product Launch" | "Livestream";
  /** Occupied resource: a store, a livestream room, or a category */
  resource: string;
  owner: string;
  /** Conflict hint when another schedule occupies the same resource concurrently */
  conflictWith?: string;
}
