param(
    [switch]$StagedOnly
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$truffleHog = if ($env:TRUFFLEHOG_PATH -and (Test-Path -LiteralPath $env:TRUFFLEHOG_PATH)) {
    Get-Item -LiteralPath $env:TRUFFLEHOG_PATH
} else {
    Get-Command trufflehog -ErrorAction SilentlyContinue
}
$resultPath = $null
$errorPath = $null

if (-not $truffleHog) {
    throw 'TruffleHog is required. Install a verified release from https://github.com/trufflesecurity/trufflehog/releases.'
}

$temporaryRoot = $null

try {
    $indexedFiles = @(git -C $repositoryRoot diff --cached --name-only --diff-filter=ACMR)
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to enumerate indexed files.'
    }
    if ($indexedFiles.Count -eq 0) {
        Write-Output 'No staged files to scan.'
        exit 0
    }

    $temporaryRoot = Join-Path ([IO.Path]::GetTempPath()) ("trufflehog-index-" + [guid]::NewGuid())
    New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
    $prefix = $temporaryRoot.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    & git -C $repositoryRoot checkout-index --force --prefix=$prefix -- @indexedFiles
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to materialize the Git index for scanning.'
    }

    $resultPath = Join-Path ([IO.Path]::GetTempPath()) ("trufflehog-results-" + [guid]::NewGuid() + '.jsonl')
    $errorPath = Join-Path ([IO.Path]::GetTempPath()) ("trufflehog-errors-" + [guid]::NewGuid() + '.log')
    & $truffleHog.FullName filesystem $temporaryRoot --json --fail --fail-on-scan-errors --no-update --no-color 1> $resultPath 2> $errorPath
    $scanExitCode = $LASTEXITCODE
    if ($scanExitCode -ne 0) {
        $summaries = @(
            Get-Content -LiteralPath $resultPath -ErrorAction SilentlyContinue | ForEach-Object {
                try {
                    $result = $_ | ConvertFrom-Json
                    $path = $result.SourceMetadata.Data.Filesystem.file
                    "{0} in {1}" -f $result.DetectorName, $path
                } catch {
                    # Non-JSON diagnostic lines are intentionally not echoed.
                }
            } | Sort-Object -Unique
        )
        if ($summaries.Count -gt 0) {
            throw "TruffleHog blocked the change: $($summaries -join '; '). Raw values were withheld."
        }
        throw "TruffleHog could not complete the scan (exit code $scanExitCode). Diagnostic output was withheld."
    }
}
finally {
    if ($temporaryRoot -and (Test-Path -LiteralPath $temporaryRoot)) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
    foreach ($path in @($resultPath, $errorPath)) {
        if ($path -and (Test-Path -LiteralPath $path)) {
            Remove-Item -LiteralPath $path -Force
        }
    }
}

Write-Output 'TruffleHog secret scan passed.'
