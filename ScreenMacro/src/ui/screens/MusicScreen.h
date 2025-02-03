#pragma once

#include "Screen.h"
#include "utils/TouchUtils.h"

class MusicScreen : public Screen {
public:
    MusicScreen(std::function<void()> exit);
    void update() override;
    void draw() override;
private:
    std::function<void()> _exit;
    std::vector<Button> _buttons;
    unsigned long _lastPress = 0;
    bool _lifted = false;
};
