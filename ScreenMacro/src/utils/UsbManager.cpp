#include "UsbManager.h"

void UsbManager::setup() {
    USB.PID(USB_PID);
    USB.VID(USB_VID);
    USB.manufacturerName(USB_MANUFACTURER);
    USB.productName(USB_PRODUCT);

    keyboard.begin();
    cdc.begin();
    consumerControl.begin();
    USB.begin();
}

int UsbManager::timedRead() {
    int c;
    auto _startMillis = millis();

    do {
        c = cdc.read();
        if(c >= 0) return c;
    } while(millis() - _startMillis < TIMED_READ_TIMEOUT);

    return -1;
}


int UsbManager::readByteWithChecksum(uint8_t& checksum) {
    int b = timedRead();

    if (b == -1) return -1;

    if (b == ESCAPE_BYTE) {
        b = cdc.read();
        if (b == -1) return -1;
        b ^= 0x20;
    }

    checksum ^= b;
    return b;
}

Command UsbManager::readCommand() {
    int c = 0;

    while (c != START_BYTE && c != -1) {
        c = cdc.read();
    }

    if (c == -1) return {};

    uint8_t checksum = 0;

    int typeData = readByteWithChecksum(checksum);

    if (typeData == -1) return {};

    int lengthBig = readByteWithChecksum(checksum);
    int lengthSmall = readByteWithChecksum(checksum);

    if (lengthBig == -1 || lengthSmall == -1) return {};

    size_t length = (lengthBig << 8) | lengthSmall;

    if (length > CDC_RX_BUFFER_SIZE) return {};


    for (size_t i = 0; i < length; ++i) {
        int data = readByteWithChecksum(checksum);
        if (data == -1) return {};
        _rxBuffer[i] = data;
    }

    int receivedChecksum = readByteWithChecksum(checksum);

    if (checksum != 0 || receivedChecksum == -1) {
        return {};
    }

    if (timedRead() != END_BYTE) return {};

    return {(CommandType)typeData, _rxBuffer, length};
}

void writeByteWithChecksum(uint8_t b, uint8_t* buffer, uint8_t& checksum, size_t& index) {
    if (b == START_BYTE || b == END_BYTE || b == ESCAPE_BYTE) {
        buffer[index++] = ESCAPE_BYTE;
        buffer[index++] = b ^ 0x20;
    } else {
        buffer[index++] = b;
    }

    checksum ^= b;
}

void UsbManager::sendCommand(CommandType type, uint8_t* payload, size_t length){
    uint8_t checksum = 0;
    size_t index = 0;

    _txBuffer[index++] = START_BYTE;

    writeByteWithChecksum((uint8_t)type, _txBuffer, checksum, index);
    writeByteWithChecksum((uint8_t)(length >> 8), _txBuffer, checksum, index);
    writeByteWithChecksum((uint8_t)(length & 0xFF), _txBuffer, checksum, index);

    for (size_t i = 0; i < length; ++i) {
        writeByteWithChecksum(payload[i], _txBuffer, checksum, index);
    }

    writeByteWithChecksum(checksum, _txBuffer, checksum, index);
    _txBuffer[index++] = END_BYTE;

    cdc.write(_txBuffer, index);
}