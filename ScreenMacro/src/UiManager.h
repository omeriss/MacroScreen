#pragma once

#include <vector>
#include "ui/FolderButton.h"
#include "ui/Screen.h"

class UiManager {
public:
    UiManager();
    void update();
    void setup();
    void changeScreen(Screen* screen);
private:
    Screen* _currentScreen;
};

