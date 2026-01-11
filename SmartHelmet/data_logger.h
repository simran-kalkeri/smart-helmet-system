#ifndef DATA_LOGGER_H
#define DATA_LOGGER_H

#include <Arduino.h>

// Initialize data logger
void initDataLogger();

// Start data collection with label
void startDataCollection(String label);

// Stop data collection
void stopDataCollection();

// Log a single sensor sample
void logSensorSample();

// Check if currently collecting
bool isCollecting();

// Get current session info
String getCurrentLabel();
int getSampleCount();

#endif
