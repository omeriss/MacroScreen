#pragma once
#include "LittleFS.h"
#include <PNGdec.h>
#include "utils/ScreenManager.h"
#include "utils/Pos.h"

class PngUtils {
public:
    PngUtils() = delete;

    static void *pngOpen(const char *filename, int32_t *size);

    static void pngClose(void *handle);

    static int32_t pngRead(PNGFILE *page, uint8_t *buffer, int32_t length);

    static int32_t pngSeek(PNGFILE *page, int32_t position);

    static void pngDraw(PNGDRAW *pDraw);

    static PNG png;
};