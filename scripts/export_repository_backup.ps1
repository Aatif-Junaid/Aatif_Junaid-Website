param(
    [Parameter(Mandatory = $true)][string]$Repository,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$output = Join-Path $root $OutputDirectory
New-Item -ItemType Directory -Force -Path $output | Out-Null

git -C $root fetch --all --prune --tags
if ($LASTEXITCODE -ne 0) { throw 'Unable to fetch all repository refs.' }
git -C $root bundle create (Join-Path $output 'repository.bundle') --all
if ($LASTEXITCODE -ne 0) { throw 'Unable to create repository bundle.' }

function Export-Endpoint {
    param([string]$Endpoint, [string]$FileName)
    & gh api --paginate --slurp $Endpoint | Set-Content -LiteralPath (Join-Path $output $FileName) -Encoding utf8
    if ($LASTEXITCODE -ne 0) { throw "Unable to export $Endpoint." }
}

Export-Endpoint "repos/$Repository" 'repository.json'
Export-Endpoint "repos/$Repository/branches?per_page=100" 'branches.json'
Export-Endpoint "repos/$Repository/tags?per_page=100" 'tags.json'
Export-Endpoint "repos/$Repository/issues?state=all&per_page=100" 'issues-and-pulls.json'
Export-Endpoint "repos/$Repository/issues/comments?per_page=100" 'issue-comments.json'
Export-Endpoint "repos/$Repository/pulls?state=all&per_page=100" 'pulls.json'
Export-Endpoint "repos/$Repository/pulls/comments?per_page=100" 'pull-review-comments.json'
Export-Endpoint "repos/$Repository/releases?per_page=100" 'releases.json'
Export-Endpoint "repos/$Repository/labels?per_page=100" 'labels.json'
Export-Endpoint "repos/$Repository/milestones?state=all&per_page=100" 'milestones.json'
Export-Endpoint "repos/$Repository/actions/workflows?per_page=100" 'actions-workflows.json'
Export-Endpoint "repos/$Repository/actions/runs?per_page=100" 'actions-runs.json'

$pullNumbers = @(& gh api --paginate "repos/$Repository/pulls?state=all&per_page=100" --jq '.[].number')
$reviews = Join-Path $output 'pull-reviews'
New-Item -ItemType Directory -Force -Path $reviews | Out-Null
foreach ($number in $pullNumbers) {
    Export-Endpoint "repos/$Repository/pulls/$number/reviews?per_page=100" "pull-reviews/$number.json"
}

& gh auth setup-git
$wikiUrl = "https://github.com/$Repository.wiki.git"
git ls-remote $wikiUrl *> $null
if ($LASTEXITCODE -eq 0) {
    git clone --mirror $wikiUrl (Join-Path $output 'wiki.git')
    if ($LASTEXITCODE -ne 0) { throw 'The wiki exists but could not be backed up.' }
}

Get-FileHash -Algorithm SHA256 (Join-Path $output 'repository.bundle') |
    Select-Object Algorithm, Hash, Path |
    ConvertTo-Json |
    Set-Content -LiteralPath (Join-Path $output 'bundle-sha256.json') -Encoding utf8

Write-Output "Backup export created at $output"
