#include "config.h"
#include "mpu6050.h"
#include "imu_filters.h"
#include "crash_detector.h"
#include "state_machine.h"
#include "mqtt_manager.h"
#include "led.h"
#include "button.h"
#define DEBUG 1

void setup() {
  Serial.begin(115200);
  Serial.println("System booted");
  initMPU();
  initMQTT();
  initLED();
  initButton();

  initStateMachine();
  Serial.println("System booted");
}

void loop() {
  updateIMU();
  updateStateMachine();
  handleMQTT();
}
