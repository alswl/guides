English | [简体中文](./software-user-manual-guide.zh-CN.md)

# Software User Manual Writing Guide

> For authors and reviewers of software user manuals. Applies to products whose primary entry point is a Web interface, including business systems, collaboration platforms, admin consoles, and developer tools. Independent of business domain, frontend framework, deployment model, and documentation platform.
>
> Goal: write concise, effective user manuals with clear navigation that are worth maintaining. Assume readers have basic software skills but do not know the product. Help them understand the product, make key decisions, and complete core tasks.
>
> **Version: 2026.10.30**. See the [changelog](./CHANGELOG.md). This repository is the single source of truth for this guide; link here when referencing it and make changes in this repository.

This guide defines quality goals and factual boundaries. Accurate product facts, consistent terminology, complete coverage of key conditions and consequences, and navigable structure are requirements. Directory examples, templates, sentence patterns, and diagram formats are references. Authors and agents should select, combine, or adapt them to the product, reader tasks, and existing documentation. There is no need to apply every example or request separate approval for routine wording choices.

## Contents

- [1. Scope and content selection](#1-scope-and-content-selection)
- [2. Organizing a user manual](#2-organizing-a-user-manual)
- [3. Writing sections and articles](#3-writing-sections-and-articles)
- [4. Chinese writing conventions](#4-chinese-writing-conventions)
- [5. Images and tables](#5-images-and-tables)
- [6. Writing and maintenance workflow](#6-writing-and-maintenance-workflow)
- [7. Agent collaboration constraints](#7-agent-collaboration-constraints)
- [8. Delivery checklist](#8-delivery-checklist)
- [References and adoption boundaries](#references-and-adoption-boundaries)

## 1. Scope and content selection

A user manual covers capabilities the software already provides. Maintain marketing material, requirements, engineering designs, source code walkthroughs, and release histories separately. A brief product introduction is useful, but promotional language cannot replace usage conditions and capability boundaries.

Writing for capable readers means omitting basic computer instruction while explaining product-specific concepts, implicit conditions, and rules. Readers must not have to discover permission requirements, data impacts, or irreversible actions through trial and error.

### 1.1 Criteria for including content

Before adding an article, answer three questions:

1. What question does it answer that the interface cannot adequately answer on its own?
2. Does it help readers complete a class of tasks or understand an important rule?
3. Will its main content remain useful after the interface layout changes?

Prioritize reusable knowledge. Centralize necessary information that changes frequently; do not omit essential navigation instructions merely to keep content stable.

| Explain clearly | Condense or omit by default |
|---|---|
| Core objects, relationships, states, and scope | Common knowledge already clear from the interface |
| Complete paths for typical tasks and criteria for success | Mechanical descriptions of every button and click |
| How to choose key options and when they apply | Lists of all options with synonymous explanations |
| Permissions, defaults, limits, and important exceptions | Low-value combinations and exhaustive rare scenarios |
| Representative examples that transfer to other tasks | Near-identical examples with only names or parameters changed |
| Recognizable failure symptoms and ways to respond | Answers such as “check the configuration” or “contact an administrator” with no diagnostic basis |

Describe infrequent actions with serious consequences, including recovery after deletion, the data exposed by public sharing, and conditions under which existing configuration is overwritten. Let the information needed for decisions and actions determine length; do not impose arbitrary word or screenshot counts.

### 1.2 Factual boundaries

- Base actions, fields, permissions, and results on actual behavior in the applicable version or a verified product contract. If sources conflict with actual behavior, investigate before presenting either as fact.
- Distinguish current capabilities, optional configuration, future plans, and author recommendations. Do not describe planned capabilities as available.
- Preserve user-visible limitations. Explain internal class names, storage implementation, or scheduling details only when they affect user decisions.
- If the interface lacks necessary information, also report the product issue. Documentation can explain current behavior, but should not accumulate instructions to compensate for every interface problem.

## 2. Organizing a user manual

### 2.1 Identify the audience, then the purpose

First determine whether readers are using the product, administering the system, or modifying the product. Using existing capabilities through an API or CLI still belongs to product usage. Changing source code, developing plugins, and participating in builds belong to contributor documentation.

Then identify the article's purpose: tutorials guide readers through a learning exercise, how-to guides solve real tasks, reference material supports precise lookup, and explanations describe relationships and rules. These purposes help divide content; they do not require four subdirectories under every directory.

| Logical entry | Content boundary | When to use |
|---|---|---|
| User guide `guide/` | Using existing software capabilities | The main body of the user manual |
| Administration `admin/` | Deployment, identity integration, backups, and operations | There is a distinct system administrator audience with its own tasks |
| Reference `manual/` | Precise definitions of fields, configuration, permissions, interfaces, and limits | Readers need to consult the content independently |
| Learning `learn/` | A structured set of tutorials and explanations | There is enough content to justify a separate entry |
| Contribution `dev/` | Modifying, extending, testing, and delivering the product | The product has contributors; keep this separate from the user manual |

These names are logical mappings, not mandatory directory names or site menus. In-product member management and business permission settings may stay in the user guide. Do not classify a task as system operations solely because the person performing it is called an administrator.

### 2.2 Suggested structure

The example below organizes a manual by functional module. Workflows or reader roles can also work. Choose the structure that makes content easiest to find, and do not create empty sections.

```text
Product user manual
├── Introduction
│   ├── Product purpose and use cases
│   └── Core concepts
├── Quick start
│   ├── Prerequisites
│   └── Complete your first task
├── Using features
│   ├── Module A
│   │   ├── Overview
│   │   ├── Core task one
│   │   └── Core task two
│   └── Module B
│       ├── Overview
│       └── Core task
├── Management and configuration
│   ├── Members and permissions
│   └── Key configuration
└── Reference and troubleshooting
    ├── Usage limits
    ├── Common problems and solutions
    └── Glossary
```

Use stable feature names familiar to users for modules. Do not organize them around backend services, database tables, or engineering teams. Small systems can list core tasks directly under “Using features” or combine short introductions and quick starts.

The home page should identify the audience, product scope, and starting points. Provide entries for first-time use and task lookup without repeating summaries of every article.

### 2.3 Hierarchy and splitting

- Prefer shallow navigation. Group larger collections by module, workflow, or reader role. Let content volume and lookup needs determine depth; do not add nested directories for a few paragraphs.
- Design navigation hierarchy and in-page headings separately. Use one level-one heading per article, usually followed by level-two and level-three headings without skipping levels.
- Organize procedures around tasks regardless of directory structure. Titles should communicate the article's purpose, such as “Export query results” or “Access permission inheritance rules.” A single title pattern is not mandatory.
- Simple creation, editing, and disabling tasks can share an article such as “Manage notification rules.” Split tasks with independent conditions, decisions, or consequences into separate pages.
- Give shared concepts and rules one authoritative document and link to it elsewhere. Task pages may retain brief reminders that directly affect the current operation.
- Avoid combining concepts, full field tables, every operation, and internal implementation into one long article. Also avoid splitting one continuous task into many fragments.

## 3. Writing sections and articles

### 3.1 Organize the body by purpose

| Article | Questions it must answer | Suitable approach |
|---|---|---|
| Product or module overview | What is it for? What are the key objects? Where should readers start? | Briefly describe purpose, relationships, and boundaries; link to tasks |
| Quick start | How can readers complete one representative task? | Minimal preparation, one complete path, intermediate and final results |
| How-to guide | When should readers do this? How should they choose and act? How can they confirm success? | Prerequisites, key decisions, actions, results, and necessary exceptions |
| Concepts and rules | How do objects relate? Why does the system behave this way? | Rules, scope, representative examples, and boundaries |
| Reference | What does a particular field or rule mean exactly? | Consistent entries or tables with explicit defaults and ranges |
| Troubleshooting | How can readers identify the problem, narrow the cause, and resume the task? | Symptoms, diagnostic evidence, corrective actions, and results |

Templates are content prompts, not mandatory lists of sections. A short article may need only a few paragraphs. Do not add “Background,” “Purpose,” or “Summary” sections that provide no new information. A quick start should follow one representative path and link to task guides for alternatives.

### 3.2 Essential information for how-to guides

A how-to guide should explain the task's purpose, prerequisites, key choices, execution, and success criteria. Add limits, failure handling, and follow-up tasks as needed. Authors choose paragraph structure, step count, and order; each information point does not require its own section.

Use numbered steps when sequence matters. Make steps easy to execute, splitting them when they involve an independent decision or result check. Short consecutive actions can share a step. Do not describe every ordinary dialog expansion, cursor movement, or input action already made clear by the interface.

Successful submission, completed background processing, and usable results may be distinct states. For long-running tasks, explain where to check progress and how to recognize completion. Describe retry, cancellation, and undo according to actual behavior.

### 3.3 Generic example: export query results

This fictional Web system example shows how to emphasize key rules. Its structure and number of steps are illustrative. Do not treat its fields, permissions, or behavior as facts about a real product.

> **Export query results**
>
> Export filtered records to CSV for offline analysis. This action requires export permission.
>
> The export includes all records matching the current filters, including pages not currently displayed. Export fields are fixed and are unaffected by the list's column settings.
>
> 1. Set filters in the record list and check the number of matching records.
> 2. Click **Export** and confirm the export scope.
> 3. Check progress under **Export tasks**. Download the file when its status becomes “Completed.”
>
> If the task fails, open its details to inspect the cause. Adjust the filters and create a new task.

This example explains scope, fields, and asynchronous results without describing every search box and pagination control. If the real system has record limits, file expiration, or retry side effects, include those facts or link to a shared reference page.

## 4. Chinese writing conventions

This section describes the Simplified Chinese conventions adopted by this guide; it remains specific to Chinese in both language editions. Community typography preferences are not universal standards. Follow explicit project conventions, and do not change product meaning for formatting consistency.

### 4.1 Terminology and interface names

- Use one term for each concept. Create a short glossary for easily confused business concepts, recording definitions, preferred names, and English equivalents where needed.
- Distinguish actions such as “删除” (delete), “归档” (archive), “停用” (disable), “退出登录” (sign out), and “注销账号” (delete an account). Do not vary terms merely to avoid repetition.
- Use natural Chinese prose. Explain necessary English terms on first use, such as “单点登录（SSO）.” Do not repeatedly translate familiar product names.
- Preserve official spelling, capitalization, parameter names, and error codes, such as GitHub, Web, and `page_size`. Do not translate code identifiers to match the glossary.
- Use actual interface labels for menus, buttons, and fields. Follow the project's formatting convention. Without one, use bold for interface names, **设置** → **成员管理** for navigation paths, and code formatting for file paths. Keep similar expressions consistent.
- By default, use “点击” for button actions, “选择” for selecting options, and “输入” for entering values. Specify keyboard or other input methods when needed; do not list every possible input method for every action.

### 4.2 Sentences and meaning

- Use common words and direct verbs. Prefer “配置通知规则” to “进行相关通知规则的配置.” Remove modifiers such as “轻松,” “强大,” and “即可” when they add no facts.
- Distinguish user actions from system behavior. Name the actor when the subject changes; avoid ambiguous references such as “其,” “该对象,” or “处理后.”
- Put conditions before instructions, such as “如果需要限制访问范围，选择指定成员.” Avoid chains of comma-separated clauses; separate actions, results, and exceptions clearly.
- Preserve distinctions conveyed by “必须,” “建议,” “可以,” “可能,” “仅,” “默认,” and “除非.” Do not turn probabilities, recommendations, or defaults into guaranteed behavior.
- State actual boundaries rather than vague terms such as “正常,” “适当,” or “较大.” For example, write “最多 20 个字符,” clarifying characters versus bytes according to the actual constraint.
- Keep paragraphs coherent around tasks instead of turning explanations into isolated lines. Do not convert English word-count limits into Chinese character-count limits.

| Vague wording | Preferred wording |
|---|---|
| 修改后会自动通知 | 保存配置后，系统向订阅成员发送通知 |
| 不超过一定数量 | 最多选择 20 项（数值须核实） |
| 取消后恢复原状 | 说明取消影响的阶段及已执行操作是否回滚 |
| 详情点击这里 | 参见“成员权限”并链接到对应文章 |

### 4.3 Punctuation, mixed scripts, and numbers

- Use Chinese punctuation in Chinese sentences. Preserve English punctuation in complete English quotations. Use Chinese quotation marks “ ” and parentheses （ ）; preserve code, commands, paths, and original error messages exactly.
- Put one ASCII space between Chinese text and English or Arabic numerals, as in “使用 API 创建 3 个任务.” Preserve official names, interface text, and literal values as they appear.
- Do not add spaces around Chinese punctuation. Titles usually have no final period; complete step sentences should have one.
- Use half-width numerals. Separate values from Latin unit symbols, as in `20 MB`; write percentages as `80%`. Do not insert spaces into configuration literals such as `30s`.
- State units and range boundaries explicitly, such as “1 至 10 项（含两端）.” Distinguish MB from MiB, characters from bytes, and timeouts from validity periods.
- Use explicit dates such as “2026 年 10 月 30 日” or `2026-10-30`, consistently within similar content. Specify time zones for tasks spanning zones. Avoid time-sensitive expressions such as “tomorrow” or “the current latest version.”
- Do not simulate webpage alignment with manual spaces or line breaks. Let the documentation platform handle line-breaking rules, fonts, and line spacing, and check the preview.

## 5. Images and tables

### 5.1 Choose a format for the question

| What readers need to understand | Suggested format |
|---|---|
| Relationships between objects | A simple concept diagram |
| Collaboration across roles or processing order | A flowchart |
| States and available actions | A state diagram or state table |
| Hard-to-find entry points or complex interactions | A focused screenshot |
| Field meanings, choice criteria, and limits | Prose or a field table |
| Actions available to each role | A permission matrix |
| Whether an operation succeeded | Observable criteria in text, with a result screenshot if needed |

Images must make information easier to understand. Prefer relationship and process diagrams that remain useful when layouts change. Use screenshots for locations and interactions that are hard to explain in words. Not every article needs an image, and ordinary clicks do not require step-by-step screenshots.

### 5.2 Image rules

- Place images next to the prose or step they explain. Captions should identify what to observe, such as “Figure 1: Relationship between filters and export scope,” rather than just “Illustration.”
- Preserve key conditions, values, and results in text; do not merely say “configure as shown.” Informative diagrams that need alternative text should describe their purpose. Explain complex relationships in the body as well.
- Use screenshots from the applicable product version and interface language. Names must match across prose, screenshots, and captions. Preserve actual English control names for English interfaces, adding Chinese explanations where useful.
- Crop irrelevant areas while retaining enough context for orientation. Use a small, consistent set of annotations, and do not rely on color alone to convey meaning.
- Use example data in screenshots. Reliably remove sensitive information from the source data or image; do not rely on blur or mosaic effects. When using overlays, flatten layers before export and inspect editable source files being committed to ensure hidden layers and metadata also contain no sensitive information.
- Make image assets easy to find, reference, and update. Follow the project's storage conventions. Prefer retaining editable diagram sources, and use filenames that identify their purpose.
- Each image must justify its maintenance cost. Layout changes that do not affect understanding need no new screenshot; changes to entry points, names, rules, or results require review.

### 5.3 Table rules

Tables support comparison and lookup, numbered lists support sequential steps, and paragraphs support continuous explanation. Choose according to reader needs. Field descriptions need not repeat every form label. Whether to create a separate reference page depends on content volume, lookup needs, and reuse.

Field references may include names, meanings, defaults, required status, ranges, and conditions under which fields take effect. Split overly wide tables by topic instead of shrinking fonts. Maintain permissions, defaults, and limits in one place, linking to them from other articles.

## 6. Writing and maintenance workflow

### 6.1 Establish structure, then write representative articles

1. Identify readers, the applicable version, and core tasks. List existing factual sources and items requiring verification.
2. Create a minimal structure and write one reader goal per article. Merge pages whose goals overlap or do not stand independently.
3. Complete one representative how-to guide and necessary explanations first to evaluate hierarchy, terminology, and the relationship between text and images.
4. Cover the remaining core tasks using the same principles. Verify missing evidence instead of filling templates with unknown capabilities.
5. Follow the documentation in an isolated environment using example data and authorized accounts. Check navigation, results, and failure handling, then rendering and links. Production changes or irreversible actions require corresponding task authorization; writing a manual does not itself authorize those operations.

When reorganizing an existing manual, record which articles are retained, moved, split, or merged and their destinations. Update navigation, image paths, and inbound links. Provide redirects for public old URLs where the platform supports them. Store plans and historical records separately; do not rewrite old material as current rules merely because it is old.

### 6.2 Keep maintenance costs low

Centralize stable knowledge: concepts, object relationships, task goals, choice criteria, and behavioral boundaries. Make changing facts easy to look up: version differences, fields, limits, entry points, and screenshots. Organize reference material around lookup needs instead of duplicating volatile information in every guide.

- Maintain one authoritative document per topic and link to repeated procedures.
- Review related articles when product changes affect user operations, permissions, defaults, limits, or results.
- Do not maintain per-page revision logs with no reader value. State version applicability when differences affect usage.
- Keep one-off incidents in issue records. Add them to troubleshooting documentation when they have recurring value and a clear diagnostic path.
- New sections must justify their value. Deleting or merging obsolete content is normal maintenance.

## 7. Agent collaboration constraints

Before writing or reorganizing a user manual, agents must read project terminology, the existing structure, and applicable product material. Reuse verified interface names and behavior. Backend implementation alone cannot establish unverified buttons, page paths, or user permissions.

For new manuals or major reorganizations, briefly describe the structure and article goals before completing the body. Local edits can be completed directly. Choose organization, explanatory depth, and presentation according to reader tasks without mechanically following examples. Distinguish facts, recommendations, and demonstration assumptions. Do not turn this guide's fictional examples into actual product capabilities. Preserve the user's business scope rather than expanding into a complete development manual or operations knowledge base.

Before delivery, check that rewriting has preserved conditions, negation, numbers, defaults, and uncertainty. List unverified items in the delivery notes. Do not hide gaps with fluent wording or claim that passing mechanical checks proves product facts correct.

## 8. Delivery checklist

- [ ] The manual has clear navigation by module or task, with no empty sections or unnecessary nesting.
- [ ] Each article has a clear reader goal. Basic explanations are condensed while core rules and important exceptions remain complete.
- [ ] Actions, permissions, fields, and results are verified for the applicable version. Current capabilities and plans are distinct.
- [ ] Core tasks can be completed by following the documentation, success criteria are observable, and necessary failure handling has a diagnostic basis.
- [ ] Chinese terminology matches the interface. Actions and actors are clear; numbers, units, conditions, and negation are accurate.
- [ ] Images have a clear purpose, text independently provides operational information, and there are no unnecessary screenshots or sensitive data.
- [ ] Shared rules have one maintenance location. Links, anchors, navigation, images, and table previews work.
- [ ] Every article is worth maintaining; content has not been added merely to fill a template.

## References and adoption boundaries

This guide draws on docs-organizer's audience × documentation purpose model, progressive grouping, and single authoritative document principle, adapting them to user manuals for software primarily accessed through the Web. The following sources support writing methods, not product facts. Their specific community typography preferences need not all be adopted.

| Source | What this guide adopts |
|---|---|
| [Diátaxis](https://diataxis.fr/) | Distinguishing tutorials, how-to guides, reference, and explanation without mandating four directories |
| [Google procedures guide](https://developers.google.com/style/procedures) | Clear locations, sequence, conditions, and results |
| [Google image guide](https://developers.google.com/style/images) | Images chosen for explanatory value, cropping, captions, alternative text, and handling sensitive information |
| [Microsoft step-by-step instructions](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions) | Task-oriented headings, scannable steps, and explicit actions |
| [Chinese technical documentation style guide](https://github.com/ruanyf/document-style-guide) | Chinese terminology, sentences, punctuation, and organization; excluding rigid sentence-length bans |
| [Chinese copywriting guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines) | Mixed scripts, full-width and half-width characters, and proper-name consistency as references for team conventions |
| [TiDB Chinese documentation contribution guide](https://github.com/pingcap/docs-cn/blob/master/CONTRIBUTING.md) | Combining standards, templates, glossaries, and maintenance checks |
| [W3C Requirements for Chinese Text Layout](https://www.w3.org/TR/clreq/) | Research on Chinese typography and mixed scripts; a Group Note Draft when consulted, not a formal Recommendation |

For product documentation examples, consider the functional grouping and limits in [Metabase dashboard filters](https://www.metabase.com/docs/latest/dashboards/filters), the rule explanations in [Notion sharing and permissions](https://www.notion.com/help/sharing-and-permissions), and the topic navigation in the [GitHub Projects overview](https://docs.github.com/zh/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects). Learn from their organization without copying their business models, length, or full sets of sections.
