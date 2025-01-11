#pragma once

#include "Button.h"
#include "utils/UsbManager.h"

class KeyboardButton : public Button {
public:
    KeyboardButton(uint8_t key, char* label, uint16_t color, int index, bool _isConsumerControl = false);
    void onPress() override;

private:
    uint16_t _key;
    bool _isConsumerControl;
};