#include "Button.h"

std::unordered_map<std::string, ButtonImage> Button::imageCache;


Button::Button(char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill, uint16_t outlineColor,
               uint16_t textColor) {
    _xd = 0;
    _yd = 0;
    _textdatum = MC_DATUM;
    currstate = false;
    laststate = false;
    _x1 = x;
    _y1 = y;
    _w = w;
    _h = h;
    _outlinecolor = outlineColor;
    _fillcolor = fill;
    _textcolor = textColor;
    _textsize = BUTTON_TEXT_SIZE;
    _label = label;
}

Button::Button(char *label, int16_t x, int16_t y, int16_t w, int16_t h, uint16_t fill) :
        Button(label, x, y, w, h, fill, TFT_WHITE, TFT_WHITE) {}

Button::Button(char *label, int16_t x, int16_t y, int16_t w, int16_t h) :
        Button(label, x, y, w, h, TFT_BLACK, TFT_WHITE, TFT_WHITE) {}


void Button::update() {
    auto& screenManager = ScreenManager::getInstance();

    press(
            screenManager.isPressed() && contains(screenManager.getPressX(), screenManager.getPressY()));

    if (justReleased()) draw();

    if (!justPressed()) return;

    draw(true);
    onPress();

    delay(10); // debounce
}

void Button::drawText(uint16_t fill, uint16_t text) {
    auto& screenManager = ScreenManager::getInstance();

    if (screenManager.tft.textfont == 255) {
        screenManager.tft.setCursor(_x1 + (_w / 8),
                                    _y1 + (_h / 4));
        screenManager.tft.setTextColor(text);
        screenManager.tft.setTextSize(_textsize);
        screenManager.tft.print(_label.c_str());
    }
    else {
        screenManager.tft.setTextColor(text, fill);
        screenManager.tft.setTextSize(_textsize);

        uint8_t tempdatum = screenManager.tft.getTextDatum();
        screenManager.tft.setTextDatum(_textdatum);
        uint16_t tempPadding = screenManager.tft.getTextPadding();
        screenManager.tft.setTextPadding(0);

        screenManager.tft.drawString(_label.c_str(), _x1 + (_w/2) + _xd, _y1 + (_h/2) - 4 + _yd);

        screenManager.tft.setTextDatum(tempdatum);
        screenManager.tft.setTextPadding(tempPadding);
    }
}

void Button::drawImage() {
    auto &screenManager = ScreenManager::getInstance();
    ButtonImage image = {nullptr, 0};

    if (imageCache.find(_label) == imageCache.end()) {
        auto img = LittleFS.open(_label.c_str(), "r");

        if (!img)
            return;

        uint8_t *buffer = (uint8_t *) ps_malloc(img.size());

        if (buffer) {
            img.read(buffer, img.size());
            image = {buffer, img.size()};
            img.close();
            imageCache[_label] = image;
        }
    } else {
        image = imageCache[_label];
    }

    int16_t rc;

    if (image.data)
        rc = PngUtils::png.openRAM(image.data, image.size, PngUtils::pngDraw);
    else
        rc = PngUtils::png.open(_label.c_str(), PngUtils::pngOpen, PngUtils::pngClose, PngUtils::pngRead,
                                PngUtils::pngSeek, PngUtils::pngDraw);


    if (rc == PNG_SUCCESS) {
        screenManager.tft.startWrite();
        Pos pos = {_x1 + (_w - PngUtils::png.getWidth()) / 2, _y1 + (_h - PngUtils::png.getHeight()) / 2};
        rc = PngUtils::png.decode(&pos, 0);
        PngUtils::png.close();
        screenManager.tft.endWrite();
    }
}

void Button::draw(bool inverted) {
    auto& screenManager = ScreenManager::getInstance();

    screenManager.tft.setFreeFont(FONT);

    uint16_t fill, outline, text;

    if(!inverted) {
        fill    = _fillcolor;
        outline = _outlinecolor;
        text    = _textcolor;
    } else {
        fill    = _textcolor;
        outline = _outlinecolor;
        text    = _fillcolor;
    }

    uint8_t r = min(_w, _h) / 4; // Corner radius
    screenManager.tft.fillRoundRect(_x1, _y1, _w, _h, r, fill);
    screenManager.tft.drawRoundRect(_x1, _y1, _w, _h, r, outline);

    if (_label[0] != '/') {
        drawText(fill, text);
    } else {
        drawImage();
    }
}

bool Button::contains(int16_t x, int16_t y) const {
    return ((x >= _x1) && (x < (_x1 + _w)) &&
            (y >= _y1) && (y < (_y1 + _h)));
}

void Button::press(bool p) {
    laststate = currstate;
    currstate = p;
}

bool Button::isPressed() const    { return currstate; }
bool Button::justPressed() const  { return (currstate && !laststate); }
bool Button::justReleased() const { return (!currstate && laststate); }

