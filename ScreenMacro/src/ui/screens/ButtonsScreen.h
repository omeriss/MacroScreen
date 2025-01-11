#pragma once

#include <vector>
#include "ui/components/buttons/Button.h"
#include "Screen.h"

class ButtonsScreen : public Screen {
public:
    explicit ButtonsScreen(std::vector<Button*> *buttons);
    ButtonsScreen() = default;
    void update() override;
    void draw() override;
    void setButtons(std::vector<Button*>* buttons);
private:
    std::vector<Button*>* _buttons;
};