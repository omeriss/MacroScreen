#include "ScreenManager.h"

ScreenManager::ScreenManager() = default;

void ScreenManager::updateTouch() {
    if (!ts.touched()) {
        _pressed = false;
        return;
    }

    TS_Point p = ts.getPoint();
    _pressed = true;
    _pressX = p.y;
    _pressY = tft.height() - p.x;
}

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
    gpio_hold_dis((gpio_num_t)BACKLIGHT_PIN);
    gpio_reset_pin((gpio_num_t)BACKLIGHT_PIN);

    tft.init();
    tft.setRotation(1);

    while (!ts.begin(TOUCH_THRESHOLD, SDA_PIN, SCL_PIN)) {}
}

void ScreenManager::turnOnBacklight() {
    pinMode(BACKLIGHT_PIN, OUTPUT);
    digitalWrite(BACKLIGHT_PIN, HIGH);
}

void ScreenManager::turnOffBacklight() {
    pinMode(BACKLIGHT_PIN, OUTPUT);
    digitalWrite(BACKLIGHT_PIN, LOW);
}

void ScreenManager::sleep() {
    turnOffBacklight();
    gpio_hold_en((gpio_num_t)BACKLIGHT_PIN);
    pinMode(SCREEN_INT_PIN, INPUT_PULLUP);
    esp_sleep_enable_ext0_wakeup((gpio_num_t)SCREEN_INT_PIN, LOW);
    tft.fillScreen(TFT_BLACK);
    esp_deep_sleep_start();
}
