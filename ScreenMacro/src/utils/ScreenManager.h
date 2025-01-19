#pragma once

#include <Arduino.h>
#include "FS.h"
#include "../../lib/FT6236/FT6236.h"
#include <SPI.h>
#include <TFT_eSPI.h>
#include "config.h"

class ScreenManager {
public:
    ScreenManager(const ScreenManager&) = delete;
    ScreenManager& operator=(const ScreenManager&) = delete;

    static ScreenManager& getInstance() {
        static ScreenManager instance;
        return instance;
    }

    void setup();
    void updateTouch();
    bool isPressed() const;
    uint16_t getPressX() const;
    uint16_t getPressY() const;
    static void turnOnBacklight();
    static void turnOffBacklight();
    void sleep();

    TFT_eSPI tft;
private:
    FT6236 ts = FT6236();
    bool _pressed = false;
    uint16_t _pressX = 0;
    uint16_t _pressY = 0;

    ScreenManager();
};
