//
// Created by omer1 on 2/9/2025.
//

#include "TimeLineSlider.h"

TimeLineSlider::TimeLineSlider(int x, int y, int w) {
    _x = x;
    _y = y;
    _w = w;
}

void TimeLineSlider::drawText(uint32_t currentTime, uint32_t totalTime, uint16_t textColor) const {
    static char time[TIME_MAX_LENGTH];
    ScreenManager::getInstance().tft.setTextColor(textColor, TFT_BLACK);
    ScreenManager::getInstance().tft.setTextDatum(MC_DATUM);

    sprintf(time, "%d:%02d", currentTime / 60, currentTime % 60);
    ScreenManager::getInstance().tft.drawString(time, _x - TIME_MARGIN, _y + LINE_HEIGHT / 2, TIME_FONT_SIZE);

    sprintf(time, "%d:%02d", totalTime / 60, totalTime % 60);
    ScreenManager::getInstance().tft.drawString(time, _x + _w + TIME_MARGIN, _y + LINE_HEIGHT / 2, TIME_FONT_SIZE);
}

void TimeLineSlider::update(uint32_t currentTime, uint32_t totalTime) {
    if (_lastCurrentTime == currentTime && _lastTotalTime == totalTime)
        return;

    int lastCircleX = map(_lastCurrentTime, 0, _lastTotalTime, _x, _x + _w);
    ScreenManager::getInstance().tft.fillCircle(lastCircleX, _y + LINE_HEIGHT / 2, CIRCLE_RADIUS, TFT_BLACK);

    int circleX = map(currentTime, 0, totalTime, _x, _x + _w);

    ScreenManager::getInstance().tft.fillRoundRect(_x, _y, circleX - _x, LINE_HEIGHT, LINE_HEIGHT / 2 , TFT_WHITE);
    ScreenManager::getInstance().tft.fillRoundRect(circleX, _y, _w - circleX + _x, LINE_HEIGHT, LINE_HEIGHT / 2 , TFT_DARKGREY);
    ScreenManager::getInstance().tft.fillCircle(circleX, _y + LINE_HEIGHT / 2, CIRCLE_RADIUS, TFT_WHITE);

    drawText(_lastCurrentTime, _lastTotalTime, TFT_BLACK);
    drawText(currentTime, totalTime, TFT_WHITE);

    _lastCurrentTime = currentTime;
    _lastTotalTime = totalTime;
}