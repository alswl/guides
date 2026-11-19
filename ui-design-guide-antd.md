English | [简体中文](./ui-design-guide-antd.zh-CN.md)

# General UI Design Guidelines · Ant Design

Use these guidelines for admin consoles, workbenches, operations tools, and data products. Build a quiet work surface with neutral colors. Use spacing, alignment, and typography to establish order. Reserve brand color, elevation, and motion for places that need attention or action. The guidelines work across component libraries. With Ant Design, start with the components and semantic tokens in the project's installed version. For modeling and composing information-dense pages, see the [Information-Dense Page Organization Guide](./fe-page-guide-antd.md).

This guide synthesizes 42 topics from a pinned commit. A default here is a starting point that can be adapted to the task, brand, input methods, and accessibility requirements. Artboard sizes, item counts, and dimensions from upstream serve as reference points. The synthesis includes upstream research topics.

## 1. Design values and reuse

| Value | Design requirement |
| --- | --- |
| Natural | Organize tasks around familiar objects, language, and sequences. Use position, shape, state, and transitions to make outcomes predictable. |
| Certain | Give the same object, action, and state a consistent name, appearance, and response. Capture repeated decisions in tokens, components, and patterns so similar tasks feel familiar. |
| Meaningful | Give each task a clear goal and recognizable outcome. Report what changed and offer help at the moment it can support the work. |
| Growing | Give new users a way to get started and experienced users a way to discover advanced actions in context. Use composable modules to support new roles, data, and workflows. |

Identify the user, primary task, current object, and completion condition before choosing a pattern. Solve recurring problems at the appropriate level of reuse, from shared conventions and primitives through business modules, page templates, and multi-page workflows. Validate reuse against real tasks. Upstream case studies include Ant Financial Technology, OceanBase Cloud Platform, Yuque, Ant Design Pro, and Alibaba Cloud StreamCompute. They show how the design system applies across different products.

Use four questions in review. Does the work fit the user's understanding of the object and task? Does the same action behave as expected on another page? Can the user verify the result? Will additional workflows, roles, or data still have clear entry points? If an approval workflow expands from one role to three, for example, reuse the detail structure and approval states while showing the relevant actions to each role. Every entry point still leads to the same record and state vocabulary.

### 1.1 From design to implementation

1. Write down the role, task, object, and completion condition. For example, “An operator locates orders by date and exports the filtered results.”
2. Mark page, section, and object actions on the design. For each critical action, specify availability, submission scope, pending state, success, failure, and cancellation.
3. Provide regular and narrow layouts with long titles, large values, empty data, and partial failures. If the product has multiple themes, identify the semantic roles they share.
4. Compare existing pages and the component library. Bind reusable styles to shared tokens and reuse existing component behavior. For a new variant, document when to use it and what visible or behavioral difference to verify.

## 2. Visual language

### 2.1 Layout, spacing, and hierarchy

- **Proximity.** Keep labels near values, icons near their text, and actions near the objects they affect. Use smaller gaps within groups and larger ones between groups. Start with whitespace and add headings, dividers, or containers where they clarify structure.
- **Alignment.** Give body copy, headings, and short fields a consistent reading edge. Align form labels and entry areas consistently. Align comparable numbers to the end of their columns and use consistent precision, typically right-aligning them in left-to-right layouts.
- **Contrast.** Use weight, size, position, luminance, and shape to distinguish whole from part, primary from secondary actions, and one state from another. Keep options visually neutral when the decision calls for careful deliberation.
- **Repetition.** Reuse spacing, type levels, component states, and action placement in similar sections. Use a small number of distinct variants for meaningful differences.
- **Grid and adaptation.** Use 8 px as the reference rhythm for layout. The upstream desktop reference uses a 1440 px artboard and a 24-column content grid. Columns flex while gutters stay stable within the intended range. Specify column behavior, gutters, section boundaries, and wrapping. A side-by-side layout can hold navigation width steady and flex the workspace. A top-to-bottom layout can define minimum side margins and then flex the content. Test reflow with actual viewports, text, and data.

#### Start with alignment and spacing

Mark the leading and trailing content edges and the primary columns before placing components. Align the outer edges of page titles, prose, tables, and forms where practical. Give each column its own reading order. At narrow widths, specify which elements wrap first, which sections stack, and which actions move into overflow.

