#pragma once

#include <vector>
#include "ui/FolderButton.h"
#include "ui/Screen.h"

class UiManager {
public:
    UiManager();
    void update();
    void setup();

    ScreenManager& getScreenManager();
    void changeScreen(Screen* screen);
private:
    Screen* _currentScreen;
    ScreenManager _screenManager;
};

