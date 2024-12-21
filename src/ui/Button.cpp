#include "Button.h"

Button::Button(ScreenManager& screenManager, char *label, uint16_t color, int index) : _screenManager(screenManager){

    int row = index / BUTTON_ROWS;
    int col = index % BUTTON_COLS;

    _button.initButton(&_screenManager.tft, BUTTON_START_X + col * (BUTTON_W + BUTTON_SPACING_X),
                       BUTTON_START_Y + row * (BUTTON_H + BUTTON_SPACING_Y),
                      BUTTON_W, BUTTON_H, TFT_WHITE, color, TFT_WHITE,
                      label, BUTTON_TEXT_SIZE);
}


void Button::update() {
    _screenManager.tft.setFreeFont(FONT);

    _button.press(
            _screenManager.isPressed() && _button.contains(_screenManager.getPressX(), _screenManager.getPressY()));

    if (_button.justReleased()) _button.drawButton();

    if (!_button.justPressed()) return;

    _button.drawButton(true);
    onPress();

    delay(10); // debounce
}

void Button::draw() {
    _screenManager.tft.setFreeFont(FONT);
    _button.drawButton();
}
