//
// Created by omer1 on 1/17/2025.
//

#include "Command.h"

Command::Command(CommandType type, uint8_t *payload, size_t length) : type(type), payload(payload), length(length) {}

Command::Command(CommandType type) : type(type), payload(nullptr), length(0) {}

Command::Command() : type(CommandType::NoData), payload(nullptr), length(0) {}


