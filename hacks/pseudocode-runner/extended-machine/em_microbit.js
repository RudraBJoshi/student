// Extended Machine — Micro:bit package for PseudoSystem
// Loaded via:  FROM LOCAL.PKG IMPORT microbit
//
// Browser mode  (window.APCSP_RUNTIME === 'browser' or unset):
//   No monkey-patching needed — the existing robot globals handle everything.
//
// MicroPython mode  (window.APCSP_RUNTIME === 'mpy'):
//   After running, call window.APCSP_PACKAGES.microbit._getMpy() to get a
//   complete .py file ready for micro:bit.
//
//   Generation uses an AST-walking Transpiler, NOT the monkey-patch approach.
//   The browser simulation still runs so the tilemap animates normally.
//
// Requires window.APCSP_LAST_AST to be set after parse() in the run handler.

(function () {
  'use strict';

  window.APCSP_PACKAGES = window.APCSP_PACKAGES || {};

  // ═══════════════════════════════════════════════════════════════════════════
  //  AST → MicroPython Transpiler
  //
  //  Usage:  new Transpiler(indentDepth).generate(astStmtArray)
  //          Returns a single MicroPython string with correct indentation.
  //
  //  Correctly handles:
  //    IF / ELSE IF / ELSE      → if / elif / else
  //    REPEAT n TIMES           → for _i in range(n)
  //    REPEAT UNTIL (cond)      → while not (cond)  [NOT-cond optimised]
  //    FOR EACH x IN list       → for x in list
  //    PROCEDURE name(p) { }    → hoisted def before main code
  //    MOVE_FORWARD / ROTATE_*  → motors.*()
  //    CAN_MOVE("dir")          → sonar*.ping() < THRESHOLD
  //    DISPLAY(...)             → print(...)
  //    Variable assignment      → x = val  (no type declarations)
  // ═══════════════════════════════════════════════════════════════════════════

  function Transpiler(depth, declared) {
    this.depth    = depth    || 0;
    this.declared = declared || Object.create(null);
  }

  Transpiler.prototype = {

    // ── entry point ──────────────────────────────────────────────────────────
    generate: function (stmts) {
      return stmts
        .map(s  => this.stmt(s))
        .filter(l => l != null)
        .join('\n');
    },

    // ── statement dispatcher ──────────────────────────────────────────────────
    stmt: function (s) {
      var p = this.ind();
      switch (s.type) {

        // x ← expr
        // Skip 2D-list assignments — browser-only map data (no grid on micro:bit)
        case 'Assign': {
          if (s.value.type === 'List' &&
              s.value.items.length > 0 &&
              s.value.items[0].type === 'List') return null;
          return p + s.name + ' = ' + this.expr(s.value);
        }

        // a[i] ← expr
        case 'ListAssign':
          return p + s.name + '[' + this.expr(s.index) + ' - 1] = ' +
                 this.expr(s.value);

        // IF (cond) { } ELIF { } ELSE { }
        case 'If': {
          var out = p + 'if ' + this.expr(s.cond) + ':\n' +
                    this.block(s.then);
          for (var i = 0; i < s.elseifs.length; i++)
            out += p + 'elif ' + this.expr(s.elseifs[i].cond) + ':\n' +
                   this.block(s.elseifs[i].body);
          if (s.else) out += p + 'else:\n' + this.block(s.else);
          return out.trimEnd();
        }

        // REPEAT n TIMES { }
        case 'RepeatTimes':
          return (p + 'for _i in range(' + this.expr(s.count) + '):\n' +
                  this.block(s.body)).trimEnd();

        // REPEAT UNTIL (cond) { }
        // Optimisation: REPEAT UNTIL (NOT expr) → while (expr)
        case 'RepeatUntil': {
          var cond = (s.cond.type === 'UnOp' && s.cond.op === 'NOT')
            ? this.expr(s.cond.expr)
            : 'not (' + this.expr(s.cond) + ')';
          return (p + 'while ' + cond + ':\n' +
                  this.block(s.body)).trimEnd();
        }

        // FOR EACH x IN list { }
        case 'ForEach':
          return (p + 'for ' + s.var + ' in ' + this.expr(s.list) + ':\n' +
                  this.block(s.body)).trimEnd();

        // PROCEDURE name(params) { body }
        // Hoisted before main code by _getMpy().
        case 'ProcDef': {
          var params = s.params.join(', ');
          var inner  = new Transpiler(this.depth + 1, Object.create(null));
          s.params.forEach(function (pr) { inner.declared[pr] = true; });
          var body   = inner.generate(s.body);
          if (!body) body = inner.ind() + 'pass';
          return p + 'def ' + s.name + '(' + params + '):\n' + body;
        }

        // RETURN(expr)
        case 'Return':
          return p + 'return ' + this.expr(s.value);

        // DISPLAY(a, b, ...)
        case 'Display': {
          if (s.args.length === 1)
            return p + 'print(' + this.expr(s.args[0]) + ')';
          return p + 'print(' +
                 s.args.map(a => 'str(' + this.expr(a) + ')').join(' + " " + ') +
                 ')';
        }

        // Robot + list builtins as statements
        case 'BuiltinStmt':
          return this.builtinStmt(s, p);

        // User procedure call
        case 'Call':
          return p + s.name + '(' + s.args.map(a => this.expr(a)).join(', ') + ')';

        // Local storage / package import — skip silently
        case 'FromPkgImport':
        case 'FromLocalImport':
        case 'ToLocalSave':
        case 'ListLocal':
        case 'DeleteLocal':
          return null;

        default: return null;
      }
    },

    // ── robot and list builtin statements ─────────────────────────────────────
    builtinStmt: function (s, p) {
      switch (s.name) {
        case 'MOVE_FORWARD':  return p + 'motors.forward()';
        case 'ROTATE_LEFT':   return p + 'motors.left()';
        case 'ROTATE_RIGHT':  return p + 'motors.right()';
        case 'SPAWN': {
          var a = s.args.map(x => this.expr(x));
          return p + '# Robot spawned at row ' + a[1] + ' col ' + a[2];
        }
        case 'RENDER':  return p + '# Map loaded';
        case 'APPEND':
          return p + this.expr(s.args[0]) + '.append(' +
                 this.expr(s.args[1]) + ')';
        case 'INSERT':
          return p + this.expr(s.args[0]) + '.insert(' +
                 this.expr(s.args[1]) + ' - 1, ' +
                 this.expr(s.args[2]) + ')';
        case 'REMOVE':
          return p + this.expr(s.args[0]) + '.pop(' +
                 this.expr(s.args[1]) + ' - 1)';
        default:
          return p + '# ' + s.name + '(' + s.args.map(a => this.expr(a)).join(', ') + ')';
      }
    },

    // ── expression dispatcher ─────────────────────────────────────────────────
    expr: function (node) {
      switch (node.type) {
        case 'Num':  return String(node.value);
        case 'Str':  return '"' + node.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        case 'Bool': return node.value ? 'True' : 'False';
        case 'Var':  return node.name;

        case 'Index':
          return this.expr(node.list) + '[' + this.expr(node.index) + ' - 1]';

        case 'List':
          return '[' + node.items.map(i => this.expr(i)).join(', ') + ']';

        case 'BinOp': {
          var ops = {
            '+':'+', '-':'-', '*':'*', '/':'/',
            'MOD':'%', 'AND':'and', 'OR':'or',
            '=':'==', '≠':'!=', '<':'<', '>':'>', '<=':'<=', '>=':'>='
          };
          return '(' + this.expr(node.left) + ' ' +
                 (ops[node.op] || node.op) + ' ' +
                 this.expr(node.right) + ')';
        }

        case 'UnOp':
          return node.op === 'NOT'
            ? 'not (' + this.expr(node.expr) + ')'
            : node.op + this.expr(node.expr);

        case 'Builtin': return this.builtinExpr(node);

        case 'Call':
          return node.name + '(' + node.args.map(a => this.expr(a)).join(', ') + ')';

        default: return '# ?';
      }
    },

    // ── builtin expressions (inside conditions, assignments, etc.) ────────────
    builtinExpr: function (node) {
      switch (node.name) {
        // CAN_MOVE maps to the appropriate sonar sensor for the direction.
        case 'CAN_MOVE': {
          var arg = node.args[0];
          var dir = (arg && arg.type === 'Str') ? arg.value.toLowerCase() : 'forward';
          if (dir === 'left')  return 'sonar_left.ping() < THRESHOLD';
          if (dir === 'right') return 'sonar_right.ping() < THRESHOLD';
          return 'sonar.ping() < THRESHOLD';
        }
        case 'MOVE_FORWARD': return 'motors.forward()';
        case 'ROTATE_LEFT':  return 'motors.left()';
        case 'ROTATE_RIGHT': return 'motors.right()';
        case 'LENGTH':
          return 'len(' + this.expr(node.args[0]) + ')';
        case 'RANDOM':
          return 'random.randint(' + this.expr(node.args[0]) + ', ' +
                 this.expr(node.args[1]) + ')';
        case 'INPUT':
          return 'input()';
        default:
          return node.name + '(' + node.args.map(a => this.expr(a)).join(', ') + ')';
      }
    },

    // ── helpers ───────────────────────────────────────────────────────────────
    block: function (stmts) {
      this.depth++;
      var lines   = stmts.map(s => this.stmt(s)).filter(l => l != null);
      var passInd = this.ind() + 'pass';
      this.depth--;
      if (!lines.length) return passInd + '\n';
      return lines.join('\n') + '\n';
    },

    ind: function () {
      var s = '';
      for (var i = 0; i < this.depth; i++) s += '    ';
      return s;
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  .py boilerplate
  // ═══════════════════════════════════════════════════════════════════════════

  var BOILERPLATE_TOP = [
    '# Generated by PseudoSystem — place motors.py + sonar.py on your micro:bit.',
    'from microbit import *',
    'import random',
    'from motors import motors',
    'from sonar import sonar, sonar_left, sonar_right',
    '',
    'THRESHOLD = 15  # cm — obstacle detection distance',
    '',
  ].join('\n');

  // ═══════════════════════════════════════════════════════════════════════════
  //  Package registration
  // ═══════════════════════════════════════════════════════════════════════════

  window.APCSP_PACKAGES.microbit = {

    _reset: function () {},

    // Returns a complete, runnable .py file for micro:bit.
    // PROCEDUREs are hoisted before the main code block.
    _getMpy: function () {
      var ast = window.APCSP_LAST_AST;
      if (!ast || !ast.length)
        return '# Run a program first to generate MicroPython output.';

      var procs = ast.filter(function (s) { return s.type === 'ProcDef'; });
      var stmts = ast.filter(function (s) { return s.type !== 'ProcDef'; });

      var procBlock = procs.length
        ? new Transpiler(0).generate(procs) + '\n\n'
        : '';

      var mainBody = new Transpiler(0).generate(stmts).trimEnd();
      if (!mainBody) mainBody = '# (empty program)';

      return BOILERPLATE_TOP + procBlock + mainBody;
    },
  };

})();
