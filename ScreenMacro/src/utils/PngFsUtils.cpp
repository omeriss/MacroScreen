#include "PngFsUtils.h"

#define MAX_IMAGE_WIDTH 240
fs::File pngTemp;
PNG PngUtils::png = PNG();

void* PngUtils::pngOpen(const char *filename, int32_t *size) {
    Serial.printf("Attempting to open %s\n", filename);
    pngTemp = LittleFS.open(filename, "r");
    *size = pngTemp.size();
    return &pngTemp;
}

void PngUtils::pngClose(void *handle) {
    fs::File f = *((fs::File*)handle);
    if (f) f.close();
}

int32_t PngUtils::pngRead(PNGFILE *page, uint8_t *buffer, int32_t length) {
    if (!pngTemp) return 0;
    page = page; // Avoid warning
    return pngTemp.read(buffer, length);
}

int32_t PngUtils::pngSeek(PNGFILE *page, int32_t position) {
    if (!pngTemp) return 0;
    page = page; // Avoid warning
    return pngTemp.seek(position);
}

void PngUtils::pngDraw(PNGDRAW *pDraw) {
    uint16_t lineBuffer[MAX_IMAGE_WIDTH];
    uint8_t maskBuffer[1 + MAX_IMAGE_WIDTH / 8];
    png.getLineAsRGB565(pDraw, lineBuffer, PNG_RGB565_BIG_ENDIAN, 0xffffffff);
    Pos *pos = (Pos *) pDraw->pUser;

    if (png.getAlphaMask(pDraw, maskBuffer, 255)) {
        // Note: pushMaskedImage is for pushing to the TFT and will not work pushing into a sprite
        ScreenManager::getInstance().tft.pushMaskedImage(pos->x, pos->y + pDraw->y, pDraw->iWidth, 1, lineBuffer, maskBuffer);
    }
}