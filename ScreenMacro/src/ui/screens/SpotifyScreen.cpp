#include "SpotifyScreen.h"

SpotifyScreen::SpotifyScreen(String refreshToken) {
    _refreshToken = refreshToken;
}

void SpotifyScreen::update() {
}

void SpotifyScreen::draw() {
    ScreenManager::getInstance().tft.fillScreen(TFT_BLACK);
}