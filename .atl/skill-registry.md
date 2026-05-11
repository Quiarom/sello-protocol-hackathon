# Skill Registry

Generated: 2026-05-11

## Project Conventions

### AGENTS.md
- Goal
- Current MVP Scope
- Next.js demo app.
- Aval Newsrooms dashboard.
- Article registration screen.
- Sello meta tag.
- `llms.txt`, `tdm-policy.json`, `rsl.txt`.
- Anchor program named `sello`.
- ContentSello and UsageReceipt records.
- VoiceConsent exists as a small optional account.
- Out of Scope
- Production LI.FI bridge.

## Installed Skills (26)

### branch-pr
- Trigger: Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review.
- Path: /home/quiarom/.codex/skills/branch-pr/SKILL.md
- Scope: user

### caveman
- Trigger: >
- Path: /home/quiarom/.agents/skills/caveman/SKILL.md
- Scope: user

### caveman-compress
- Trigger: >
- Path: /home/quiarom/.agents/skills/caveman-compress/SKILL.md
- Scope: user

### caveman-help
- Trigger: >
- Path: /home/quiarom/.agents/skills/caveman-help/SKILL.md
- Scope: user

### caveman-review
- Trigger: >
- Path: /home/quiarom/.agents/skills/caveman-review/SKILL.md
- Scope: user
- Compact rules:
  - `🔴 bug:` — broken behavior, will cause incident
  - `🟡 risk:` — works but fragile (race, missing null check, swallowed error)
  - `🔵 nit:` — style, naming, micro-optim. Author can ignore
  - `❓ q:` — genuine question, not a suggestion
  - "I noticed that...", "It seems like...", "You might want to consider..."
  - "This is just a suggestion but..." — use `nit:` instead
  - "Great work!", "Looks good overall but..." — say it once at the top, not per comment
  - Restating what the line does — the reviewer can read the diff

### chained-pr
- Trigger: Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus.
- Path: /home/quiarom/.codex/skills/chained-pr/SKILL.md
- Scope: user
- Compact rules:
  - Split PRs over **400 changed lines** unless a maintainer explicitly accepts `size:exception`.
  - Keep each PR reviewable in about **≤60 minutes**.
  - Use one deliverable work unit per PR; keep tests/docs with the unit they verify.
  - State start, end, prior dependencies, follow-up work, and out-of-scope items in every chained PR.
  - Every child PR must include a dependency diagram marking the current PR with `📍`.
  - In Feature Branch Chain, create a draft/no-merge tracker PR; child PR #1 targets the tracker branch, later children target the immediate parent branch.
  - Treat polluted diffs as base bugs: retarget or rebase until only the current work unit appears.
  - Do not mix chain strategies after the user chooses one.

### cognitive-doc-design
- Trigger: Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs.
- Path: /home/quiarom/.codex/skills/cognitive-doc-design/SKILL.md
- Scope: user
- Compact rules:
  - | Pattern | Rule |
  - |---------|------|
  - | Lead with the answer | Put the decision, action, or outcome first. Context comes after. |
  - | Progressive disclosure | Start with the happy path, then add details, edge cases, and references. |
  - | Chunking | Group related information into small sections. Keep flat lists short. |
  - | Signposting | Use headings, labels, callouts, and summaries so readers know where they are. |
  - | Recognition over recall | Prefer tables, checklists, examples, and templates over prose that must be remembered. |
  - | Review empathy | Design docs so reviewers can verify intent without reconstructing the whole story. |

### colosseum-copilot
- Trigger: |
- Path: /home/quiarom/.agents/skills/colosseum-copilot/SKILL.md
- Scope: user
- Compact rules:
  - Bullet points with inline citations (project slugs, archive titles)
  - Concise answers (typically 5-15 bullets)
  - Offer deep-dive when warranted
  - Similar Projects (5-8 bullets)
  - Archive Insights (3-5 bullets)
  - Current Landscape (per research angle)
  - Key Insights (patterns, gaps, trends)
  - Opportunities and Gaps

### comment-writer
- Trigger: Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments.
- Path: /home/quiarom/.codex/skills/comment-writer/SKILL.md
- Scope: user

### design-taste-frontend
- Trigger: Senior UI/UX Engineer. Architect digital interfaces overriding default LLM biases. Enforces metric-based rules, strict component architecture, CSS hardware acceleration, and balanced design engineering.
- Path: /home/quiarom/.agents/skills/design-taste-frontend/SKILL.md
- Scope: user

### find-skills
- Trigger: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.
- Path: /home/quiarom/.agents/skills/find-skills/SKILL.md
- Scope: user

### full-output-enforcement
- Trigger: Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns, and handles token-limit splits cleanly. Apply to any task requiring exhaustive, unabridged output.
- Path: /home/quiarom/.agents/skills/full-output-enforcement/SKILL.md
- Scope: user

### go-testing
- Trigger: Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns.
- Path: /home/quiarom/.codex/skills/go-testing/SKILL.md
- Scope: user
- Compact rules:
  - Prefer table-driven tests for multiple cases; use `t.Run(tt.name, ...)`.
  - Test behavior and state transitions, not implementation trivia.
  - Use `t.TempDir()` for filesystem tests; never rely on a real home directory.
  - Keep integration tests skippable with `testing.Short()` when they run external commands or slow flows.
  - For Bubbletea, test `Model.Update()` directly for state changes; use `teatest` only for interactive flows.
  - Golden files must be deterministic; update only through the repo's `-update` path and rerun tests without `-update`.
  - Use small mocks/interfaces around system or command execution boundaries.
  - | Target | Test pattern |

