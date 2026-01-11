#include "crash_detector.h"
#include "mpu6050.h"
#include "imu_filters.h"
#include "config.h"
#include <math.h>

#define CONFIDENCE_DECAY 0.85  // More aggressive decay (was 0.9)
#define CONFIDENCE_TRIGGER 0.7
#define CRASH_COOLDOWN_MS 3000  // Reduced from 5000ms for faster recovery

static float confidence = 0.0;
static unsigned long cooldownUntil = 0;

bool crashCandidateDetected() {

  // Cooldown after previous crash
  if (millis() < cooldownUntil) return false;

  float ax = getAx();
  float ay = getAy();
  float az = getAz();

  float A = sqrt(ax*ax + ay*ay + az*az);
  float pitch = fabs(getPitch());
  float roll  = fabs(getRoll());

  // Decay old confidence
  confidence *= CONFIDENCE_DECAY;

  if (A > ACCEL_CRASH_G) confidence += 0.4;
  if (pitch > TILT_THRESHOLD_DEG || roll > TILT_THRESHOLD_DEG) confidence += 0.4;
  if (A > HARD_IMPACT_G) confidence = 1.0;

  confidence = constrain(confidence, 0.0, 1.0);

  return confidence >= CONFIDENCE_TRIGGER;
}

float getCrashConfidence() {
  return confidence;
}

void resetCrashDetector() {
  confidence = 0.0;
  cooldownUntil = millis() + CRASH_COOLDOWN_MS;
}
