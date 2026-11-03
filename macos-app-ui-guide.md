English | [简体中文](./macos-app-ui-guide.zh-CN.md)

# Modern macOS App UI and Interaction Guide

For product managers, designers, developers, and AI agents building general macOS desktop clients with native frameworks, Electron, or a hybrid stack. Make a small set of choices to produce a consistent, clear, reliable, and polished application. Adopt the defaults unless a task justifies a change; build individuality on this baseline.

**Version: 2026.11.03.** Sources checked on the same date. Maintain both language editions together. This guide does not prescribe Swift, a fixed number of regions, or a particular product's layout.

## 1. Choose before drawing

Inherit the reasoning sequence from the [dense information page guide](./fe-page-guide-antd.md): **domain objects → user tasks → primary information model → presentation structure**. Add window ownership, command scope, input methods, and recovery for desktop applications. Do not inherit the Ant Design component stack or form-first editing.

Complete this decision sheet before drawing detailed screens. Keep a default when no switching condition applies; document each departure with a reason and a verification method.

| Decision | Default | When to switch |
| --- | --- | --- |
| Content presentation | List | Grid for recognition by appearance; table for comparing fields across objects; prose for continuous reading |
| Workspace | Collection browser; list and detail for frequent inspection | Single-content window for independent documents; lightweight utility for small system-level actions |
| Visual system | System typography, semantic colors, one accent, standard density | Explicit brand or content requirements; retain complete states and accessibility |
| Editing | Edit simple attributes in place | Form when multiple fields require joint validation or submission |
| Commands | Restrained toolbar and menu bar | Add shortcuts, command search, and customization for frequent professional workflows |
| Advanced features | Appear for the relevant task or selection | Keep permanently visible only when frequent and global |
| Persistence | Autosave application-owned data; undo reversible changes | Explicit submission for publishing, external writes, or multi-field transactions |

Deliver this sheet, a normal screen, a narrow-window screen, key states, and the acceptance results from section 9. Empty-state screenshots alone are insufficient.

**Evidence boundaries:** “Platform reference” means Apple guidance. “Product observation” means behavior described or shown by a product's own site or manual, not an effectiveness study. “Community practice” comes from open-source projects. All other defaults and rules are **author recommendations**. Apple's visual approach is one option. Follow repository precedence for design decisions: product rules and permissions → current implementation and dependencies → this guide → official recommendations → historical examples. Platform/API constraints remain implementation constraints.

## 2. Choose a window composition

Choose one primary composition and add regions only for actual capabilities. Do not add sidebars, inspectors, or cards just to complete a template.

| Composition | Tasks and regions | Action placement | Narrow-window behavior |
| --- | --- | --- | --- |
| A Collection browser | Files, downloads, records: optional navigation sidebar and list/grid/table | Search, create/import, and view controls in toolbar; selection actions in context menu | Collapse sidebar first; retain identifying table fields and move secondary fields to detail |
| B List and detail | Mail, notes, messages: optional navigation, object list, detail | Collection commands near list; current-object commands near detail | Switch to list → detail with Back; preserve selection, query, and scroll position |
| C Single content | Document, image, reading: primary content and optional inspector | Document commands in toolbar; object properties in inspector or in place | Collapse auxiliary regions first; declare a reasonable minimum size if content requires space |
| D Settings | Preferences: category navigation and grouped settings | Apply ordinary toggles immediately; Save/Cancel for atomic groups | Reduce columns without truncating labels; keep business-object navigation separate |
| E Lightweight utility | Launcher, status viewer, small utility action | Menu bar panel or small window with one primary path | Offer a full window when content no longer fits comfortably; open complex settings separately |

```text
A Collection browser        B List and detail           C Single content
┌────── Toolbar ──────┐     ┌────── Toolbar ──────┐     ┌────── Toolbar ──────┐
│Nav │  Collection   │     │Nav │List│  Detail   │     │  Content  │Inspect│
└────────────────────┘     └────────────────────┘     └────────────────────┘
Navigation and inspectors are optional; diagrams prescribe neither widths nor region counts.
```

