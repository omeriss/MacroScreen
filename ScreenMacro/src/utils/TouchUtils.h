#pragma once

#include "Arduino.h"
#include "config.h"
#include "ScreenManager.h"
#include "UsbManager.h"

bool checkDoubleTap(unsigned long& lastPress, bool& lifted);

enum SwipeDirection {
    SWIPE_NONE,
    SWIPE_UP,
    SWIPE_DOWN,
    SWIPE_LEFT,
    SWIPE_RIGHT,
};

SwipeDirection checkSwipe();