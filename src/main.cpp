#include "UiManager.h"
#include <PNGdec.h>

UiManager uiManager;

void setup() {
    Serial.begin(9600);
    uiManager.setup();
}

void loop() {
    uiManager.update();


}