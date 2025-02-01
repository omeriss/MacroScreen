#pragma once

#include "Button.h"
#include "ui/screens/Screen.h"
#include <functional>

class ActionButton : public Button {
public:
    ActionButton(std::function<void()> buttonAction, char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);
    void onPress() override;
private:
    std::function<void()> _buttonAction;
};
