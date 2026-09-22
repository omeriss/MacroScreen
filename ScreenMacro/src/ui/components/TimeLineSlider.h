#pragma once

#include "utils/ScreenManager.h"
#include "config.h"

#define LINE_HEIGHT 6
#define CIRCLE_RADIUS 6
#define TIME_MARGIN 20
#define TIME_MAX_LENGTH 12
#define TIME_FONT_SIZE 2

class TimeLineSlider {
public:
    TimeLineSlider(int x, int y, int w);

    void update(uint32_t currentTime, uint32_t totalTime);
private:
    void drawText(uint32_t currentTime, uint32_t totalTime, uint16_t textColor) const;

    int _x, _y, _w;
    uint32_t _lastCurrentTime = 0;
    uint32_t _lastTotalTime = 0;
};