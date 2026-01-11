#ifndef ML_CRASH_DETECTOR_H
#define ML_CRASH_DETECTOR_H

#include <Arduino.h>

// Initialize ML crash detector
void initMLCrashDetector();

// Returns true if ML model predicts an accident
bool mlCrashDetected();

// Get the probability/confidence of accident (0.0-1.0)
float getMLConfidence();

// Reset the detector
void resetMLCrashDetector();

#endif
