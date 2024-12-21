#pragma once

#include <Arduino.h>
#include "FS.h"
#include "../../lib/FT6236/FT6236.h"
#include <SPI.h>
#include <TFT_eSPI.h>
#include "config.h"

#define CALIBRATION_FILE "/CalData"
#define CALIBRATION_ARRAY_SIZE 5
#define REPEAT_CAL false

class ScreenManager {
public:
    void setup();
    ScreenManager();
    void calibrate();
    void updateTouch();
    bool isPressed() const;
    uint16_t getPressX() const;
    uint16_t getPressY() const;
    TFT_eSPI tft;
private:
    FT6236 ts = FT6236();
    bool _pressed = false;
    uint16_t _pressX = 0;
    uint16_t _pressY = 0;
};
