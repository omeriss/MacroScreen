//
// Created by omer1 on 12/13/2024.
//

#include "Screen.h"

Screen::Screen(ScreenManager &screenManager, std::vector<Button*> *buttons) : _buttons(buttons), _screenManager(screenManager) {}

Screen::Screen(ScreenManager &screenManager) : _screenManager(screenManager) {

}


void Screen::update() {
    for (auto& button : *_buttons) {
        button->update();
    }
}

void Screen::draw() {
    _screenManager.tft.fillScreen(TFT_BLACK);

    for (auto& button : *_buttons) {
        button->draw();
    }
}


void Screen::setButtons(std::vector<Button *> *buttons) {
    _buttons = buttons;
}
