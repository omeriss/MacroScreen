#pragma once

#include "Button.h"
#include "Screen.h"
#include <functional>

class FolderButton : public Button {
public:
    FolderButton(std::function<void(Screen*)> changeScreen, Screen* folderScreen, char* label, uint16_t color, int index);
    void onPress() override;
private:
    Screen* _folderScreen;
    std::function<void(Screen*)> _changeScreen;
};
