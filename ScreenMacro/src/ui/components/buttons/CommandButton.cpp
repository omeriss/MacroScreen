#include "CommandButton.h"

CommandButton::CommandButton(CommandType type, const uint8_t *data, uint32_t _size, const char *label, int16_t x, int16_t y,
                             int16_t w, int16_t h, uint16_t fill) :
        Button(label, x, y, w, h, fill), _type(type),  _size(_size) {
    _data = new uint8_t[_size];
    memcpy(_data, data, _size);
}

CommandButton::CommandButton(Command command, const char *label, int16_t x, int16_t y, int16_t w, int16_t h,
                             uint16_t fill) :
        CommandButton(command.type, command.payload, command.length, label, x, y, w, h, fill) {
}


void CommandButton::onPress() {
    UsbManager::getInstance().sendCommand(_type, _data, _size);
}
