# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ERPsb is an ERP system for small Brazilian businesses ("pequenas empresas") that currently rely on informal controls (paper, spreadsheets, WhatsApp). The project targets an MVP-first approach with a clear evolution path to a full ERP.

**MVP modules (implementation order):** Cadastros (registrations) → Financeiro (financial) → Vendas (sales) → Fiscal (tax/invoicing) → Estoque (inventory, optional).

The project concept is documented in `doc/erp-sb.txt`.

## Development Methodology: BMad Method

This project uses the **BMad Method** (`bmad-method` npm package) for AI-driven agile planning and development. The `.bmad-core/` directory contains the full BMad framework.

### BMad Agents (invoke via `/BMad:agents:<name>`)

- `/pm` - Product Manager: creates PRDs from project briefs
- `/architect` - System Architect: designs architecture from PRD
- `/dev` - Developer (James): implements stories task-by-task
- `/qa` - Test Architect (Quinn): risk profiling, test design, reviews, quality gates
- `/sm` - Scrum Master: drafts stories from epics
- `/po` - Product Owner: validates stories, runs master checklist, shards documents
- `/analyst` - Business Analyst: research, brainstorming, project briefs
- `/bmad-master` - Can perform any agent role except story implementation

### BMad Workflow

1. **Planning phase:** Analyst → PM (PRD) → Architect (architecture) → PO (validation + sharding)
2. **Development cycle:** SM (draft story) → PO (validate) → Dev (implement) → QA (review) → commit
3. **Dev agent (`/dev`) rules:**
   - Must load `devLoadAlwaysFiles` from `core-config.yaml` on startup (coding standards, tech stack, source tree)
   - Implements stories sequentially: read task → implement → write tests → validate → check off
   - Only modifies Dev Agent Record sections in story files
   - Halts on: unapproved deps, ambiguity, 3 repeated failures, missing config, failing regression

### Key BMad Paths

```
.bmad-core/core-config.yaml     # Project configuration (doc locations, dev load files)
docs/prd.md                      # Product Requirements Document (once created)
docs/architecture.md             # Architecture document (once created)
docs/stories/                    # Story files for development
docs/qa/                         # QA assessments and quality gates
```

### Core Config (`core-config.yaml`)

The `devLoadAlwaysFiles` list defines files the dev agent must always load:
- `docs/architecture/coding-standards.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/source-tree.md`

These files will be created during the architecture phase.

## Current Project State

The project is in its initial setup phase. No source code, architecture docs, or PRD exist yet. The next step is to begin the BMad planning workflow (analyst/PM → PRD → architecture → stories).

## Commands

```bash
npm install          # Install dependencies (currently only bmad-method dev dependency)
npx bmad-method      # Access BMad Method CLI tooling
```

No build, lint, or test commands are configured yet (will be defined during architecture phase).

## Design Principles (from project spec)

- Usability over complexity
- Simple processes before advanced automation
- Financial module is the core ("financeiro é o coração")
- Tax/fiscal features must not block operations
- Everything built in MVP must scale without structural rework
- Modular architecture, APIs from the start, centralized business rules
