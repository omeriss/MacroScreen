#include "ButtonsScreen.h"

ButtonsScreen::ButtonsScreen(std::vector<Button*> *buttons) : _buttons(buttons) {}

void ButtonsScreen::update() {
    for (auto& button : *_buttons) {
        button->update();
    }
}

void ButtonsScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    for (auto& button : *_buttons) {
        button->draw();
    }
}


void ButtonsScreen::setButtons(std::vector<Button *> *buttons) {
    _buttons = buttons;
}
