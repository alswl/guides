# guides

A collection of development guides and conventions for building software with a consistent, extensible, community-standard approach.

## Guides

| Guide | Description |
| --- | --- |
| [go-cli-guides.md](./go-cli-guides.md) | Building command-line tools (CLIs) in Go — cobra/viper stack, extensible structure, clig.dev conventions |
| [go-server-guides.md](./go-server-guides.md) | Building HTTP API services in Go — huma + GORM stack, layered extensible structure |

## Principles

All guides share the same design goals, in priority order:

**Clarity > low maintenance cost > extensibility.**

- Follow mainstream community standards and de facto tooling.
- Vertical slicing ("one feature, one package") so features extend by adding, not modifying.
- Program to interfaces; keep entry points thin and business logic pure.

## Versioning & Changelog

- Version: **v0.0.1-alpha1**
- The [CHANGELOG](./CHANGELOG.md) is generated from [Conventional Commits](https://www.conventionalcommits.org/) using [git-cliff](https://git-cliff.org/).
