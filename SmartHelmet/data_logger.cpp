#include "data_logger.h"
#include "mpu6050.h"
#include "imu_filters.h"

// Data collection state
static bool collecting = false;
static String currentLabel = "";
static unsigned long sessionStartTime = 0;
static int sampleCount = 0;
static unsigned long lastSampleTime = 0;

#define SAMPLE_INTERVAL_MS 20  // 50Hz sampling rate

void initDataLogger() {
  collecting = false;
  currentLabel = "";
  sampleCount = 0;
  Serial.println("DATA_LOGGER:READY");
}

void startDataCollection(String label) {
  if (collecting) {
    Serial.println("DATA_LOGGER:ERROR:Already collecting");
    return;
  }
  
  collecting = true;
  currentLabel = label;
  sessionStartTime = millis();
  sampleCount = 0;
  lastSampleTime = 0;
  
  // Print CSV header
  Serial.println("DATA_LOGGER:START:" + label);
  Serial.println("timestamp_ms,ax,ay,az,gx,gy,gz,pitch,roll,label");
}

void stopDataCollection() {
  if (!collecting) {
    Serial.println("DATA_LOGGER:ERROR:Not collecting");
    return;
  }
  
  collecting = false;
  Serial.println("DATA_LOGGER:STOP:Samples=" + String(sampleCount));
  
  currentLabel = "";
  sampleCount = 0;
}

void logSensorSample() {
  if (!collecting) return;
  
  // Enforce sampling rate
  unsigned long now = millis();
  if (now - lastSampleTime < SAMPLE_INTERVAL_MS) {
    return;
  }
  lastSampleTime = now;
  
  // Get sensor data
  float ax = getAx();
  float ay = getAy();
  float az = getAz();
  float gx = getGx();
  float gy = getGy();
  float gz = getGz();
  float pitch = getPitch();
  float roll = getRoll();
  
  // Calculate timestamp relative to session start
  unsigned long timestamp = now - sessionStartTime;
  
  // Output CSV row
  Serial.print(timestamp);
  Serial.print(",");
  Serial.print(ax, 4);
  Serial.print(",");
  Serial.print(ay, 4);
  Serial.print(",");
  Serial.print(az, 4);
  Serial.print(",");
  Serial.print(gx, 4);
  Serial.print(",");
  Serial.print(gy, 4);
  Serial.print(",");
  Serial.print(gz, 4);
  Serial.print(",");
  Serial.print(pitch, 2);
  Serial.print(",");
  Serial.print(roll, 2);
  Serial.print(",");
  Serial.println(currentLabel);
  
  sampleCount++;
}

bool isCollecting() {
  return collecting;
}

String getCurrentLabel() {
  return currentLabel;
}

int getSampleCount() {
  return sampleCount;
}
