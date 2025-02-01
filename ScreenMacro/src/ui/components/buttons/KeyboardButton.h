#pragma once

#include "Button.h"
#include "utils/UsbManager.h"

class KeyboardButton : public Button {
public:
    KeyboardButton(uint8_t key, bool _isConsumerControl, char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);
    void onPress() override;

private:
    uint16_t _key;
    bool _isConsumerControl;
};