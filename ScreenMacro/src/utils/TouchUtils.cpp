#include "TouchUtils.h"

bool checkDoubleTap(unsigned long& lastPress, bool& lifted) {
    bool pressed = ScreenManager::getInstance().isPressed();

    if (pressed) {
        if (lifted && millis() - lastPress < DOUBLE_TAP_THRESHOLD)
            return true;
        else {
            lifted = false;
            lastPress = millis();
        }
    }
    else
        lifted = true;

    return false;
}