For an order list, try 8 px within a group, 16 px between neighboring controls, and 24 or 32 px between sections, then adjust for actual density. Keep filter controls and the query button together and leave a clear gap before the results. Related content can share one surface when spacing makes the grouping evident. Use a divider or container when two independent topics need separation. In a compact mode, adjust row height and spacing together while preserving room for labels, states, and actions.

For a short form that users need to scan quickly, place labels above and align them to the start of their inputs. A horizontal form can use a fixed label column with trailing alignment so all inputs start on one line. In lists, align comparable amounts or quantities by place value with consistent precision. Align names and descriptions to the leading reading edge.

### 2.2 Color, typography, and elevation

| Element | Default |
| --- | --- |
| Brand color | The Ant Design reference primary is `#1677FF`. Generate a light-to-dark ramp and assign semantic tokens for default, hover, pressed, and subtle background treatments. Use saturated color for key actions, selection, and important information. |
| Functional color | Define shared color roles for success, warning, error, information, and links. Supplement color with text, icons, or shapes. The upstream system palette has 12 base hues with 10 shades each, 13 neutrals, and a separate visualization palette. |
| Neutral color | Define roles for the page, containers, borders, dividers, headings, body text, secondary text, and disabled states. Check translucent colors against their composited backgrounds. |
| Typography | Prefer system fonts with appropriate language fallbacks. Start body text at 14 px with a 22 px line height. Three to five sizes generally cover a working interface. Use mainly weights 400 and 500, with 600 for emphasis as needed. Use `tabular-nums` for comparable figures. |
| Elevation | Use shadow to show how a surface relates to the base plane. Keep persistent controls such as inputs at base level. Use low elevation for hover lift, medium for anchored overlays such as dropdowns, and high for independent modal dialogs. Bottom overlays can cast upward and side overlays toward the content. |
| Dark mode | Preserve the information, priorities, and state meanings of light mode. Recalculate surfaces, text, and brand shades for dark backgrounds. Keep large saturated areas subdued and check text, boundaries, focus, and states individually. |

Check actual foreground and background combinations against the product's accessibility target. For WCAG 2.2 AA text contrast, use at least 4.5:1 for normal text and 3:1 for large text. The upstream typography page sets a design target of 7:1 for body text and headings.

#### Configure color and elevation for a working interface

Assign page background, content surface, dividers, body text, and supporting text before adding accents. Check the hierarchy in neutrals first. On a ticket page, use position and a heading for the ticket name, a status label for progress, and a primary button for the next consequential action. Links, selections, and primary buttons can come from one brand ramp and use text, background tint, and solid fill to distinguish their roles. Status text and icons still convey urgency.

Review default, hover, pressed, keyboard focus, selected, disabled, and loading states side by side. Focus must be recognizable in both ordinary and selected states. Hover emphasis can be transient. Selection needs a persistent marker. Check actual color combinations in dark mode, especially subtle tag backgrounds, chart grid lines, input borders, and translucent overlays. Verify shadow, backdrop, and stacking order across dropdowns, drawers, and dialogs.

#### Specify reusable values in the visual handoff

The following is a sample desktop workbench specification. Start with existing project tokens for type, spacing, and grid, then validate them with real content. Upstream provides the 8 px rhythm, 24-column grid, 1440 px reference artboard, and 14/22 body type. The other values show one possible configuration.

| Specify | Example | Check |
| --- | --- | --- |
| Spacing and grid | Use 8 px between icon and label, 16 px between control groups, and 24 or 32 px between major sections. A wide overview can divide its 24 columns into 12+12 or 8+8+8. | Apply the same spacing tier to the same kind of relationship. When columns stack, primary content should precede supporting content. |
| Type scale | Set body to 14/22, section headings to 16/24, and page titles to 24/32, in px. Use semantic text color for supporting copy first. | Check long Chinese and English headings, two-line field help, and numeric columns. |
| Surfaces | Use the page background to frame the workspace, a content surface for primary sections, and subtle borders within tables. Choose radii from the existing control and container scales. | Each nested surface should communicate grouping or elevation. Check table, card, and overlay boundaries in dark mode. |
| Flexible regions | Specify when the sidebar stays fixed, collapses, or moves into a menu. Specify the content area's usable minimum width, wrapping, scrolling, and action overflow. | Resize from 1440 px to the smallest supported width. At each reflow point, complete the same task. |

### 2.3 Icons and illustrations

