// VirtualBit 126 — Virtual Micro:bit · v1 · 2026
// Synchronous AST interpreter for PseudoSystem
// Usage: window.APCSP_VMB.run(ast) → { frames, serial, error, steps }
//
//   frames : [{map, row, col, dir}, …]  — for tilemap animation
//   serial : ['line1', 'line2', …]       — print() / DISPLAY output
//   error  : string | null
//   steps  : number of statements executed

(function () {
  'use strict';

  window.APCSP_VMB = window.APCSP_VMB || {};

  window.APCSP_VMB.run = function (ast) {
    var MAX_STEPS = 5000;

    // ── Robot state ───────────────────────────────────────────────────────────
    var robotMap = null, robotRow = 0, robotCol = 0, robotDir = 0; // 0=UP
    var DIRS = [{dr:-1,dc:0},{dr:0,dc:1},{dr:1,dc:0},{dr:0,dc:-1}];
    var frames = [], serial = [], steps = 0;

    // ── Scope stack ───────────────────────────────────────────────────────────
    var scopes = [{}];
    var procs  = {};

    function get(name) {
      for (var i = scopes.length - 1; i >= 0; i--)
        if (name in scopes[i]) return scopes[i][name];
      throw new Error("Undefined variable '" + name + "'");
    }

    function set(name, val) {
      for (var i = scopes.length - 1; i >= 0; i--)
        if (name in scopes[i]) { scopes[i][name] = val; return; }
      scopes[scopes.length - 1][name] = val;
    }

    function deepCopy(v) {
      return Array.isArray(v) ? v.map(deepCopy) : v;
    }

    // ── Robot helpers ─────────────────────────────────────────────────────────
    function recordFrame() {
      if (!robotMap) return;
      frames.push({
        map: robotMap.map(function (r) { return r.slice(); }),
        row: robotRow, col: robotCol, dir: robotDir
      });
    }

    function canMove(dirStr) {
      if (!robotMap) return false;
      var d = robotDir;
      var s = typeof dirStr === 'string' ? dirStr.toLowerCase() : 'forward';
      if      (s === 'backward') d = (robotDir + 2) % 4;
      else if (s === 'left')     d = (robotDir + 3) % 4;
      else if (s === 'right')    d = (robotDir + 1) % 4;
      var nr = robotRow + DIRS[d].dr;
      var nc = robotCol + DIRS[d].dc;
      if (nr < 0 || nr >= robotMap.length || nc < 0 || nc >= robotMap[0].length) return false;
      return robotMap[nr][nc] === 0;
    }

    // ── Formatting ────────────────────────────────────────────────────────────
    function fmt(v) {
      if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      return String(v);
    }

    // ── ReturnSignal ──────────────────────────────────────────────────────────
    function ReturnSignal(v) { this.value = v; }

    // ── Expression evaluator ──────────────────────────────────────────────────
    function evalExpr(node) {
      switch (node.type) {
        case 'Num':  return node.value;
        case 'Str':  return node.value;
        case 'Bool': return node.value;
        case 'Var':  return get(node.name);

        case 'List': return node.items.map(evalExpr);

        case 'Index': {
          var list = evalExpr(node.list);
          var i = evalExpr(node.index);
          if (!Array.isArray(list)) throw new Error('Subscript on non-list');
          if (!Number.isInteger(i) || i < 1 || i > list.length)
            throw new Error('Index ' + i + ' out of bounds (length ' + list.length + ', 1-indexed)');
          return list[i - 1];
        }

        case 'BinOp': {
          var l = evalExpr(node.left), r = evalExpr(node.right);
          switch (node.op) {
            case '+':   return (typeof l === 'string' || typeof r === 'string') ? String(l) + String(r) : l + r;
            case '-':   return l - r;
            case '*':   return l * r;
            case '/':   if (r === 0) throw new Error('Division by zero'); return l / r;
            case 'MOD': return ((l % r) + r) % r;
            case '=':   return l === r;
            case '≠':   return l !== r;
            case '<':   return l < r;
            case '>':   return l > r;
            case '<=':  return l <= r;
            case '>=':  return l >= r;
            case 'AND': return Boolean(l) && Boolean(r);
            case 'OR':  return Boolean(l) || Boolean(r);
          }
          break;
        }

        case 'UnOp': {
          var v = evalExpr(node.expr);
          if (node.op === 'NOT') return !v;
          if (node.op === '-')   return -v;
          break;
        }

        case 'Builtin': return evalBuiltin(node.name, node.args);
        case 'Call':    return evalCall(node.name, node.args);
      }
      throw new Error('Unknown AST node: ' + node.type);
    }

    // ── Built-in functions ────────────────────────────────────────────────────
    function evalBuiltin(name, argNodes) {
      var v = argNodes.map(evalExpr);
      switch (name) {
        case 'RANDOM': return Math.floor(Math.random() * (v[1] - v[0] + 1)) + v[0];
        case 'LENGTH':
          if (Array.isArray(v[0])) return v[0].length;
          if (typeof v[0] === 'string') return v[0].length;
          throw new Error('LENGTH requires a list or string');
        case 'APPEND':
          if (!Array.isArray(v[0])) throw new Error('APPEND requires a list');
          v[0].push(v[1]); return v[0];
        case 'INSERT':
          if (!Array.isArray(v[0])) throw new Error('INSERT requires a list');
          v[0].splice(v[1] - 1, 0, v[2]); return v[0];
        case 'REMOVE':
          if (!Array.isArray(v[0])) throw new Error('REMOVE requires a list');
          v[0].splice(v[1] - 1, 1); return v[0];

        case 'RENDER':
          if (Array.isArray(v[0]) && Array.isArray(v[0][0]))
            robotMap = v[0].map(function (r) { return r.slice(); });
          return;

        case 'SPAWN': {
          if (Array.isArray(v[0]) && Array.isArray(v[0][0]))
            robotMap = v[0].map(function (r) { return r.slice(); });
          if (!robotMap) throw new Error('SPAWN: first argument must be a 2D list map');
          robotRow = v[1] - 1; robotCol = v[2] - 1; robotDir = 0;
          recordFrame();
          return;
        }

        case 'MOVE_FORWARD':
          if (!robotMap) throw new Error('No robot spawned — call SPAWN first');
          if (!canMove('forward')) throw new Error('MOVE_FORWARD: robot hit a wall!');
          robotRow += DIRS[robotDir].dr;
          robotCol += DIRS[robotDir].dc;
          recordFrame(); return;

        case 'ROTATE_LEFT':  robotDir = (robotDir + 3) % 4; recordFrame(); return;
        case 'ROTATE_RIGHT': robotDir = (robotDir + 1) % 4; recordFrame(); return;
        case 'CAN_MOVE': return canMove(v[0]);

        case 'INPUT':
          throw new Error('INPUT() is not supported in VirtualBit mode');
      }
      return undefined;
    }

    // ── Procedure calls ───────────────────────────────────────────────────────
    var BUILTINS = ['RANDOM','LENGTH','APPEND','INSERT','REMOVE',
                    'RENDER','SPAWN','MOVE_FORWARD','ROTATE_LEFT','ROTATE_RIGHT','CAN_MOVE'];

    function evalCall(name, argNodes) {
      if (BUILTINS.indexOf(name) !== -1) return evalBuiltin(name, argNodes);
      var proc = procs[name];
      if (!proc) throw new Error("Undefined procedure '" + name + "'");
      if (argNodes.length !== proc.params.length)
        throw new Error("'" + name + "' expects " + proc.params.length + " arg(s), got " + argNodes.length);
      var vals = argNodes.map(function (a) { return deepCopy(evalExpr(a)); });
      scopes.push({});
      proc.params.forEach(function (p, i) { scopes[scopes.length - 1][p] = vals[i]; });
      var result = null;
      try { execStmts(proc.body); }
      catch (e) {
        if (e instanceof ReturnSignal) result = e.value;
        else { scopes.pop(); throw e; }
      }
      scopes.pop();
      return result;
    }

    // ── Statement executor ────────────────────────────────────────────────────
    function execStmt(s) {
      if (++steps > MAX_STEPS)
        throw new Error('Step limit (' + MAX_STEPS + ') reached — possible infinite loop');

      switch (s.type) {
        case 'Assign':
          set(s.name, evalExpr(s.value)); break;

        case 'ListAssign': {
          var list = get(s.name);
          if (!Array.isArray(list)) throw new Error("'" + s.name + "' is not a list");
          var idx = evalExpr(s.index);
          if (!Number.isInteger(idx) || idx < 1 || idx > list.length)
            throw new Error('Index ' + idx + ' out of bounds');
          list[idx - 1] = evalExpr(s.value); break;
        }

        case 'If': {
          if (evalExpr(s.cond)) {
            scopes.push({}); execStmts(s.then); scopes.pop();
          } else {
            var done = false;
            for (var ei = 0; ei < s.elseifs.length; ei++) {
              if (evalExpr(s.elseifs[ei].cond)) {
                scopes.push({}); execStmts(s.elseifs[ei].body); scopes.pop();
                done = true; break;
              }
            }
            if (!done && s.else) { scopes.push({}); execStmts(s.else); scopes.pop(); }
          }
          break;
        }

        case 'RepeatTimes': {
          var n = evalExpr(s.count);
          if (!Number.isFinite(n) || n < 0) throw new Error('REPEAT count must be a non-negative number');
          for (var ri = 0; ri < n; ri++) {
            if (++steps > MAX_STEPS) throw new Error('Step limit reached');
            scopes.push({}); execStmts(s.body); scopes.pop();
          }
          break;
        }

        case 'RepeatUntil':
          while (!evalExpr(s.cond)) {
            if (++steps > MAX_STEPS) throw new Error('Step limit reached');
            scopes.push({}); execStmts(s.body); scopes.pop();
          }
          break;

        case 'ForEach': {
          var lst = evalExpr(s.list);
          if (!Array.isArray(lst)) throw new Error('FOR EACH requires a list');
          for (var fi = 0; fi < lst.length; fi++) {
            if (++steps > MAX_STEPS) throw new Error('Step limit reached');
            scopes.push({});
            scopes[scopes.length - 1][s.var] = lst[fi];
            execStmts(s.body);
            scopes.pop();
          }
          break;
        }

        case 'ProcDef': procs[s.name] = s; break;

        case 'Return': throw new ReturnSignal(evalExpr(s.value));

        case 'Display': {
          var vals = s.args.map(evalExpr);
          serial.push(vals.map(fmt).join(' '));
          break;
        }

        case 'BuiltinStmt':
        case 'Call':
          evalCall(s.name, s.args); break;

        case 'FromPkgImport':
        case 'FromLocalImport':
        case 'ToLocalSave':
        case 'ListLocal':
        case 'DeleteLocal':
          break;
      }
    }

    function execStmts(stmts) {
      for (var i = 0; i < stmts.length; i++) execStmt(stmts[i]);
    }

    // ── Run ───────────────────────────────────────────────────────────────────
    try {
      execStmts(ast);
      return { frames: frames, serial: serial, error: null, steps: steps };
    } catch (e) {
      if (e instanceof ReturnSignal)
        return { frames: frames, serial: serial, error: null, steps: steps };
      return { frames: frames, serial: serial, error: e.message, steps: steps };
    }
  };

})();
