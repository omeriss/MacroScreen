#pragma once

#include "Screen.h"

class SpotifyScreen : public Screen {
public:
    SpotifyScreen(String refreshToken);
    void update() override;
    void draw() override;
private:
    String _refreshToken;
};
