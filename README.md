# create-nextplus

Scaffold a complete Payload CMS project.

```bash
bunx create-nextplus my-project
```

This copies the bundled template into `my-project/`, renames `package.json`, generates a `.env` (with fresh secrets pre-filled), runs `bun install`, and initializes a fresh git repo.

## Local development

```bash
bun install
bun link
```

Then, from anywhere:

```bash
create-nextplus my-project
```

## Structure

- `src/index.ts` — CLI entry point
- `src/scaffold.ts` — copies the template, renames `package.json`, provisions `.env`
- `src/install.ts` — runs `bun install` and `git init`
- `src/utils.ts` — project name validation
- `templates/advanced/` — the Payload CMS boilerplate that gets copied
