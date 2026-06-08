#include "ActionButton.h"

ActionButton::ActionButton(std::function<void()> buttonAction, const char *label, int16_t x, int16_t y, int16_t w, int16_t h,
                           uint16_t fill) : Button(label, x, y, w, h, fill), _buttonAction(buttonAction) {}


ActionButton::ActionButton(std::function<void()> buttonAction, const char *label, int16_t x, int16_t y, int16_t w,
                           int16_t h, uint16_t fill, uint16_t outlineColor, uint16_t textColor)
                           : Button(label, x, y, w, h, fill, outlineColor, textColor), _buttonAction(buttonAction) {}



void ActionButton::onPress() {
    _buttonAction();
}
