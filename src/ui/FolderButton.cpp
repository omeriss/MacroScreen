#include "FolderButton.h"

FolderButton::FolderButton(ScreenManager& screenManager, std::function<void(Screen*)> changeScreen, Screen* folderScreen, char *label, uint16_t color, int index) :
        Button(screenManager, label, color, index), _changeScreen(changeScreen), _folderScreen(folderScreen) {
}


void FolderButton::onPress() {
    _changeScreen(_folderScreen);
}