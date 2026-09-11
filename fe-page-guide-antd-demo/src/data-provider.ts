import type {
  BaseRecord,
  CreateParams,
  CreateResponse,
  CrudFilters,
  CrudSorting,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  GetManyParams,
  GetManyResponse,
  GetOneParams,
  GetOneResponse,
  LogicalFilter,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { store } from "./data/store";

/**
 * In-memory DataProvider: handles pagination / sorting / filtering / error-response
 * adaptation uniformly, so individual list pages don't reimplement the protocol
 * conversion themselves (Guide 4.2).
 */
function rowsOf(resource: string): Record<string, unknown>[] {
  return (store as unknown as Record<string, Record<string, unknown>[]>)[resource] ?? [];
}

function applyFilters(rows: Record<string, unknown>[], filters: CrudFilters = []): Record<string, unknown>[] {
  return rows.filter((row) =>
    (filters as LogicalFilter[]).every((f) => {
      if (!("field" in f)) return true;
      const value = row[f.field];
      switch (f.operator) {
        case "eq":
          return value === f.value;
        case "ne":
          return value !== f.value;
        case "in":
          return Array.isArray(f.value) ? f.value.includes(value as never) : value === f.value;
        case "contains":
          return String(value ?? "").toLowerCase().includes(String(f.value ?? "").toLowerCase());
        default:
          return true;
      }
    }),
  );
}

function applySorters(rows: Record<string, unknown>[], sorters: CrudSorting = []): Record<string, unknown>[] {
  const items = [...rows];
  sorters.forEach(({ field, order }) => {
    items.sort((a, b) => {
      const av = a[field] as string | number | undefined;
      const bv = b[field] as string | number | undefined;
      const cmp = av === bv ? 0 : (av ?? "") > (bv ?? "") ? 1 : -1;
      return order === "desc" ? -cmp : cmp;
    });
  });
  return items;
}

export const dataProvider: DataProvider = {
  getApiUrl: () => "memory://store",

  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters,
    sorters,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    const filtered = applySorters(applyFilters(rowsOf(resource), filters), sorters);
    const current = pagination?.current ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const start = (current - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize) as TData[],
      total: filtered.length,
    };
  },

  getOne: async <TData extends BaseRecord = BaseRecord>({
    resource,
    id,
  }: GetOneParams): Promise<GetOneResponse<TData>> => {
    const row = rowsOf(resource).find((r) => r.id === id);
    if (!row) throw new Error(`${resource} ${id} not found`);
    return { data: row as TData };
  },

  getMany: async <TData extends BaseRecord = BaseRecord>({
    resource,
    ids,
  }: GetManyParams): Promise<GetManyResponse<TData>> => {
    return { data: rowsOf(resource).filter((r) => ids.includes(String(r.id))) as TData[] };
  },

  create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    variables,
  }: CreateParams<TVariables>): Promise<CreateResponse<TData>> => {
    const row = { id: `${resource}-${Date.now()}`, ...(variables as Record<string, unknown>) };
    rowsOf(resource).unshift(row);
    return { data: row as TData };
  },

  update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    id,
    variables,
  }: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
    const row = rowsOf(resource).find((r) => r.id === id);
    if (!row) throw new Error(`${resource} ${id} not found`);
    Object.assign(row, variables);
    return { data: row as TData };
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    id,
  }: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> => {
    const rows = rowsOf(resource);
    const index = rows.findIndex((r) => r.id === id);
    const [removed] = rows.splice(index, 1);
    return { data: removed as TData };
  },
};
