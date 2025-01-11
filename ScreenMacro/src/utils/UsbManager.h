#pragma once

#include "USB.h"
#include "USBHIDKeyboard.h"
#include "USBHIDConsumerControl.h"
#include <vector>
#include <esp32-hal.h>
#include "config.h"

#define START_BYTE 0x7E
#define END_BYTE 0x7F
#define ESCAPE_BYTE 0x7D

#define CDC_RX_BUFFER_SIZE 2048
#define CDC_TX_BUFFER_SIZE 1024

enum class CommandType : uint8_t {
    NoData,
    Acknowledge,
    Log,
    OpenProgram
};

struct Command {
    CommandType type;
    uint8_t* payload;
    size_t length;
};

class UsbManager {
public:
    UsbManager(UsbManager const &) = delete;

    void operator=(UsbManager const &) = delete;

    static UsbManager &getInstance() {
        static UsbManager instance;
        return instance;
    }

    void setup();

    Command readCommand();

    void sendCommand(CommandType type, uint8_t *payload, size_t length);

    USBHIDKeyboard keyboard = USBHIDKeyboard();
    USBCDC cdc = USBCDC();
    USBHIDConsumerControl consumerControl = USBHIDConsumerControl();
private:
    int timedRead();

    int readByteWithChecksum(uint8_t &checksum);

    UsbManager() {};

    uint8_t _rxBuffer[CDC_RX_BUFFER_SIZE];
    uint8_t _txBuffer[CDC_TX_BUFFER_SIZE];
};