#include "ButtonsScreen.h"

ButtonsScreen::ButtonsScreen(std::vector<Button*> *buttons, std::function<void()> exit) : _buttons(buttons), _exit(std::move(exit)) {
    _type = ScreenType::NONE;
}

#define FOR_EACH_BUTTON_ON_PAGE(page, buttons, action) \
    for (int i = (page) * (BUTTONS_PER_SCREEN); i < (buttons)->size() && i < ((page) + 1) * (BUTTONS_PER_SCREEN); i++) { \
        action; \
    }


void ButtonsScreen::update() {
    auto swipe = checkSwipe();

    if (swipe == SWIPE_LEFT) {
        if (page == 0) {
            if (_exit)
                _exit();
        } else {
            page--;
            draw();
        }
    } else if (swipe == SWIPE_RIGHT && page < _buttons->size() / BUTTONS_PER_SCREEN) {
        page++;
        draw();
    }
    else
        FOR_EACH_BUTTON_ON_PAGE(page, _buttons, (*_buttons)[i]->update());
}

void ButtonsScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    FOR_EACH_BUTTON_ON_PAGE(page, _buttons, (*_buttons)[i]->draw());
}


void ButtonsScreen::setButtons(std::vector<Button *> *buttons) {
    _buttons = buttons;
}

void ButtonsScreen::setExit(std::function<void()> exit) {
    _exit = std::move(exit);
}
