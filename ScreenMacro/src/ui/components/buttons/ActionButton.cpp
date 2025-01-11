#include "ActionButton.h"

ActionButton::ActionButton(std::function<void()> buttonAction, char* label, uint16_t color, int index):
Button(label, color, index), _buttonAction(buttonAction) {
}


void ActionButton::onPress() {
    _buttonAction();
}