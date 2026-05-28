// Extended Machine — Arduino package for PseudoSystem
// Loaded via:  FROM LOCAL.PKG IMPORT arduino
//
// Browser mode  (window.APCSP_RUNTIME === 'browser' or unset):
//   No monkey-patching needed — the existing robot globals handle everything.
//
// C++ mode  (window.APCSP_RUNTIME === 'cpp'):
//   After running, call window.APCSP_PACKAGES.arduino._getCpp() to get a
//   complete .ino file with correctly-structured control flow.
//
//   Generation uses an AST-walking Transpiler, NOT the monkey-patch approach.
//   The browser simulation still runs so the tilemap animates normally.
//
// Requires ONE addition to index.md's run-button handler (already done):
//   window.APCSP_LAST_AST = ast;   ← set immediately after new Parser().parse()

(function () {
  'use strict';

  window.APCSP_PACKAGES = window.APCSP_PACKAGES || {};

  // ═══════════════════════════════════════════════════════════════════════════
  //  AST → C++ Transpiler
  //
  //  Usage:  new Transpiler(indentDepth).generate(astStmtArray)
  //          Returns a single C++ string with correct indentation.
  //
  //  Correctly handles:
  //    IF / ELSE IF / ELSE      → if / else if / else
  //    REPEAT n TIMES           → for loop
  //    REPEAT UNTIL (cond)      → while (!(cond))  [NOT-cond optimised to while(cond)]
  //    FOR EACH x IN list       → range-for
  //    PROCEDURE name(p) { }    → hoisted before loop(), void / auto return
  //    MOVE_FORWARD / ROTATE_*  → motors.*()
  //    CAN_MOVE("dir")          → ultrasonic*.read() < THRESHOLD  (context-aware)
  //    DISPLAY(...)             → Serial.print / Serial.println chain
  //    Variable assignment      → auto x = val;  (re-assignment skips 'auto')
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
        // Skip 2D-list assignments — they are browser-only map data (no grid on Arduino)
        case 'Assign': {
          if (s.value.type === 'List' &&
              s.value.items.length > 0 &&
              s.value.items[0].type === 'List') return null;
          var rhs = this.expr(s.value);
          if (this.declared[s.name]) return p + s.name + ' = ' + rhs + ';';
          this.declared[s.name] = true;
          return p + 'auto ' + s.name + ' = ' + rhs + ';';
        }

        // a[i] ← expr
        case 'ListAssign':
          return p + s.name + '[' + this.expr(s.index) + ' - 1] = ' +
                 this.expr(s.value) + ';';

        // IF (cond) { } ELSE IF { } ELSE { }
        case 'If': {
          var out = p + 'if (' + this.expr(s.cond) + ') {\n' +
                    this.block(s.then) + p + '}';
          for (var i = 0; i < s.elseifs.length; i++)
            out += ' else if (' + this.expr(s.elseifs[i].cond) + ') {\n' +
                   this.block(s.elseifs[i].body) + p + '}';
          if (s.else) out += ' else {\n' + this.block(s.else) + p + '}';
          return out;
        }

        // REPEAT n TIMES { }
        case 'RepeatTimes':
          return p + 'for (int _i = 0; _i < ' + this.expr(s.count) + '; _i++) {\n' +
                 this.block(s.body) + p + '}';

        // REPEAT UNTIL (cond) { }
        // Optimisation: REPEAT UNTIL (NOT expr) → while (expr) instead of while (!(!(expr)))
        case 'RepeatUntil': {
          var cond = (s.cond.type === 'UnOp' && s.cond.op === 'NOT')
            ? this.expr(s.cond.expr)          // strip double negation
            : '!(' + this.expr(s.cond) + ')';
          return p + 'while (' + cond + ') {\n' +
                 this.block(s.body) + p + '}';
        }

        // FOR EACH x IN list { }
        case 'ForEach':
          return p + 'for (auto& ' + s.var + ' : ' + this.expr(s.list) + ') {\n' +
                 this.block(s.body) + p + '}';

        // PROCEDURE name(params) { body }
        // Handled separately by _getCpp (hoisted before loop()).
        // If encountered inline, emit as a C++ lambda.
        case 'ProcDef': {
          var hasRet = JSON.stringify(s.body).indexOf('"Return"') !== -1;
          var rt     = hasRet ? 'auto' : 'void';
          var params = s.params.map(function (pr) { return 'auto ' + pr; }).join(', ');
          var inner  = new Transpiler(this.depth + 1, Object.create(null));
          s.params.forEach(function (pr) { inner.declared[pr] = true; });
          var body   = inner.generate(s.body);
          return p + rt + ' ' + s.name + '(' + params + ') {\n' +
                 (body ? body + '\n' : '') + p + '}';
        }

        // RETURN(expr)
        case 'Return':
          return p + 'return ' + this.expr(s.value) + ';';

        // DISPLAY(a, b, ...)
        case 'Display': {
          if (s.args.length === 1)
            return p + 'Serial.println(' + this.expr(s.args[0]) + ');';
          var lines = [];
          for (var j = 0; j < s.args.length; j++) {
            var fn = (j === s.args.length - 1) ? 'Serial.println' : 'Serial.print';
            lines.push(p + fn + '(' + this.expr(s.args[j]) + ');');
            if (j < s.args.length - 1) lines.push(p + 'Serial.print(\' \');');
          }
          return lines.join('\n');
        }

        // Robot + list builtins as statements
        case 'BuiltinStmt':
          return this.builtinStmt(s, p);

        // User procedure call
        case 'Call':
          return p + s.name + '(' + s.args.map(a => this.expr(a)).join(', ') + ');';

        // Local storage / package import — skip silently in C++ output
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
        case 'MOVE_FORWARD':  return p + 'motors.forward();';
        case 'ROTATE_LEFT':   return p + 'motors.turnLeft();';
        case 'ROTATE_RIGHT':  return p + 'motors.turnRight();';
        case 'SPAWN': {
          var a = s.args.map(x => this.expr(x));
          return p + '// Robot spawned at row ' + a[1] + ' col ' + a[2];
        }
        case 'RENDER':  return p + '// Map loaded';
        case 'APPEND':
          return p + this.expr(s.args[0]) + '.push_back(' +
                 this.expr(s.args[1]) + ');';
        case 'INSERT':
          return p + this.expr(s.args[0]) + '.insert(' +
                 this.expr(s.args[0]) + '.begin() + ' + this.expr(s.args[1]) + ' - 1, ' +
                 this.expr(s.args[2]) + ');';
        case 'REMOVE':
          return p + this.expr(s.args[0]) + '.erase(' +
                 this.expr(s.args[0]) + '.begin() + ' + this.expr(s.args[1]) + ' - 1);';
        default:
          return p + '// ' + s.name + '(' + s.args.map(a => this.expr(a)).join(', ') + ')';
      }
    },

    // ── expression dispatcher ─────────────────────────────────────────────────
    expr: function (node) {
      switch (node.type) {
        case 'Num':  return String(node.value);
        case 'Str':  return '"' + node.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        case 'Bool': return node.value ? 'true' : 'false';
        case 'Var':  return node.name;

        case 'Index':
          return this.expr(node.list) + '[' + this.expr(node.index) + ' - 1]';

        case 'List':
          return '{' + node.items.map(i => this.expr(i)).join(', ') + '}';

        case 'BinOp': {
          var ops = {
            '+':'+', '-':'-', '*':'*', '/':'/',
            'MOD':'%', 'AND':'&&', 'OR':'||',
            '=':'==', '≠':'!=', '<':'<', '>':'>', '<=':'<=', '>=':'>='
          };
          return '(' + this.expr(node.left) + ' ' +
                 (ops[node.op] || node.op) + ' ' +
                 this.expr(node.right) + ')';
        }

        case 'UnOp':
          return node.op === 'NOT'
            ? '!(' + this.expr(node.expr) + ')'
            : node.op + this.expr(node.expr);

        case 'Builtin': return this.builtinExpr(node);

        case 'Call':
          return node.name + '(' + node.args.map(a => this.expr(a)).join(', ') + ')';

        default: return '/* ? */';
      }
    },

    // ── builtin expressions (inside conditions, assignments, etc.) ────────────
    builtinExpr: function (node) {
      switch (node.name) {
        // CAN_MOVE returns the appropriate sensor expression for the direction.
        // Direction must be a string literal; variable directions default to front.
        case 'CAN_MOVE': {
          var arg = node.args[0];
          var dir = (arg && arg.type === 'Str') ? arg.value.toLowerCase() : 'forward';
          if (dir === 'left')  return 'ultrasonicLeft.read() < THRESHOLD';
          if (dir === 'right') return 'ultrasonicRight.read() < THRESHOLD';
          return 'ultrasonic.read() < THRESHOLD';
        }
        case 'MOVE_FORWARD': return 'motors.forward()';
        case 'ROTATE_LEFT':  return 'motors.turnLeft()';
        case 'ROTATE_RIGHT': return 'motors.turnRight()';
        case 'LENGTH':
          return this.expr(node.args[0]) + '.size()';
        case 'RANDOM':
          return 'random(' + this.expr(node.args[0]) + ', ' +
                 this.expr(node.args[1]) + ' + 1)';
        case 'INPUT':
          return 'Serial.readStringUntil(\'\\n\')';
        default:
          return node.name + '(' + node.args.map(a => this.expr(a)).join(', ') + ')';
      }
    },

    // ── helpers ───────────────────────────────────────────────────────────────
    block: function (stmts) {
      this.depth++;
      var out = stmts.map(s => this.stmt(s)).filter(l => l != null).join('\n');
      this.depth--;
      return out ? out + '\n' : '';
    },

    ind: function () {
      var s = '';
      for (var i = 0; i < this.depth; i++) s += '    ';
      return s;
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  .ino boilerplate
  // ═══════════════════════════════════════════════════════════════════════════

  var BOILERPLATE_TOP = [
    '// Generated by PseudoSystem — place motors.h + ultrasonic.h in the same folder.',
    '#include "motors.h"',
    '#include "ultrasonic.h"',
    '',
    'MotorController  motors;',
    '',
    'UltrasonicSensor ultrasonic(7, 8);        // front — CAN_MOVE("forward"/"backward")',
    'UltrasonicSensor ultrasonicLeft(11, 12);  // left  — CAN_MOVE("left")',
    'UltrasonicSensor ultrasonicRight(A0, A1); // right — CAN_MOVE("right")',
    '',
    '#define THRESHOLD 15  // cm — obstacle detection distance',
    '',
  ].join('\n');

  // ═══════════════════════════════════════════════════════════════════════════
  //  Package registration
  // ═══════════════════════════════════════════════════════════════════════════

  window.APCSP_PACKAGES.arduino = {

    // Kept for API compatibility — run button calls this before every run.
    // Nothing to clear: the Transpiler reads window.APCSP_LAST_AST fresh each time.
    _reset: function () {},

    // Returns a complete, compilable .ino file.
    // PROCEDUREs are hoisted before loop(); everything else goes inside loop().
    _getCpp: function () {
      var ast = window.APCSP_LAST_AST;
      if (!ast || !ast.length)
        return '// Run a program first to generate C++ output.';

      var procs = ast.filter(function (s) { return s.type === 'ProcDef'; });
      var stmts = ast.filter(function (s) { return s.type !== 'ProcDef'; });

      // Procedures at depth 0 (before loop)
      var procBlock = procs.length
        ? new Transpiler(0).generate(procs) + '\n\n'
        : '';

      // Main body at depth 1 (inside loop)
      // trimEnd only — trim() would strip the leading indent from the first line
      var loopBody = new Transpiler(1).generate(stmts).trimEnd();
      if (!loopBody) loopBody = '    // (empty program)';

      return BOILERPLATE_TOP +
             procBlock +
             'void setup() {\n' +
             '    Serial.begin(9600);\n' +
             '    motors.begin();\n' +
             '    ultrasonic.begin();\n' +
             '    ultrasonicLeft.begin();\n' +
             '    ultrasonicRight.begin();\n' +
             '}\n\n' +
             'void loop() {\n' +
             loopBody + '\n' +
             '    while (true);  // halt — prevent loop() restarting the program\n' +
             '}';
    },
  };

})();
