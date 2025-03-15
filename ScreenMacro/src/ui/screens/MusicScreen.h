#pragma once

#include "Screen.h"
#include "utils/TouchUtils.h"
#include "ui/components/buttons/ToggleButton.h"
#include "ui/components/buttons/ActionButton.h"
#include "ui/components/TimeLineSlider.h"
#include "utils/UsbManager.h"

#define BUTTONS_SIZE 60
#define BUTTONS_PADDING 40
#define BUTTON_X(i) ((SCREEN_WIDTH - BUTTONS_SIZE * 3 - BUTTONS_PADDING * 2) / 2 + (i) * (BUTTONS_SIZE + BUTTONS_PADDING))
#define BUTTON_Y 250
#define HOVER_COLOR 0x0841
#define AUDIO_TEXT_LEN 64
#define IMG_X 270
#define IMG_Y 30

class MusicScreen : public Screen {
public:
    explicit MusicScreen(std::function<void()> exit);

    void update() override;

    void draw() override;

    void setAudio(Command command);

private:
    std::function<void()> _exit;

    ToggleButton _playPause = ToggleButton("/play.png", "/pause.png", BUTTON_X(1), BUTTON_Y, BUTTONS_SIZE, BUTTONS_SIZE,
                                           TFT_BLACK, TFT_BLACK, HOVER_COLOR, [this](bool b) {
                uint8_t d = b;
                UsbManager::getInstance().sendCommand(CommandType::AudioAction, &d, 1);
            });
    ActionButton _prev = ActionButton(
            []() {
                uint8_t d = 2;
                UsbManager::getInstance().sendCommand(CommandType::AudioAction, &d, 1);
            },
            "/prev.png", BUTTON_X(0), BUTTON_Y, BUTTONS_SIZE, BUTTONS_SIZE, TFT_BLACK, TFT_BLACK, HOVER_COLOR);
    ActionButton _next = ActionButton(
            []() {
                uint8_t d = 3;
                UsbManager::getInstance().sendCommand(CommandType::AudioAction, &d, 1);
            },
            "/next.png", BUTTON_X(2), BUTTON_Y, BUTTONS_SIZE, BUTTONS_SIZE, TFT_BLACK, TFT_BLACK,
            HOVER_COLOR);
    TimeLineSlider _timeLineSlider = TimeLineSlider(50, 200, 380);

    uint16_t _lastImgWidth = 0;
    uint16_t _lastImgHeight = 0;
};
