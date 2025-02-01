#pragma once

#include <vector>
#include "ui/components/buttons/ActionButton.h"
#include "ui/components/buttons/KeyboardButton.h"
#include "ui/components/buttons/AppButton.h"
#include "ui/screens/Screen.h"
#include "ui/screens/MusicScreen.h"
#include "ui/screens/GamingScreen.h"
#include "ui/screens/ButtonsScreen.h"
#include "utils/UsbManager.h"

class UiManager {
public:
    UiManager();
    void update();
    void setup();
    void changeScreen(Screen* screen);
private:
    Screen* _currentScreen;
};

