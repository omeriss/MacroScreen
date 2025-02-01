#pragma once

#include "Arduino.h"
#include "config.h"
#include "ScreenManager.h"

bool checkDoubleTap(unsigned long& lastPress, bool& lifted);