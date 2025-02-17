#pragma once

#include "Button.h"
#include "utils/UsbManager.h"

class AppButton : public Button {
public:
    AppButton(const char *path, const char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);

    void onPress() override;

private:
    const char *_path;
};