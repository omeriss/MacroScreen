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
#define BUTTONS_PER_SCREEN (BUTTON_ROWS * BUTTON_COLS)

#define JSON_PATH "/screen.json"
#define IMAGE_PATH "/images"

// json analyze
#define BUTTON_TYPE "type"
#define BUTTON_LABEL "label"
#define BUTTON_PATH "path"
#define BUTTON_INDEX "index"
#define BUTTON_BACKGROUND "background"
#define BUTTON_FOLDER "folder"
#define BUTTON_PRESS "press"
#define BUTTON_APP "app"
#define BUTTON_SCRIPT "script"

#define FOLDER_BUTTONS "buttons"

#define FOLDER_TYPE "folder"
#define GAMING_TYPE "gaming"
#define AUDIO_TYPE "audio"
#define KEYBOARD_TYPE "keyboard"
#define APP_TYPE "app"
#define SCRIPT_TYPE "script"

// font config
#define FONT &FreeSansOblique12pt7b
#define FONT_BOLD &FreeSansBold12pt7b

// touch config
#define TOUCH_THRESHOLD 40

#define DOUBLE_TAP_THRESHOLD 500
#define SWIPE_THRESHOLD 100

// screen data
#define SCREEN_WIDTH 480
#define SCREEN_HEIGHT 320

// usb
#define USB_PID 0x1610
#define USB_VID 0x1610
#define USB_MANUFACTURER "Omeriss"
#define USB_PRODUCT "ScreenMacro"
#define TIMED_READ_TIMEOUT 100

#define MILS_TO_SLEEP (1000*60*5)
