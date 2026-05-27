// Stats package — MIN, MAX, SUM, MEAN (operate on lists)
(function () {
  window.APCSP_PACKAGES = window.APCSP_PACKAGES || {};
  window.APCSP_PACKAGES.stats = {
    MIN: function (lst) {
      if (!Array.isArray(lst) || !lst.length) throw new Error('MIN requires a non-empty list');
      return Math.min.apply(null, lst);
    },
    MAX: function (lst) {
      if (!Array.isArray(lst) || !lst.length) throw new Error('MAX requires a non-empty list');
      return Math.max.apply(null, lst);
    },
    SUM: function (lst) {
      if (!Array.isArray(lst)) throw new Error('SUM requires a list');
      return lst.reduce(function (a, b) { return a + b; }, 0);
    },
    MEAN: function (lst) {
      if (!Array.isArray(lst) || !lst.length) throw new Error('MEAN requires a non-empty list');
      return lst.reduce(function (a, b) { return a + b; }, 0) / lst.length;
    },
  };
})();
