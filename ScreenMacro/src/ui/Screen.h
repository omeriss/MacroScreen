#pragma once

#include <vector>
#include "Button.h"

class Screen {
public:
    explicit Screen(std::vector<Button*> *buttons);
    Screen() = default;
    void update();
    void draw();
    void setButtons(std::vector<Button*>* buttons);
private:
    std::vector<Button*>* _buttons;
};