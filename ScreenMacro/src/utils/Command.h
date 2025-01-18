#pragma once

#include <Arduino.h>
#include <cstring>

#define DEFAULT_BUFFER_SIZE 1024

enum class CommandType : uint8_t {
    NoData,
    Acknowledge,
    Log,
    OpenProgram,
    StartStatistics,
    StopStatistics,
    SendStatistics,
    Boot
};


class Command {
public:

    Command(CommandType type, uint8_t* payload, size_t length);
    Command(CommandType type);
    Command();

    template<typename InsertType>
    Command& WriteArr(InsertType* insertData, size_t len) {
        std::memcpy(payload + length, insertData, sizeof(InsertType) * len);
        length = length + sizeof(InsertType) * len;

        return *this;
    }

    template<typename InsertType>
    friend Command& operator <<(Command& command, InsertType insertData) {
        std::memcpy(command.payload + command.length, &insertData, sizeof(InsertType));
        command.length = command.length + sizeof(InsertType);

        return command;
    }

    template<typename readType>
    Command& ReadArr(readType* ReadData, size_t len) {
        std::memcpy(ReadData, payload + _pos, sizeof(readType) * len);
        _pos += sizeof(readType) * len;

        return *this;
    }

    template<typename readType>
    friend Command& operator >>(Command& command, readType& ReadData) {
        std::memcpy(&ReadData, command.payload + command._pos, sizeof(readType));
        command._pos += sizeof(readType);

        return command;
    }


    CommandType type;
    uint8_t* payload;
    size_t length;

private:
    size_t _pos = 0;

    // static send buffer
    static uint8_t _defaultBuffer[DEFAULT_BUFFER_SIZE];
};