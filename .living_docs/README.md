# `.living_docs/` — Schema Reference

This directory is managed by the [`@GuardianBob/living-docs`](https://github.com/GuardianBob/living-docs) plugin.
It contains **machine-readable, sharded** documentation of every task an AI agent completes in this repository — plus a derived `INDEX.md` that's regenerated on every write.

> **Humans:** start with `INDEX.md`, then `status/current.md`, then `adventures/compiled.md` (if present).
> **Agents:** the `living-docs` skill auto-loads with the full read/write workflow.

---

## Directory layout

```
.living_docs/
├── INDEX.md                  # Derived. Regenerated on every write. NEVER hand-edit.
├── README.md                 # This file. Schema docs for humans.
├── memory/                   # Per-task technical record (one .md per task)
├── git-commits/              # Per-task commit narrative (one .md per task)
├── adventures/
│   └── chapters/             # Per-task narrative chapter (one .md per task)
├── status/
│   └── current.md            # Singleton. OVERWRITTEN every task.
├── schemas/                  # Copies of the plugin's JSON Schemas
└── _archive/                 # Aged-out shards (see living-docs-archive)
```

Naming conventions (enforced by the plugin scripts, not the schemas):

| Type        | Pattern                                | Example                               |
|-------------|----------------------------------------|---------------------------------------|
| memory      | `T-NNN__YYYY-MM-DD__<slug>.md`         | `T-042__2026-04-29__add-auth.md`      |
| git-commits | `T-NNN__<type>__<slug>.md`             | `T-042__feat__add-auth.md`            |
| adventures  | `NNN__<chapter-slug>.md`               | `042__shadow-of-the-auth-token.md`    |
| status      | `current.md` (always)                  | `current.md`                          |

---

## The four shard types

Every shard is a Markdown file with a YAML frontmatter block delimited by `---`.
Validation runs against `schemas/<type>.schema.json` — see those files for the authoritative field list.

### 1. `memory/` — the technical record

Written by the agent that completes a task. **No persona voice.** Read by the next agent that needs decision context.

Required fields: `schema_version`, `task_id`, `date`, `type`, `status`, `slug`, `title`, `characters`.
Optional: `files_touched`, `tags`, `related_tasks`, `duration_minutes`, `open_followups`.

### 2. `git-commits/` — the commit mirror

Written immediately after `git commit`. Body is ≤ 3 lines and **persona voice is allowed**. `commit_hash` may be `pending` if filled in by a hook later.

Required: `schema_version`, `task_id`, `date`, `type`, `slug`.
Optional: `commit_hash`, `characters`.

### 3. `adventures/chapters/` — the narrative

Written **last**, after the memory and commit shards exist. The full in-character story of the task. Read by the next agent for narrative continuity.

Required: `schema_version`, `chapter`, `task_id`, `date`, `title`, `characters`, `cat_appearance`.
Optional: `tasks_completed`, `word_count`, `slug`.

> ⚠ `cat_appearance` is one of the strings `"the-cat"`, `"cheshire"`, `"both"`, or `"false"`. Yes — the literal string `"false"`, not the YAML boolean `false`. This keeps serialization stable across re-emit cycles.

### 4. `status/current.md` — the singleton

The only **unsharded** living doc. Overwritten by every agent on every task. 1–3 bullets in the body. No persona voice.

Required: `schema_version`, `updated` (ISO 8601 UTC), `active_task` (string `T-NNN` or `null`).
Optional: `last_completed_task`.

---

## `INDEX.md` — the source of truth

`INDEX.md` is **derived state**. It's rebuilt by:

```bash
npx living-docs-rebuild
```

The rebuild script:
1. Walks `memory/`, `git-commits/`, `adventures/chapters/`.
2. Validates every shard against its schema (refuses to write INDEX if any shard fails).
3. Reads `status/current.md` for `active_task` / `last_completed_task`.
4. Computes `next_task_id` (highest `T-NNN` seen + 1), `recent_tasks` (newest 10), `open_followups` (flattened from shards, capped at 20), and `counts`.
5. Writes the new INDEX atomically (rename-over).

**Never edit `INDEX.md` by hand.** Your edits will be lost the next time anything runs.

The INDEX itself is also schema-validated — see `schemas/index.schema.json`. The `generator` field looks like `@GuardianBob/living-docs@0.1.0`.

---

## Lifecycle

1. **Bootstrap** (once per repo): `npx living-docs-bootstrap` — creates this directory and copies the schemas.
2. **Per task** (the agent does this):
   - Write a `memory/` shard.
   - `git commit` and write a `git-commits/` shard.
   - Write an `adventures/chapters/` shard.
   - Overwrite `status/current.md`.
   - Run `npx living-docs-rebuild`.
3. **Add helper** (optional): `npx living-docs-add memory --task-id T-042 --type feat --slug add-auth ...` — interactive or flag-driven shard creation that also runs rebuild.
4. **Archive** (occasionally): `npx living-docs-archive --older-than-days 90` — moves old shards into `_archive/YYYY-Q*/` and updates counts.
5. **Compile narrative** (on demand): `npx living-docs-compile` — concatenates `adventures/chapters/*.md` into `adventures/compiled.md` for human reading.

---

## Schema versioning

Every shard carries `schema_version: 1`. If the plugin ever ships a breaking schema change, it will:

1. Bump `schema_version` to `2` in new shards.
2. Ship a migration script (`living-docs-migrate`) that rewrites old shards in place.
3. Bump the plugin's semver major.

Old shards stay readable until you migrate.

---

## Help

- Plugin source & docs: <https://github.com/GuardianBob/living-docs>
- Issue tracker: same repo
- Schemas: see `schemas/*.schema.json` in this directory
- The `living-docs` skill (auto-loaded) has the full agent-facing workflow

If something feels off — a shard that won't validate, an INDEX field you don't recognize, a hook that nudges you at the wrong time — open an issue. The schemas are deliberately strict; that's the safety net.
