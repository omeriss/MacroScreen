#pragma once

#include <Arduino.h>
#include <cstring>

#define DEFAULT_BUFFER_SIZE 2048

enum class CommandType : uint8_t {
    NoData,
    Acknowledge,
    Log,
    StartWriteFile,
    SendFilePart,
    Ls,
    LogFile,
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
    Command& writeArr(InsertType* insertData, uint16_t len) {
        (*this) << len;
        std::memcpy(payload + length, insertData, sizeof(InsertType) * len);
        length = length + sizeof(InsertType) * len;

        return *this;
    }

    Command& writeString(const char* str) {
        uint16_t len = strlen(str);
        (*this) << len;
        std::memcpy(payload + length, str, len);
        length = length + len;

        return *this;
    }

    template<typename InsertType>
    friend Command& operator <<(Command& command, InsertType insertData) {
        std::memcpy(command.payload + command.length, &insertData, sizeof(InsertType));
        command.length = command.length + sizeof(InsertType);

        return command;
    }

    template<typename readType>
    friend Command& operator >>(Command& command, readType& ReadData) {
        std::memcpy(&ReadData, command.payload + command._pos, sizeof(readType));
        command._pos += sizeof(readType);

        return command;
    }

    template<typename readType>
    Command& readArr(readType* ReadData) {
        uint16_t len;
        (*this) >> len;
        std::memcpy(ReadData, payload + _pos, sizeof(readType) * len);
        _pos += sizeof(readType) * len;

        return *this;
    }

    Command& readString(char* str) {
        uint16_t len;
        (*this) >> len;
        std::memcpy(str, payload + _pos, len);
        str[len] = '\0';
        _pos += len;

        return *this;
    }

    CommandType type;
    uint8_t* payload;
    size_t length;

private:
    size_t _pos = 0;

    // static send buffer
    static uint8_t _defaultBuffer[DEFAULT_BUFFER_SIZE];
};