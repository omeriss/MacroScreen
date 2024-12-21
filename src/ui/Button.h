#pragma once

#include "TFT_eSPI.h"
#include "utils/ScreenManager.h"
#include <vector>
#include "config.h"

class Button {
public:
    Button(ScreenManager& screenManager, char* label, uint16_t color, int index);
    void update();
    void draw();
    virtual void onPress(){};
protected:
    TFT_eSPI_Button _button;
    ScreenManager& _screenManager;
};