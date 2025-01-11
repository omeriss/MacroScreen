#pragma once

#include <vector>
#include "ui/components/buttons/Button.h"

class Screen {
public:
    virtual void update() = 0;
    virtual void draw() = 0;
};