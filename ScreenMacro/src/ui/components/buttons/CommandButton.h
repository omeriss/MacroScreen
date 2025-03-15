#pragma once

#include "Button.h"
#include "utils/UsbManager.h"

class CommandButton : public Button {
public:
    CommandButton(CommandType type, const uint8_t* data, uint32_t _size, const char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);
    CommandButton(Command command, const char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);

    void onPress() override;

private:
    CommandType _type;
    uint8_t *_data;
    uint32_t _size;
};