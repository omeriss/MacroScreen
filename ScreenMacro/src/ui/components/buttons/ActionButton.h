#pragma once

#include "Button.h"
#include "ui/screens/Screen.h"
#include <functional>

class ActionButton : public Button {
public:
    ActionButton(std::function<void()> buttonAction, char* label, uint16_t color, int index);
    void onPress() override;
private:
    std::function<void()> _buttonAction;
};