- **System icons** should have clear meanings and consistent strokes and corners. When extending a set, use consistent artboards, clear space, contours, and naming. Check visual weight at the rendered size and adjust diagonals, curves, and negative space optically. Upstream uses a 1024 × 1024 drawing grid with a 64 px perimeter allowance. Give icon-only controls an accessible name and a tooltip available on focus.
- **Business icons** can use more detail and brand color. Check recognition at the rendered size, in the intended container, and against the actual background. Use the same symbol for the same business concept.
- **Illustrations** can explain a situation, support onboarding, or reinforce a result. Use a palette compatible with the UI and compose scenes from reusable people, objects, and environments. Start with natural human proportions. Put the subject in the foreground, establish context in the middle ground, and keep the background subdued. State outcomes and next actions in text.

#### Size graphics for their role

Match the visual size of inline icons to nearby text. Inherit the text color by default and apply a functional color when the icon conveys a state. Use a consistent outline or filled style in a toolbar, checking both rendered size and hit area. Business icons can support entry cards or larger onboarding areas. Upstream gives 32, 48, and 64 px as reference sizes. Use illustrations at points that benefit from explanation, such as first use, exceptions, and workflow outcomes. Brief text or a status icon generally suffices after a routine action.

## 3. Actions, navigation, and motion

### 3.1 Discoverability and continuity

| Principle | Application |
| --- | --- |
| Make it direct | Edit where the outcome is visible. Use inline editing for small changes, with clear ways to enter editing, save, and cancel for groups of fields. Constrain drag reordering to the meaningful direction and provide a handle, drop feedback, and an alternative control. |
| Stay on the page | Choose among inline expansion, overlays, in-page views, drawers, and standalone pages. Keep short tasks in context. Use a standalone page when the work needs an independent link, recovery, or a dedicated workspace. Restore applicable filters, pagination, and position when users return to a list. |
| Keep it lightweight | Put actions near their objects. Keep frequent tools visible, reveal secondary tools on hover and focus, and show batch or editing controls in the corresponding mode. The hit area can exceed the visible control while keeping adjacent targets distinct. |
| Provide an invitation | Use labels, example placeholders, handles, inline tips, and short walkthroughs to show how to begin. Provide dynamic cues in response to input and context. Let users dismiss and restart walkthroughs. |
| React immediately | Acknowledge actions through a visible change, loading state, or feedback message. Use live suggestions, lookups, preview, and progressive disclosure to prevent errors. If background refresh would interrupt reading or editing, announce new data and let the user choose when to refresh. |
| Use transitions | Show the origin, destination, or effect of opening, expanding, adding, removing, and switching. Keep unchanged content stable. Make motion brief, intuitive, and smooth, with quick exits and understandable state changes under reduced-motion settings. |

#### Test the same action before, during, and after

Consider reordering a queue. Before the action, show a drag handle and provide Move up and Move down commands. During the action, mark valid drop targets and keep surrounding content stable. After the action, show the new order in place. If saving is ongoing, show its status. On failure, restore the order or allow retry. A visible list change can suffice when users only need to recognize an outcome. Motion can explain which row moved, while saving and recovery still need explicit states.

For inline edits, put submission, cancellation, and validation close to the field. A short task can expand in place or use a popover. More complex content may need a drawer or dedicated page. Move focus into an overlay when it opens and return it to the trigger when it closes. When users leave an edit unfinished, preserve a draft or warn about discarding it according to the value of the work.

### 3.2 Navigation

- Build around the paths users take. Global navigation shows the core structure and current location. Use top navigation for a shallow set of entries, starting with two to seven. Use side navigation for more entries, multiple levels, or frequent switching. For complex menus, provide browsable groups and avoid narrow hover paths. Keep utilities such as search, notifications, help, and account controls in stable positions.
- Give subsites and immersive editors a clear exit. Use page headers, anchors, or trees for in-page navigation and support direct links when sections need to be shared. Use tabs for peer views and steps for linear tasks, with the current step marked. Steps, pagination, and previous/next controls should convey direction or how much remains.
- Let users open details from an object title. Use breadcrumbs for meaningful parent relationships and omit them when location is already apparent. Add an explicit way back in spaces that hide global navigation. Test deep links by checking whether users can identify where they are, the parent context, and where links lead.

#### Choose controls by navigation intent

