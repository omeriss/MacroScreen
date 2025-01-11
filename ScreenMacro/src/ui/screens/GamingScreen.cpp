#include "GamingScreen.h"

GamingScreen::GamingScreen(std::function<void()> exit) :
_cpu(0, 100, "%", "CPU", 60 + 30, 100, 60, TFT_GREEN),
_gpu(0, 100, "%", "GPU", 60 + 30 * 2 + 120, 100, 60, TFT_BLUE),
_ram(0, 100, "%", "RAM", 60 + 30 * 3 + 120 * 2, 100, 60, TFT_RED),
_exit(exit)
{
}

bool GamingScreen::_checkDoubleTap() {
    bool pressed = ScreenManager::getInstance().isPressed();

    if (pressed) {
        if (_lifted && millis() - _lastPress < DOUBLE_TAP_THRESHOLD) {
            _exit();
            return true;
        }
        else {
            _lifted = false;
            _lastPress = millis();
        }
    }
    else
        _lifted = true;

    return false;
}


void GamingScreen::update() {
    if(_checkDoubleTap()) return;

    static unsigned long lastUpdate = 0;

    if (millis() - lastUpdate < 1000) return;

    lastUpdate = millis();

    // random val between 0 and 99
    _cpu.update(random(100));
    _gpu.update(random(100));
    _ram.update(random(100));
}

void GamingScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    _cpu.draw();
    _gpu.draw();
    _ram.draw();
}