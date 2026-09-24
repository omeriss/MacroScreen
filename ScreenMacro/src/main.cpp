#include "LittleFS.h"
#include "UiManager.h"
#include "utils/PngFsUtils.h"
#include <Arduino.h>

UiManager uiManager;

void setup() {
    delay(100);
    Serial.begin(115200);

    UsbManager::getInstance().setup();
    psramInit();

    if (!LittleFS.begin())
        return;

    uiManager.setup();
}

void loop() {
    uiManager.update();
}
