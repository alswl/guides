import { Refine } from "@refinedev/core";
import { ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { App as AntdApp, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import {
  DashboardOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PartitionOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { dataProvider } from "./data-provider";
import { AppHeader } from "./components/app-header";
import { AppFooter } from "./components/app-footer";
import { Dashboard } from "./pages/dashboard";
import { ProductList } from "./pages/product-list";
import { ProductGallery } from "./pages/product-gallery";
import { ProductRelations } from "./pages/product-relations";
import { CampaignCreate } from "./pages/campaign-create";
import { CampaignShow } from "./pages/campaign-show";
import { TicketInbox } from "./pages/ticket-inbox";
import { SupplierCatalog } from "./pages/supplier-catalog";
import { CategoryTree } from "./pages/category-tree";
import { ActivityLog } from "./pages/activity-log";
import { StoreStatus } from "./pages/store-status";
import { DocView } from "./pages/doc-view";
import { PriceCompare } from "./pages/price-compare";
import { RegionOverview } from "./pages/region-overview";
import { RuleForm } from "./pages/rule-form";
import { RunDrilldown } from "./pages/run-drilldown";
import { CampaignBoard } from "./pages/campaign-board";
import { ScheduleCalendar } from "./pages/schedule-calendar";
import { ReviewThread } from "./pages/review-thread";

/**
 * The menu is the skeleton index from Guide 2.3 (business content is just conceptual filler):
 * top level is an information-structure grouping, second level is the concrete skeleton,
 * and the second-level order matches the guide's table.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={enUS}>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              // The menu is the skeleton index: 19 items map one-to-one to Guide 2.3's
              // "information model ↔ expression skeleton" table.
              // Top level is an information-structure grouping, second level is the skeleton.
              // Groups are cut along adjacent rows of the 2.3 table, so the in-group order
              // matches the guide exactly; only "Overview & Work" is pulled to the front —
              // the dashboard is the home route /, so its entry belongs at the top of the
              // menu, not the bottom. Business content is just conceptual filler, used so
              // every layout has something comparable to display.
              { name: "grpWork", meta: { label: "Overview & Work", icon: <DashboardOutlined /> } },
              { name: "dashboard", list: "/", meta: { parent: "grpWork", label: "Dashboard / Overview" } },
              { name: "workbench", list: "/tickets", meta: { parent: "grpWork", label: "Master-Detail Workspace" } },
              { name: "config", list: "/rules", meta: { parent: "grpWork", label: "Configuration Form" } },

              { name: "grpObject", meta: { label: "Objects & Structure", icon: <ProfileOutlined /> } },
              { name: "detail", list: "/campaigns/CMP-2026-0912", meta: { parent: "grpObject", label: "Sectioned Detail" } },
              { name: "table", list: "/products", meta: { parent: "grpObject", label: "2D Comparison Table" } },
              { name: "discovery", list: "/suppliers", meta: { parent: "grpObject", label: "Catalog & Discovery" } },
              { name: "gallery", list: "/gallery", meta: { parent: "grpObject", label: "Card Grid" } },
              { name: "tree", list: "/categories", meta: { parent: "grpObject", label: "Hierarchy Tree" } },
              { name: "relations", list: "/relations", meta: { parent: "grpObject", label: "Relationship List" } },

              { name: "grpProcess", meta: { label: "Process & Events", icon: <PartitionOutlined /> } },
              { name: "wizard", list: "/campaigns/new", meta: { parent: "grpProcess", label: "Step Wizard" } },
              { name: "drilldown", list: "/runs", meta: { parent: "grpProcess", label: "Trace Drill-Down" } },
              { name: "board", list: "/board", meta: { parent: "grpProcess", label: "Kanban" } },
              { name: "statusWall", list: "/stores", meta: { parent: "grpProcess", label: "Status Wall" } },
              { name: "timeline", list: "/activity", meta: { parent: "grpProcess", label: "Event Timeline" } },
              { name: "discussion", list: "/reviews", meta: { parent: "grpProcess", label: "Discussion Thread" } },

              { name: "grpContent", meta: { label: "Content & Diffs", icon: <FileTextOutlined /> } },
              { name: "docs", list: "/docs/campaign-handbook", show: "/docs/:slug", meta: { parent: "grpContent", label: "Continuous Document" } },
              { name: "compare", list: "/prices/compare", meta: { parent: "grpContent", label: "Side-by-Side Comparison" } },

              { name: "grpSpaceTime", meta: { label: "Space & Time", icon: <GlobalOutlined /> } },
              { name: "spatial", list: "/regions", meta: { parent: "grpSpaceTime", label: "Map / Canvas" } },
              { name: "calendar", list: "/calendar", meta: { parent: "grpSpaceTime", label: "Calendar / Scheduling" } },
            ]}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayoutV2
                    Title={() => <span>Retail Ops</span>}
                    Header={AppHeader}
                    Footer={AppFooter}
                  >
                    <Outlet />
                  </ThemedLayoutV2>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/gallery" element={<ProductGallery />} />
                <Route path="/relations" element={<ProductRelations />} />
                <Route path="/runs" element={<RunDrilldown />} />
                <Route path="/board" element={<CampaignBoard />} />
                <Route path="/reviews" element={<ReviewThread />} />
                <Route path="/campaigns/new" element={<CampaignCreate />} />
                <Route path="/campaigns/:id" element={<CampaignShow />} />
                <Route path="/tickets" element={<TicketInbox />} />
                <Route path="/suppliers" element={<SupplierCatalog />} />
                <Route path="/categories" element={<CategoryTree />} />
                <Route path="/activity" element={<ActivityLog />} />
                <Route path="/stores" element={<StoreStatus />} />
                <Route path="/regions" element={<RegionOverview />} />
                <Route path="/calendar" element={<ScheduleCalendar />} />
                <Route path="/prices/compare" element={<PriceCompare />} />
                <Route path="/docs/:slug" element={<DocView />} />
                <Route path="/docs" element={<Navigate to="/docs/campaign-handbook" replace />} />
                <Route path="/rules" element={<RuleForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
