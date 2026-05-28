# ─────────────────────────────────────────────────────────────────────────────
#  MotorController — ELECFREAKS Cutebot I2C motor driver
#
#  Wiring: no extra wiring needed — the Cutebot drives both motors through its
#  onboard I2C bus (address 0x10).  Just plug the micro:bit in.
#
#  I2C packet format (4 bytes):
#    byte 0 : register  (0x01 = left motor,  0x02 = right motor)
#    byte 1 : direction (0x01 = forward,     0x02 = reverse, 0x00 = stop)
#    byte 2 : speed     (0–100)
#    byte 3 : 0x00 (padding)
#
#  Timing constants for a typical tiled floor at speed=80.
#  Calibrate CELL_TIME_MS and TURN_TIME_MS on your actual Cutebot.
# ─────────────────────────────────────────────────────────────────────────────

from microbit import i2c, sleep

CUTEBOT_ADDR = 0x10

# ── Tune these for your robot ──────────────────────────────────────────────────
MOTOR_SPEED   = 80   # 0–100
CELL_TIME_MS  = 700  # ms to travel one grid cell forward
TURN_TIME_MS  = 490  # ms to rotate 90 degrees in place
STEP_GAP_MS   = 80   # brief stop between moves (helps grid alignment)


class MotorController:

    def _send(self, l_dir, l_spd, r_dir, r_spd):
        i2c.write(CUTEBOT_ADDR, bytes([0x01, l_dir, l_spd, 0x00]))
        i2c.write(CUTEBOT_ADDR, bytes([0x02, r_dir, r_spd, 0x00]))

    def stop(self):
        self._send(0x00, 0, 0x00, 0)

    def forward(self):
        self._send(0x01, MOTOR_SPEED, 0x01, MOTOR_SPEED)
        sleep(CELL_TIME_MS)
        self.stop()
        sleep(STEP_GAP_MS)

    def backward(self):
        self._send(0x02, MOTOR_SPEED, 0x02, MOTOR_SPEED)
        sleep(CELL_TIME_MS)
        self.stop()
        sleep(STEP_GAP_MS)

    def left(self):
        # Left motor reverses, right motor advances → robot pivots left
        self._send(0x02, MOTOR_SPEED, 0x01, MOTOR_SPEED)
        sleep(TURN_TIME_MS)
        self.stop()
        sleep(STEP_GAP_MS)

    def right(self):
        # Left motor advances, right motor reverses → robot pivots right
        self._send(0x01, MOTOR_SPEED, 0x02, MOTOR_SPEED)
        sleep(TURN_TIME_MS)
        self.stop()
        sleep(STEP_GAP_MS)


motors = MotorController()
