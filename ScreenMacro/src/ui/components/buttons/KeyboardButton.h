#pragma once

#include "Button.h"
#include "utils/UsbManager.h"

class KeyboardButton : public Button {
public:
    KeyboardButton(uint8_t* keys, uint8_t length, const char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);
    void onPress() override;

private:
    uint8_t* _keys;
    uint8_t _length;
};