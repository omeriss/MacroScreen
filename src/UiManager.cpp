#include "UiManager.h"

void UiManager::update() {
    _screenManager.updateTouch();
    _currentScreen->update();
}

UiManager::UiManager() {
    // define subscreen

    Screen* subScreen = new Screen(_screenManager);
    _currentScreen = new Screen(_screenManager);

    auto changeScreen = [this](Screen* screen) {this->changeScreen(screen);};
    auto* subButtons = new std::vector<Button*>();
    subButtons->push_back(new FolderButton(_screenManager, changeScreen,
                                           _currentScreen,"<-", TFT_BLUE, 0));
    subButtons->push_back(new Button(_screenManager, "C1", TFT_BLUE, 1));
    subButtons->push_back(new Button(_screenManager, "C2", TFT_BLUE, 2));
    subButtons->push_back(new Button(_screenManager, "C3", TFT_BLUE, 3));

    auto buttons = new std::vector<Button*>();
    buttons->push_back(new FolderButton(_screenManager, changeScreen,
                                        subScreen,"B1", TFT_BLUE, 0));
    buttons->push_back(new Button(_screenManager, "B2", TFT_BLUE, 1));
    buttons->push_back(new Button(_screenManager, "B3", TFT_BLUE, 2));
    buttons->push_back(new Button(_screenManager, "B4", TFT_BLUE, 3));
    buttons->push_back(new Button(_screenManager, "B5", TFT_BLUE, 4));
    buttons->push_back(new Button(_screenManager, "B6", TFT_BLUE, 5));
    buttons->push_back(new Button(_screenManager, "B7", TFT_BLUE, 6));
    buttons->push_back(new Button(_screenManager, "B8", TFT_BLUE, 7));
    buttons->push_back(new Button(_screenManager, "B9", TFT_BLUE, 8));

    _currentScreen->setButtons(buttons);
    subScreen->setButtons(subButtons);
}

void UiManager::setup() {
    _screenManager.setup();
    _screenManager.calibrate();

    _currentScreen->draw();
}

ScreenManager &UiManager::getScreenManager() {
    return _screenManager;
}

void UiManager::changeScreen(Screen *screen) {
    _currentScreen = screen;
    _currentScreen->draw();
}
