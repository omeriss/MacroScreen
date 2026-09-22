#include "Command.h"

uint8_t Command::_defaultBuffer[];

Command::Command(CommandType type, uint8_t *payload, size_t length) : type(type), payload(payload), length(length) {}

Command::Command(CommandType type) : type(type), payload(_defaultBuffer), length(0) {}

Command::Command() : type(CommandType::NoData), payload(_defaultBuffer), length(0) {}


