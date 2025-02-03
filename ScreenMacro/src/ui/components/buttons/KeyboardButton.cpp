#include "KeyboardButton.h"

KeyboardButton::KeyboardButton(uint8_t key, bool isConsumerControl, char *label, int16_t x, int16_t y, int16_t w,
                               int16_t h, uint16_t fill) : Button(label, x, y, w, h, fill), _key(key),
                                                           _isConsumerControl(isConsumerControl) {}

void KeyboardButton::onPress() {
    if (_isConsumerControl) {
        UsbManager::getInstance().consumerControl.press(_key);
        UsbManager::getInstance().consumerControl.release();
    } else {
        UsbManager::getInstance().keyboard.write(_key);
    }
}