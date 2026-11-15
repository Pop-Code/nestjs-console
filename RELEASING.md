# Releasing

Releases are fully automated by [`.github/workflows/release.yml`](.github/workflows/release.yml) when a `v*` tag is pushed.

## Steps

1. On `master`, bump `version` in `package.json` (follow [Semantic Versioning](https://semver.org)).
2. In `CHANGELOG.md`, rename `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD`. The workflow uses this section as the release notes and fails if it is missing.
3. Regenerate the API docs: `yarn doc`.
4. Commit, merge to `master`, then tag and push:

    ```bash
    git tag -a vX.Y.Z -m "vX.Y.Z"
    git push origin vX.Y.Z
    ```

The workflow then:

- checks the tag matches the `package.json` version,
- runs lint, build, smoke test and tests,
- creates the GitHub release with the CHANGELOG notes,
- publishes to npm with provenance (`latest`, or `next` for prereleases such as `12.0.0-beta.1`).

If a step fails, fix the cause and re-run the workflow, or start it manually from the Actions tab (**Release → Run workflow**) with the existing tag. Steps that already succeeded (GitHub release, npm version) are skipped.

## npm trusted publishing (one-time setup)

The workflow authenticates to npm with GitHub OIDC, so no `NPM_TOKEN` secret is needed. On [npmjs.com](https://www.npmjs.com/package/nestjs-console/access), under **Settings → Trusted Publisher**, add a GitHub Actions publisher:

- Organization or user: `Pop-Code`
- Repository: `nestjs-console`
- Workflow filename: `release.yml`
- Environment: leave empty
