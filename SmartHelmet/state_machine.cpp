#include <Arduino.h>
#include "state_machine.h"
//#include "crash_detector.h"  // Old threshold-based detector
#include "ml_crash_detector.h"  // New ML-based detector
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
      if (mlCrashDetected()) {  // Using ML model now!
        float confidence = getMLConfidence();
        Serial.print("STATE → CRASH_PENDING (ML confidence: ");
        Serial.print(confidence * 100);
        Serial.println("%)");
        state = STATE_PENDING;
        crashTime = millis();
        lastStateChange = millis();   
        ledOn();
        publishAccidentPending();
        // IMPORTANT: Reset ML detector immediately to prevent accumulation during pending state
        resetMLCrashDetector();
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
      // Ensure ML detector is fully reset
      resetMLCrashDetector();   
      cancelRequested = false;
      state = STATE_MONITOR;
      lastStateChange = millis();  
      return;
    }

    if (millis() - crashTime > CANCEL_WINDOW_MS) {
      Serial.println("STATE → CONFIRMED CRASH");
      ledOff();
      publishCrashConfirmed();
      // Ensure ML detector is fully reset
      resetMLCrashDetector();   
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
