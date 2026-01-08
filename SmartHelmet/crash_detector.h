#ifndef CRASH_DETECTOR_H
#define CRASH_DETECTOR_H
#include <Arduino.h>

bool crashCandidateDetected();
float getCrashConfidence();
void resetCrashDetector();

#endif
