#pragma once

#include <vector>
#include "Screen.h"
#include <TFT_eWidget.h>
#include "ui/components/StatClock.h"
#include "config.h"

class GamingScreen: public Screen {
public:
    GamingScreen(std::function<void()> exit);
    void update() override;
    void draw() override;
private:
    bool _checkDoubleTap();

    StatClock _cpu;
    StatClock _gpu;
    StatClock _ram;
    std::function<void()> _exit;
    unsigned long _lastPress = 0;
    bool _lifted = false;
};