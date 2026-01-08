#include <Arduino.h>
#include "mpu6050.h"
#include "config.h"
#include <Wire.h>

static float ax, ay, az;
static float gx, gy, gz;
static bool mpuReady = false;

// MPU6050 registers
#define PWR_MGMT_1  0x6B
#define ACCEL_XOUT  0x3B

void initMPU() {
  Wire.begin(21, 22);

  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x1C);
  Wire.write(0x08);
  if (Wire.endTransmission() == 0) {
    mpuReady = true;
    Serial.println("MPU6050 initialized successfully");
  } else {
    mpuReady = false;
    Serial.println("MPU6050 NOT responding");
  }
}

bool isMPUReady() {
  return mpuReady;
}

void updateIMU() {
  if (!mpuReady) return;

  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(ACCEL_XOUT);
  Wire.endTransmission(false);

  Wire.requestFrom(MPU6050_ADDR, 14, true);

  int16_t rawAx = (Wire.read() << 8) | Wire.read();
  int16_t rawAy = (Wire.read() << 8) | Wire.read();
  int16_t rawAz = (Wire.read() << 8) | Wire.read();
  Wire.read(); Wire.read(); // temperature (ignored)
  int16_t rawGx = (Wire.read() << 8) | Wire.read();
  int16_t rawGy = (Wire.read() << 8) | Wire.read();
  int16_t rawGz = (Wire.read() << 8) | Wire.read();

  // Convert to physical units
  ax = rawAx / ACCEL_SCALE;
  ay = rawAy / ACCEL_SCALE;
  az = rawAz / ACCEL_SCALE;

  gx = rawGx / GYRO_SCALE;
  gy = rawGy / GYRO_SCALE;
  gz = rawGz / GYRO_SCALE;

  #if DEBUG
  Serial.print("IMU | Ax: "); Serial.print(ax);
  Serial.print(" Ay: "); Serial.print(ay);
  Serial.print(" Az: "); Serial.println(az);
  #endif
}

// Getters
float getAx() { return ax; }
float getAy() { return ay; }
float getAz() { return az; }

float getGx() { return gx; }
float getGy() { return gy; }
float getGz() { return gz; }


