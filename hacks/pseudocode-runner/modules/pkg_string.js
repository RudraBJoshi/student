// String package — UPPER, LOWER, SUBSTRING, CONTAINS, SPLIT
(function () {
  window.APCSP_PACKAGES = window.APCSP_PACKAGES || {};
  window.APCSP_PACKAGES.string = {
    UPPER: function (s) {
      if (typeof s !== 'string') throw new Error('UPPER requires a string');
      return s.toUpperCase();
    },
    LOWER: function (s) {
      if (typeof s !== 'string') throw new Error('LOWER requires a string');
      return s.toLowerCase();
    },
    SUBSTRING: function (s, start, len) {
      if (typeof s !== 'string') throw new Error('SUBSTRING requires a string');
      return s.substr(start - 1, len); // 1-indexed start
    },
    CONTAINS: function (s, sub) {
      if (typeof s !== 'string') throw new Error('CONTAINS requires a string');
      return s.indexOf(String(sub)) !== -1;
    },
    SPLIT: function (s, delim) {
      if (typeof s !== 'string') throw new Error('SPLIT requires a string');
      return s.split(delim !== undefined ? String(delim) : '');
    },
  };
})();
