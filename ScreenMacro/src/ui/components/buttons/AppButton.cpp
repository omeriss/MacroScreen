#include "AppButton.h"


AppButton::AppButton(char *path, char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill) :
        Button(label, x, y, w, h, fill), _path(path) {}

void AppButton::onPress() {
    UsbManager::getInstance().sendCommand(CommandType::OpenProgram, (uint8_t *) _path, strlen(_path));
}