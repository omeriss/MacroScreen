#include "UiManager.h"
#include <Arduino.h>
#include "LittleFS.h"
#include "utils/PngFsUtils.h"

UiManager uiManager;

void setup() {
    delay(100);
    Serial.begin(115200);

    UsbManager::getInstance().setup();
    psramInit();

    if(!LittleFS.begin())
        return;

    uiManager.setup();
}

int t = 0;

void loop() {
    uiManager.update();

    // draw the top right pixel in random color
    if (++t % 1000 == 0) {
        ScreenManager::getInstance().tft.drawPixel(ScreenManager::getInstance().tft.width() - 1, 0,
                                                   ScreenManager::getInstance().tft.color565(random(255), random(255),
                                                                                             random(255)));
        t = 0;
    }
}

