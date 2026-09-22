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

SwipeDirection checkSwipe() {
    static uint16_t x = 0, y = 0;
    static bool pressed = false;
    static bool lifted = true;

    auto& screenManager = ScreenManager::getInstance();

    if (!lifted && screenManager.isPressed())
        return SWIPE_NONE;
    else
        lifted = true;

    if (pressed && !screenManager.isPressed()) {
        pressed = false;
        return SWIPE_NONE;
    }

    if (!pressed && screenManager.isPressed()) {
        pressed = true;
        x = screenManager.getPressX();
        y = screenManager.getPressY();

        // log the press
        static char buffer[100];
        sprintf(buffer, "Pressed at %d, %d", x, y);
        UsbManager::getInstance().sendLog(buffer);

        return SWIPE_NONE;
    }

    if (!pressed)
        return SWIPE_NONE;

    int16_t cx = screenManager.getPressX();
    int16_t cy = screenManager.getPressY();
    int16_t dx = cx - x;
    int16_t dy = cy - y;

    if (!cx || !cy)
        return SWIPE_NONE;

    SwipeDirection direction = SWIPE_NONE;

    if (abs(dx) > abs(dy)) {
        if (dx > SWIPE_THRESHOLD)
            direction = SWIPE_RIGHT;
        if (dx < -SWIPE_THRESHOLD)
            direction = SWIPE_LEFT;
    }
    else {
        if (dy > SWIPE_THRESHOLD)
            direction = SWIPE_DOWN;
        if (dy < -SWIPE_THRESHOLD)
            direction = SWIPE_UP;
    }

    if (direction != SWIPE_NONE){
        pressed = false;
        lifted = false;

        // log the press
        static char buffer[300];
        sprintf(buffer, "Pressed end %d, %d, dx= %d, dy= %d, cx= %d, cy=%d", x, y, dx, dy, (int16_t)screenManager.getPressX(), (int16_t)screenManager.getPressY());
        UsbManager::getInstance().sendLog(buffer);
    }

    return direction;
}