# Portfolio

## Memory

Use only the project-local memory in `.claude/memory/`. It is gitignored and indexed by `.claude/memory/MEMORY.md`, which `.claude/CLAUDE.md` imports. Read it at the start of every session. When it holds pending reminders for the user, bring them up in your first reply. Write to it only when the user asks you to remember something.

Do not read from or write to the global memory directory (`~/.claude/projects/.../memory/`).

## No comments, no artifacts

This repo holds working code and nothing else.

Do not write code comments of any kind: `//`, `/* */`, JSDoc, JSX `{/* */}`, or header blocks that a script injects into the files it generates. Do not add anything that is not functionality: no notes files, no TODOs, no supporting docs, no dead code kept "just in case", no agent memory inside the repo.

The reasoning behind a change goes in the pull request or the commit message, never in the file. Deliver code comment-free in the first place instead of writing comments and stripping them later.

Two things are not comments and do stay:

- Strings that only look like comments but are app content — the fake code in the hero (`components/sections/HeroStage.tsx`) and the CSS emitted by `components/lab/ProjectsLab.tsx`.
- Directive comments that change tool behaviour: `eslint-disable`, `@ts-expect-error`, `prettier-ignore`.

`npm run lint` enforces this. The `house/no-comments` ESLint rule covers `.ts`, `.tsx` and `.mjs`; `scripts/check-css-comments.mjs` covers `.css`. If a script generates code, its template literals are subject to the same rule — the checkers cannot see inside them.

The only exception is an explicit request to comment a specific piece of code. It covers that piece only.
