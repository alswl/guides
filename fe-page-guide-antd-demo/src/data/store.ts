import * as seed from "./seed";
import type {
  ActivityLog,
  Campaign,
  CampaignRun,
  Category,
  DocPage,
  IncidentEvent,
  PriceVersion,
  Product,
  ProductRelation,
  Region,
  ReviewMessage,
  Rule,
  Schedule,
  StoreStatus,
  Supplier,
  Ticket,
  TodoItem,
} from "./types";

/**
 * In-memory mutable dataset: write operations (processing a ticket, submitting a
 * campaign, saving a rule, starring a supplier) mutate these arrays directly.
 * A page refresh resets everything to the seed data — a feature for a demo, not a bug.
 */
export const store = {
  products: [...seed.products] as Product[],
  campaigns: [...seed.campaigns] as Campaign[],
  campaignRuns: [...seed.campaignRuns] as CampaignRun[],
  tickets: [...seed.tickets] as Ticket[],
  suppliers: [...seed.suppliers] as Supplier[],
  productRelations: [...seed.productRelations] as ProductRelation[],
  categories: [...seed.categories] as Category[],
  activityLogs: [...seed.activityLogs] as ActivityLog[],
  reviewMessages: [...seed.reviewMessages] as ReviewMessage[],
  docPages: [...seed.docPages] as DocPage[],
  priceVersions: [...seed.priceVersions] as PriceVersion[],
  regions: [...seed.regions] as Region[],
  rules: [...seed.rules] as Rule[],
  storeStatuses: [...seed.storeStatuses] as StoreStatus[],
  incidentEvents: [...seed.incidentEvents] as IncidentEvent[],
  todos: [...seed.todos] as TodoItem[],
  schedules: [...seed.schedules] as Schedule[],
  salesTrend: [...seed.salesTrend],
  /** Starred supplier IDs (supplier catalog page) */
  starredSupplierIds: new Set<string>(["s-hengyuan", "s-jiahe"]),
};

export function getRunByCampaign(campaignId: string): CampaignRun | undefined {
  return store.campaignRuns.find((r) => r.campaignId === campaignId);
}

export function categoryName(id: string): string {
  return store.categories.find((c) => c.id === id)?.name ?? id;
}

export function supplierName(id: string): string {
  return store.suppliers.find((s) => s.id === id)?.name ?? id;
}

export function productName(id: string): string {
  return store.products.find((p) => p.id === id)?.name ?? id;
}
