//
// Created by omer1 on 12/13/2024.
//

#include "Screen.h"

Screen::Screen(std::vector<Button*> *buttons) : _buttons(buttons) {}

void Screen::update() {
    for (auto& button : *_buttons) {
        button->update();
    }
}

void Screen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    for (auto& button : *_buttons) {
        button->draw();
    }
}


void Screen::setButtons(std::vector<Button *> *buttons) {
    _buttons = buttons;
}
