# Backup and recovery

The scheduled `immutable-backup.yml` workflow preserves all Git refs in a Git bundle plus repository metadata, issues, pull requests, comments, reviews, labels, milestones, releases, Actions metadata, and a wiki mirror when a wiki exists. It uses GitHub's short-lived workflow token and AWS OIDC, so GitHub stores no long-lived AWS access key.

GitHub's public APIs cannot recreate every issue or pull-request identity, timestamp, review state, or internal identifier exactly on GitHub.com. The archive preserves the evidence and content needed for recovery, but it is not a bit-for-bit restoration of GitHub's service database.

## AWS cold-storage requirements

Use a dedicated AWS backup account that is not administered by the GitHub account owner.

1. Create the S3 bucket with versioning and Object Lock enabled at bucket creation.
2. Set default retention to Compliance mode for 10 years. Compliance mode prevents shortening retention, including by root.
3. Require SSE-KMS with a customer-managed key and separate the KMS key administrator from the backup writer.
4. Block public access and ACLs. Deny non-TLS requests, retention bypass, object deletion, and bucket deletion. Grant the GitHub role only object upload, bucket-location, and KMS encryption/data-key permissions.
5. Add the GitHub OIDC provider and restrict the role trust policy to the exact repository and protected branch or environment.
6. Send S3 Inventory and CloudTrail data events to a separate immutable logging bucket.
7. Add repository variables `AWS_BACKUP_BUCKET`, `AWS_BACKUP_ROLE_ARN`, `AWS_BACKUP_KMS_KEY_ARN`, and `AWS_BACKUP_REGION`.
8. Run the workflow manually and verify the archive, checksum, KMS key, Compliance lock, and retention date in AWS.

The workflow skips itself until all four variables exist. A skipped workflow is not a backup.

## Restore drill

Perform this quarterly from a clean, isolated machine.

1. Download the archive and checksum using a read-only recovery role.
2. Run `sha256sum -c <archive>.sha256` and extract the archive.
3. Run `git bundle verify repository.bundle`.
4. Run `git clone repository.bundle restored-repository` and compare branches, tags, and default-branch SHA with the metadata snapshot.
5. Restore first to a private quarantine repository. Reapply access, rulesets, Actions, environments, Pages, domain verification, and security settings before deployment.
6. Recreate issues and pull requests only after deciding how imported historical identity and timestamps will be represented.
7. Confirm `CNAME`, DNS, Cloudflare, HTTPS, and Pages from independent accounts before switching production traffic.
8. Record recovery time, archive key, checksum result, missing data, and corrective actions without exposing sensitive data.

## Account-compromise sequence

1. Revoke sessions, tokens, SSH keys, OAuth grants, and compromised recovery methods.
2. Rotate external credentials before changing Git history.
3. Freeze deployments, DNS changes, and collaborator changes.
4. Preserve security and audit logs off platform.
5. Restore to quarantine from the last known-good immutable archive.
6. Compare refs, content, DNS, Pages, and metadata before recovering in place or replacing the repository.
7. Re-enable production only after two-person review of access, rulesets, workflows, domain controls, and backups.
