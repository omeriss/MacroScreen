#include "UiManager.h"

void UiManager::update() {
    ScreenManager::getInstance().updateTouch();
    _currentScreen->update();
}

UiManager::UiManager() {
    // define subscreen

    Screen* subScreen = new Screen();
    _currentScreen = new Screen();

    auto changeScreen = [this](Screen* screen) {this->changeScreen(screen);};
    auto* subButtons = new std::vector<Button*>();
    subButtons->push_back(new FolderButton(changeScreen,
                                           _currentScreen,"<-", TFT_BLUE, 0));
    subButtons->push_back(new Button("C1", TFT_BLUE, 1));
    subButtons->push_back(new Button("C2", TFT_BLUE, 2));
    subButtons->push_back(new Button("C3", TFT_BLUE, 3));

    auto buttons = new std::vector<Button*>();
    buttons->push_back(new FolderButton(changeScreen,
                                        subScreen,"B1", TFT_BLUE, 0));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 1));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 2));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 3));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 4));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 5));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 6));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 7));
    buttons->push_back(new Button("/chrome.png", TFT_BLUE, 8));

    _currentScreen->setButtons(buttons);
    subScreen->setButtons(subButtons);
}

void UiManager::setup() {
    ScreenManager::getInstance().setup();
    ScreenManager::getInstance().calibrate();

    _currentScreen->draw();
}

void UiManager::changeScreen(Screen *screen) {
    _currentScreen = screen;
    _currentScreen->draw();
}
