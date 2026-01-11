#include "config.h"
#include "mpu6050.h"
#include "imu_filters.h"
//#include "crash_detector.h"  // Old threshold-based detector
#include "ml_crash_detector.h"  // New ML-based detector
#include "state_machine.h"
#include "mqtt_manager.h"
#include "led.h"
#include "button.h"
#include "data_logger.h"
#define DEBUG 1

void setup() {
  Serial.begin(115200);
  Serial.println("System booted");
  initMPU();
  initMQTT();
  initLED();
  initButton();
  initDataLogger();
  initMLCrashDetector();  // Initialize ML detector

  initStateMachine();
  Serial.println("System ready - ML-based accident detection active");
  Serial.println("Send START:label or STOP for data collection");
}

void loop() {
  updateIMU();
  
  // Handle Serial commands for data collection
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.startsWith("START:")) {
      String label = command.substring(6);
      startDataCollection(label);
    } 
    else if (command == "STOP") {
      stopDataCollection();
    }
    else if (command == "STATUS") {
      if (isCollecting()) {
        Serial.println("STATUS:COLLECTING:" + getCurrentLabel() + ":Samples=" + String(getSampleCount()));
      } else {
        Serial.println("STATUS:IDLE");
      }
    }
  }
  
  // Log sensor data if collecting
  if (isCollecting()) {
    logSensorSample();
  } else {
    // Normal operation mode
    updateStateMachine();
    handleMQTT();
  }
}
