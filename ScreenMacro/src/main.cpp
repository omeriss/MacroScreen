#include "UiManager.h"
#include <Arduino.h>
#include "LittleFS.h"
#include "utils/PngFsUtils.h"

UiManager uiManager;

void setup() {
    Serial.begin(115200);

    Serial.println("Starting setup");

    UsbManager::getInstance().setup();

    if (psramInit()){
        Serial.println("PSRAM initialized successfully");
    } else {
        Serial.println("An error occurred while initializing PSRAM");
    }

    if(!LittleFS.begin()){
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    Serial.println("LittleFS mounted successfully");

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

