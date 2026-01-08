#include "button.h"
#include "config.h"
#include <Arduino.h>


static bool lastButtonState = HIGH;
static unsigned long lastDebounceTime = 0;
static const unsigned long debounceDelay = 50; // ms

void initButton() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

bool buttonPressed() {
  static bool stableState = HIGH;      // debounced state
  static bool lastStableState = HIGH;  // previous debounced state

  bool reading = digitalRead(BUTTON_PIN);

  if (reading != stableState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    stableState = reading;
  }

  // Detect FALLING EDGE on stable signal
  if (lastStableState == HIGH && stableState == LOW) {
    lastStableState = stableState;
    return true;
  }

  lastStableState = stableState;
  return false;
}

