# Prowl Hub - Product Backlog

**Repo**: `Prowl-qa/prowl-hub`
**Stack**: Next.js + YAML templates + GitHub Actions CI
**License**: Apache 2.0

---

## High Priority

*No active items.*

## Medium Priority

*No active items.*

## Low Priority

{PQH-001} **HUB-002: Target URL Pattern Metadata**
   Add optional `targetUrl` pattern metadata to hunt templates so agents can discover relevant templates for a given application URL. Supports P5-007 (URL-based hunt discovery) in the CLI.

**Acceptance Criteria**:
- Templates include optional `meta.targetPattern` field (e.g., `"**/login"`, `"**/admin/**"`)
- Pattern matching uses glob syntax
- Metadata is separate from runtime hunt config

{PQH-002} **HUB-010: Server-Side Filtering (500+ hunts)**
   Move search/filter/pagination to server-side via `searchParams` when catalog exceeds 500 hunts. Server component reads `?q=&category=&page=`, filters and slices server-side. Search input becomes a GET form or debounced `router.push`.

{PQH-003} **HUB-011: Sort Options**
   Add sort controls to browse page (newest, alphabetical, most steps). Default to alphabetical.

{PQH-004} **HUB-012: Hunt Detail Page**
   Create `/browse/[category]/[name]` route showing full YAML, metadata, and related hunts from the same category.

## Completed

### HUB-017: Fix EC2 run-scoping cleanup and main-branch OIDC defaults (completed: 2026-04-07)
**Description**: Restored the default OIDC trust ref to `refs/heads/main`, removed the cleanup job’s 30-minute age gate, propagated `github.run_id` into the EC2 driver as a shared `RunId` tag so workflow cleanup and driver fallback target only the current run’s instances, moved `fs.mkdtemp` into the guarded EC2 setup path, and tightened `ec2:CreateTags` with `ec2:CreateAction = RunInstances` plus the updated allowed tag keys. Verified with lint, typecheck, node tests, and `terraform plan -refresh=false -var 'molecule_public_key=…'`, which showed the expected trust/policy updates and the already-expected destruction of the old `tls_private_key` state object / private-key output.

### HUB-016: Address EC2 workflow and Terraform security review findings (completed: 2026-04-07)
**Description**: Replaced the EC2 summary step's `bc` dependency with `awk`, normalized EC2 template/IO setup failures into standard failed-result records, increased Molecule exec buffers, fixed end-of-file `playbook: |` extraction with CRLF regression coverage, added the stable `Project=ec2-test-env` instance tag used by cleanup/IAM restrictions, tightened the OIDC trust and EC2 lifecycle policy scope, switched the subnet AZ to `data.aws_availability_zones`, and removed Terraform-managed private-key generation plus the secret output. Verified with lint, typecheck, node tests, and `terraform plan -refresh=false -var 'molecule_public_key=…'`, which showed only the expected IAM updates and destruction of the old `tls_private_key` state object / private-key output.

### HUB-015: Address EC2 test-run isolation and validation workflow review findings (completed: 2026-04-07)
**Description**: Scoped the EC2 fallback cleanup command to a per-run tag so concurrent runs in the same environment no longer risk terminating each other. Also switched PEM materialization to `printf`, removed the `infra/` validation bypass in favor of an infra allowlist, stopped ignoring `.terraform.lock.hcl`, tightened EC2 playbook block extraction with regression coverage, removed the obsolete GitHub OIDC thumbprint, documented the intentional isolated-test-VPC security-group tradeoff, and verified the repo checks plus `terraform plan -refresh=false` for `infra/ec2-test-env`.

### HUB-014: Harden EC2 test preflight failure handling (completed: 2026-04-02)
**Description**: Fixed the EC2 validation and cleanup paths so invalid SSH private keys now fail preflight immediately and the EC2 fallback cleanup command keeps instance IDs attached to `--instance-ids` before `--region`. Added targeted CLI coverage for the fallback command shape.

### HUB-013: Align hub browser icon with the shared Prowl site icon (completed: 2026-03-21)
**Description**: Replaced the metadata-only favicon setup in `prowl-hub` with Next App Router special files. Added `app/icon.png` and `app/apple-icon.png` from the shared mascot asset, removed the redundant `metadata.icons` block from the root layout, and verified the production build now emits `/icon.png` and `/apple-icon.png` routes.

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
