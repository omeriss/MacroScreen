#include "UiManager.h"
#include "ui/screens/GamingScreen.h"

#pragma clang diagnostic push
#pragma ide diagnostic ignored "misc-no-recursion"
#pragma clang diagnostic push
#pragma ide diagnostic ignored "MemoryLeak"

UiManager::UiManager() {
    _lastUpdate = millis();
}

void UiManager::update() {
    ScreenManager::getInstance().updateTouch();
    _currentScreen->update();

    static char path[128];
    auto command = UsbManager::getInstance().readCommand();

    if (command.type != CommandType::NoData || ScreenManager::getInstance().isPressed())
        _lastUpdate = millis();

    if (millis() - _lastUpdate > MILS_TO_SLEEP)
        ScreenManager::getInstance().sleep();

    if (command.type != CommandType::NoData) {
        switch (command.type) {
            case CommandType::Log:
                UsbManager::getInstance().sendCommand(CommandType::Log, command.payload, command.length);
                break;
            case CommandType::SendStatistics:
                if (_currentScreen->getType() == GAMING) {
                    auto *gaming = static_cast<GamingScreen *>(_currentScreen);
                    uint8_t cup, gpu, ram;
                    uint16_t fps;

                    command >> cup >> ram >> gpu >> fps;

                    gaming->setStatistics(cup, gpu, ram, fps);
                } else {
                    UsbManager::getInstance().sendCommand(CommandType::StopStatistics, nullptr, 0);
                }
                break;
            case CommandType::SendAudio:
                if (_currentScreen->getType() == AUDIO) {
                    auto *music = static_cast<MusicScreen *>(_currentScreen);
                    music->setAudio(command);
                } else {
                    UsbManager::getInstance().sendCommand(CommandType::StopAudio, nullptr, 0);
                }
                break;
            case CommandType::Ls: {
                fs::File dir = LittleFS.open("/");

                if (!dir)
                    break;

                Command cmd(CommandType::Ls);

                while (true) {
                    fs::File entry = dir.openNextFile();

                    if (!entry)
                        break;

                    const char *name = entry.name();
                    const int len = strlen(name);
                    cmd.writeArr((uint8_t *)name, len);
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
                UsbManager::getInstance().sendCommand(CommandType::Acknowledge, (uint8_t *)&i, sizeof(i));

                // TODO: timeout and retry
                for (i++; i <= parts; i++) {
                    auto part = UsbManager::getInstance().readCommand();
                    if (part.type != CommandType::SendFilePart) {
                        i--;
                        continue;
                    }

                    file.write(part.payload, part.length);

                    UsbManager::getInstance().sendCommand(CommandType::Acknowledge, (uint8_t *)&i, sizeof(i));
                }

                file.close();
                break;
            }
            case CommandType::MkDir: {
                command.readString(path);

                if (!LittleFS.mkdir(path)) {
                    UsbManager::getInstance().sendLog("Failed to create directory");
                }

                Command cmd(CommandType::Acknowledge);
                cmd.writeString(path);
                UsbManager::getInstance().sendCommand(cmd);

                break;
            }
            case CommandType::RmDir: {
                command.readString(path);

                // todo, remove all the files in the dir first

                if (!LittleFS.rmdir(path)) {
                    UsbManager::getInstance().sendLog("Failed to remove directory");
                }

                Command cmd(CommandType::Acknowledge);
                cmd.writeString(path);
                UsbManager::getInstance().sendCommand(cmd);

                break;
            }
            case CommandType::LogFile: {
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

Button *UiManager::createButton(JsonObject buttonData, Screen *containingScreen) {
    if (buttonData[BUTTON_TYPE].isNull())
        return nullptr;

    std::string label = buttonData[BUTTON_LABEL];
    int index = buttonData[BUTTON_INDEX];
    int backgroundColor = buttonData[BUTTON_BACKGROUND];
    uint16_t background = (((backgroundColor >> 16) & 0xF8) << 8) | (((backgroundColor >> 8) & 0xFC) << 3) |
                          ((backgroundColor & 0xFF) >> 3);

    if (label.length() && label[0] == '/') {
        label = IMAGE_PATH + label;
    }

    int row = (index % BUTTONS_PER_SCREEN) / BUTTON_ROWS;
    int col = (index % BUTTONS_PER_SCREEN) % BUTTON_COLS;
    int x = BUTTON_START_X + col * (BUTTON_W + BUTTON_SPACING_X) - BUTTON_W / 2;
    int y = BUTTON_START_Y + row * (BUTTON_H + BUTTON_SPACING_Y) - BUTTON_H / 2;

    if (strcmp(buttonData[BUTTON_TYPE], FOLDER_TYPE) == 0) {
        auto screen = generateScreen(buttonData[BUTTON_FOLDER]);
        screen->setExit([this, containingScreen]() { this->changeScreen(containingScreen); });

        return new ActionButton([this, screen]() { this->changeScreen(screen); }, label.c_str(),
                                x, y, BUTTON_W, BUTTON_H, background);
    }
    if (strcmp(buttonData[BUTTON_TYPE], AUDIO_TYPE) == 0) {
        auto screen = new MusicScreen([this, containingScreen]() { this->changeScreen(containingScreen); });

        return new ActionButton([this, screen]() { this->changeScreen(screen); }, label.c_str(),
                                x, y, BUTTON_W, BUTTON_H, background);
    }
    if (strcmp(buttonData[BUTTON_TYPE], GAMING_TYPE) == 0) {
        auto screen = new GamingScreen([this, containingScreen]() { this->changeScreen(containingScreen); });

        return new ActionButton([this, screen]() { this->changeScreen(screen); }, label.c_str(),
                                x, y, BUTTON_W, BUTTON_H, background);
    }
    if (strcmp(buttonData[BUTTON_TYPE], APP_TYPE) == 0) {
        const char *app = buttonData[BUTTON_APP];
        return new CommandButton(CommandType::OpenProgram, (const uint8_t *)app, strlen(app), label.c_str(),
                                 x, y, BUTTON_W, BUTTON_H, background);
    }
    if (strcmp(buttonData[BUTTON_TYPE], SCRIPT_TYPE) == 0) {
        const char *script = buttonData[BUTTON_SCRIPT];
        return new CommandButton(CommandType::RunScript, (const uint8_t *)script, strlen(script), label.c_str(),
                                 x, y, BUTTON_W, BUTTON_H, background);
    }
    if (strcmp(buttonData[BUTTON_TYPE], KEYBOARD_TYPE) == 0) {
        JsonVariant keys = buttonData[BUTTON_PRESS];

        if (!keys.is<JsonArray>())
            return nullptr;

        uint8_t *keyArray = new uint8_t[keys.size()];
        int i = 0;
        for (auto key : keys.as<JsonArray>()) {
            keyArray[i++] = key;
        }

        return new KeyboardButton(
            keyArray, keys.size(), label.c_str(), x, y, BUTTON_W, BUTTON_H, background);
    }

    return new Button(label.c_str(), x, y, BUTTON_W, BUTTON_H, background);
}

ButtonsScreen *UiManager::generateScreen(JsonVariant doc) {
    auto *screen = new ButtonsScreen();

    JsonVariant buttonsObject = doc[FOLDER_BUTTONS];
    if (!buttonsObject.is<JsonObject>())
        return screen;

    std::vector<std::pair<int, Button *>> buttonsWithIndex;

    for (auto pair : buttonsObject.as<JsonObject>()) {
        auto data = pair.value().as<JsonObject>();
        Button *button = createButton(data, screen);
        if (button)
            buttonsWithIndex.emplace_back(data[BUTTON_INDEX].as<int>(), button);
    }

    std::sort(buttonsWithIndex.begin(), buttonsWithIndex.end(),
              [](const std::pair<int, Button *> &a, const std::pair<int, Button *> &b) { return a.first < b.first; });

    std::vector<Button *> buttons;
    buttons.reserve(buttonsWithIndex.size());
    for (auto &entry : buttonsWithIndex)
        buttons.push_back(entry.second);

    screen->setButtons(std::move(buttons));
    return screen;
}

void UiManager::setup() {
    ScreenManager::getInstance().setup();

    JsonDocument doc;
    fs::File file = LittleFS.open(JSON_PATH, "r");

    if (!file || deserializeJson(doc, file)) {
        _currentScreen = new ButtonsScreen();
    } else {
        _currentScreen = generateScreen(doc);
    }
    if (file)
        file.close();

    _currentScreen->draw();
}

void UiManager::changeScreen(Screen *screen) {
    _currentScreen = screen;
    _currentScreen->draw();
}

UiManager::~UiManager() {}

#pragma clang diagnostic pop
#pragma clang diagnostic pop