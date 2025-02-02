#include "UiManager.h"
#include "ui/screens/GamingScreen.h"

void UiManager::update() {
    ScreenManager::getInstance().updateTouch();
    _currentScreen->update();

    static char path[128];
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
            case CommandType::Ls: {
                fs::File dir = LittleFS.open("/");

                if (!dir)
                    break;

                Command cmd(CommandType::Ls);

                while (true) {
                    fs::File entry = dir.openNextFile();

                    if (!entry) break;

                    const char *name = entry.name();
                    const int len = strlen(name);
                    cmd.writeArr((uint8_t *) name, len);
                }
                UsbManager::getInstance().sendCommand(cmd);

                break;
            }
            case CommandType::StartWriteFile: {
                uint16_t parts;
                command >> parts;
                command.readString(path);

                fs::File file = LittleFS.open(path, "w");

                if (!file) {
                    UsbManager::getInstance().sendLog("Failed to open file");
                    UsbManager::getInstance().sendLog(path);
                    break;
                }

                uint16_t i = 0;
                UsbManager::getInstance().sendCommand(CommandType::Acknowledge, (uint8_t*)&i, sizeof(i));

                for (i++; i <= parts; i++) {
                    auto part = UsbManager::getInstance().readCommand();
                    if (part.type != CommandType::SendFilePart) {
                        i--;
                        continue;
                    }

                    file.write(part.payload, part.length);

                    UsbManager::getInstance().sendCommand(CommandType::Acknowledge, (uint8_t*)&i, sizeof(i));
                }

                file.close();
                break;
            }
            case CommandType::LogFile:
            {
                command.readString(path);
                fs::File file = LittleFS.open(path, "r");

                if (!file) {
                    UsbManager::getInstance().sendLog("Failed to open file");
                    break;
                }

                Command cmd(CommandType::Log);
                auto len = file.read(cmd.payload, DEFAULT_BUFFER_SIZE);
                cmd.length = len;
                file.close();
                UsbManager::getInstance().sendCommand(cmd);
                break;
            }
            case CommandType::Boot:
                REG_WRITE(RTC_CNTL_OPTION1_REG, RTC_CNTL_FORCE_DOWNLOAD_BOOT);
                esp_restart();
            default:
                break;
        }
    }
}

Button* createButton (char* label, int16_t color, int index) {
    int row = index / BUTTON_ROWS;
    int col = index % BUTTON_COLS;

    return new Button(label, BUTTON_START_X + col * (BUTTON_W + BUTTON_SPACING_X) - BUTTON_W / 2,
                      BUTTON_START_Y + row * (BUTTON_H + BUTTON_SPACING_Y) - BUTTON_H / 2, BUTTON_W, BUTTON_H, color);
}

ActionButton* createActionButton (std::function<void()> action, char* label, int16_t color, int index) {
    int row = index / BUTTON_ROWS;
    int col = index % BUTTON_COLS;

    return new ActionButton(action, label, BUTTON_START_X + col * (BUTTON_W + BUTTON_SPACING_X) - BUTTON_W / 2,
                            BUTTON_START_Y + row * (BUTTON_H + BUTTON_SPACING_Y) - BUTTON_H / 2, BUTTON_W, BUTTON_H, color);
}

KeyboardButton* createKeyboardButton (uint8_t key, char* label, int16_t color, int index, bool isConsumerControl) {
    int row = index / BUTTON_ROWS;
    int col = index % BUTTON_COLS;

    return new KeyboardButton(key, isConsumerControl, label, BUTTON_START_X + col * (BUTTON_W + BUTTON_SPACING_X) - BUTTON_W / 2,
                              BUTTON_START_Y + row * (BUTTON_H + BUTTON_SPACING_Y) - BUTTON_H / 2, BUTTON_W, BUTTON_H, color);
}

AppButton* createAppButton (char* path, char* label, int16_t color, int index) {
    int row = index / BUTTON_ROWS;
    int col = index % BUTTON_COLS;

    return new AppButton(path, label, BUTTON_START_X + col * (BUTTON_W + BUTTON_SPACING_X) - BUTTON_W / 2,
                         BUTTON_START_Y + row * (BUTTON_H + BUTTON_SPACING_Y) - BUTTON_H / 2, BUTTON_W, BUTTON_H, color);
}



UiManager::UiManager() {
    // define subscreen

    auto *subScreen = new ButtonsScreen();
    auto *cur = new ButtonsScreen();
    auto *spotify = new MusicScreen([this, cur]() { this->changeScreen(cur); });
    auto *gaming = new GamingScreen([this, cur]() { this->changeScreen(cur); });

    auto *subButtons = new std::vector<Button *>();
    subButtons->push_back(createActionButton([this, cur]() { this->changeScreen(cur); }, "<-", TFT_BLUE, 0));
    subButtons->push_back(createActionButton([this, cur]() {
        REG_WRITE(RTC_CNTL_OPTION1_REG, RTC_CNTL_FORCE_DOWNLOAD_BOOT);
        esp_restart();
    }, "BOOT", TFT_BLUE, 1));
    subButtons->push_back(createActionButton([this, cur]() {
        esp_restart();
    }, "Restart", TFT_BLUE, 2));
    subButtons->push_back(createActionButton([this, cur]() {
        ScreenManager::getInstance().turnOffBacklight();
    }, "LOW", TFT_BLUE, 3));
    subButtons->push_back(createActionButton([this, cur]() {
        ScreenManager::getInstance().turnOnBacklight();
    }, "HIGH", TFT_BLUE, 4));
    subButtons->push_back(createActionButton([this, cur]() {
        ScreenManager::getInstance().sleep();
    }, "SLEEP", TFT_BLUE, 5));
    subButtons->push_back(createButton("C3", TFT_BLUE, 6));
    subButtons->push_back(createButton("C1", TFT_BLUE, 7));
    subButtons->push_back(createActionButton([this, gaming]() { this->changeScreen(gaming); }, "game", TFT_BLACK, 8));

    auto buttons = new std::vector<Button *>();
    buttons->push_back(createActionButton([this, subScreen]() { this->changeScreen(subScreen); }, "DEBUG", TFT_BLUE, 0));
    buttons->push_back(createKeyboardButton('1', "1", TFT_BLUE, 1, false));
    buttons->push_back(createKeyboardButton(HID_USAGE_CONSUMER_PLAY_PAUSE, "play-pause", TFT_BLUE, 2, true));
    buttons->push_back(
            createActionButton([this, spotify]() { this->changeScreen(spotify); }, "/spotify.png", TFT_BLACK, 3));
    buttons->push_back(
            createAppButton("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "/chrome.png", TFT_BLUE,
                          4));
    buttons->push_back(createButton("test", TFT_BLUE, 5));
    buttons->push_back(createButton("/explorer.png", TFT_BLUE, 6));
    buttons->push_back(createButton("something", TFT_BLUE, 7));
    buttons->push_back(createActionButton([this, gaming]() { this->changeScreen(gaming); }, "game", TFT_BLACK, 8));

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
