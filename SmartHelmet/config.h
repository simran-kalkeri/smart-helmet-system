#ifndef CONFIG_H
#define CONFIG_H

// IMU
#define IMU_SAMPLE_RATE 100   // Hz

// Crash thresholds
#define ACCEL_WARN_G     3.0
#define ACCEL_CRASH_G    4.5
#define HARD_IMPACT_G    3.5

#define TILT_THRESHOLD_DEG 60
#define TILT_TIME_MS     2000

// Cancel window
#define CANCEL_WINDOW_MS 10000

// BLE
#define BLE_DEVICE_NAME "SmartHelmet"

// Pins
#define LED_PIN 2   // or LED_BUILTIN if defined
#define BUTTON_PIN 26

// MPU6050 I2C
#define MPU6050_ADDR 0x68

// Sensitivity (default ranges)
#define ACCEL_SCALE 16384.0   // ±2g
#define GYRO_SCALE  131.0     // ±250 deg/s

#endif
