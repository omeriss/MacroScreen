#include "FolderButton.h"

FolderButton::FolderButton(std::function<void(Screen*)> changeScreen, Screen* folderScreen, char *label, uint16_t color, int index) :
        Button(label, color, index), _changeScreen(changeScreen), _folderScreen(folderScreen) {
}


void FolderButton::onPress() {
    _changeScreen(_folderScreen);
}