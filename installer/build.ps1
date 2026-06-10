<#
.SYNOPSIS
    Builds the ScreenMacro installer: installer\out\ScreenMacro-Setup-<version>.msi

.DESCRIPTION
    1. publishes the service (self-contained win-x64) into installer\staging\service
    2. builds the Tauri app (release exe, no bundling) into installer\staging
    3. builds the MSI with WiX

    The version comes from -Version, or installer\version.txt when omitted (MAJOR.MINOR.PATCH).
    To ship an update: bump the version, run this script, hand out the new MSI. Running it on a PC that
    has an older version uninstalls that version first (see Package.wxs).

.EXAMPLE
    .\build.ps1                 # version from version.txt
    .\build.ps1 -Version 1.2.0  # explicit version (also written back to version.txt)
#>
param(
    [string]$Version,
    [switch]$SkipService,   # reuse the previous staging\service
    [switch]$SkipApp        # reuse the previous staging\screenmacroapp.exe
)

$ErrorActionPreference = 'Stop'

$Root       = Split-Path $PSScriptRoot -Parent
$Staging    = Join-Path $PSScriptRoot 'staging'
$VersionFile = Join-Path $PSScriptRoot 'version.txt'

function Invoke-Step([string]$Title, [scriptblock]$Body) {
    Write-Host "`n=== $Title" -ForegroundColor Cyan
    & $Body
    if ($LASTEXITCODE -ne 0) { throw "$Title failed (exit code $LASTEXITCODE)" }
}

# --- version -----------------------------------------------------------------------------------
if (-not $Version) { $Version = (Get-Content $VersionFile -Raw).Trim() }
if ($Version -notmatch '^(\d+)\.(\d+)\.(\d+)$') { throw "Version '$Version' must look like MAJOR.MINOR.PATCH (e.g. 1.2.0)" }
# Windows Installer limits: major < 256, minor < 256, patch < 65536
if ([int]$Matches[1] -gt 255 -or [int]$Matches[2] -gt 255 -or [int]$Matches[3] -gt 65535) {
    throw "Version '$Version' is out of range for Windows Installer (max 255.255.65535)"
}
Set-Content -Path $VersionFile -Value $Version -Encoding ascii
Write-Host "Building ScreenMacro $Version" -ForegroundColor Green

New-Item -ItemType Directory -Force $Staging | Out-Null

# --- service -----------------------------------------------------------------------------------
if (-not $SkipService) {
    $serviceOut = Join-Path $Staging 'service'
    if (Test-Path $serviceOut) { Remove-Item $serviceOut -Recurse -Force }

    # Self-contained so the PC needs no .NET runtime. Not single-file / not trimmed: Program.cs uses
    # Assembly.Location and the command dispatch is reflection-based.
    Invoke-Step 'Publish ScreenMacroService' {
        dotnet publish (Join-Path $Root 'ScreenMacroService\ScreenMacroService\ScreenMacroService.csproj') `
            -c Release -r win-x64 --self-contained true -p:Version=$Version -o $serviceOut
    }
}

# --- app ---------------------------------------------------------------------------------------
if (-not $SkipApp) {
    $appDir = Join-Path $Root 'ScreenMacroApp'

    if (-not (Test-Path (Join-Path $appDir 'node_modules'))) {
        Invoke-Step 'npm ci' { Push-Location $appDir; try { npm ci } finally { Pop-Location } }
    }

    # Override only the version (exe file version) without editing tauri.conf.json
    $versionConfig = Join-Path $Staging 'tauri-version.json'
    Set-Content -Path $versionConfig -Value "{ `"version`": `"$Version`" }" -Encoding ascii

    Invoke-Step 'Build ScreenMacroApp (Tauri)' {
        Push-Location $appDir
        try { npm run tauri build -- --no-bundle --config $versionConfig } finally { Pop-Location }
    }

    $exe = Join-Path $appDir 'src-tauri\target\release\screenmacroapp.exe'
    if (-not (Test-Path $exe)) { throw "Expected $exe after the Tauri build" }
    Copy-Item $exe (Join-Path $Staging 'screenmacroapp.exe') -Force
}

Copy-Item (Join-Path $Root 'ScreenMacroApp\src-tauri\icons\icon.ico') (Join-Path $Staging 'icon.ico') -Force

# --- msi ---------------------------------------------------------------------------------------
Invoke-Step 'Build MSI' {
    # --no-incremental: WiX's up-to-date check ignores the version/staging inputs, so always relink
    dotnet build (Join-Path $PSScriptRoot 'ScreenMacro.Installer.wixproj') -c Release --no-incremental `
        -p:Version=$Version -p:StagingDir=$Staging
}

$msi = Join-Path $PSScriptRoot "out\ScreenMacro-Setup-$Version.msi"
Write-Host "`nDone: $msi" -ForegroundColor Green