| User intent | Control and design decision |
| --- | --- |
| Go to another primary feature | Top or side navigation. Keep the active item visible and group related destinations together. |
| Switch between peer views of the current object | Tabs. Use basic tabs for page-level views, card or pill variants for local sections, and vertical tabs when there are many categories. |
| Jump farther down this page | Anchors or a contents list. A long page may benefit from Back to top. Deep links should land on the target section. |
| Complete a task in a fixed order | Steps. Use a horizontal layout for a short, stable flow. Consider vertical steps when there are more stages or they need explanation. |
| Find a different batch of results | Pagination. Full controls suit tables, while a compact variant can serve cards or overlays. Communicate the current page, result count, or available movement. |

#### Set navigation bounds and selection rules

- Start top navigation with two to seven items and one or two levels. Try a sidebar when there are more than six entries, deeper groups, or frequent switching. One to three levels is a common sidebar starting point. These ranges come from upstream. Where they overlap, decide by total label width and task-switching frequency.
- Show the breadcrumb levels that explain the current location. Upstream suggests about three visible levels, with intermediate levels collapsed in deeper paths. When the title already has breadcrumbs, add a back control only if it serves a specific return path. Breadcrumbs go to structural parents. Browser-history return should restore relevant list controls and position where possible.
- Start a short linear task with three to five visible horizontal steps. Mark complete, current, upcoming, or error states and preserve input when users move back. Try a vertical layout when there are more steps, long labels, or explanatory text. Check both step count and label length at the smallest supported width.
- Open a deep link to an object. Confirm that the active primary navigation item, page title, parent, and local selection agree. Switch to a shareable tab, copy the address, and verify that it opens in the same place in a new window.

### 3.3 Buttons and action areas

- Use at most one primary button per action area. Default buttons serve ordinary actions, text buttons fit dense or low-emphasis actions, and dashed buttons invite users to add something in place. Use danger styling for real risk and ghost buttons on dark or complex backgrounds as appropriate. Reserve strong calls to action for focused guidance.
- Place actions by scope. Put object-wide actions in the header or object toolbar, local actions near their content, and section submission at the end of the reading or entry path. A persistent page footer can support object progression or a very long form.
- Group business actions, view controls, utilities, and overflow. Prioritize frequent and consequential actions, collect infrequent ones under overflow, and use spacing or dividers between groups. Label buttons with the action and the object or result when needed, such as “Publish report” or “Delete project.”

### 3.4 Arrange actions in a toolbar

On a project list, put the primary New project button on the right of the toolbar. Give density controls and Refresh secondary emphasis and move infrequent export actions into overflow. Keep frequent item actions such as Edit on the row. After selection, show the count and the batch actions that apply to those rows. Keep risky actions in the relevant object action group. A confirmation should name the objects, explain the consequence, and label the action explicitly, such as “Delete 3 projects.” At narrow widths, retain the main action and object identity first, and move less frequent tools into overflow.

### 3.5 Define submission and destructive action behavior

| Action | Before submission | After submission |
| --- | --- | --- |
| Low-risk and reversible | Execute directly when the affected object is clear. | Keep the object locatable and offer Undo while recovery is available. If undo fails, explain the current state. |
| Difficult to reverse or affects several objects | Show the objects, count, and consequences. Use a dialog for consequential decisions or Popconfirm for a simple local confirmation. Make the safe action easy to find. | Prevent duplicate execution while the request is pending. Show counts for succeeded, unprocessed, and failed items, with access to failed items or retry. |
| Save within an editor or form | Make the save scope clear on entry. When submission is disabled, give a nearby reason. When it is available, report problems through the appropriate validation. | Preserve input if submission fails. After switching or closing an overlay, users can return to the previous working position. |

## 4. Data entry, display, and formatting

### 4.1 Choose entry controls

| Task | Control and behavior |
| --- | --- |
| Enter free text | Use a single-line input for short text and a text area for longer text. Give each field a persistent label. Put format, units, and constraints close to the field. A placeholder can show an example value. |
| Choose known options | Use radio buttons for a few exclusive options that benefit from side-by-side comparison. Use checkboxes for multiple selections and a searchable select for longer option lists. Use a transfer control to move selections between two sets. |
| Change a setting | Use a switch for an immediately applied Boolean setting and show its current state. Include options that require submission in a form. Save interdependent settings together. |
| Set a number or date | Use sliders for ranges and approximate intensity, with numeric entry for exact values. Use date pickers for dates or ranges and make formats and available bounds clear. |
| Search or upload | Search or autocomplete helps locate a known object. For uploads, state file type, size, and count limits. Show progress, failure, and retry. Preview images where useful and offer click-to-select alongside drag-and-drop. |

