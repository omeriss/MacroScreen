# Helper invoked by the ScreenMacro MSI (custom actions) as SYSTEM. Lives next to the installed files.
#   Stop        - stop the auto-start task and kill ScreenMacro processes running from this install
#   Register    - create the elevated "at logon" scheduled task and start it
#   Unregister  - remove the scheduled task
#   Purge       - real uninstall only: remove per-user app data and everything left in the install dir
# Keep this file ASCII-only (Windows PowerShell 5.1 reads BOM-less files as ANSI).
param(
    [Parameter(Mandatory)]
    [ValidateSet('Stop', 'Register', 'Unregister', 'Purge')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'

$TaskName   = 'ScreenMacroService'
$InstallDir = $PSScriptRoot
$ServiceExe = Join-Path $InstallDir 'Service\ScreenMacroService.exe'
$AppExe     = Join-Path $InstallDir 'screenmacroapp.exe'

# Per-user folders the app / service create at runtime (see CLAUDE.md):
#   %APPDATA%\ScreenMacroService          - script copies made by "upload" (RunScript looks here)
#   %LOCALAPPDATA%\ScreenMacroService     - service log files (logs\service-yyyyMMdd.log)
#   %LOCALAPPDATA%\com.screenmacroapp.app - lastProjects.json + WebView2 profile
#   %APPDATA%\com.screenmacroapp.app      - Tauri app data (if any)
# The user's project folders (screen.json, images) are never touched.
$UserDataFolders = @(
    'AppData\Roaming\ScreenMacroService',
    'AppData\Local\ScreenMacroService',
    'AppData\Local\com.screenmacroapp.app',
    'AppData\Roaming\com.screenmacroapp.app'
)

function Stop-ScreenMacro {
    try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue } catch { }

    # Only processes started from THIS install, so a dev build elsewhere is left alone
    $prefix = $InstallDir.TrimEnd('\') + '\'
    # WMI (not Get-Process.Path) so the exe path of elevated / 64-bit processes is always readable
    $victims = Get-CimInstance Win32_Process -Filter "Name = 'ScreenMacroService.exe' OR Name = 'screenmacroapp.exe'" |
        Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) }

    foreach ($p in $victims) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }
    foreach ($p in $victims) { Wait-Process -Id $p.ProcessId -Timeout 10 -ErrorAction SilentlyContinue }
}

function Register-Task {
    $action = New-ScheduledTaskAction -Execute $ServiceExe -WorkingDirectory (Split-Path $ServiceExe)

    # Any member of Administrators, when they log on, in their own desktop session (needed for
    # OpenProgram/RunScript/media/FPS), fully elevated with no UAC prompt (RunLevel Highest).
    $trigger   = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -GroupId 'S-1-5-32-544' -RunLevel Highest
    $settings  = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -ExecutionTimeLimit ([TimeSpan]::Zero) `
        -MultipleInstances IgnoreNew `
        -StartWhenAvailable `
        -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

    Register-ScheduledTask -TaskName $TaskName -Force `
        -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
        -Description 'Starts the ScreenMacro service elevated when an administrator logs on.' | Out-Null

    # Bring the service up now instead of waiting for the next logon. Not fatal: with nobody
    # logged on (e.g. a remote/silent install) it simply starts at the next logon.
    try { Start-ScheduledTask -TaskName $TaskName } catch { }
}

function Unregister-Task {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
}

function Remove-UserData {
    $profiles = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\*' -ErrorAction SilentlyContinue |
        Where-Object { $_.ProfileImagePath -and (Test-Path -LiteralPath $_.ProfileImagePath) } |
        ForEach-Object { [Environment]::ExpandEnvironmentVariables($_.ProfileImagePath) }

    foreach ($profile in $profiles) {
        foreach ($folder in $UserDataFolders) {
            Remove-Item -LiteralPath (Join-Path $profile $folder) -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Remove-InstallDirContents {
    # Sanity check so a wrong INSTALLFOLDER override can never delete an unrelated directory
    $looksInstalled = (Test-Path -LiteralPath $ServiceExe) -or (Test-Path -LiteralPath $AppExe)
    if ((Split-Path $InstallDir -Leaf) -ne 'ScreenMacro' -or -not $looksInstalled) { return }

    # Everything except this script; the MSI removes the script and the (now empty) folders itself
    Get-ChildItem -LiteralPath $InstallDir -Force |
        Where-Object { $_.FullName -ne $PSCommandPath } |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

switch ($Action) {
    'Stop'       { Stop-ScreenMacro }
    'Register'   { Register-Task }
    'Unregister' { Unregister-Task }
    'Purge'      { Remove-UserData; Remove-InstallDirContents }
}
