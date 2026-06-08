#include "KeyboardButton.h"

KeyboardButton::KeyboardButton(uint8_t* keys, uint8_t length, const char *label, int16_t x, int16_t y, int16_t w,
                               int16_t h, uint16_t fill) : Button(label, x, y, w, h, fill), _keys(keys),
                                                           _length(length) {}

void KeyboardButton::onPress() {
    for (int i = 0; i < _length; i++) {
        UsbManager::getInstance().keyboard.press(_keys[i]);
    }

    UsbManager::getInstance().keyboard.releaseAll();
}