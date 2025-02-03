#include "GamingScreen.h"

#define TEXT_PADDING 30

GamingScreen::GamingScreen(std::function<void()> exit) :
_cpu(0, 100, "%", "CPU", 60 + 30, 100, 60, TFT_GREEN),
_gpu(0, 100, "%", "GPU", 60 + 30 * 2 + 120, 100, 60, TFT_BLUE),
_ram(0, 100, "%", "RAM", 60 + 30 * 3 + 120 * 2, 100, 60, TFT_RED),
_exit(exit)
{
    _type = GAMING;
}

void GamingScreen::update() {
    if(checkDoubleTap(_lastPress, _lifted)) {
        _exit();
        return;
    }
}

void GamingScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    _cpu.draw();
    _gpu.draw();
    _ram.draw();

    ScreenManager::getInstance().tft.setTextDatum(TC_DATUM);
    ScreenManager::getInstance().tft.setFreeFont(FONT);
    ScreenManager::getInstance().tft.setTextSize(1);
    ScreenManager::getInstance().tft.setTextColor(TFT_YELLOW, TFT_BLACK);

    ScreenManager::getInstance().tft.drawString("FPS", SCREEN_WIDTH / 2, SCREEN_HEIGHT - TEXT_PADDING);

    UsbManager::getInstance().sendCommand(CommandType::StartStatistics, nullptr, 0);
}

void GamingScreen::setStatistics(int cpu, int gpu, int ram, uint16_t fps) {
    _cpu.update(cpu);
    _gpu.update(gpu);
    _ram.update(ram);


    ScreenManager::getInstance().tft.setTextColor(TFT_WHITE, TFT_BLACK);
    ScreenManager::getInstance().tft.setTextDatum(TC_DATUM);
    ScreenManager::getInstance().tft.setFreeFont(FONT);
    ScreenManager::getInstance().tft.setTextSize(1);

    ScreenManager::getInstance().tft.fillRect(SCREEN_WIDTH / 2 - TEXT_PADDING, SCREEN_HEIGHT - TEXT_PADDING * 3, TEXT_PADDING * 2, TEXT_PADDING * 2, TFT_BLACK);

    ScreenManager::getInstance().tft.drawNumber(fps, SCREEN_WIDTH / 2, SCREEN_HEIGHT - TEXT_PADDING * 2);



}