#### Decide when to validate, save, and acknowledge

Explain required fields, accepted formats, and limits before submission. Validate recognizable formatting problems at a useful point in editing, so users have time to enter a value. Check cross-field constraints, permissions, and server-side validation on submit. Attach errors to the relevant fields. For long forms, consider an error summary with ways to reach affected fields. Preserve input after failure, show submission progress, and guard against duplicate submission. If saving a switch fails, restore a recognizable state and explain the failure.

#### Choose a form structure by field count and relationship

| Situation | Starting point from upstream | Verify in the implementation |
| --- | --- | --- |
| A few mutually exclusive choices | Use radio buttons when people need to compare choices directly. Try a select when there are more than five options. | Labels remain readable, frequent options are easy to locate, and users can select by keyboard. |
| Repeated editing of small objects | Use repeatable rows for up to three short fields per item. Try an editable table for two to five fields suited to column comparison. | Where the ranges overlap, decide by the need for headers and column comparison. Preserve row identity and focus after adding, removing, or validating. |
| Repeated editing of complex objects | Try collapsible sections for six to eight fields per item, and a drawer for more than eight or substantial supporting text. | Users can locate errors inside collapsed sections. The scope of item or group saves is evident. |
| Settings page | Lay out fewer than seven settings directly, group seven to fifteen by topic, and consider tabs above fifteen. | Check that users recognize the group or tab names and that interdependent settings have a clear submission scope. |

Field counts are starting points. Long labels, dependencies, narrow layouts, and entry frequency can change the choice. Give every input an accessible name when a row contains several fields. Use the column or group heading to make its purpose apparent.

### 4.2 Choose a display structure

| Structure | Suitable task |
| --- | --- |
| Table | Scan and compare the same fields across records. Order columns and actions by priority. Keep times, statuses, and actions legible. Add sorting, filters, and pagination as needed. |
| List | Scan summaries in order or select an object in a narrow container. Keep names, summaries, states, and actions in predictable positions. |
| Cards | Present objects with more independence when reading order is flexible. Give each card one theme and combine closely related content within it. |
| Collapse | Reveal secondary or lengthy groups on demand. Use an accordion when users seldom need to compare open sections. |
| Tree, timeline, carousel | Show parent-child relationships with a tree, events or milestones with a timeline, and supplementary sequential content with a carousel. Keep essential content directly reachable. |

Design list controls around how users look for information. Use keywords to find known items, visible live filters for exploration, and an explicit query action when several criteria must apply together. Start with pagination for structured records. Incremental loading fits lists where users typically find what they need near the top and rarely need precise positioning. In batch mode, show the selection count and action scope. Make newly created items easy to locate. Choose undo, confirmation, or additional verification for deletion according to its consequences. Distinguish an empty collection, no matches, and a load failure.

#### Make list queries and return behavior predictable

For example, an order ID is a good keyword query, processing status benefits from a visible filter, and several date or amount ranges can apply together through a Query action. Show applied filters and sorting. When nothing matches, keep the conditions visible and let users clear them separately or together. A user who opens an order from page three and returns should reach the same query, page, and position. Expand a few detail fields inline. Consider a list and detail split when users frequently switch objects.

In narrow tables, prioritize the columns people need to identify, judge, and act on a record. Show secondary fields in details, or make horizontal scrolling discoverable when side-by-side comparison matters. If long titles are clamped, provide a way to read the full text. Make time order clear in timelines and parent-child and expansion states clear in trees. Carousels should show the current item and let users move in either direction.

#### Specify observable list behavior

| Action | Default interaction and expected result |
| --- | --- |
| Change criteria or sorting | Show applied criteria and sort direction. A new query normally starts on page one. Make initial loading, refresh over existing results, and load failure distinguishable. |
| Change page or page size | Show the current position. Hide paging controls when there is only one page if appropriate. Apply a consistent position rule after a size change. Verify that deleting the only item on the final page returns users to a valid page. |
| Select and run a batch action | State whether selection applies to the current page or across pages. When all matches can be selected, distinguish “20 selected on this page” from “All 427 matching items selected.” Clear or reconfirm out-of-scope selections after filters change. |
| Create | Use New in the toolbar for an independent item, or a dashed button at the start or end of the list for insertion at that location. Locate the created item under the current sort and filters. If the filters exclude it, explain why and provide a way to open it. |
| Open details or return | Expand short content inline, use a drawer when users need the list for reference, or use a split view for rapid item switching. Give shareable, refreshable, or long-running work its own address, and restore applicable query and browse position on return. |

