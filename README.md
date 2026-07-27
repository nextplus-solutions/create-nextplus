# create-nextplus

Scaffold a complete Payload CMS project.

## Usage

The package is published to GitHub Packages under the `nextplus-solutions` org, not the public npm registry. GitHub Packages requires authentication for every install — even public packages — so you need a GitHub [personal access token](https://github.com/settings/tokens) with `read:packages` scope.

Add this to `~/.npmrc` (once per machine):

```
@nextplus-solutions:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then, from anywhere:

```bash
bunx @nextplus-solutions/create-nextplus my-project
```

This copies the bundled template into `my-project/`, renames `package.json`, generates a `.env` (with fresh secrets pre-filled), runs `bun install`, and initializes a fresh git repo.

## Local development

```bash
bun install
bun link
```

Then, from anywhere on this machine:

```bash
create-nextplus my-project
```

## Publishing

```bash
GITHUB_TOKEN=$(gh auth token) bun publish
```

Requires a token with `write:packages` scope and bump the `version` in `package.json` first (GitHub Packages rejects republishing an existing version).

## Structure

- `src/index.ts` — CLI entry point
- `src/scaffold.ts` — copies the template, renames `package.json`, provisions `.env`
- `src/install.ts` — runs `bun install` and `git init`
- `src/utils.ts` — project name validation
- `templates/advanced/` — the Payload CMS boilerplate that gets copied
