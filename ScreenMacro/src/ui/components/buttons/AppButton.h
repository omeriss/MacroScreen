#pragma once

#include "Button.h"
#include "utils/UsbManager.h"

class AppButton : public Button {
public:
    AppButton(char* path, char* label, uint16_t color, int index);
    void onPress() override;

private:
    char* _path;
};