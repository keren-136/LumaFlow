---
name: agent-optimization-log
description: Maintain AGENT_NOTES.md, a running log of webcmd adapter fixes, selector changes, login/session quirks, and optimization learnings. Trigger this whenever a webcmd command is created, breaks and gets healed, or a reusable pattern about the Luma dashboard is discovered — and whenever explicitly asked to log or document agent notes.
---

## What this skill does

Keeps a single file, `AGENT_NOTES.md`, at the repo root, documenting everything learned while building and healing the `luma` webcmd adapter. This file is for humans AND for you (Codex) to read back later so you don't re-diagnose the same problem twice.

## When to use it

- Right after creating a new webcmd command (e.g. `luma guests approve`)
- Right after healing/fixing a broken command
- Whenever you discover something non-obvious about Luma's dashboard (a selector that's fragile, a login/session quirk, a rate limit, an unexpected page state)
- Whenever the user explicitly asks to "log this" or "note this down"

## How to update AGENT_NOTES.md

1. If `AGENT_NOTES.md` doesn't exist yet, create it with this header:
Agent Notes — LumaFlow
Running log of webcmd adapter learnings. Newest entries at the top.
2. Never overwrite existing entries. Always prepend new entries directly below the header.

3. Use this exact entry template, filled in:
[YYYY-MM-DD HH:MM] <short title>

Command/area: <e.g. luma guests approve>
What happened: <bug, breakage, or discovery, 1-2 sentences>
Fix / learning: <what was changed or learned, 1-2 sentences>
Reusable pattern: <anything future adapters should reuse or avoid, or "none">


4. Keep each entry under 100 words. Do not restate the whole conversation — just the useful nugget.

5. After appending, briefly tell the user what you logged, in one sentence.
