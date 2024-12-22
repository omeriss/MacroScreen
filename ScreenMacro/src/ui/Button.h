#pragma once

#include "TFT_eSPI.h"
#include "utils/ScreenManager.h"
#include <vector>
#include "config.h"
#include "utils/PngFsUtils.h"

class Button {
public:
    Button(char* label, uint16_t color, int index);
    void update();
    void draw(bool inverted = false);
    virtual void onPress(){};
protected:
    int16_t  _x1, _y1; // Coordinates of top-left corner of button
    int16_t  _xd, _yd; // Button text datum offsets (wrt centre of button)
    uint16_t _w, _h;   // Width and height of button
    uint8_t  _textsize, _textdatum; // Text size multiplier and text datum for button
    uint16_t _outlinecolor, _fillcolor, _textcolor;
    char     _label[15]; // Button text is 9 chars maximum unless long_name used

    bool  currstate, laststate; // Button states
private:
    bool     contains(int16_t x, int16_t y) const;
    void     press(bool p);
    bool     isPressed() const;
    bool     justPressed() const;
    bool     justReleased() const;
    void drawText(uint16_t fill, uint16_t text);
    void drawImage();
};