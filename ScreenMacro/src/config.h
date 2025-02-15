//pins
#define SDA_PIN 4
#define SCL_PIN 5
#define BACKLIGHT_PIN 14
#define SCREEN_INT_PIN 8

// Buttons Data
#define BUTTON_W 140
#define BUTTON_H 80

#define BUTTON_START_X (BUTTON_W / 2 + 15)
#define BUTTON_START_Y (BUTTON_H / 2 + 20)

#define BUTTON_SPACING_X 15
#define BUTTON_SPACING_Y 20
#define BUTTON_TEXT_SIZE 1

#define BUTTON_ROWS 3
#define BUTTON_COLS 3

// font config
#define FONT &FreeSansOblique12pt7b
#define FONT_BOLD &FreeSansBold12pt7b

// touch config
#define TOUCH_THRESHOLD 40

#define DOUBLE_TAP_THRESHOLD 500

// screen data
#define SCREEN_WIDTH 480
#define SCREEN_HEIGHT 320

// usb
#define USB_PID 0x1610
#define USB_VID 0x1610
#define USB_MANUFACTURER "Omeriss"
#define USB_PRODUCT "ScreenMacro"
#define TIMED_READ_TIMEOUT 100