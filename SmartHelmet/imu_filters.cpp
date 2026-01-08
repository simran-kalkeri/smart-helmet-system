#include <Arduino.h>
#include "imu_filters.h"
#include "mpu6050.h"
#include <math.h>

float getPitch() {
  float ax = getAx();
  float ay = getAy();
  float az = getAz();

  return atan2(ax, sqrt(ay*ay + az*az)) * 180.0 / PI;
}

float getRoll() {
  float ay = getAy();
  float ax = getAx();
  float az = getAz();

  return atan2(ay, sqrt(ax*ax + az*az)) * 180.0 / PI;
}
