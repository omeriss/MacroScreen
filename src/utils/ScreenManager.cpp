#include "ScreenManager.h"

ScreenManager::ScreenManager() {
}

#ifdef TOUCH_CS
void ScreenManager::calibrate() {
    uint16_t calData[CALIBRATION_ARRAY_SIZE];

    if (!SPIFFS.begin()) {
        SPIFFS.format();
        SPIFFS.begin();
    }

    if (SPIFFS.exists(CALIBRATION_FILE)) {
#if REPEAT_CAL
        SPIFFS.remove(CALIBRATION_FILE);
#else
        File f = SPIFFS.open(CALIBRATION_FILE, "r");

        if (f) {
            if (f.readBytes((char *) calData, CALIBRATION_ARRAY_SIZE * sizeof(uint16_t)) ==
                CALIBRATION_ARRAY_SIZE * sizeof(uint16_t)) {
                tft.setTouch(calData);
                f.close();

                return;
            }

            f.close();
        }
#endif
    }

    tft.fillScreen(TFT_BLACK);
    tft.setCursor(20, 0);
    tft.setTextFont(2);
    tft.setTextSize(1);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);

    tft.println("Touch corners as indicated");

    tft.setTextFont(1);
    tft.println();

    tft.calibrateTouch(calData, TFT_MAGENTA, TFT_BLACK, 15);

    tft.setTextColor(TFT_GREEN, TFT_BLACK);
    tft.println("Calibration complete!");

    File f = SPIFFS.open(CALIBRATION_FILE, "w");

    if (f) {
        f.write((const unsigned char *) calData, CALIBRATION_ARRAY_SIZE * sizeof(uint16_t));
        f.close();
    }
}

void ScreenManager::updateTouch() {
    _pressed = tft.getTouch(&_pressX, &_pressY);
}
#endif
#ifndef TOUCH_CS
// calibrate
void ScreenManager::calibrate() {
//    tft.fillScreen(TFT_BLACK);
//    tft.setCursor(20, 0);
//    tft.setTextFont(2);
//    tft.setTextSize(1);
//    tft.setTextColor(TFT_WHITE, TFT_BLACK);
//
//    tft.println("Touch corners as indicated");
//
//    tft.setTextFont(1);
//    tft.println();
//
//    uint16_t size = 20;
//    uint16_t color_bg = TFT_BLACK;
//    uint16_t color_fg = TFT_WHITE;
//    uint16_t _height = tft.height();
//    uint16_t _width = tft.width();
//
//
//    int16_t values[] = {0,0,0,0,0,0,0,0};
//    uint16_t x_tmp, y_tmp;
//
//
//
//    for(uint8_t i = 0; i<4; i++) {
//        tft.fillRect(0, 0, size + 1, size + 1, color_bg);
//        tft.fillRect(0, _height - size - 1, size + 1, size + 1, color_bg);
//        tft.fillRect(_width - size - 1, 0, size + 1, size + 1, color_bg);
//        tft.fillRect(_width - size - 1, _height - size - 1, size + 1, size + 1, color_bg);
//
//        if (i == 5) break; // used to clear the arrows
//
//        switch (i) {
//            case 0: // up left
//                tft.drawLine(0, 0, 0, size, color_fg);
//                tft.drawLine(0, 0, size, 0, color_fg);
//                tft.drawLine(0, 0, size, size, color_fg);
//                break;
//            case 1: // bot left
//                tft.drawLine(0, _height - size - 1, 0, _height - 1, color_fg);
//                tft.drawLine(0, _height - 1, size, _height - 1, color_fg);
//                tft.drawLine(size, _height - size - 1, 0, _height - 1, color_fg);
//                break;
//            case 2: // up right
//                tft.drawLine(_width - size - 1, 0, _width - 1, 0, color_fg);
//                tft.drawLine(_width - size - 1, size, _width - 1, 0, color_fg);
//                tft.drawLine(_width - 1, size, _width - 1, 0, color_fg);
//                break;
//            case 3: // bot right
//                tft.drawLine(_width - size - 1, _height - size - 1, _width - 1, _height - 1, color_fg);
//                tft.drawLine(_width - 1, _height - 1 - size, _width - 1, _height - 1, color_fg);
//                tft.drawLine(_width - 1 - size, _height - 1, _width - 1, _height - 1, color_fg);
//                break;
//        }
//
//        // user has to get the chance to release
//        if (i > 0) delay(2000);
//
//        for (uint8_t j = 0; j < 8; j++) {
//            // Use a lower detect threshold as corners tend to be less sensitive
//            while (!ts.touched());
//            TS_Point p = ts.getPoint();
//
//            values[i * 2] += p.x;
//            values[i * 2 + 1] += p.y;
//        }
//        values[i * 2] /= 8;
//        values[i * 2 + 1] /= 8;
//    }
//
//    // print all the values
//    for (uint8_t i = 0; i < 8; i++) {
//        Serial.print(values[i]);
//        Serial.print(" ");
//    }
}

void ScreenManager::updateTouch() {
    if (!ts.touched()) {
        _pressed = false;
        return;
    }

    TS_Point p = ts.getPoint();
    _pressed = true;
    _pressX = tft.width() - p.y;
    _pressY = p.x;
}



#endif

uint16_t ScreenManager::getPressY() const {
    return _pressY;
}

uint16_t ScreenManager::getPressX() const {
    return _pressX;
}

bool ScreenManager::isPressed() const {
    return _pressed;
}

void ScreenManager::setup() {
    tft.init();
    tft.setRotation(3);

    bool touchStarted = false;

    while (!touchStarted) {
        touchStarted = ts.begin(TOUCH_THRESHOLD, 21, 22);

        if (!touchStarted) {
            Serial.println("Couldn't start FT6206 touchscreen controller");
        }
    }
}
