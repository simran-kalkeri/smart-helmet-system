#include <Arduino.h>
#include "state_machine.h"
#include "crash_detector.h"
#include "mqtt_manager.h"
#include "led.h"
#include "button.h"
#include "config.h"

enum State { STATE_IDLE, STATE_MONITOR, STATE_PENDING };
static State state = STATE_MONITOR;
static unsigned long crashTime = 0;
static unsigned long lastStateChange = 0;
static bool cancelRequested = false;

void initStateMachine() {
  state = STATE_MONITOR;
}

void updateStateMachine() {
  if (state == STATE_MONITOR) {
    if (millis() - lastStateChange > 500) {
      if (crashCandidateDetected()) {
        Serial.println("STATE → CRASH_PENDING");
        state = STATE_PENDING;
        crashTime = millis();
        lastStateChange = millis();   
        ledOn();
        publishAccidentPending();
      }
    }
  }

  if (state == STATE_PENDING) {
    if (digitalRead(BUTTON_PIN) == LOW) {
      cancelRequested = true;
    }

    if (cancelRequested) {
      Serial.println("STATE → CANCELLED (False Alarm)");
      ledOff();
      publishCrashCancelled(); 
      resetCrashDetector();   
      cancelRequested = false;
      state = STATE_MONITOR;
      lastStateChange = millis();  
      return;
    }

    if (millis() - crashTime > CANCEL_WINDOW_MS) {
      Serial.println("STATE → CONFIRMED CRASH");
      ledOff();
      publishCrashConfirmed();
      resetCrashDetector();   
      state = STATE_MONITOR;
      lastStateChange = millis();  
    }
  }
}

extern void onExternalAccidentPending() {
  if (state == STATE_MONITOR) {
    Serial.println("STATE → CRASH_PENDING (external)");
    state = STATE_PENDING;
    crashTime = millis();
    lastStateChange = millis();  
    ledOn();
  }
}
