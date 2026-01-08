#include "led.h"
#include "config.h"
#include <Arduino.h>

void initLED() {
  pinMode(LED_PIN, OUTPUT);
  ledOff();
}

void ledOn() {
  digitalWrite(LED_PIN, HIGH);   // use LOW if LED is active-low
}

void ledOff() {
  digitalWrite(LED_PIN, LOW);
}

void ledBlink() {
  digitalWrite(LED_PIN, !digitalRead(LED_PIN));
}
