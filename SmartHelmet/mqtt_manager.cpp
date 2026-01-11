#include "mqtt_manager.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include "mpu6050.h"
#include "imu_filters.h"
#include <Arduino.h>  

// 🔹 CHANGE THESE
const char* ssid = "Oppo 17";
const char* password = "1234567802";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);
extern void onExternalAccidentPending();

void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    String clientId = "ESP32_HELMET_H001_" + String(WiFi.macAddress());
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe("helmet/H001/event");
    } else {
      Serial.print("failed, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void initMQTT() {
  setupWiFi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttCallback);
  reconnectMQTT();
}

void handleMQTT() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
}

void mqttCallback(char* topic, uint8_t* payload, unsigned int length){
  Serial.println("🔥 MQTT CALLBACK TRIGGERED");

  Serial.print("Topic: ");
  Serial.println(topic);

  Serial.print("Payload length: ");
  Serial.println(length);
  
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.print("MQTT RX PAYLOAD: ");
  Serial.println(msg);

  if (msg.indexOf("ACCIDENT_PENDING") >= 0) {
    Serial.println("✅ ACCIDENT_PENDING DETECTED IN PAYLOAD");
    onExternalAccidentPending();
  }
}

void publishAccidentPending() {
  char payload[512];

  snprintf(payload, sizeof(payload),
    "{"
      "\"type\":\"ACCIDENT_PENDING\","
      "\"helmetId\":\"H001\","
      "\"source\":\"ESP32\","
      "\"timestamp\":%lu"
    "}",
    millis()
  );

  client.publish("helmet/H001/event", payload, false);
  Serial.println(" MQTT: Crash pending published");
}

void publishCrashConfirmed() {
  char payload[256];

  float ax = getAx();
  float ay = getAy();
  float az = getAz();
  float gForce = sqrt(ax*ax + ay*ay + az*az);

  snprintf(payload, sizeof(payload),
    "{"
      "\"type\":\"CRASH_CONFIRMED\","
      "\"helmetId\":\"H001\","
      "\"gForce\":%.2f,"
      "\"tilt\":%.2f,"
      "\"acceleration\":{"
        "\"x\":%.2f,"
        "\"y\":%.2f,"
        "\"z\":%.2f"
      "},"
      "\"cancelWindow\":\"EXPIRED\","
      "\"source\":\"ESP32\""
    "}",
    gForce,
    getPitch(),
    ax, ay, az
  );

  client.publish("helmet/H001/event", payload, true);
  Serial.println("🚨 MQTT: Crash confirmed published");
}

void publishCrashCancelled() {
  char payload[200];

  snprintf(payload, sizeof(payload),
    "{"
      "\"type\":\"CRASH_CANCELLED\","
      "\"helmetId\":\"H001\","
      "\"reason\":\"USER_OVERRIDE\","
      "\"timestamp\":%lu,"
      "\"source\":\"ESP32\""
    "}",
    millis()
  );

  client.publish("helmet/H001/event", payload, true);
  Serial.println("🟡 MQTT: Crash cancelled published");
}

