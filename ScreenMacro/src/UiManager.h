#pragma once

#include <vector>
#include <tuple>
#include "ui/components/buttons/ActionButton.h"
#include "ui/components/buttons/KeyboardButton.h"
#include "ui/components/buttons/CommandButton.h"
#include "ui/screens/Screen.h"
#include "ui/screens/MusicScreen.h"
#include "ui/screens/GamingScreen.h"
#include "ui/screens/ButtonsScreen.h"
#include "utils/UsbManager.h"
#include "LittleFS.h"
#include <ArduinoJson.h>

class UiManager {
public:
    UiManager();

    void update();

    void setup();

    void changeScreen(Screen *screen);

    ~UiManager();

private:
    Button *createButton(JsonObject buttonData, Screen* containingScreen);
    ButtonsScreen *generateScreen(JsonVariant doc);
    Screen *_currentScreen;
    unsigned long _lastUpdate = 0;
};

