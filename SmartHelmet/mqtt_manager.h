#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H
#include <Arduino.h> 

void initMQTT();
void handleMQTT();
void mqttCallback(char* topic, uint8_t* payload, unsigned int length);
void publishCrashConfirmed();
void publishCrashCancelled();
void publishAccidentPending();

#endif
