#include "MusicScreen.h"

MusicScreen::MusicScreen(std::function<void()> exit) : _exit(exit) {
    _type = AUDIO;
}

#include <pgmspace.h>

void MusicScreen::update() {
    if(checkDoubleTap(_lastPress, _lifted)) {
        _exit();
        return;
    }

    _next.update();
    _prev.update();
    _playPause.update();
}

void MusicScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);

    _next.draw();
    _prev.draw();
    _playPause.draw();
    _timeLineSlider.update(0, 0);

    UsbManager::getInstance().sendCommand(CommandType::StartAudio, nullptr, 0);
}

void MusicScreen::setAudio(Command command) {
    auto& screenManager = ScreenManager::getInstance();
    bool sessionSwapped, playing;
    uint32_t timeElapsed, totalTime;

    command >> sessionSwapped >> playing;
    command >> timeElapsed >> totalTime;

    static char audioName[AUDIO_TEXT_LEN] = {0};
    static char audioArtist[AUDIO_TEXT_LEN] = {0};

    if (sessionSwapped) {
        screenManager.tft.setTextDatum(TL_DATUM);
        screenManager.tft.setTextColor(TFT_BLACK, TFT_BLACK);
        screenManager.tft.drawString(audioName, 10, 50, 4);
        screenManager.tft.drawString(audioArtist, 10, 100, 2);

        command.readString(audioName, AUDIO_TEXT_LEN);
        command.readString(audioArtist, AUDIO_TEXT_LEN);

        screenManager.tft.setTextColor(TFT_WHITE, TFT_BLACK);
        screenManager.tft.drawString(audioName, 10, 50, 4);

        screenManager.tft.setTextColor(TFT_DARKGREY, TFT_BLACK);
        screenManager.tft.drawString(audioArtist, 10, 100, 2);

        auto rc = PngUtils::png.open("/audio.png", PngUtils::pngOpen, PngUtils::pngClose, PngUtils::pngRead,
                                PngUtils::pngSeek, PngUtils::pngDraw);

        if (rc == PNG_SUCCESS) {
            screenManager.tft.fillRect(IMG_X, IMG_Y, _lastImgWidth, _lastImgHeight, TFT_BLACK);
            _lastImgWidth = PngUtils::png.getWidth();
            _lastImgHeight = PngUtils::png.getHeight();
            
            screenManager.tft.startWrite();
            ImgDrawData pos = {IMG_X, IMG_Y, TFT_BLACK};
            rc = PngUtils::png.decode(&pos, 0);
            PngUtils::png.close();
            screenManager.tft.endWrite();
        }
    }

    _timeLineSlider.update(timeElapsed / 1000, totalTime / 1000);
    _playPause.setState(playing);
}
