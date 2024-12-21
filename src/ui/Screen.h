#pragma once

#include <vector>
#include "Button.h"

class Screen {
public:
    Screen(ScreenManager& screenManager, std::vector<Button*> *buttons);
    Screen(ScreenManager& screenManager);
    void update();
    void draw();
    void setButtons(std::vector<Button*>* buttons);
private:
    std::vector<Button*>* _buttons;
    ScreenManager& _screenManager;
};