### 4.3 Numbers, dates, privacy, and missing values

- Localize grouping, decimals, percentages, and currency formats. Align comparable numbers and put a shared unit in the column heading. Identify currencies when they vary. Give users access to precise values when displaying abbreviations. Follow business rules for amounts spelled out on formal documents.
- Use absolute timestamps for retrieval and audit, and relative times to show recency. `YYYY-MM-DD HH:mm` is a possible default for Chinese operations UIs. Show the relevant time zone across regions and make full timestamps available where precision matters. Relative display can move from “Just now” to minutes and hours ago, then to a date.
- Follow product rules for full masking or show only the fragment needed for recognition, such as an account suffix. Permissions and data policy determine access to raw values. Asterisks are a display treatment.
- Use one product-wide placeholder for missing values and distinguish them semantically from zero, inapplicability, missing permission, loading, and errors. Upstream uses both `-` and `--` across different pages. This guide adopts a single convention per product. Use placeholders for empty fields, explanatory states for empty collections, and skeletons or progress indicators for loading.

#### Distinguish easily confused values

| Data situation | Readable treatment |
| --- | --- |
| Confirmed absence of an event | Show `0`, as in 0 retries. |
| Value has yet to be recorded | Use the product's field placeholder and explain “Not collected yet” where it matters. |
| Field does not apply | Show “Not applicable.” A subscription with auto-renewal off has no next renewal date. |
| Only part is visible | Show data the user can access normally and identify access restrictions on the hidden part. |
| Pending or failed retrieval | Show loading or explain the failure and offer retry. Preserve valid data that has already loaded. |

Keep the precision and currency consistent across the table, detail page, and export. An overview can show “1.25 million” and provide the exact figure in details. State the endpoints of a time range and the relevant time zone. Provide sufficient timestamp precision for audit records.

#### Review data formats with concrete examples

| Field | Display convention |
| --- | --- |
| Counts and progress | Right-align counts and use locale-specific grouping. Give percentages consistent precision and a percent sign. Task progress can appear as `12/30` with a heading or supporting text that identifies both numbers. |
| Amounts | Put a shared currency in the header, such as “Amount (CNY).” For mixed currencies, identify each currency and define the conversion basis before aggregating. |
| Dates and times | Chinese operations interfaces can use `YYYY-MM-DD` and 24-hour time. For messages, the upstream starting point is “Just now” under one minute, elapsed minutes or hours under 24 hours, a date after 24 hours, and a year after one year. Provide the absolute time when users need to verify it. |
| Sensitive data | Show only the fragment needed for the task, such as the last four digits of an account. Check access boundaries for copying, exporting, and opening details. |

Compare the same field across table cells, details, chart tooltips, and exports. If a regional report shows a currency on the page, for example, the export should retain it in the heading or corresponding field.

## 5. Feedback and interface copy

### 5.1 Match feedback to scope and urgency

| Situation | Feedback |
| --- | --- |
| Outcome immediately visible | Let the interface change serve as feedback, such as a selection or updated value. |
| Brief, low-risk result | Use a lightweight Message. If reversal is possible, make Undo easy to find. |
| Invalid field | Describe the issue and correction near the field. Preserve entered data and keep the feedback visible until resolved. |
| Page-level issue or persistent notice | Use an inline Alert and give a recovery action. Use Tooltip for brief explanations attached to an object, and Popover for richer context or actions. |
| Background completion, warning, or later follow-up | Use a Notification for important changes and retain it in a notification center when users need to revisit it. Use numbers on badges when counts matter and status dots for simpler signals. |
| Explicit decision required | Use Popconfirm for a small confirmation near the target, or a dialog for consequential or blocking decisions. Identify the object, impact, and next action. |
| Waiting | Show feedback near the affected area. Use determinate progress when measurable, an indeterminate indicator otherwise, and a skeleton when the eventual structure is known. Offer cancellation or background execution for long operations where feasible. |
| Handoff or detailed outcome | Use a result region or page for a long workflow or required follow-up. State the actual outcome, including partial success, pending work, or failure. |

#### The same business outcome can call for different feedback

For a small table export, put the button into a loading state and show a brief confirmation when the file is ready. For a large background export, acknowledge that it started and send a notification with a download action when it completes. Keep the notification available for later. If the export fails, explain the affected scope, whether retry is available, and whether the filters were preserved. Keep system unavailability visible for as long as it matters. Use a dialog when the user must decide how to proceed. Choose one main feedback treatment that conveys the result and avoid multiple alerts for the same event.

