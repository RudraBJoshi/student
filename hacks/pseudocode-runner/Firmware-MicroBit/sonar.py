# ─────────────────────────────────────────────────────────────────────────────
#  SonarSensor — HC-SR04 ultrasonic driver for micro:bit
#
#  Cutebot wiring (built-in connector):
#    Trig → P1     Echo → P2   (front-facing sensor)
#
#  Left / right side sensors are not present on the stock Cutebot.
#  sonar_left and sonar_right are NullSonar stubs that always return 999 cm
#  (i.e. CAN_MOVE("left") / CAN_MOVE("right") are always True).
#  To add side sensors, replace the stubs below with real SonarSensor instances
#  wired to spare pins (e.g. P13/P14).
#
#  ping() returns distance in centimetres, or 999.0 on timeout (nothing in range).
# ─────────────────────────────────────────────────────────────────────────────

import utime
from microbit import pin1, pin2


class SonarSensor:
    def __init__(self, trig, echo):
        self._trig = trig
        self._echo = echo

    def ping(self):
        trig, echo = self._trig, self._echo
        TIMEOUT_US = 30000  # ~510 cm max

        # 10 µs trigger pulse
        trig.write_digital(0)
        utime.sleep_us(2)
        trig.write_digital(1)
        utime.sleep_us(10)
        trig.write_digital(0)

        # Wait for echo to go HIGH
        t0 = utime.ticks_us()
        while echo.read_digital() == 0:
            if utime.ticks_diff(utime.ticks_us(), t0) > TIMEOUT_US:
                return 999.0

        # Measure echo pulse width
        start = utime.ticks_us()
        while echo.read_digital() == 1:
            if utime.ticks_diff(utime.ticks_us(), start) > TIMEOUT_US:
                return 999.0
        end = utime.ticks_us()

        duration = utime.ticks_diff(end, start)
        return duration * 0.017  # µs → cm  (speed of sound / 2)


class NullSonar:
    """Stub for side sensors not present on the stock Cutebot."""
    def ping(self):
        return 999.0


# ── Sensor instances ───────────────────────────────────────────────────────────
sonar       = SonarSensor(pin1, pin2)  # front — CAN_MOVE("forward") / CAN_MOVE("backward")
sonar_left  = NullSonar()             # stub  — replace with SonarSensor(pin13, pin14) etc.
sonar_right = NullSonar()             # stub