### high-end-visual-design
- Trigger: Teaches the AI to design like a high-end agency. Defines the exact fonts, spacing, shadows, card structures, and animations that make a website feel expensive. Blocks all the common defaults that make AI designs look cheap or generic.
- Path: /home/quiarom/.agents/skills/high-end-visual-design/SKILL.md
- Scope: user

### imagegen
- Trigger: Generate or edit raster images when the task benefits from AI-created bitmap visuals such as photos, illustrations, textures, sprites, mockups, or transparent-background cutouts. Use when Codex should create a brand-new image, transform an existing image, or derive visual variants from references, and the output should be a bitmap asset rather than repo-native code or vector. Do not use when the task is better handled by editing existing SVG/vector/code-native assets, extending an established icon or logo system, or building the visual directly in HTML/CSS/canvas.
- Path: /home/quiarom/.codex/skills/.system/imagegen/SKILL.md
- Scope: user

### issue-creation
- Trigger: Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests.
- Path: /home/quiarom/.codex/skills/issue-creation/SKILL.md
- Scope: user

### judgment-day
- Trigger: Trigger: judgment day, dual review, adversarial review, juzgar. Run blind dual review, fix confirmed issues, then re-judge.
- Path: /home/quiarom/.codex/skills/judgment-day/SKILL.md
- Scope: user
- Compact rules:
  - Resolve project skills before launching agents: read skill registry, match compact rules by target files/task, and inject the same `Project Standards` block into both judge prompts and fix prompts.
  - Launch **two blind judges in parallel** with identical target and criteria; never review the code yourself.
  - Wait for both judges before synthesis; never accept a partial verdict.
  - Classify warnings as `WARNING (real)` only if normal intended use can trigger them; otherwise downgrade to INFO as `WARNING (theoretical)`.
  - Ask before fixing Round 1 confirmed issues.
  - After any fix agent runs, immediately re-launch both judges in parallel before commit/push/done/session summary.
  - Terminal states are only `JUDGMENT: APPROVED` or `JUDGMENT: ESCALATED`.
  - After 2 fix iterations with remaining issues, ask the user whether to continue.

### minimalist-ui
- Trigger: Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. No gradients, no heavy shadows.
- Path: /home/quiarom/.agents/skills/minimalist-ui/SKILL.md
- Scope: user

### openai-docs
- Trigger: Use when the user asks how to build with OpenAI products or APIs and needs up-to-date official documentation with citations, help choosing the latest model for a use case, or model upgrade and prompt-upgrade guidance; prioritize OpenAI docs MCP tools, use bundled references only as helper context, and restrict any fallback browsing to official OpenAI domains.
- Path: /home/quiarom/.codex/skills/.system/openai-docs/SKILL.md
- Scope: user

### plugin-creator
- Trigger: Create and scaffold plugin directories for Codex with a required `.codex-plugin/plugin.json`, optional plugin folders/files, and baseline placeholders you can edit before publishing or testing. Use when Codex needs to create a new local plugin, add optional plugin structure, or generate or update repo-root `.agents/plugins/marketplace.json` entries for plugin ordering and availability metadata.
- Path: /home/quiarom/.codex/skills/.system/plugin-creator/SKILL.md
- Scope: user

### react-email
- Trigger: Use when building HTML email templates with React components, adding a visual email editor to an application using the React Email visual editor, rendering emails to HTML, or sending emails with Resend. Covers welcome emails, password resets, notifications, order confirmations, newsletters, transactional emails, and the embeddable email editor component.
- Path: /home/quiarom/.agents/skills/react-email/SKILL.md
- Scope: user

### redesign-existing-projects
- Trigger: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
- Path: /home/quiarom/.agents/skills/redesign-existing-projects/SKILL.md
- Scope: user
- Compact rules:
  - Work with the existing tech stack. Do not migrate frameworks or styling libraries.
  - Do not break existing functionality. Test after every change.
  - Before importing any new library, check the project's dependency file first.
  - If the project uses Tailwind, check the version (v3 vs v4) before modifying config.
  - If the project has no framework, use vanilla CSS.
  - Keep changes reviewable and focused. Small, targeted improvements over big rewrites.

### skill-creator
- Trigger: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations.
- Path: /home/quiarom/.codex/skills/.system/skill-creator/SKILL.md
- Scope: user

### skill-installer
- Trigger: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos).
- Path: /home/quiarom/.codex/skills/.system/skill-installer/SKILL.md
- Scope: user

### solana-dev
- Trigger: Use when user asks to "build a Solana dapp", "write an Anchor program", "create a token", "debug Solana errors", "set up wallet connection", "test my Solana program", "deploy to devnet", or "explain Solana concepts" (rent, accounts, PDAs, CPIs, etc.). End-to-end Solana development playbook covering wallet connection, Anchor/Pinocchio programs, Codama client generation, LiteSVM/Mollusk/Surfpool testing, and security checklists. Integrates with the Solana MCP server for live documentation search. Prefers framework-kit (@solana/client + @solana/react-hooks) for UI, wallet-standard-first connection (incl. ConnectorKit), @solana/kit for client/RPC code, and @solana/web3-compat for legacy boundaries.
- Path: /home/quiarom/.agents/skills/solana-dev/SKILL.md
- Scope: user

### work-unit-commits
- Trigger: Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code.
- Path: /home/quiarom/.codex/skills/work-unit-commits/SKILL.md
- Scope: user

