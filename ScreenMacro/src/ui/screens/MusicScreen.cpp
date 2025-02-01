#include "MusicScreen.h"

MusicScreen::MusicScreen(std::function<void()> exit) : _exit(exit) {
    // create button
    _buttons.push_back(Button("/next.png", 330, 200, 60, 60, TFT_BLACK, TFT_BLACK, 0x0841));
    _buttons.push_back(Button("/pause.png", 230, 200, 60, 60, TFT_BLACK, TFT_BLACK, 0x0841));
    _buttons.push_back(Button("/play.png", 130, 200, 60, 60, TFT_BLACK, TFT_BLACK, 0x0841));
    _buttons.push_back(Button("/prev.png", 30, 200, 60, 60, TFT_BLACK, TFT_BLACK, 0x0841));

}

void MusicScreen::update() {
    if(checkDoubleTap(_lastPress, _lifted)) {
        _exit();
        return;
    }

    for(auto &button : _buttons) {
        button.update();
    }
}

void MusicScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    for(auto &button : _buttons) {
        button.draw();
    }
}