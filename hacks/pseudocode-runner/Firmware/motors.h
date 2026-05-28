#pragma once
#include <Arduino.h>

// ─────────────────────────────────────────────────────────────────────────────
//  MotorController — L298N dual H-bridge driver
//
//  Wiring (change the pin constants below if your board differs):
//
//    L298N  │  Arduino Uno/Nano
//    ───────┼──────────────────
//    ENA    │  9   (PWM, left motor speed)
//    IN1    │  2   (left motor direction A)
//    IN2    │  3   (left motor direction B)
//    ENB    │  10  (PWM, right motor speed)
//    IN3    │  4   (right motor direction A)
//    IN4    │  5   (right motor direction B)
//
//  Timing constants are for a typical 5 V robot on a tiled floor.
//  Calibrate CELL_TIME_MS and TURN_TIME_MS on your actual hardware.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tune these for your robot ─────────────────────────────────────────────────
#define MOTOR_SPEED    200   // PWM 0-255
#define CELL_TIME_MS   700   // ms to travel one grid cell
#define TURN_TIME_MS   490   // ms to rotate 90 degrees in place
#define STEP_GAP_MS     80   // brief stop between moves (helps grid alignment)

class MotorController {
public:
  void begin() {
    pinMode(_ena, OUTPUT); pinMode(_in1, OUTPUT); pinMode(_in2, OUTPUT);
    pinMode(_enb, OUTPUT); pinMode(_in3, OUTPUT); pinMode(_in4, OUTPUT);
    stop();
  }

  // Move one grid cell forward.
  void forward() {
    _drive(MOTOR_SPEED, true, MOTOR_SPEED, true);
    delay(CELL_TIME_MS);
    stop();
    delay(STEP_GAP_MS);
  }

  // Move one grid cell backward.
  void backward() {
    _drive(MOTOR_SPEED, false, MOTOR_SPEED, false);
    delay(CELL_TIME_MS);
    stop();
    delay(STEP_GAP_MS);
  }

  // Rotate 90 degrees left (counter-clockwise) in place.
  void turnLeft() {
    _drive(MOTOR_SPEED, false, MOTOR_SPEED, true);
    delay(TURN_TIME_MS);
    stop();
    delay(STEP_GAP_MS);
  }

  // Rotate 90 degrees right (clockwise) in place.
  void turnRight() {
    _drive(MOTOR_SPEED, true, MOTOR_SPEED, false);
    delay(TURN_TIME_MS);
    stop();
    delay(STEP_GAP_MS);
  }

  void stop() {
    analogWrite(_ena, 0);
    analogWrite(_enb, 0);
    digitalWrite(_in1, LOW); digitalWrite(_in2, LOW);
    digitalWrite(_in3, LOW); digitalWrite(_in4, LOW);
  }

private:
  // Pin assignments — edit here if your wiring is different
  static const uint8_t _ena = 9,  _in1 = 2, _in2 = 3;
  static const uint8_t _enb = 10, _in3 = 4, _in4 = 5;

  void _drive(uint8_t lSpd, bool lFwd, uint8_t rSpd, bool rFwd) {
    analogWrite(_ena, lSpd);
    digitalWrite(_in1, lFwd ? HIGH : LOW);
    digitalWrite(_in2, lFwd ? LOW  : HIGH);
    analogWrite(_enb, rSpd);
    digitalWrite(_in3, rFwd ? HIGH : LOW);
    digitalWrite(_in4, rFwd ? LOW  : HIGH);
  }
};
