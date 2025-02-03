#include "StatClock.h"


StatClock::StatClock(int min, int max, char *unit, char *label, int x, int y, int r, uint32_t color) :
_min_value(min), _max_value(max), _unit(unit), _label(label), _x(x), _y(y), _r(r), _color(color) {
    _value = min;
}

int StatClock::calcAngle(int value) {
    return map(value, _min_value, _max_value, ANGLE_GAP, 360 - ANGLE_GAP);
}

void StatClock::drawText(uint32_t textColor) {
    auto &screenManager = ScreenManager::getInstance();

    screenManager.tft.setTextColor(textColor, TFT_BLACK);
    screenManager.tft.setTextDatum(MC_DATUM);
    screenManager.tft.setFreeFont(FONT_BOLD);
    screenManager.tft.setTextSize(2);
    screenManager.tft.drawNumber(_value, _x, _y - 10);
}

void StatClock::draw() {
    auto &screenManager = ScreenManager::getInstance();

    int angle = calcAngle(_value);

    // draw arc
    screenManager.tft.drawArc(_x, _y, _r + BORDER_MARGIN, _r - SLIDER_THICKNESS - BORDER_MARGIN, ANGLE_GAP - BORDER_MARGIN, 360 - ANGLE_GAP + BORDER_MARGIN, TFT_LIGHTGREY, TFT_BLACK);
    screenManager.tft.drawArc(_x, _y, _r, _r - SLIDER_THICKNESS, ANGLE_GAP, angle, _color, TFT_LIGHTGREY);
    screenManager.tft.drawArc(_x, _y, _r, _r - SLIDER_THICKNESS, angle, 360 - ANGLE_GAP, TFT_BLACK, TFT_LIGHTGREY);

    drawText(TFT_WHITE);

    screenManager.tft.setFreeFont(FONT);
    screenManager.tft.setTextSize(1);
    screenManager.tft.drawString(_unit, _x, _y + 30);

    screenManager.tft.setTextColor(TFT_WHITE, TFT_BLACK);
    screenManager.tft.setTextDatum(TC_DATUM);
    screenManager.tft.setFreeFont(FONT);
    screenManager.tft.setTextSize(1);
    screenManager.tft.drawString(_label, _x, _y + _r + 10);

}

void StatClock::update(int value) {
    // delete old value
    auto &screenManager = ScreenManager::getInstance();

    if (_value == value) return;

    int oldAngle = calcAngle(_value);
    int newAngle = calcAngle(value);

    if (newAngle > oldAngle)
        screenManager.tft.drawArc(_x, _y, _r, _r - SLIDER_THICKNESS, ANGLE_GAP, newAngle, _color, TFT_LIGHTGREY);
    else
        screenManager.tft.drawArc(_x, _y, _r, _r - SLIDER_THICKNESS, newAngle, 360 - ANGLE_GAP, TFT_BLACK, TFT_LIGHTGREY);

    drawText(TFT_BLACK);
    _value = value;
    drawText(TFT_WHITE);
}

int StatClock::getValue() {
    return _value;
}
