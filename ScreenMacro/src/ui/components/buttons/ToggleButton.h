#pragma once

#include "Button.h"
#include "ui/screens/Screen.h"
#include <functional>

class ToggleButton : public Button {
public:

    ToggleButton(const char *offLabel, const char *onLabel, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill, std::function<void(bool)> onToggle);
    ToggleButton(const char *offLabel, const char *onLabel, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill, uint16_t outlineColor, uint16_t textColor, std::function<void(bool)> onToggle);
    void onPress() override;
    void setState(bool state);
private:
    bool _state = false;
    std::string _otherLabel;
    std::function<void(bool)> _onToggle;
};