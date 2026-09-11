English | [简体中文](./README.zh-CN.md)

# fe-page-guide-antd-demo

A runnable companion project for the [Information-Dense Page Organization Guide (Ant Design)](../fe-page-guide-antd.md).

**The left-hand menu is the index for Guide 2.3's "information model ↔ expression skeleton" table**: 19 second-level menu items map to 19 skeletons. The top level is 5 information-structure groupings, cut along adjacent rows of the 2.3 table, so the in-group order matches the guide exactly; only "Overview & Work" is pulled to the front — the dashboard is the home route `/`, so its entry doesn't belong at the bottom of the menu. Open any item to see what one layout looks like with concrete business content.

The business content on the pages (retail operations) is just **conceptual filler** — it exists so every layout has comparable content to display, not to recreate a real product. The skeletons and component structure are what this project is actually about.

Stack: Vite + React 18 + TypeScript + [Refine](https://refine.dev/) + Ant Design v5 + ProComponents (refine's `ThemedLayoutV2` uses `ProLayout` internally to carry the page shell).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

Data is an in-memory mock (`src/data/`); writes (submitting a campaign, processing a ticket, saving a rule, starring a supplier) actually mutate memory state and reset to the seed data on refresh.

## Page gallery

The actual rendered result for all 19 skeletons, in Guide 2.3's order (menu grouping order is in the next section). Screenshots taken at a 1440px viewport; click through for the full-size image.

### Sectioned Detail

`/campaigns/CMP-2026-0912`

![Sectioned Detail](docs/screenshots/detail.png)

### 2D Comparison Table

`/products`

![2D Comparison Table](docs/screenshots/table.png)

### Catalog & Discovery

`/suppliers`

![Catalog & Discovery](docs/screenshots/discovery.png)

### Card Grid

`/gallery`

![Card Grid](docs/screenshots/gallery.png)

### Hierarchy Tree

`/categories`

![Hierarchy Tree](docs/screenshots/tree.png)

### Relationship List

`/relations`

![Relationship List](docs/screenshots/relations.png)

### Step Wizard

`/campaigns/new`

![Step Wizard](docs/screenshots/wizard.png)

### Trace Drill-Down

`/runs`

![Trace Drill-Down](docs/screenshots/drilldown.png)

### Kanban

`/board`

![Kanban](docs/screenshots/board.png)

### Status Wall

`/stores`

![Status Wall](docs/screenshots/status-wall.png)

### Event Timeline

`/activity`

![Event Timeline](docs/screenshots/timeline.png)

### Discussion Thread

`/reviews`

![Discussion Thread](docs/screenshots/discussion.png)

### Continuous Document

`/docs/campaign-handbook`

![Continuous Document](docs/screenshots/doc.png)

### Side-by-Side Comparison

`/prices/compare`

![Side-by-Side Comparison](docs/screenshots/compare.png)

### Map / Canvas

`/regions`

![Map / Canvas](docs/screenshots/spatial.png)

### Calendar / Scheduling

`/calendar`

![Calendar / Scheduling](docs/screenshots/calendar.png)

### Dashboard / Overview

`/`

![Dashboard / Overview](docs/screenshots/dashboard.png)

### Master-Detail Workspace

`/tickets`

![Master-Detail Workspace](docs/screenshots/workbench.png)

### Configuration Form

`/rules`

![Configuration Form](docs/screenshots/config.png)
## Menu ↔ skeleton ↔ guide chapter

| Top-level group | Second-level skeletons |
|---|---|
| Overview & Work | Dashboard / Overview, Master-Detail Workspace, Configuration Form |
| Objects & Structure | Sectioned Detail, 2D Comparison Table, Catalog & Discovery, Card Grid, Hierarchy Tree, Relationship List |
| Process & Events | Step Wizard, Trace Drill-Down, Kanban, Status Wall, Event Timeline, Discussion Thread |
| Content & Diffs | Continuous Document, Side-by-Side Comparison |
| Space & Time | Map / Canvas, Calendar / Scheduling |

The table below lists skeletons in Guide 2.3's original order, independent of the menu grouping:

| Skeleton | Route | Primary information model | Key implementation | Guide chapter |
|---|---|---|---|---|
| Sectioned Detail | `/campaigns/CMP-2026-0912` | Single object | `PageContainer` header with identity/status/primary action + `ProDescriptions` + `Tabs` | 4.4 |
| 2D Comparison Table | `/products` | Collection | `useTable` + `ProTable`: `rowKey`, query/sort/pagination synced to the URL, `valueEnum`, empty values as `-` | 4.2 |
| Catalog & Discovery | `/suppliers` | Collection (discovery) | Search + faceted filters + `Card` grid + favorites; distinguishes "no match" from "no data" | 3.5 |
| Card Grid | `/gallery` | Collection (visual browsing) | `Row`/`Col` responsive grid + `Card` cover + search/sort + `Pagination`; includes a no-match empty state | 4.3 |
| Hierarchy Tree | `/categories` | Hierarchy | `Tree` + `Breadcrumb` + master-detail `Table` (with subcategory rollups) | 4.5 |
| Relationship List | `/relations` | Relationship network | "Pairs with" / "substitute for" as two semantically grouped adjacency lists (deliberately not a graph) | 4.5 |
| Step Wizard | `/campaigns/new` | Process & state | `Steps` + step-by-step `ProForm` (lazily rendered) + a high-risk double-confirmation `Modal` + `Result` | 4.10 / 4.11 |
| Trace Drill-Down | `/runs` | Process & state | `Steps` stage summary → per-step result → `Collapse` progressive disclosure of raw records (with a failure example) | 4.6 |
| Kanban | `/board` | Process & state | Column = stage + card carries identity and blockers + drag-to-advance (illegal moves are blocked); includes in-column counts | 4.6 |
| Status Wall | `/stores` | State continuity | Global `Alert` + status list + event `Timeline` | 3.2 |
| Event Timeline | `/activity` | Event sequence | `Statistic` summary + `Timeline` + type filter (original order recoverable) + collapsible raw events | 4.6 |
| Discussion Thread | `/reviews` | Discussion & collaboration | `List` + `Avatar` + reply relationships; system events carry lower weight | 4.6 |
| Continuous Document | `/docs/campaign-handbook` | Document & content | `Typography` continuous body + `Anchor`/`Affix` table of contents, no split Cards | 4.8 |
| Side-by-Side Comparison | `/prices/compare` | Version & diff | Comparison scope + diff summary `Statistic` + side-by-side `Table` (stable row anchors) | 4.8 |
| Map / Canvas | `/regions` | Space & location | Native page shell + a custom-drawn SVG distribution canvas (Design Token colors, Tab-selectable) + an equivalent store list | 2.3 / 4.7 |
| Calendar / Scheduling | `/calendar` | Time & scheduling | antd `Calendar` + `cellRender` event blocks + conflict `Alert`; a multi-day schedule covers its full span | 4.9 |
| Dashboard / Overview | `/` | Metrics & distribution | `Statistic` + `@ant-design/plots` Line + a to-do list + `Alert`; the chart is paired with a text summary | 3.2 / 4.7 |
| Master-Detail Workspace | `/tickets` | Queue | Left queue + right detail split (no Drawer obscuring the queue); auto-advances to the next item after resolving one | 4.2 / 4.12 |
| Configuration Form | `/rules` | Configuration & rules | `ProForm` grouped by business concept (heading + divider, no nested Cards) + an impact-preview `Alert` | 4.10 / 4.11 |

> The campaign detail page additionally demonstrates "one primary model + peer supporting views": the execution chain and review discussion inside its `Tabs` reuse the standalone page components above (Guide 3.1).

## App shell

`ThemedLayoutV2` carries the sidebar and content area; `AppHeader` / `AppFooter` fill in the header and footer:

- The header holds global context (the current-environment selector, demonstrating Guide 3.5's "a frequently switched work context should keep showing its current value") and global actions;
- The footer holds secondary information like version and data scope;
- Header/footer styling comes from ConfigProvider's Design Tokens (antd's official styling approach), no custom visuals.
- The content model is consistently "gray layout background + white Card": every page's content sits inside a Card; form groups inside a page use headings and dividers, never nested Cards (Guide 2.5).

## Style discipline (Guide 3.4)

The whole project avoids hand-building a second visual system — verifiable with `grep`:

- No custom CSS files, no `className`, no hand-written font size (`fontSize`) or weight (`fontWeight`);
- Emphasis uses `Typography.Text`'s `strong` / `type="secondary"`, compactness uses the component's `size="small"`, empty states use `Empty`, in-line alignment uses `Flex` / `Space` / `Row`;
- The only place colors are picked is `theme.useToken()` (the header's divider, the `/regions` canvas) — no hardcoded color values;
- Inline `style` only appears for layout sizing: control widths, region margins, max line length, scroll-region height;
- The SVG in `/regions` is the project's only custom-drawn view — no native component can express "spatial distribution" as an information substance, and even so its colors and corner radius still come from tokens, with the focus outline preserved;
- (The SVG inside `/gallery` is just fixture data generating placeholder covers — it isn't a custom-drawn view.)

## Directory structure

```
src/
  App.tsx               # <Refine> resources (the two-level menu IS the skeleton index) + routes + ThemedLayoutV2
  data-provider.ts      # In-memory DataProvider: handles pagination/sorting/filtering uniformly (Guide 4.2)
  data/
    types.ts            # Domain types: the same object plays different information-model roles on different pages
    seed.ts             # Simulated data (products, campaigns, tickets, suppliers, stores…)
    store.ts            # In-memory mutable dataset + name-lookup helpers
  components/
    app-header.tsx      # Header: global context and global actions
    app-footer.tsx      # Footer
    tags.tsx            # Status Tags: short text + low-intensity color expressed together
  pages/                # One file per skeleton; each file's header comment names the skeleton and its guide chapter
docs/
  screenshots/          # 19 page screenshots (1440px viewport), matching "Page gallery"
```

## Suggested reading order

- If you don't want to run the project, just look at the 19 screenshots in "Page gallery" — they're in Guide 2.3's table order.
- Once it's running, read top-to-bottom against Guide 2.3 from the left menu; each item is one skeleton.
- Compare `/relations` (topology doesn't affect judgment, so it deliberately uses an adjacency list) with `/regions` (distribution itself is the judgment basis, so it earns a custom canvas) to feel out Guide 4.5's boundary for "when a graph is actually warranted."
- Compare `/runs` (a process, using `Steps`) with `/activity` (things that already happened, using `Timeline`) — the two are not interchangeable.
- The campaign detail page demonstrates how `Tabs` carry peer views of the same object (Guide 3.1).
- Compare `/board` (stage flow, where moving is the action) with `/runs` (a look-only execution chain) to see the division of labor between Kanban and trace drill-down.
- Compare `/calendar` (who occupies a time slot, and when it conflicts) with `/activity` (what happened, in what order) — the two time semantics are not interchangeable.
