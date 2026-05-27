// Turtle package — canvas drawing for loop visualisation
// State lives in this closure; _init() resets it each run.
(function () {
  window.APCSP_PACKAGES = window.APCSP_PACKAGES || {};

  var _ctx = null;
  var _x = 150, _y = 150, _angle = -90; // angle: 0=right, -90=up
  var _penDown = true, _color = '#00ff41', _lineWidth = 2;

  function rad(deg) { return deg * Math.PI / 180; }

  window.APCSP_PACKAGES.turtle = {
    // Called by the interpreter when package is imported
    _init: function (state) {
      _ctx   = state.ctx;
      _x     = state.width  / 2;
      _y     = state.height / 2;
      _angle = -90;
      _penDown   = true;
      _color     = '#00ff41';
      _lineWidth = 2;
    },

    FORWARD: function (dist) {
      if (!_ctx) throw new Error('Turtle not initialised — import turtle before calling FORWARD');
      var nx = _x + dist * Math.cos(rad(_angle));
      var ny = _y + dist * Math.sin(rad(_angle));
      if (_penDown) {
        _ctx.beginPath();
        _ctx.strokeStyle = _color;
        _ctx.lineWidth   = _lineWidth;
        _ctx.moveTo(_x, _y);
        _ctx.lineTo(nx, ny);
        _ctx.stroke();
      }
      _x = nx; _y = ny;
    },

    BACKWARD: function (dist) {
      _angle += 180;
      window.APCSP_PACKAGES.turtle.FORWARD(dist);
      _angle -= 180;
    },

    LEFT:  function (deg) { _angle -= deg; },
    RIGHT: function (deg) { _angle += deg; },

    PEN_UP:   function () { _penDown = false; },
    PEN_DOWN: function () { _penDown = true;  },

    // COLOR("red") or COLOR(255, 0, 128)
    COLOR: function (colorOrR, g, b) {
      if (typeof colorOrR === 'string') {
        _color = colorOrR;
      } else {
        _color = 'rgb(' + Math.round(colorOrR) + ','
                        + Math.round(g)         + ','
                        + Math.round(b)         + ')';
      }
    },

    CLEAR: function () {
      if (_ctx) _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    },
  };
})();
