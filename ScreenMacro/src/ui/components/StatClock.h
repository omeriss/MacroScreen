#pragma once

#include "utils/ScreenManager.h"
#include "config.h"

#define BORDER_MARGIN 2
#define SLIDER_THICKNESS 8
#define ANGLE_GAP 30

class StatClock {
public:
    StatClock(int min, int max, char* unit, char* label, int x, int y, int r, u_int32_t color);
    void draw();
    void update(int value);
    int getValue();
private:
    int calcAngle(int value);
    void drawText(uint32_t textColor);

    int _min_value;
    int _max_value;
    int _value;
    char* _unit;
    char* _label;
    int _x;
    int _y;
    int _r;
    u_int32_t _color;

};