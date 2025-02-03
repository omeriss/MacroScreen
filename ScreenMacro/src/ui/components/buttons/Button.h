#pragma once

#include "TFT_eSPI.h"
#include "utils/ScreenManager.h"
#include <vector>
#include <unordered_map>
#include "config.h"
#include "utils/PngFsUtils.h"
#include <string>

struct ButtonImage {
    uint8_t* data;
    uint32_t size;
};

class Button {
public:
    Button(char *label, int16_t x, int16_t y, int16_t w, int16_t h);
    Button(char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill);
    Button(char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill, uint16_t outlineColor, uint16_t textColor);
    void update();
    void draw(bool inverted = false);
    virtual void onPress(){};
protected:
    int16_t  _x1, _y1; // Coordinates of top-left corner of button
    int16_t  _xd, _yd; // Button text datum offsets (wrt centre of button)
    uint16_t _w, _h;   // Width and height of button
    uint8_t  _textsize, _textdatum; // Text size multiplier and text datum for button
    uint16_t _outlinecolor, _fillcolor, _textcolor;
    std::string     _label;

    bool  currstate, laststate; // Button states
private:
    bool     contains(int16_t x, int16_t y) const;
    void     press(bool p);
    bool     isPressed() const;
    bool     justPressed() const;
    bool     justReleased() const;
    void drawText(uint16_t fill, uint16_t text);
    void drawImage();
    static std::unordered_map<std::string, ButtonImage> imageCache;
};