| ID / Condition | Rule | Good / Bad example | Acceptance |
| --- | --- | --- | --- |
| W1 Multiple windows | Give each window explicit object/task ownership; open another for independent work or comparison | Two documents side by side / opening a window on every row click | Open, edit, and close two objects independently; titles, commands, and saves target the correct object |
| W2 Resizable window | Retain system window controls, collapsible auxiliary regions, and sensible geometry restoration | Window stays visible after disconnecting a display / fixed canvas obscures primary buttons | Test declared minimum size, larger text, and reopening after display removal |
| W3 Toolbar | Group by task, usually no more than three groups; retain frequent commands | Navigation / content actions / search and view / ten equal-weight buttons or a card per button | Primary task remains possible with secondary commands hidden; overflow commands remain discoverable and usable |

**Platform reference:** [Windows](https://developer.apple.com/design/human-interface-guidelines/windows), [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars), [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars). Toolbar grouping and window conventions come from platform guidance; compositions A–E are this guide's choices. macOS toolbar commands should also be available in the menu bar.

## 3. Adopt this visual baseline

Prefer system controls and their metrics. These are **starting tokens for custom UI**, not Apple-mandated dimensions; do not resize native controls just to match them. Logical units are pt in native UI and usually CSS px in Electron; verify actual scaling.

| Property | Standard baseline | Adjustment condition |
| --- | --- | --- |
| Typography | System UI font; body/row title 13; secondary text 12; section title 15–17 semibold | Start long-form reading at 15–17; content typography may differ from UI; support user text preferences |
| Spacing | Scale: 4, 8, 12, 16, 24; control gaps 8, group gaps 16, main padding 16 | Reduce one step in compact regions, increase one in reading regions; keep equivalent regions consistent |
| Controls | Custom button height 28–32; visible icons 16–18; standalone icon hit area at least 28×28 | Enlarge for larger text or touch-oriented use; small artwork does not imply a small hit area |
| Lists | Single-line rows 32–36; two-line rows 48–56; aligned titles and metadata | Grow for wrapped content; never clip text to enforce row height |
| Sidebar | Initial width 200–240; resizable; truncated names have a full-name access path | Widen for hierarchy/labels; collapse in narrow windows rather than crushing content |
| Color | Semantic backgrounds/text; one accent for selection, focus, or primary action | Use status colors semantically; avoid a different colored tile for every group |
| Surfaces | Window background, content surface, temporary overlay; separate neighbors with spacing or subtle dividers | Use cards only for objects needing independent boundaries; use shadows primarily for overlays |
| Corners | Custom small controls 6, large containers 10; consistent within a class | Prefer system components; avoid nested rounded containers |

**Choose one primary density:** standard uses the table; compact supports repeated expert scanning and bulk work, with single-line rows 28–30 and group gaps 12 while retaining hit areas; spacious supports reading through content line spacing and margins, without enlarging the entire toolbar. Mix at most two adjacent densities in a window, according to region responsibilities.

Polish starts with alignment, proportion, continuity, and state feedback. Complete these states for each component before adding decoration:

| State | Default recipe | Avoid |
| --- | --- | --- |
| Resting | Content has priority; metadata one level quieter; repeated rows share alignment | Inconsistent indentation, too many text sizes, equal emphasis everywhere |
| Hover | Subtle background; reveal secondary actions without shifting content | Hiding the only primary entry point; appearing buttons change row width |
| Selected | Low-intensity accent fill with a recognizable edge/marker; retain text contrast | Hue-only differences; thick borders plus glow plus shadow |
| Keyboard focus | Clear focus ring, distinct from selection | Treating selection as focus; removing focus rings |
| Disabled/read-only | Explain unavailable commands; content stays readable/copyable | Fading entire regions until text becomes illegible |
| Loading/failure | Local status and recovery actions; preserve existing content | Clearing lists on every refresh; global alerts for every error |

**Product observations:** [Things](https://culturedcode.com/things/features/) expands task details inside an item, supporting lightweight rows with optional detail. [Bear](https://bear.app/faq/typography-options/) offers reading font, line width, and spacing preferences, separating content typography from toolbar density. [Linear's design retrospective](https://linear.app/now/behind-the-latest-design-refresh) discusses quieter navigation, smaller icons, fewer borders, and predictable action locations. Transfer these relationships without copying brand colors. Glass, gradients, and dark themes are not acceptance requirements for modern UI.

## 4. Navigation, selection, and commands

| Condition | Default choice | Switching condition / distinction |
| --- | --- | --- |
| Switch collections or product areas | Sidebar | Tabs for a few areas without hierarchy; Export is not a navigation destination |
| Switch representations of the same data | Segmented control or view menu | Preserve identity, selection, and filters; workflow stages are not views |
| Complete a genuinely ordered task | Explicit steps and Continue/Back | Do not force ordinary browsing into a wizard; freely accessible areas are not steps |
| Change pointer/keyboard meaning | Explicit mode/tool state | For example, crop; show entry and exit rather than a vague universal Edit switch |
| Find objects | Collection search with visible scope | Show scope and provenance for cross-collection search; search and filters combine and can be cleared |
| Many commands | Menu bar and searchable command entry | Command palette accelerates access; core features retain discoverable paths |
| Frequent, familiar action | Small icon button with tooltip and accessible name | Keep short text for unfamiliar, ambiguous, or consequential actions such as Publish |
| Single/range/discontinuous selection | Click, Shift range, Cmd toggle | Define focus, anchor, and selection in custom collections; selection is not opening |

| ID / Condition | Rule | Good / Bad example | Acceptance |
| --- | --- | --- | --- |
| C1 All commands | Make scope explicit; share behavior and availability across toolbar, menu, and shortcuts | Move 3 selected items to Trash / menu deletes current item while shortcut deletes collection | Execute through every entry with single, multiple, empty, and read-only selections |
| C2 Search and bulk actions | Show result scope and selection count; define Select All | “Select all 24 results” / silently acting on the whole library | Filter, select all, inspect affected objects; verify consistent selection after clearing filters |
| C3 Icon controls | Use one icon family; tooltips name action and actual shortcut; accessibility names do not depend on tooltips | Magnifier named Search / three unnamed similar magic wands | Identify controls using keyboard and VoiceOver, including state; hit-area edges work |
| C4 Progressive disclosure | Reveal advanced controls by task, with keyboard/menu access; keep common controls stable | Selection reveals properties / all features discoverable only on hover | Complete the same task without a mouse; changing selection does not destabilize layout |

**Product and community practice:** [Raycast](https://manual.raycast.com/quickstart) associates its Action Panel with the current result. [Firefox](https://support.mozilla.org/en-US/kb/customize-firefox-controls-buttons-and-toolbars) supports toolbar and overflow customization. [VS Code](https://code.visualstudio.com/docs/configure/custom-layout) supports layout changes and restoration. Add customization only for demonstrated workflow complexity and include a reset. KDE's [simple defaults](https://develop.kde.org/hig/simple_by_default/) and [power when needed](https://develop.kde.org/hig/powerful_when_needed/) offer transferable community methods, not macOS shortcut conventions.

## 5. Editing and temporary UI

| Condition | Choose | Good / Bad example |
| --- | --- | --- |
| One visible name or value | In-place editing | Rename a list item / full form page for one name |
| Continuous spatial property | Direct manipulation and precise input alternative | Drag to resize or enter a value / repeated dragging by guesswork |
| Brief choice | Anchored menu/popover | Sort or color selection / long multi-step settings inside a popover |
| Persistent selected-object properties | Inspector | Update properties as selection changes / modal on every object click |
| Joint field validation/submission | Grouped form; sheet for a short transaction | Connection address and credentials / Save required for every independent toggle |
| Consequence must be decided before proceeding | Confirmation naming consequence and action | Replace existing file / confirmation for every undoable organization action |
| Ordinary preferences | Separate settings window grouped by task | Appearance, shortcuts, storage / unnamed miscellaneous advanced bucket |

| ID / Condition | Rule | Good / Bad example | Acceptance |
| --- | --- | --- | --- |
| E1 Drag | Snapshot on press, preview during movement, commit once on release; Esc restores original state | One drag, one undo / one history entry per pixel | One Cmd-Z restores the starting value; Esc during dragging leaves no mutation |
| E2 Direct manipulation | Align handles, cursors, and target feedback; provide keyboard/menu/value alternatives | Resize edge with size feedback / invisible target with no precise input | Test edge hits, invalid targets, boundaries; achieve the same result without dragging |
| E3 In-place text | Define commit, cancel, and blur behavior; preserve invalid input for correction | Enter commits a single line, Esc cancels / losing text on blur | Enter during IME composition does not submit; distinguish newline from submission |
| E4 Multi-selection properties | Distinguish shared and mixed values; change only the specified attribute | Mixed marker; changing tag preserves other fields / first object's value presented as shared | Select different objects, change one attribute, verify all other fields |

Direct manipulation applies to editable content; it does not turn every app into an editor. **Product observations:** [Obsidian tabs](https://help.obsidian.md/tabs) offer drag grouping and command access; [iMovie](https://support.apple.com/en-us/102353) edge trimming shows a direct relationship between object and result. Adopt these interactions only when the corresponding objects and constraints exist.

## 6. Saving, tasks, and application lifecycle

| ID / Condition | Rule | Good / Bad example | Acceptance |
| --- | --- | --- | --- |
| L1 App-owned editable data | Distinguish in-memory changes, local save, and remote sync; preserve content on failure with recovery | Saved locally, waiting to sync / claiming everything is synced offline | Edit, disconnect, deny writes, restart; verify data and status separately |
| L2 Reversible edits | Name undo/redo; group one continuous intent; make results understandable | Undo Rename / undo changes off-screen data without feedback | Cmd-Z and Shift-Cmd-Z round trip; scope remains understandable after view changes |
| L3 Background tasks | Persistent status; cancellation when supported; retry or diagnosis on failure | Download list retains progress/errors / transient toast is the only record | Switch windows, cancel, retry; no duplicate submission or overwriting later manual edits |
| L4 Close and quit | Define window close, application quit, and background continuation; handle unsaved risk | Task entry remains after download window closes / task state becomes unknowable | Close last window, Cmd-Q, reopen; inspect tasks and restored state |
| L5 Files and system capabilities | Use system file/permission entry points; explain permission at point of use; unrelated tasks survive denial | Handle stale file path / requesting all permissions on launch | Deny permission, move/delete file, deny disk writes; provide actionable outcomes |

Platform reference: [Undo and redo](https://developer.apple.com/design/human-interface-guidelines/undo-and-redo). Community practice: [VS Code notification guidance](https://code.visualstudio.com/api/ux-guidelines/notifications) limits interruption and encourages useful actions. Notifications do not replace persistent task state.

## 7. One acceptance baseline for native and Electron

| Capability | Native focus | Electron focus |
| --- | --- | --- |
| Windows/title bar | System controls, full screen, restored geometry | Use system window capabilities; mark interactive controls in custom title bars `no-drag` so drag regions do not swallow clicks |
| Menus/keyboard | Correct responder and window/selection scope | Native macOS menus and suitable roles; route custom document history separately from text-input undo |
| Accessibility | Names, roles, values, focus, auxiliary actions | Semantic HTML/necessary ARIA and focus order; verify VoiceOver in the packaged application |
| System adaptation | Light/dark, increased contrast, reduced motion, text preferences | Honor the same preferences; browser default-theme testing is insufficient |
| Input/files | IME, file panels, external drops, system clipboard | Test IME composition, application menus, native file dialogs, and clipboard behavior |

Platform reference: [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility). Implementation references: Electron [window interactions](https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions), [Menu](https://www.electronjs.org/docs/latest/api/menu), [Accessibility](https://www.electronjs.org/docs/latest/tutorial/accessibility). Framework choice should not change the meaning of the same user action.

## 8. Worked example: a local reference library

Task: find, preview, and organize files. Objects: reference items and collections; content creation is out of scope. Choose **B List and detail**, standard density, system typography, and one accent.

| Decision | Concrete result |
| --- | --- |
| Regions | Collections in sidebar; name, type, modified time in list; preview and essential metadata in detail. No extra inspector |
| Toolbar | Navigation group; Import group; search/view group. Familiar actions may be icons; Import keeps a short label |
| Selection | Click selects and previews; Cmd/Shift multi-select; detail shows count and shared properties for multiple items |
| Editing | Rename in place; move collections through drag or menu; one move, one undo |
| Search | Default to current collection with visible scope; no results offers Clear Filters |
| Narrow window | Collapse sidebar first, then list → detail; Back retains query and scroll position |
| States | Empty library offers Import; missing file offers Locate; import status persists and failed items can retry |
| Visuals | Start single-line rows at 36, names at 13, metadata at 12; no cards per row; subtle accent fill and marker for selection |

Review normal lists with long multilingual names, mixed selection, no results, missing files, narrow layout, and keyboard focus. If the primary task becomes choosing images by appearance, switch collection presentation to a grid without replacing command and recovery contracts.

## 9. Executable acceptance checklist

Record **Pass / Fail / Not applicable (reason)** with window dimensions, data, and observed results. Screenshots support visual checks; interactions require execution. Blank entries or “looks fine” do not pass.

| Check | Procedure | Expected result |
| --- | --- | --- |
| Coherent choices | Compare each region with the section 1 decision sheet | Every departure has a task reason; no redundant regions or unnecessary cards |
| Real content | Use long names, multiple languages, empty values, and more than one screen of data | Stable alignment; full key names accessible; controls do not obscure content |
| Window adaptation | Test normal/minimum sizes and reopening after external display removal | Primary task remains possible; window visible; auxiliary regions recoverable |
| Visual states | Compare resting, hover, selected, focus, disabled, failure; switch light/dark | Distinguishable states; focus separate from selection; meaning not conveyed by color alone |
| Readability | Check text/background contrast and enlarge text | This system adopts 4.5:1 for ordinary text and 3:1 for large text as a starting baseline; no clipping; readability survives theme changes |
| Commands/selection | Single, multiple, filtered Select All; execute via menu/toolbar/shortcut | Consistent scope and clear count; unauthorized/unavailable actions do not run |
| Keyboard/assistive technology | Complete primary task without mouse; read key controls with VoiceOver | Visible focus, no traps, accurate names/states; dismissing temporary UI returns focus |
| Edit transaction | Drag then undo; Esc mid-drag; confirm IME composition | One intent, one undo; cancel restores original; composition does not submit |
| Recovery/tasks | Write failure, offline, retry, close window, quit/reopen | No false success or loss of confirmed saved data; task consequences and recovery clear |
| Actual application | Repeat menus, window controls, file entry in packaged macOS app | Promised behavior works; browser preview does not substitute for desktop acceptance |

The contrast baseline adopts [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); it does not claim Web standards mandate every native control. Start custom hit areas from section 3 and adjust using spacing and actual testing. [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) uses CSS px and exceptions; do not restate it as a universal macOS pt minimum.

Report outcomes concretely: “Composition B, standard density; grid substituted for image recognition; 8 of 10 checks passed, file-permission recovery failed, direct editing not applicable.” Retain failures and non-applicable items; “polished” and “modern” do not replace evidence.
