#include "UiManager.h"
#include "ui/screens/GamingScreen.h"

void UiManager::update() {
    ScreenManager::getInstance().updateTouch();
    _currentScreen->update();

    auto command = UsbManager::getInstance().readCommand();

    if(command.type != CommandType::NoData){
        switch (command.type) {
            case CommandType::Log:
                UsbManager::getInstance().sendCommand(CommandType::Log, command.payload, command.length);
                break;
            default:
                break;
        }
    }
}

UiManager::UiManager() {
    // define subscreen

    auto* subScreen = new ButtonsScreen();
    auto* cur = new ButtonsScreen();
    auto* spotify = new SpotifyScreen("refreshToken");
    auto* gaming = new GamingScreen([this, cur]() {this->changeScreen(cur);});

    auto* subButtons = new std::vector<Button*>();
    subButtons->push_back(new ActionButton([this, cur]() {this->changeScreen(cur);} , "<-", TFT_BLUE, 0));
    subButtons->push_back(new Button("C1", TFT_BLUE, 1));
    subButtons->push_back(new Button("C2", TFT_BLUE, 2));
    subButtons->push_back(new Button("C3", TFT_BLUE, 3));
    subButtons->push_back(new Button("C1", TFT_BLUE, 4));
    subButtons->push_back(new Button("C2", TFT_BLUE, 5));
    subButtons->push_back(new Button("C3", TFT_BLUE, 6));
    subButtons->push_back(new Button("C1", TFT_BLUE, 7));
    subButtons->push_back(new Button("C2", TFT_BLUE, 8));
    subButtons->push_back(new Button("C3", TFT_BLUE, 9));

    auto buttons = new std::vector<Button*>();
    buttons->push_back(new ActionButton([this, subScreen]() {this->changeScreen(subScreen);}, "B1", TFT_BLUE, 0));
    buttons->push_back(new KeyboardButton('1' ,"1", TFT_BLUE, 1));
    buttons->push_back(new KeyboardButton(HID_USAGE_CONSUMER_PLAY_PAUSE ,"play-pause", TFT_BLUE, 2, true));
    buttons->push_back(new ActionButton([this, spotify]() {this->changeScreen(spotify);}, "/spotify.png", TFT_BLACK, 3));
    buttons->push_back(new AppButton("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "/chrome.png", TFT_BLUE, 4));
    buttons->push_back(new Button("test", TFT_BLUE, 5));
    buttons->push_back(new Button("/explorer.png", TFT_BLUE, 6));
    buttons->push_back(new Button("something", TFT_BLUE, 7));
    buttons->push_back(new ActionButton([this, gaming]() {this->changeScreen(gaming);}, "game", TFT_BLACK, 8));

    cur->setButtons(buttons);
    subScreen->setButtons(subButtons);
    _currentScreen = cur;
}

void UiManager::setup() {
    ScreenManager::getInstance().setup();
    ScreenManager::getInstance().calibrate();

    Serial.println("Calibration done");
    _currentScreen->draw();
    Serial.println("Screen drawn");
}

void UiManager::changeScreen(Screen *screen) {
    _currentScreen = screen;
    _currentScreen->draw();
}
