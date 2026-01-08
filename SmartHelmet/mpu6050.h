#ifndef MPU6050_H
#define MPU6050_H

void initMPU();
void updateIMU();
bool isMPUReady();

// Accelerometer values in g
float getAx();
float getAy();
float getAz();

// Gyroscope values in degrees/second
float getGx();
float getGy();
float getGz();

#endif