#### Map the states and exit paths of an asynchronous action

1. **Start.** Acknowledge acceptance at the trigger. Distinguish submitting from queued, and keep an identifier users can revisit.
2. **In progress.** Put feedback on the button, region, or page according to scope. Refresh in place when readable data already exists. Use a skeleton for an initial load with a known structure. Show counts, percentages, or stages when real progress is known. When a long action can be canceled, explain what cancellation affects.
3. **Finish.** Update the object and list on success, then add a message when the result warrants one. For partial success, retain successful items and identify failed objects and the retry scope. Use a notification or result page when the outcome extends beyond the original working context.
4. **Exit or recover.** After refresh, back navigation, or retry, reconcile the actual result and restore available actions. Keep failure information findable and lead users to the field, object, or step that needs attention. If the service may already have processed the request, check status before letting users submit again.

### 5.2 Write in language users recognize

- Start from the user's task and lead with the important information. Use the same names for the object and action across the control, destination, and feedback.
- Use familiar words, short sentences, and specific verbs. For failure, explain what happened, what was affected, and what the user can do. Keep the tone friendly and measured. Avoid blame and generic encouragement.
- Use sentence case in English and respect the casing of proper names and abbreviations. Use Arabic numerals for data and follow locale conventions. Short labels, buttons, and hints generally omit terminal punctuation. Punctuate full explanations normally and reserve exclamation marks for appropriate greetings or congratulations.

#### Write one action as a complete set of messages

| Placement | Example |
| --- | --- |
| Object action | “Publish report” |
| Confirmation title and explanation | “Publish the weekly sales report?” and “Workspace members will be able to view it after publishing.” |
| Submission controls | “Publish” and “Cancel” |
| Success feedback | “Weekly sales report published” |
| Recoverable failure | “The weekly sales report could not be published. Your draft was saved. Try again.” |

A label identifies the field, help text explains how to fill it in, and a button says what will happen. Use the same terms for the object and action throughout and distinguish started, in progress, and complete. Use natural word order in each language while preserving the same state, consequence, and way forward.

## 6. Page patterns

| Page | When and how to use it |
| --- | --- |
| Workbench | Bring together to-dos, key data, shortcuts, and help for each role. Put frequent work on the first screen and consider a sample for complex objects. Upstream suggests five to nine modules as a reference for information load. |
| List page | In a single column, put query or filter controls before summary information and results. Use a sidebar for complex filters when there is room. Choose a query table, standard list, card grid, cross-category search, or member management layout according to the task. |
| Detail page | Show one object's identity, state, main actions, and details. Lay out short content on one surface. Use spacing and dividers for related groups, cards for distinct themes, and tabs for views that stand on their own. Approval records and release workflows can follow stages. |
| Form page | Start with one column and group fields by relationship. Use steps for genuinely linear tasks and show progress. For repeated objects, choose compact rows, editable tables, collapsible items, or drawers based on complexity. Use placeholder text for examples or constraints, keep field labels, and explain when changes take effect. |
| Empty state | For first use, explain the feature and how to begin. For no matches, explain the criteria and let users adjust or clear them. For completed work, acknowledge completion. Add imagery and suggested actions when they serve the case. |
| Exception page | Distinguish missing resources, access denial, server errors, compatibility issues, and load failures. Put retry or help where a local failure occurred. When the whole page is blocked, explain why and offer a viable next step. Design and review normal, partial, loading, error, and wholly empty states. |
| Result page | Use after a long flow or when users need outcome details. Show the result, necessary explanation, next steps, and supporting detail. Usually offer one or two actions. Warn users about any automatic redirect. |
| Visualization page | Surface key metrics in an overview, anomalies in monitoring, linked filters and comparisons in analysis, and precise lookup in detail views. Put the conclusion and primary metrics first, with a way to drill down. |

### 6.1 Connect pages around a task

