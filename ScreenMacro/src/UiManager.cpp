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
            case CommandType::SendStatistics:
                if (_currentScreen->getType() == GAMING) {
                    auto* gaming = static_cast<GamingScreen*>(_currentScreen);
                    uint8_t cup, gpu, ram;
                    uint16_t fps;

                    command >> cup >> ram >> gpu >> fps;

                    gaming->setStatistics(cup, gpu, ram, fps);
                }
                else {
                    UsbManager::getInstance().sendCommand(CommandType::StopStatistics, nullptr, 0);
                }
                break;
            case CommandType::Boot:
                REG_WRITE(RTC_CNTL_OPTION1_REG, RTC_CNTL_FORCE_DOWNLOAD_BOOT);
                esp_restart();
            default:
                break;
        }
    }
}

UiManager::UiManager() {
    // define subscreen

    auto *subScreen = new ButtonsScreen();
    auto *cur = new ButtonsScreen();
    auto *spotify = new SpotifyScreen("refreshToken");
    auto *gaming = new GamingScreen([this, cur]() { this->changeScreen(cur); });

    auto *subButtons = new std::vector<Button *>();
    subButtons->push_back(new ActionButton([this, cur]() { this->changeScreen(cur); }, "<-", TFT_BLUE, 0));
    subButtons->push_back(new ActionButton([this, cur]() {
        REG_WRITE(RTC_CNTL_OPTION1_REG, RTC_CNTL_FORCE_DOWNLOAD_BOOT);
        esp_restart();
    }, "BOOT", TFT_BLUE, 1));
    subButtons->push_back(new ActionButton([this, cur]() {
        esp_restart();
    }, "Restart", TFT_BLUE, 2));
    subButtons->push_back(new ActionButton([this, cur]() {
        ScreenManager::getInstance().turnOffBacklight();
    }, "LOW", TFT_BLUE, 3));
    subButtons->push_back(new ActionButton([this, cur]() {
        ScreenManager::getInstance().turnOnBacklight();
    }, "HIGH", TFT_BLUE, 4));
    subButtons->push_back(new ActionButton([this, cur]() {
        ScreenManager::getInstance().sleep();
    }, "SLEEP", TFT_BLUE, 5));
    subButtons->push_back(new Button("C3", TFT_BLUE, 6));
    subButtons->push_back(new Button("C1", TFT_BLUE, 7));
    subButtons->push_back(new Button("C2", TFT_BLUE, 8));
    subButtons->push_back(new Button("C3", TFT_BLUE, 9));

    auto buttons = new std::vector<Button *>();
    buttons->push_back(new ActionButton([this, subScreen]() { this->changeScreen(subScreen); }, "DEBUG", TFT_BLUE, 0));
    buttons->push_back(new KeyboardButton('1', "1", TFT_BLUE, 1));
    buttons->push_back(new KeyboardButton(HID_USAGE_CONSUMER_PLAY_PAUSE, "play-pause", TFT_BLUE, 2, true));
    buttons->push_back(
            new ActionButton([this, spotify]() { this->changeScreen(spotify); }, "/spotify.png", TFT_BLACK, 3));
    buttons->push_back(
            new AppButton("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "/chrome.png", TFT_BLUE,
                          4));
    buttons->push_back(new Button("test", TFT_BLUE, 5));
    buttons->push_back(new Button("/explorer.png", TFT_BLUE, 6));
    buttons->push_back(new Button("something", TFT_BLUE, 7));
    buttons->push_back(new ActionButton([this, gaming]() { this->changeScreen(gaming); }, "game", TFT_BLACK, 8));

    cur->setButtons(buttons);
    subScreen->setButtons(subButtons);
    _currentScreen = cur;
}

void UiManager::setup() {
    ScreenManager::getInstance().setup();
    _currentScreen->draw();
}

void UiManager::changeScreen(Screen *screen) {
    _currentScreen = screen;
    _currentScreen->draw();
}
