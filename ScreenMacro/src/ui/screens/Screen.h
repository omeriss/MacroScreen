#pragma once

#include <vector>
#include "ui/components/buttons/Button.h"

// create enum screentype
enum ScreenType {
    NONE,
    SPOTIFY,
    GAMING
};

class Screen {
public:
    virtual void update() = 0;
    virtual void draw() = 0;

    ScreenType getType() {
        return _type;
    }

protected:
    ScreenType _type = NONE;
};