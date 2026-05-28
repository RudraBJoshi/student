#pragma once
#include <Arduino.h>

// ─────────────────────────────────────────────────────────────────────────────
//  UltrasonicSensor — HC-SR04 driver (configurable pins)
//
//  Create one instance per sensor, passing trig and echo pins:
//
//    UltrasonicSensor ultrasonic(7, 8);       // front
//    UltrasonicSensor ultrasonicLeft(11, 12); // left side
//    UltrasonicSensor ultrasonicRight(A0, A1);// right side  (A0=14, A1=15 on Uno)
//
//  read() returns distance in centimetres.
//  Returns 999.0 when no echo is received (nothing in range / wiring error).
// ─────────────────────────────────────────────────────────────────────────────

class UltrasonicSensor {
public:
  UltrasonicSensor(uint8_t trig, uint8_t echo) : _trig(trig), _echo(echo) {}

  void begin() {
    pinMode(_trig, OUTPUT);
    pinMode(_echo, INPUT);
  }

  // Returns distance in cm.  Blocks for up to ~30 ms waiting for echo.
  float read() {
    // Send 10 µs trigger pulse
    digitalWrite(_trig, LOW);
    delayMicroseconds(2);
    digitalWrite(_trig, HIGH);
    delayMicroseconds(10);
    digitalWrite(_trig, LOW);

    // Measure echo duration (30 000 µs timeout ≈ 510 cm max)
    unsigned long duration = pulseIn(_echo, HIGH, 30000UL);
    return (duration > 0) ? duration * 0.017f : 999.0f;
  }

private:
  uint8_t _trig, _echo;
};
