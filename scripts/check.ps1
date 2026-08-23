$ErrorActionPreference = 'Stop'

function Find-Python {
    foreach ($name in @('python', 'python3')) {
        $command = Get-Command $name -ErrorAction SilentlyContinue
        if ($command -and $command.Source -notmatch '\\Microsoft\\WindowsApps\\python(?:3)?\.exe$') {
            return @{ Executable = $command.Source; Prefix = @() }
        }
    }

    $launcher = Get-Command 'py' -ErrorAction SilentlyContinue
    if ($launcher) {
        return @{ Executable = $launcher.Source; Prefix = @('-3') }
    }

    $bundled = Join-Path $HOME '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
    if (Test-Path -LiteralPath $bundled) {
        return @{ Executable = $bundled; Prefix = @() }
    }

    throw 'Python 3 is required. Install Python or restore the bundled Codex runtime.'
}

$python = Find-Python
$checker = Join-Path $PSScriptRoot 'check_site.py'
& $python.Executable @($python.Prefix) $checker
exit $LASTEXITCODE
