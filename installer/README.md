# ScreenMacro installer

WiX v5 MSI (per-machine, x64). Restores from NuGet on first build; only the .NET SDK is needed.

## Build

```powershell
cd installer
.\build.ps1                  # version from version.txt
.\build.ps1 -Version 1.2.0   # explicit version (also saved to version.txt)
.\build.ps1 -SkipApp         # reuse staging\screenmacroapp.exe (faster when only the service changed)
```

Output: `installer\out\ScreenMacro-Setup-<version>.msi`. Steps: publish the service (self-contained win-x64)
to `staging\service`, `npm run tauri build -- --no-bundle` for the app, then `dotnet build` of the wixproj.

## What the MSI does

|               |                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files         | `C:\Program Files\ScreenMacro\screenmacroapp.exe`, `Service\ScreenMacroService.exe` (+ runtime), `Setup.ps1`                                                                                                                                                                                                                                            |
| Shortcuts     | Desktop and Start Menu "ScreenMacro" (all users)                                                                                                                                                                                                                                                                                                        |
| PATH          | Adds `...\ScreenMacro\Service` to the system PATH, so `ScreenMacroService.exe` resolves by bare name (what `lib.rs` uses)                                                                                                                                                                                                                               |
| Auto-start    | Scheduled task `ScreenMacroService`: at logon of an Administrators-group user, `RunLevel Highest` (elevated, no UAC prompt), restarts on failure, started once right after install                                                                                                                                                                      |
| App elevation | `HKLM\...\AppCompatFlags\Layers` = `~ RUNASADMIN` for `screenmacroapp.exe` (the app must be elevated to kill/restart the elevated service)                                                                                                                                                                                                              |
| Logs          | The Release service has no console window; it logs (Serilog) to `%LOCALAPPDATA%\ScreenMacroService\logs\service-yyyyMMdd.log` (one file per day, 14 files kept, 20 MB each)                                                                                                                                                                             |
| Uninstall     | Stops processes, removes the task, files, shortcuts, PATH entry, the RunAsAdmin flag, ARP entry, and the per-user app data (`%APPDATA%\ScreenMacroService`, `%LOCALAPPDATA%\ScreenMacroService` incl. logs, `%LOCALAPPDATA%\com.screenmacroapp.app`, `%APPDATA%\com.screenmacroapp.app`). **Project folders (screen.json / images) are never touched.** |

## Releasing a new version

1. Bump `version.txt` (or pass `-Version`). MSI only compares `MAJOR.MINOR.PATCH`.
2. `.\build.ps1`
3. Run the new MSI. It finds the old install through the fixed `UpgradeCode`, runs the old version's uninstall
   steps (stop, remove the task and files, but keep app data), then installs the new one. Installing an older
   version over a newer one is blocked. Installing the same version again just repairs/replaces.

**Never change `UpgradeCode` in `Package.wxs`**, or new installers stop replacing old ones.

## Silent install / uninstall (elevated shell)

```powershell
msiexec /i ScreenMacro-Setup-1.2.0.msi /qn /l*v install.log
msiexec /x ScreenMacro-Setup-1.2.0.msi /qn /l*v uninstall.log
```
