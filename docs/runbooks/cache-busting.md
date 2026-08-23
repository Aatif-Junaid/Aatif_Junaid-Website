# Runbook: update asset cache versions

## Symptom

A merged file is correct in GitHub but returning visitors still receive an older stylesheet, script, resume, or social image.

## Procedure

1. Change only the version for the asset that changed.
2. Keep the same version everywhere that asset is referenced.
3. Run `pwsh -File scripts/check.ps1`.

Current patterns:

| Asset | Reference pattern |
|---|---|
| Shared CSS | `assets/css/site.css?v=N` |
| Shared JavaScript | `assets/js/site.js?v=N` |
| Case-study JavaScript | `assets/js/case-studies.js?v=N` |
| Public resume | `resume.pdf?v=YYYY-MMx` |
| Social image | `og-image.jpg?v=N` |

Use the next integer for CSS, JavaScript, and social images. Keep the dated resume version descriptive and unique.

## Checks

- The repository check reports one version per repeated asset.
- Every changed page requests the new URL through the local server.
- Unchanged assets keep their prior version.
