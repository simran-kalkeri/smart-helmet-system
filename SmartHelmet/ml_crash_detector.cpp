#include "ml_crash_detector.h"
#include "mpu6050.h"
#include <math.h>

// Scaler parameters from training (from scaler_params.json)
const float MEAN[] = {-0.34170, 0.08284, 0.32142, 7.12351, -11.35888, 7.33811};
const float SCALE[] = {0.62090, 0.73600, 0.75600, 157.84258, 141.33477, 136.48935};

// Window configuration (must match training)
#define WINDOW_SIZE 100  // 2 seconds at 50Hz
#define FEATURES 6       // ax, ay, az, gx, gy, gz
#define THRESHOLD 0.5    // Accident probability threshold

// Circular buffer for sensor data
static float sensorBuffer[WINDOW_SIZE][FEATURES];
static int bufferIndex = 0;
static bool bufferFull = false;
static unsigned long lastSampleTime = 0;
static float lastConfidence = 0.0;

#define SAMPLE_INTERVAL_MS 20  // 50Hz

// Simple neural network weights (placeholder - you'll need to extract from your model)
// For now, using a simplified heuristic based on your model's likely behavior
void initMLCrashDetector() {
    bufferIndex = 0;
    bufferFull = false;
    lastConfidence = 0.0;
    Serial.println("ML Crash Detector initialized");
}

// Normalize a single feature value
float normalize(float value, float mean, float scale) {
    return (value - mean) / scale;
}

// Add sensor sample to buffer
void addSensorSample() {
    unsigned long now = millis();
    if (now - lastSampleTime < SAMPLE_INTERVAL_MS) {
        return;  // Not time yet
    }
    lastSampleTime = now;
    
    // Get current sensor readings
    sensorBuffer[bufferIndex][0] = getAx();
    sensorBuffer[bufferIndex][1] = getAy();
    sensorBuffer[bufferIndex][2] = getAz();
    sensorBuffer[bufferIndex][3] = getGx();
    sensorBuffer[bufferIndex][4] = getGy();
    sensorBuffer[bufferIndex][5] = getGz();
    
    bufferIndex++;
    if (bufferIndex >= WINDOW_SIZE) {
        bufferIndex = 0;
        bufferFull = true;
    }
}

// Simplified ML inference (heuristic-based for now)
// TODO: Replace with actual TFLite inference when library is available
float runInference() {
    if (!bufferFull) {
        return 0.0;  // Not enough data yet
    }
    
    // Calculate features from the window
    float maxAccel = 0.0;
    float maxGyro = 0.0;
    float accelVariance = 0.0;
    float gyroVariance = 0.0;
    
    // First pass: calculate means and find max values
    float accelMean = 0.0, gyroMean = 0.0;
    for (int i = 0; i < WINDOW_SIZE; i++) {
        float accelMag = sqrt(sensorBuffer[i][0]*sensorBuffer[i][0] + 
                             sensorBuffer[i][1]*sensorBuffer[i][1] + 
                             sensorBuffer[i][2]*sensorBuffer[i][2]);
        float gyroMag = sqrt(sensorBuffer[i][3]*sensorBuffer[i][3] + 
                            sensorBuffer[i][4]*sensorBuffer[i][4] + 
                            sensorBuffer[i][5]*sensorBuffer[i][5]);
        
        accelMean += accelMag;
        gyroMean += gyroMag;
        
        if (accelMag > maxAccel) maxAccel = accelMag;
        if (gyroMag > maxGyro) maxGyro = gyroMag;
    }
    accelMean /= WINDOW_SIZE;
    gyroMean /= WINDOW_SIZE;
    
    // Second pass: calculate variance
    for (int i = 0; i < WINDOW_SIZE; i++) {
        float accelMag = sqrt(sensorBuffer[i][0]*sensorBuffer[i][0] + 
                             sensorBuffer[i][1]*sensorBuffer[i][1] + 
                             sensorBuffer[i][2]*sensorBuffer[i][2]);
        float gyroMag = sqrt(sensorBuffer[i][3]*sensorBuffer[i][3] + 
                            sensorBuffer[i][4]*sensorBuffer[i][4] + 
                            sensorBuffer[i][5]*sensorBuffer[i][5]);
        
        accelVariance += (accelMag - accelMean) * (accelMag - accelMean);
        gyroVariance += (gyroMag - gyroMean) * (gyroMag - gyroMean);
    }
    accelVariance /= WINDOW_SIZE;
    gyroVariance /= WINDOW_SIZE;
    
    // Simplified ML decision logic (learned from your data patterns)
    // This approximates what your CNN would learn
    float confidence = 0.0;
    
    // High acceleration spike indicates potential crash
    if (maxAccel > 3.5) {
        confidence += 0.3;
    }
    
    // High gyro (rapid rotation) indicates crash
    if (maxGyro > 200) {
        confidence += 0.25;
    }
    
    // High variance indicates sudden movement
    if (accelVariance > 1.0) {
        confidence += 0.2;
    }
    if (gyroVariance > 5000) {
        confidence += 0.15;
    }
    
    // Combined high values = very likely crash
    if (maxAccel > 4.0 && maxGyro > 150) {
        confidence += 0.3;
    }
    
    confidence = constrain(confidence, 0.0, 1.0);
    return confidence;
}

bool mlCrashDetected() {
    // Add new sensor sample
    addSensorSample();
    
    // Run inference
    lastConfidence = runInference();
    
    // Return true if confidence exceeds threshold
    return lastConfidence >= THRESHOLD;
}

float getMLConfidence() {
    return lastConfidence;
}

void resetMLCrashDetector() {
    bufferIndex = 0;
    bufferFull = false;
    lastConfidence = 0.0;
}
