# AGENTS.md

## Overview

A Yeoman generator that scaffolds Spring Boot 3.x microservices with configurable
database, migration, build tool, authentication, cache, messaging, and observability options.

## Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run the full mocha test suite (generator integration tests) |
| `npm run lint` | Run ESLint over `generators/` and `test/` |
| `npm run format` | Format code with Prettier |
| `npm install` | Install dependencies |

## Architecture

- `generators/app/` — entry generator, composes the server generator
- `generators/server/` — main microservice generator (prompts, build tool, app code, docker, CI)
- `generators/controller/` — CRUD API generator on top of an existing project
- `generators/base-generator.js` — shared helpers (`generateMainJavaCode`, `_formatCode`, logging)
- `generators/constants.js` — single source of truth for framework/plugin/image versions
- `generators/common/files/` — shared build wrappers (mvnw, gradlew)

Templates live under `generators/server/templates/` and use EJS syntax (`<%= VAR %>`,
`<%_ if (cond) { _%>`). Version constants are injected via `constants.js` — never hardcode
versions in templates.

## Conventions

- ESM only (`import`/`export`); `package.json` has `"type": "module"`
- Prompt options live in `generators/server/prompts.js`; the generator branches on
  `configOptions.<option>` (lowerCamelCase) in `configuring()` / `writing()`
- When `configOptions` derives from a prompt default, normalize it in `configuring()` with
  `this.configOptions.x = this.configOptions.x || 'default'`
- Tests use `yeoman-test` `YeomanTest` with `.withPrompts()` and assert generated files
  with `yeoman-assert` (`assert.file` + `assert.fileContent`). Default `formatCode: false`
  for speed; keep at most one end-to-end case with real build per area
- Run `npm run lint` before committing

## Verification

- New templates MUST compile: generate a project with the option and run
  `./mvnw compile -Dspotless.check.skip=true` (or gradlew equivalent)
- Assert file **content** (`assert.fileContent`) for behavior-level contracts, not just existence