- **Workbench to detail.** A reviewer sees items awaiting their review on the workbench, then uses status and deadlines in the list to decide what to open first. Put requester, request, review state, and main actions at the top of the detail page. Group supporting materials by topic. Organize history separately from the current review, and consider a timeline or steps when several stages matter.
- **Form to outcome.** Use a basic form for a single submission with a few fields. Group a larger set of independent fields by topic. When later choices depend on earlier ones, use steps and preserve information already entered. Make it clear whether settings take effect individually or upon group submission. For complex outcomes, lead with completion status, affected objects, and what to do next. Add reference IDs, progress, or failure detail where needed.
- **Design distinct states for missing content.** First use might offer Create or View example. No matches can offer Clear filters. A finished queue can show “All items reviewed.” A failed request needs Retry. For access denial, explain whether users can request access or return. If a compatibility issue affects only a few operations, identify the affected features in context.

## 7. Data visualization

Start with the question the user needs to answer. Use metric cards for key values, lines for trends over time, bars for comparisons, histograms or scatter plots for distributions, flow diagrams for processes or volumes, and a suitable part-to-whole chart for proportions. Offer a table for exact lookup or detailed comparisons. Check that scales, axes, and aggregation faithfully represent the data.

Use dedicated categorical, sequential, or diverging palettes, with consistent meanings across charts. Include the title, units, scale, legend, source, or time range where needed. Reinforce color with labels, shapes, or position. Structure interaction as overview, focus and filter, then detail on demand. Provide keyboard- or touch-accessible equivalents to hover details. On narrow screens, prioritize the key metrics and conclusions, and adapt axis labels, legends, and layout.

### 7.1 Connect the overview to verifiable detail

In a monitoring report, show the current incident count, reporting window, and last update on the first screen. A trend chart shows when incidents began. Bars grouped by service help compare their impact. After the user selects a period or service, the detail table should inherit that filter so specific records can be checked. In linked charts, show which filters are active and provide a way back to the overview.

Choose color by data meaning. Distinct categorical colors can identify services. A sequential ramp can show low to high values. A diverging ramp can show positive and negative deviations from a target. Pair state colors with text or markers. Start a bar chart at zero when length encodes the comparison. If a line chart narrows the axis range, make the scale plain. Preserve the layout during loading where practical, and explain the reporting range or filters when a chart is empty.

## 8. Design review checklist

- [ ] Users can identify the page, primary object, and main action on the first screen. Spacing, alignment, and type make the hierarchy evident.
- [ ] Names, component states, colors, and action placement hold across pages. The main action is easy to find and users can understand the consequences of risky actions.
- [ ] Users can orient themselves after entering from a deep link, switching views, or going back. The core task works with long text, narrow viewports, and realistic data volumes.
- [ ] The core flow works by keyboard and touch. Focus is visible, icons have names, and essential actions and information are accessible through multiple input methods. Check both themes and reduced motion.
- [ ] Feedback is observable from entry through submission. Empty, no-match, loading, partial, error, access-denied, and successful states have suitable treatments.
- [ ] Numbers, units, currency, time, and privacy rules are consistent. Charts answer the intended question and lead to precise data when it is available.

### 8.1 Walk through the implementation with realistic data

| Review action | Pass condition |
| --- | --- |
| Open an order through a deep link, then enter details from a filtered third page and return | Navigation shows the correct location. The list retains criteria, sorting, page, and reachable browse position. |
| Tab to filters, icon buttons, and the action menu. Open and close a dialog. | Focus is visible and action names and order are clear. Focus returns to a sensible place and the core task works without hover. |
| Submit a form with a format error, then with a server rejection, then successfully | Users can locate field errors and correct them. Valid input is retained and the successful submission happens once. |
| Run a batch action on records across pages and simulate partial failure | The scope is clear before submission. Users can locate successful and failed items. Retry affects only pending items. |
| Narrow the window with long Chinese and English titles and very large table values | Primary information remains visible, controls remain usable, and scrolling is discoverable. Users can reach content that is clipped or concealed. |
| Simulate first use, no matches, a long load, partial failure, access denial, and completion | Each state explains the reason, actual impact, and the relevant next step. |
| Repeat the main flow in dark mode and with reduced motion | Hierarchy, focus, and state remain distinguishable. Key changes are conveyed by static state. |

## 9. Sources

This guide draws on the Ant Design design documents at a pinned commit, including design values, global styles, principles, shared rules, research patterns, visualization, illustrations, and case studies. Recommended ranges from upstream are identified in their sections. The handoff tables, asynchronous behavior, and review scenarios extend the guide for implementation. Text contrast terminology follows WCAG 2.2. [Upstream Ant Design design documents](https://github.com/ant-design/ant-design/tree/ee8db7734e6a4d2387a55324e7e35eecb5535e72/docs/spec)
