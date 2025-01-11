#include "KeyboardButton.h"

KeyboardButton::KeyboardButton(uint8_t key, char* label, uint16_t color, int index, bool isConsumerControl)
: Button(label, color, index), _key(key), _isConsumerControl(isConsumerControl) {}

void KeyboardButton::onPress() {
    if (_isConsumerControl) {
        UsbManager::getInstance().consumerControl.press(_key);
        UsbManager::getInstance().consumerControl.release();
    } else {
        UsbManager::getInstance().keyboard.write(_key);
    }
}