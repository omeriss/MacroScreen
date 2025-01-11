#include "AppButton.h"


AppButton::AppButton(char* path, char* label, uint16_t color, int index): Button(label, color, index), _path(path) {
}

void AppButton::onPress() {
    UsbManager::getInstance().sendCommand(CommandType::OpenProgram, (uint8_t*)_path, strlen(_path));
}