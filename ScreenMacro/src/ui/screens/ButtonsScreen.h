#pragma once

#include <vector>
#include "ui/components/buttons/Button.h"
#include "Screen.h"
#include <utility>
#include "utils/TouchUtils.h"

class ButtonsScreen : public Screen {
public:
    explicit ButtonsScreen(std::vector<Button*> *buttons, std::function<void()> exit = nullptr);
    ButtonsScreen() = default;
    void update() override;
    void draw() override;
    void setButtons(std::vector<Button*>* buttons);
    void setExit(std::function<void()> exit);
private:
    std::function<void()> _exit = nullptr;
    std::vector<Button*>* _buttons;
    uint16_t page = 0;
};