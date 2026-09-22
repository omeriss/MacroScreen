//
// Created by omer1 on 2/9/2025.
//

#include "ToggleButton.h"

ToggleButton::ToggleButton(const char *offLabel, const char *onLabel, int16_t x, int16_t y, int16_t w, int16_t h,
                           uint16_t fill, std::function<void(bool)> onToggle) : Button(offLabel, x, y, w, h, fill),
                                                                               _otherLabel(onLabel), _onToggle(onToggle) {}

ToggleButton::ToggleButton(const char *offLabel, const char *onLabel, int16_t x, int16_t y, int16_t w, int16_t h,
                           uint16_t fill, uint16_t outlineColor, uint16_t textColor,
                           std::function<void(bool)> onToggle) : Button(offLabel, x, y, w, h, fill, outlineColor, textColor),
                                                               _otherLabel(onLabel), _onToggle(onToggle) {}

void ToggleButton::onPress() {
    _state = !_state;
    _onToggle(_state);
    _label.swap(_otherLabel);
}

void ToggleButton::setState(bool state) {
    if (state == _state)
        return;

    _label.swap(_otherLabel);
    _state = state;
    draw();
}
