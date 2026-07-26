# Macro Deck

This is DIY clone for stream deck using esp32 board and a tft screen

This is made to work with 480x320 4 inch tft screen, if you use any other screen, you might need to change some configurations.

## Project structure

| Folder                | What it is                                                                       |
| --------------------- | -------------------------------------------------------------------------------- |
| `ScreenMacro/`        | the firmware that runs on the ESP32-S3 (PlatformIO)                              |
| `ScreenMacroService/` | .NET background service that runs on the PC and talks to the device over USB     |
| `ScreenMacroApp/`     | the desktop app (Tauri + React) you use to edit the layout                       |
| `installer/`          | builds the Windows installer that installs the app + service together, see below |
| `Case/`               | 3D-print STLs for the enclosure                                                  |

## Installer

Instead of building and running each part by hand, `installer/` builds a single Windows installer (`.msi`) that:

- installs the app and the service to `C:\Program Files\ScreenMacro`
- adds a desktop + start menu shortcut for the app
- makes the service start automatically (elevated) whenever you log in, so it's always running in the background

To build it yourself:

```
cd installer
.\build.ps1
```

This produces `installer\out\ScreenMacro-Setup-<version>.msi`.

## Wiring

in order to connect the tft screen (ILI9488, SPI) connect:

```
VDD -> 3.3V
GND -> GND
CS  -> GPIO 10
RST -> GPIO 6
DC  -> GPIO 7
SDI (MOSI) -> GPIO 11
SCK        -> GPIO 12
SDO (MISO) -> not connected (unused)
BL  -> GPIO 14
```

the touch panel is capacitive (FT6236, I2C):

```
VCC -> 3.3V
GND -> GND
SDA -> GPIO 4
SCL -> GPIO 5
INT -> GPIO 8
```

if you're using a different screen/pinout, these are all defined in `ScreenMacro/include/tftSetup.h` (TFT pins) and `ScreenMacro/src/config.h` (touch + backlight pins) - change them there.
