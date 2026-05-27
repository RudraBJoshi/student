// Math package — SQRT, ABS, FLOOR, CEIL, POW
(function () {
  window.APCSP_PACKAGES = window.APCSP_PACKAGES || {};
  window.APCSP_PACKAGES.math = {
    SQRT:  function (x) { return Math.sqrt(x); },
    ABS:   function (x) { return Math.abs(x); },
    FLOOR: function (x) { return Math.floor(x); },
    CEIL:  function (x) { return Math.ceil(x); },
    POW:   function (x, y) { return Math.pow(x, y); },
  };
})();
