#pragma once

#include <vector>
#include "Screen.h"
#include <TFT_eWidget.h>
#include "ui/components/StatClock.h"
#include "config.h"
#include "utils/UsbManager.h"
#include "utils/TouchUtils.h"

#define NAME_MAX_LENGTH 20

class GamingScreen: public Screen {
public:
    GamingScreen(std::function<void()> exit);
    void update() override;
    void draw() override;
    void setStatistics(int cpu, int gpu, int ram, uint16_t fps);
private:
    StatClock _cpu;
    StatClock _gpu;
    StatClock _ram;
    std::function<void()> _exit;
    unsigned long _lastPress = 0;
    bool _lifted = false;
    uint8_t _gameName[NAME_MAX_LENGTH];
};