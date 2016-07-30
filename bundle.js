/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="./node.d.ts" />
	// Web UI script.
	"use strict";
	var ast_1 = __webpack_require__(1);
	var bfml_1 = __webpack_require__(25);
	var alt_1 = __webpack_require__(26);
	var nba_1 = __webpack_require__(27);
	var dot_1 = __webpack_require__(28);
	var ltlParser = __webpack_require__(29).parser;
	var viz = __webpack_require__(33);
	document.addEventListener('DOMContentLoaded', function (ev) {
	    // イベントを設定
	    document.querySelector('#convert-button').addEventListener('click', function (e) {
	        var fml = document.querySelector('#ltl-formula').value;
	        convert(fml);
	    }, false);
	    // あれ
	    var cs = document.querySelectorAll('input.ltl-sample-button');
	    var l = cs.length;
	    console.log(l);
	    var _loop_1 = function(i) {
	        var b = cs[i];
	        b.addEventListener('click', function (e) {
	            document.querySelector('#ltl-formula').value = b.getAttribute('data-sample');
	        }, false);
	    };
	    for (var i = 0; i < l; i++) {
	        _loop_1(i);
	    }
	});
	// LTL formulaが入力されました
	function convert(fml) {
	    var exp = tryLTLParse(fml);
	    if (exp == null) {
	        return;
	    }
	    var result = document.querySelector('#result');
	    empty(result);
	    result.insertAdjacentHTML('beforeend', "<p>Rendering... (It may take time)</p>");
	    setTimeout(function () {
	        empty(result);
	        result.insertAdjacentHTML('beforeend', "<h2>Results</h2>");
	        // LTL formulaをshow
	        showLTLFormula(result, 'Input LTL formula:', exp);
	        // normalizeする
	        var exp2 = exp.normalize();
	        showLTLFormula(result, 'Normalized LTL formula:', exp2);
	        // ABAを得る
	        var aba = alt_1.toABA(exp2);
	        showABA(result, 'Alternating Büchi Automaton:', aba);
	        // NBAにしてdot
	        var nba = nba_1.toNBA(aba);
	        var dot = dot_1.toDot(nba);
	        showDot(result, 'Nondeterministic Büchi Automaton:', dot);
	    }, 0);
	}
	function tryLTLParse(fml) {
	    try {
	        var exp = ltlParser.parse(fml);
	        return exp;
	    }
	    catch (e) {
	        // 文法エラーだ！
	        var err = document.querySelector('#error');
	        var pre = document.createElement('pre');
	        pre.textContent = e.message;
	        empty(err);
	        err.appendChild(pre);
	        return null;
	    }
	}
	// XXX HTMLエスケープとかが雑（多分問題ないけど）
	function showLTLFormula(region, title, exp) {
	    var ltlh = LTLtoHTML(exp)[0];
	    var html = "<div class=\"region\">\n        <p>" + title + "</p>\n        <p class='ltl-formula'>" + ltlh + "</p>\n</div>";
	    region.insertAdjacentHTML('beforeend', html);
	}
	function LTLtoHTML(exp) {
	    if (exp instanceof ast_1.C) {
	        return [("<i class='ltl-constant'>" + String(exp.value) + "</i>"), true];
	    }
	    else if (exp instanceof ast_1.Prop) {
	        return [("<var class='ltl-prop'>" + exp.name + "</var>"), true];
	    }
	    else if (exp instanceof ast_1.Not) {
	        var op = atom(LTLtoHTML(exp.op));
	        return [("<i class='ltl-op'>\u00AC</i>" + op), true];
	    }
	    else if (exp instanceof ast_1.Or) {
	        var op1 = atom(LTLtoHTML(exp.op1));
	        var op2 = atom(LTLtoHTML(exp.op2));
	        return [(op1 + "<i class='ltl-op'>\u2228</i>" + op2), false];
	    }
	    else if (exp instanceof ast_1.And) {
	        var op1 = atom(LTLtoHTML(exp.op1));
	        var op2 = atom(LTLtoHTML(exp.op2));
	        return [(op1 + "<i class='ltl-op'>\u2227</i>" + op2), false];
	    }
	    else if (exp instanceof ast_1.Implies) {
	        var op1 = atom(LTLtoHTML(exp.op1));
	        var op2 = atom(LTLtoHTML(exp.op2));
	        return [(op1 + "<i class='ltl-op'>\u2283</i>" + op2), false];
	    }
	    else if (exp instanceof ast_1.X) {
	        var op = atom(LTLtoHTML(exp.op));
	        return [("<i class='ltl-op-char'>X</i>" + op), true];
	    }
	    else if (exp instanceof ast_1.F) {
	        var op = atom(LTLtoHTML(exp.op));
	        return [("<i class='ltl-op-char'>F</i>" + op), true];
	    }
	    else if (exp instanceof ast_1.G) {
	        var op = atom(LTLtoHTML(exp.op));
	        return [("<i class='ltl-op-char'>G</i>" + op), true];
	    }
	    else if (exp instanceof ast_1.U) {
	        var op1 = atom(LTLtoHTML(exp.op1));
	        var op2 = atom(LTLtoHTML(exp.op2));
	        return [(op1 + "<i class='ltl-op-char'>U</i>" + op2), false];
	    }
	    else if (exp instanceof ast_1.R) {
	        var op1 = atom(LTLtoHTML(exp.op1));
	        var op2 = atom(LTLtoHTML(exp.op2));
	        return [(op1 + "<i class='ltl-op-char'>R</i>" + op2), false];
	    }
	    else {
	        return ['', true];
	    }
	    function atom(_a) {
	        var str = _a[0], a = _a[1];
	        if (!a) {
	            return "(" + str + ")";
	        }
	        else {
	            return str;
	        }
	    }
	}
	// ABAをテーブルで表示
	function showABA(result, title, aba) {
	    var alphabet = aba.alphabet, states = aba.states, transition = aba.transition, initial = aba.initial, accepting = aba.accepting;
	    var tdhs = alphabet.map(function (a) {
	        return "<th>{" + a + "}</th>";
	    }).join('');
	    var trs = states.map(function (q, i) {
	        var map = transition[q];
	        var tds = alphabet.map(function (a) {
	            var bfml = map[a];
	            var html = BFmlToHTML(bfml)[0];
	            var tags = [];
	            if (q === initial) {
	                tags.push('init');
	            }
	            if (accepting.indexOf(q) >= 0) {
	                tags.push('F');
	            }
	            var tagstr = tags.length > 0 ? "(" + tags.join(',') + ")" : '';
	            return "<td>" + html + "</td>";
	        }).join('');
	        var tags = [];
	        if (q === initial) {
	            tags.push('init');
	        }
	        if (accepting.indexOf(q) >= 0) {
	            tags.push('F');
	        }
	        var tagstr = tags.length > 0 ? "(" + tags.join(',') + ")" : '';
	        return "<tr>\n    <td>q<sub>" + i + "</sub>" + tagstr + "</td>\n    " + tds + "\n</tr>";
	    }).join('');
	    var html = "<div class=\"region\">\n        <p>" + title + "</p>\n        <table class='aba-table'>\n            <thead>\n                <tr>\n                    <td></td>\n                    " + tdhs + "\n                </tr>\n            </thead>\n            <tbody>\n                " + trs + "\n            </tbody>\n        </table>\n</div>";
	    console.log(html);
	    result.insertAdjacentHTML('beforeend', html);
	    function BFmlToHTML(bfml) {
	        if (bfml instanceof bfml_1.BExp) {
	            var i = states.indexOf(bfml.exp.hash);
	            return [("q<sub>" + i + "</sub>"), true];
	        }
	        else if (bfml instanceof bfml_1.BConst) {
	            return [("<i class='bfml-constant'>" + String(bfml.value) + "</i>"), true];
	        }
	        else if (bfml instanceof bfml_1.BOr) {
	            var op1 = atom(BFmlToHTML(bfml.op1));
	            var op2 = atom(BFmlToHTML(bfml.op2));
	            return [(op1 + "<i class='bfml-op'>\u2228</i>" + op2), false];
	        }
	        else if (bfml instanceof bfml_1.BAnd) {
	            var op1 = atom(BFmlToHTML(bfml.op1));
	            var op2 = atom(BFmlToHTML(bfml.op2));
	            return [(op1 + "<i class='bfml-op'>\u2227</i>" + op2), false];
	        }
	        // XXX This is copy!
	        function atom(_a) {
	            var str = _a[0], a = _a[1];
	            if (!a) {
	                return "(" + str + ")";
	            }
	            else {
	                return str;
	            }
	        }
	    }
	}
	//dotを表示
	function showDot(result, title, dot) {
	    var svg = viz(dot, {
	        engine: 'dot',
	        format: 'svg',
	    });
	    var dataurl = 'data:image/svg+xml;base64,' + btoa(svg);
	    var html1 = "<div class=\"region\">\n        <p>" + title + "</p>\n        <div>\n            <img src=\"" + dataurl + "\" class=\"graph\">\n        </div>\n        <p><a href=\"" + dataurl + "\" target=\"_blank\">Too small? Click here to open in proper size</a></p>\n    </div>";
	    result.insertAdjacentHTML('beforeend', html1);
	    var html = "<div class=\"region\">\n    <p>" + title + " (in the DOT format)</p>\n    <pre class=\"dot\"><code>" + dot + "</code></pre>\n</div>";
	    result.insertAdjacentHTML('beforeend', html);
	}
	function empty(elm) {
	    while (elm.hasChildNodes()) {
	        elm.removeChild(elm.firstChild);
	    }
	}
	function sample(text) {
	    document.querySelector('#ltl-formula').value = text;
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="./node.d.ts" />
	// Definition of LTL AST.
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var crypto = __webpack_require__(2);
	// expression
	var Exp = (function () {
	    function Exp() {
	    }
	    return Exp;
	}());
	exports.Exp = Exp;
	// boolean constant.
	var C = (function (_super) {
	    __extends(C, _super);
	    function C(value) {
	        _super.call(this);
	        this.value = value;
	        this.hash = util.hash(this);
	    }
	    C.prototype.toLTL = function () {
	        return String(this.value);
	    };
	    C.prototype.clone = function () {
	        return new C(this.value);
	    };
	    C.prototype.normalize = function () {
	        return this.clone();
	    };
	    C.prototype.fv = function () {
	        return [];
	    };
	    return C;
	}(Exp));
	exports.C = C;
	// prop.
	var Prop = (function (_super) {
	    __extends(Prop, _super);
	    function Prop(name) {
	        _super.call(this);
	        this.name = name;
	        this.hash = util.hash(this);
	    }
	    Prop.prototype.toLTL = function () {
	        return String(this.name);
	    };
	    Prop.prototype.clone = function () {
	        return new Prop(this.name);
	    };
	    Prop.prototype.normalize = function () {
	        return this.clone();
	    };
	    Prop.prototype.fv = function () {
	        return [this.name];
	    };
	    return Prop;
	}(Exp));
	exports.Prop = Prop;
	// Basic 演算子.
	var Not = (function (_super) {
	    __extends(Not, _super);
	    function Not(op) {
	        _super.call(this);
	        this.op = op;
	        this.hash = util.hash(this);
	    }
	    Not.prototype.toLTL = function () {
	        return '~ ' + util.atom(this.op.toLTL());
	    };
	    Not.prototype.clone = function () {
	        return new Not(this.op.clone());
	    };
	    Not.prototype.normalize = function () {
	        var exp = this.op.normalize();
	        // 2重のnotをはずす
	        if (exp instanceof Not) {
	            return exp.op;
	        }
	        else {
	            return new Not(exp);
	        }
	    };
	    Not.prototype.fv = function () {
	        return this.op.fv();
	    };
	    return Not;
	}(Exp));
	exports.Not = Not;
	var Or = (function (_super) {
	    __extends(Or, _super);
	    function Or(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	        this.hash = util.hash(this);
	    }
	    Or.prototype.toLTL = function () {
	        return util.atom(this.op1.toLTL()) + ' \\/ ' + util.atom(this.op2.toLTL());
	    };
	    Or.prototype.clone = function () {
	        return new Or(this.op1.clone(), this.op2.clone());
	    };
	    Or.prototype.normalize = function () {
	        var op1 = this.op1.normalize();
	        var op2 = this.op2.normalize();
	        // constになったらor/andを消せる
	        if (op1 instanceof C) {
	            return op1.value ? op1 : op2;
	        }
	        else if (op2 instanceof C) {
	            return op2.value ? op2 : op1;
	        }
	        else {
	            return new Or(op1, op2);
	        }
	    };
	    Or.prototype.fv = function () {
	        return this.op1.fv().concat(this.op2.fv());
	    };
	    return Or;
	}(Exp));
	exports.Or = Or;
	var And = (function (_super) {
	    __extends(And, _super);
	    function And(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	        this.hash = util.hash(this);
	    }
	    And.prototype.toLTL = function () {
	        return util.atom(this.op1.toLTL()) + ' /\\ ' + util.atom(this.op2.toLTL());
	    };
	    And.prototype.clone = function () {
	        return new And(this.op1.clone(), this.op2.clone());
	    };
	    And.prototype.normalize = function () {
	        var op1 = this.op1.normalize();
	        var op2 = this.op2.normalize();
	        if (op1 instanceof C) {
	            return op1.value ? op2 : op1;
	        }
	        else if (op2 instanceof C) {
	            return op2.value ? op1 : op2;
	        }
	        else {
	            return new And(op1, op2);
	        }
	    };
	    And.prototype.fv = function () {
	        return this.op1.fv().concat(this.op2.fv());
	    };
	    return And;
	}(Exp));
	exports.And = And;
	var Implies = (function (_super) {
	    __extends(Implies, _super);
	    function Implies(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	        this.hash = util.hash(this);
	    }
	    Implies.prototype.toLTL = function () {
	        return util.atom(this.op1.toLTL()) + ' -> ' + util.atom(this.op2.toLTL());
	    };
	    Implies.prototype.clone = function () {
	        return new Implies(this.op1.clone(), this.op2.clone());
	    };
	    Implies.prototype.normalize = function () {
	        // p -> q (<=>) not(p) or q
	        var op1 = new Not(this.op1);
	        var e = new Or(op1, this.op2);
	        return e.normalize();
	    };
	    Implies.prototype.fv = function () {
	        return this.op1.fv().concat(this.op2.fv());
	    };
	    return Implies;
	}(Exp));
	exports.Implies = Implies;
	var X = (function (_super) {
	    __extends(X, _super);
	    function X(op) {
	        _super.call(this);
	        this.op = op;
	        this.hash = util.hash(this);
	    }
	    X.prototype.toLTL = function () {
	        return 'X ' + util.atom(this.op.toLTL());
	    };
	    X.prototype.clone = function () {
	        return new X(this.op.clone());
	    };
	    X.prototype.normalize = function () {
	        return new X(this.op.normalize());
	    };
	    X.prototype.fv = function () {
	        return this.op.fv();
	    };
	    return X;
	}(Exp));
	exports.X = X;
	var F = (function (_super) {
	    __extends(F, _super);
	    function F(op) {
	        _super.call(this);
	        this.op = op;
	        this.hash = util.hash(this);
	    }
	    F.prototype.toLTL = function () {
	        return 'F ' + util.atom(this.op.toLTL());
	    };
	    F.prototype.clone = function () {
	        return new F(this.op.clone());
	    };
	    F.prototype.normalize = function () {
	        // F p = true U p
	        var e = new U(new C(true), this.op);
	        return e.normalize();
	    };
	    F.prototype.fv = function () {
	        return this.op.fv();
	    };
	    return F;
	}(Exp));
	exports.F = F;
	var G = (function (_super) {
	    __extends(G, _super);
	    function G(op) {
	        _super.call(this);
	        this.op = op;
	        this.hash = util.hash(this);
	    }
	    G.prototype.toLTL = function () {
	        return 'G ' + util.atom(this.op.toLTL());
	    };
	    G.prototype.clone = function () {
	        return new F(this.op.clone());
	    };
	    G.prototype.normalize = function () {
	        // G p = not (true U (not p))
	        var e = new Not(new U(new C(true), new Not(this.op)));
	        return e.normalize();
	    };
	    G.prototype.fv = function () {
	        return this.op.fv();
	    };
	    return G;
	}(Exp));
	exports.G = G;
	var U = (function (_super) {
	    __extends(U, _super);
	    function U(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	        this.hash = util.hash(this);
	    }
	    U.prototype.toLTL = function () {
	        return util.atom(this.op1.toLTL()) + ' U ' + util.atom(this.op2.toLTL());
	    };
	    U.prototype.clone = function () {
	        return new U(this.op1.clone(), this.op2.clone());
	    };
	    U.prototype.normalize = function () {
	        return new U(this.op1.normalize(), this.op2.normalize());
	    };
	    U.prototype.fv = function () {
	        return this.op1.fv().concat(this.op2.fv());
	    };
	    return U;
	}(Exp));
	exports.U = U;
	var R = (function (_super) {
	    __extends(R, _super);
	    function R(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	        this.hash = util.hash(this);
	    }
	    R.prototype.toLTL = function () {
	        return util.atom(this.op1.toLTL()) + ' R ' + util.atom(this.op2.toLTL());
	    };
	    R.prototype.clone = function () {
	        return new R(this.op1.clone(), this.op2.clone());
	    };
	    R.prototype.normalize = function () {
	        // p R q = not ((not p) U (not q))
	        var e = new Not(new U(new Not(this.op1), new Not(this.op2)));
	        return e.normalize();
	    };
	    R.prototype.fv = function () {
	        return this.op1.fv().concat(this.op2.fv());
	    };
	    return R;
	}(Exp));
	exports.R = R;
	var util;
	(function (util) {
	    // stringがspaceを含んだら()で囲む（LTL生成用）
	    function atom(str) {
	        if (/\s/.test(str) && !(/^\(.*\)$/.test(str))) {
	            return "(" + str + ")";
	        }
	        else {
	            return str;
	        }
	    }
	    util.atom = atom;
	    // take hash of LTL expression
	    function hash(exp) {
	        var hash = crypto.createHash('md5');
	        hash.update(exp.toLTL());
	        return hash.digest('hex');
	    }
	    util.hash = hash;
	})(util = exports.util || (exports.util = {}));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(7)
	
	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}
	
	exports.createHash = __webpack_require__(9)
	
	exports.createHmac = __webpack_require__(22)
	
	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}
	
	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}
	
	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}
	
	var p = __webpack_require__(23)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync
	
	
	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(4)
	var ieee754 = __webpack_require__(5)
	var isArray = __webpack_require__(6)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation
	
	var rootParent = {}
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }
	
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }
	
	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }
	
	  // Unusual.
	  return fromObject(this, arg)
	}
	
	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'
	
	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)
	
	  that.write(string, encoding)
	  return that
	}
	
	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)
	
	  if (isArray(object)) return fromArray(that, object)
	
	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }
	
	  if (object.length) return fromArrayLike(that, object)
	
	  return fromJsonObject(that, object)
	}
	
	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}
	
	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0
	
	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)
	
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}
	
	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }
	
	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent
	
	  return that
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)
	
	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break
	
	    ++i
	  }
	
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')
	
	  if (list.length === 0) {
	    return new Buffer(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }
	
	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}
	
	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0
	
	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'binary':
	        return binarySlice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0
	
	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1
	
	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)
	
	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }
	
	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}
	
	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'binary':
	        return binaryWrite(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  if (newBuf.length) newBuf.parent = this.parent || this
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }
	
	  return len
	}
	
	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length
	
	  if (end < start) throw new RangeError('end < start')
	
	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return
	
	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')
	
	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var BP = Buffer.prototype
	
	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true
	
	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set
	
	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set
	
	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer
	
	  return arr
	}
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	;(function (exports) {
		'use strict';
	
	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array
	
		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)
	
		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}
	
		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr
	
			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}
	
			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
	
			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)
	
			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length
	
			var L = 0
	
			function push (v) {
				arr[L++] = v
			}
	
			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}
	
			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}
	
			return arr
		}
	
		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length
	
			function encode (num) {
				return lookup.charAt(num)
			}
	
			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}
	
			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}
	
			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}
	
			return output
		}
	
		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 5 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(8)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(3).Buffer))

/***/ },
/* 8 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(10)
	
	var md5 = toConstructor(__webpack_require__(19))
	var rmd160 = toConstructor(__webpack_require__(21))
	
	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}
	
	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}
	
	var Buffer = __webpack_require__(3).Buffer
	var Hash   = __webpack_require__(11)(Buffer)
	
	exports.sha1 = __webpack_require__(12)(Buffer, Hash)
	exports.sha256 = __webpack_require__(17)(Buffer, Hash)
	exports.sha512 = __webpack_require__(18)(Buffer, Hash)


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function (Buffer) {
	
	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }
	
	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }
	
	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }
	
	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block
	
	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)
	
	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }
	
	      s += ch
	      f += ch
	
	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s
	
	    return this
	  }
	
	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8
	
	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80
	
	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)
	
	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }
	
	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)
	
	    var hash = this._update(this._block) || this._hash()
	
	    return enc ? hash.toString(enc) : hash
	  }
	
	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }
	
	  return Hash
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */
	
	var inherits = __webpack_require__(13).inherits
	
	module.exports = function (Buffer, Hash) {
	
	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0
	
	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)
	
	  var POOL = []
	
	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()
	
	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)
	
	    this._h = null
	    this.init()
	  }
	
	  inherits(Sha1, Hash)
	
	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0
	
	    Hash.prototype.init.call(this)
	    return this
	  }
	
	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {
	
	    var a, b, c, d, e, _a, _b, _c, _d, _e
	
	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e
	
	    var w = this._w
	
	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)
	
	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )
	
	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }
	
	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }
	
	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }
	
	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }
	
	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }
	
	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }
	
	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }
	
	  return Sha1
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }
	
	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};
	
	
	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }
	
	  if (process.noDeprecation === true) {
	    return fn;
	  }
	
	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }
	
	  return deprecated;
	};
	
	
	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};
	
	
	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;
	
	
	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};
	
	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};
	
	
	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];
	
	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}
	
	
	function stylizeNoColor(str, styleType) {
	  return str;
	}
	
	
	function arrayToHash(array) {
	  var hash = {};
	
	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });
	
	  return hash;
	}
	
	
	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }
	
	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	
	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);
	
	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }
	
	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }
	
	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }
	
	  var base = '', array = false, braces = ['{', '}'];
	
	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	
	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }
	
	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	
	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	
	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }
	
	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }
	
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	
	  ctx.seen.push(value);
	
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	
	  ctx.seen.pop();
	
	  return reduceToSingleString(output, base, braces);
	}
	
	
	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}
	
	
	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}
	
	
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}
	
	
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }
	
	  return name + ': ' + str;
	}
	
	
	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);
	
	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }
	
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}
	
	
	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;
	
	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;
	
	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;
	
	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;
	
	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;
	
	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;
	
	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;
	
	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;
	
	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	
	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;
	
	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;
	
	exports.isBuffer = __webpack_require__(15);
	
	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	
	
	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}
	
	
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];
	
	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}
	
	
	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};
	
	
	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(16);
	
	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;
	
	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};
	
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(14)))

/***/ },
/* 14 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	(function () {
	  try {
	    cachedSetTimeout = setTimeout;
	  } catch (e) {
	    cachedSetTimeout = function () {
	      throw new Error('setTimeout is not defined');
	    }
	  }
	  try {
	    cachedClearTimeout = clearTimeout;
	  } catch (e) {
	    cachedClearTimeout = function () {
	      throw new Error('clearTimeout is not defined');
	    }
	  }
	} ())
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = cachedSetTimeout.call(null, cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    cachedClearTimeout.call(null, timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        cachedSetTimeout.call(null, drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 16 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */
	
	var inherits = __webpack_require__(13).inherits
	
	module.exports = function (Buffer, Hash) {
	
	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]
	
	  var W = new Array(64)
	
	  function Sha256() {
	    this.init()
	
	    this._w = W //new Array(64)
	
	    Hash.call(this, 16*4, 14*4)
	  }
	
	  inherits(Sha256, Hash)
	
	  Sha256.prototype.init = function () {
	
	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0
	
	    this._len = this._s = 0
	
	    return this
	  }
	
	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }
	
	  function R (X, n) {
	    return (X >>> n);
	  }
	
	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }
	
	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }
	
	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }
	
	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }
	
	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }
	
	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }
	
	  Sha256.prototype._update = function(M) {
	
	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2
	
	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0
	
	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]
	
	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w
	
	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }
	
	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0
	
	  };
	
	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)
	
	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)
	
	    return H
	  }
	
	  return Sha256
	
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(13).inherits
	
	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]
	
	  var W = new Array(160)
	
	  function Sha512() {
	    this.init()
	    this._w = W
	
	    Hash.call(this, 128, 112)
	  }
	
	  inherits(Sha512, Hash)
	
	  Sha512.prototype.init = function () {
	
	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0
	
	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0
	
	    this._len = this._s = 0
	
	    return this
	  }
	
	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }
	
	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }
	
	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }
	
	  Sha512.prototype._update = function(M) {
	
	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl
	
	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0
	
	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0
	
	    for (var i = 0; i < 80; i++) {
	      var j = i * 2
	
	      var Wi, Wil
	
	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)
	
	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)
	
	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)
	
	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]
	
	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]
	
	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)
	
	        W[j] = Wi
	        W[j + 1] = Wil
	      }
	
	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)
	
	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)
	
	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]
	
	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)
	
	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)
	
	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)
	
	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }
	
	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0
	
	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }
	
	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)
	
	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }
	
	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)
	
	    return H
	  }
	
	  return Sha512
	
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */
	
	var helpers = __webpack_require__(20);
	
	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;
	
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	
	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;
	
	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
	
	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
	
	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
	
	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
	
	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);
	
	}
	
	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}
	
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}
	
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}
	
	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;
	
	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }
	
	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}
	
	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}
	
	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}
	
	module.exports = { hash: hash };
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160
	
	
	
	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
	
	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	
	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];
	
	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];
	
	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};
	
	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};
	
	var processBlock = function (H, M, offset) {
	
	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];
	
	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }
	
	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;
	
	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;
	
	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};
	
	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}
	
	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}
	
	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}
	
	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}
	
	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}
	
	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}
	
	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
	
	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');
	
	  var m = bytesToWords(message);
	
	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;
	
	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );
	
	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }
	
	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];
	
	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }
	
	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}
	
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(9)
	
	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)
	
	module.exports = Hmac
	
	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg
	
	  var blocksize = (alg === 'sha512') ? 128 : 64
	
	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key
	
	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }
	
	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)
	
	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }
	
	  this._hash = createHash(alg).update(ipad)
	}
	
	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}
	
	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(24)
	
	module.exports = function (crypto, exports) {
	  exports = exports || {}
	
	  var exported = pbkdf2Export(crypto)
	
	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync
	
	  return exports
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }
	
	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')
	
	    setTimeout(function() {
	      var result
	
	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }
	
	      callback(undefined, result)
	    })
	  }
	
	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')
	
	    if (iterations < 0)
	      throw new TypeError('Bad iterations')
	
	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')
	
	    if (keylen < 0)
	      throw new TypeError('Bad key length')
	
	    digest = digest || 'sha1'
	
	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)
	
	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)
	
	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)
	
	      var U = crypto.createHmac(digest, password).update(block1).digest()
	
	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen
	
	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }
	
	      U.copy(T, 0, 0, hLen)
	
	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()
	
	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }
	
	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }
	
	    return DK
	  }
	
	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).Buffer))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	// Boolean Formulae over Exp.
	var ast_1 = __webpack_require__(1);
	var BFml = (function () {
	    function BFml() {
	    }
	    return BFml;
	}());
	exports.BFml = BFml;
	var BExp = (function (_super) {
	    __extends(BExp, _super);
	    function BExp(exp) {
	        _super.call(this);
	        this.exp = exp;
	    }
	    BExp.prototype.normalize = function () {
	        // 中身はnormalizeしないの？
	        return new BExp(this.exp);
	    };
	    BExp.prototype.toString = function () {
	        return this.exp.toLTL();
	    };
	    return BExp;
	}(BFml));
	exports.BExp = BExp;
	var BConst = (function (_super) {
	    __extends(BConst, _super);
	    function BConst(value) {
	        _super.call(this);
	        this.value = value;
	    }
	    BConst.prototype.normalize = function () {
	        return this;
	    };
	    BConst.prototype.toString = function () {
	        return String(this.value);
	    };
	    return BConst;
	}(BFml));
	exports.BConst = BConst;
	var BIn = (function (_super) {
	    __extends(BIn, _super);
	    function BIn(prop, neg) {
	        _super.call(this);
	        this.prop = prop;
	        this.neg = neg;
	    }
	    BIn.prototype.normalize = function () {
	        return this;
	    };
	    BIn.prototype.toString = function () {
	        return '_ ' + (this.neg ? '\u2209 ' : '\u2208 ') + this.prop;
	    };
	    return BIn;
	}(BFml));
	exports.BIn = BIn;
	var BOr = (function (_super) {
	    __extends(BOr, _super);
	    function BOr(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	    }
	    BOr.prototype.normalize = function () {
	        var op1 = this.op1.normalize();
	        var op2 = this.op2.normalize();
	        if (op1 instanceof BConst) {
	            return op1.value ? op1 : op2;
	        }
	        else if (op2 instanceof BConst) {
	            return op2.value ? op2 : op1;
	        }
	        else {
	            return new BOr(op1, op2);
	        }
	    };
	    BOr.prototype.toString = function () {
	        return ast_1.util.atom(this.op1.toString()) + ' /\\ ' + ast_1.util.atom(this.op2.toString());
	    };
	    return BOr;
	}(BFml));
	exports.BOr = BOr;
	var BAnd = (function (_super) {
	    __extends(BAnd, _super);
	    function BAnd(op1, op2) {
	        _super.call(this);
	        this.op1 = op1;
	        this.op2 = op2;
	    }
	    BAnd.prototype.normalize = function () {
	        var op1 = this.op1.normalize();
	        var op2 = this.op2.normalize();
	        if (op1 instanceof BConst) {
	            return op1.value ? op2 : op1;
	        }
	        else if (op2 instanceof BConst) {
	            return op2.value ? op1 : op2;
	        }
	        else {
	            return new BAnd(op1, op2);
	        }
	    };
	    BAnd.prototype.toString = function () {
	        return ast_1.util.atom(this.op1.toString()) + ' \\/ ' + ast_1.util.atom(this.op2.toString());
	    };
	    return BAnd;
	}(BFml));
	exports.BAnd = BAnd;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// LTL formula -> Alternating Buchi Automaton
	"use strict";
	var ast_1 = __webpack_require__(1);
	var bfml_1 = __webpack_require__(25);
	// LTL formula -> ABA
	function toABA(exp) {
	    // alphabetは全ての命題の集合のpowerset
	    var props = util.uniq(exp.fv());
	    var propspw = util.powerset(props);
	    propspw.forEach(function (ps) { return ps.sort(); });
	    // 上を文字列にまとめる
	    var alphabet = propspw.map(function (ps) { return ps.join(','); });
	    // Transitionを作る
	    var hashTable = {};
	    var bfTable = {};
	    var states = [];
	    var accepting = [];
	    var transition = {};
	    // 未処理のexpressionたち
	    var queue = [exp];
	    hashTable[exp.hash] = exp;
	    while (queue.length > 0) {
	        var e = queue.shift();
	        states.push(e.hash);
	        // これがaccepting stateか判定する
	        if (e instanceof ast_1.Not && e.op instanceof ast_1.U) {
	            accepting.push(e.hash);
	        }
	        // \rho(e)を求める
	        var er = rho(e);
	        // bfTableに保存
	        bfTable[e.hash] = er;
	        // erに残るLTL formulaを見つける
	        var fs = findFreeFormulae(er);
	        // 未処理のものがあったらqueueに加える
	        for (var _i = 0, fs_1 = fs; _i < fs_1.length; _i++) {
	            var f = fs_1[_i];
	            if (!(f.hash in hashTable)) {
	                //これはまだ発見されていない
	                queue.push(f);
	                hashTable[f.hash] = f;
	            }
	        }
	    }
	    // rhoの計算が終わったので遷移規則を書き下す
	    for (var _a = 0, states_1 = states; _a < states_1.length; _a++) {
	        var ststr = states_1[_a];
	        var exp_1 = hashTable[ststr];
	        // rho(exp)
	        var bf = bfTable[ststr];
	        var map = {};
	        // 各alphabetに対して計算
	        for (var _b = 0, propspw_1 = propspw; _b < propspw_1.length; _b++) {
	            var ps = propspw_1[_b];
	            var psstr = ps.join(',');
	            map[psstr] = resolveBIn(bf, ps);
	        }
	        transition[exp_1.hash] = map;
	    }
	    // initial state
	    var initial = exp.hash;
	    return {
	        alphabet: alphabet,
	        states: states,
	        transition: transition,
	        accepting: accepting,
	        initial: initial,
	    };
	    // \rho(e)を計算
	    function rho(exp) {
	        if (exp instanceof ast_1.C) {
	            return new bfml_1.BConst(exp.value);
	        }
	        else if (exp instanceof ast_1.Prop) {
	            return new bfml_1.BIn(exp.name, false);
	        }
	        else if (exp instanceof ast_1.Not) {
	            return execNot(rho(exp.op));
	        }
	        else if (exp instanceof ast_1.Or) {
	            return (new bfml_1.BOr(rho(exp.op1), rho(exp.op2))).normalize();
	        }
	        else if (exp instanceof ast_1.And) {
	            return (new bfml_1.BAnd(rho(exp.op1), rho(exp.op2))).normalize();
	        }
	        else if (exp instanceof ast_1.X) {
	            return new bfml_1.BExp(exp.op);
	        }
	        else if (exp instanceof ast_1.U) {
	            var e = new bfml_1.BOr(rho(exp.op2), new bfml_1.BAnd(rho(exp.op1), new bfml_1.BExp(exp)));
	            return e.normalize();
	        }
	        else {
	            throw new Error('Cannot exec rho for: ' + exp.toLTL());
	        }
	        function execNot(exp) {
	            if (exp instanceof bfml_1.BConst) {
	                return new bfml_1.BConst(!exp.value);
	            }
	            else if (exp instanceof bfml_1.BExp) {
	                // notを中に入れる
	                var e = new ast_1.Not(exp.exp);
	                return new bfml_1.BExp(e.normalize());
	            }
	            else if (exp instanceof bfml_1.BIn) {
	                return new bfml_1.BIn(exp.prop, !exp.neg);
	            }
	            else if (exp instanceof bfml_1.BOr) {
	                return (new bfml_1.BAnd(execNot(exp.op1), execNot(exp.op2))).normalize();
	            }
	            else if (exp instanceof bfml_1.BAnd) {
	                return (new bfml_1.BOr(execNot(exp.op1), execNot(exp.op2))).normalize();
	            }
	            else {
	                throw new Error('execNot: cannot exec for ' + exp);
	            }
	        }
	    }
	    // rhoの結果からfreeなformulaを探す
	    function findFreeFormulae(exp) {
	        var result = [];
	        if (exp instanceof bfml_1.BExp) {
	            result.push(exp.exp);
	        }
	        else if (exp instanceof bfml_1.BOr || exp instanceof bfml_1.BAnd) {
	            result.push.apply(result, findFreeFormulae(exp.op1).concat(findFreeFormulae(exp.op2)));
	        }
	        return result;
	    }
	    // BFml中のBInを解決する
	    function resolveBIn(exp, ps) {
	        if (exp instanceof bfml_1.BConst || exp instanceof bfml_1.BExp) {
	            return exp;
	        }
	        else if (exp instanceof bfml_1.BIn) {
	            var b = ps.indexOf(exp.prop) >= 0;
	            return new bfml_1.BConst(exp.neg ? !b : b);
	        }
	        else if (exp instanceof bfml_1.BOr) {
	            var e = new bfml_1.BOr(resolveBIn(exp.op1, ps), resolveBIn(exp.op2, ps));
	            return e.normalize();
	        }
	        else if (exp instanceof bfml_1.BAnd) {
	            var e = new bfml_1.BAnd(resolveBIn(exp.op1, ps), resolveBIn(exp.op2, ps));
	            return e.normalize();
	        }
	    }
	}
	exports.toABA = toABA;
	var util;
	(function (util) {
	    // Array uniq.
	    function uniq(arr) {
	        var result = [];
	        var table = {};
	        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
	            var a = arr_1[_i];
	            if (table[a] !== true) {
	                result.push(a);
	                table[a] = true;
	            }
	        }
	        return result;
	    }
	    util.uniq = uniq;
	    // Array powerset.
	    function powerset(arr) {
	        // recursiveに作る
	        if (arr.length === 0) {
	            return [[]];
	        }
	        var x = arr[0], xs = arr.slice(1);
	        var r = powerset(xs);
	        // xを加えたほう
	        var r2 = r.map(function (a) { return [x].concat(a); });
	        return r.concat(r2);
	    }
	    util.powerset = powerset;
	})(util = exports.util || (exports.util = {}));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// Alternating Buchi Automaton -> Non-deterministic Buchi Automaton
	"use strict";
	var bfml_1 = __webpack_require__(25);
	var alt_1 = __webpack_require__(26);
	function toNBA(aba) {
	    var alphabet = aba.alphabet;
	    // ALTのstate集合Sに対して，NBAのstateは(2^S)×(2^S)
	    var states = [];
	    var transition = {};
	    var accepting = [];
	    // 初期状態から始めるぞ
	    var initial = aba.accepting.indexOf(aba.initial) >= 0 ? ";" + aba.initial : aba.initial + ";";
	    var queue = [initial];
	    while (queue.length > 0) {
	        var ststr = queue.shift();
	        if (ststr in transition) {
	            continue;
	        }
	        // 文字列表現を配列に直す
	        var _a = ststr.split(';', 2), q0str = _a[0], q1str = _a[1];
	        var q0 = q0str.split(',').filter(function (v) { return !!v; });
	        var q1 = q1str.split(',').filter(function (v) { return !!v; });
	        states.push(ststr);
	        var map = {};
	        if (q0.length === 0) {
	            // Reset mode
	            accepting.push(ststr);
	            for (var _i = 0, alphabet_1 = alphabet; _i < alphabet_1.length; _i++) {
	                var a = alphabet_1[_i];
	                var sss = [];
	                for (var _b = 0, q1_1 = q1; _b < q1_1.length; _b++) {
	                    var q = q1_1[_b];
	                    var abamap = aba.transition[q];
	                    var bfml = abamap[a];
	                    var ss_1 = makeNextState(bfml, false);
	                    sss.push(ss_1);
	                }
	                var ss = makeAnd(sss);
	                // sssたちのandを取る感じで
	                // できたのでmapに書き込む
	                map[a] = ss.map(function (_a) {
	                    var q0 = _a[0], q1 = _a[1];
	                    return alt_1.util.uniq(q0).sort().join(',') + ';' + alt_1.util.uniq(q1).sort().join(',');
	                });
	                queue.push.apply(queue, map[a]);
	            }
	        }
	        else {
	            // Reset modeでない
	            for (var _c = 0, alphabet_2 = alphabet; _c < alphabet_2.length; _c++) {
	                var a = alphabet_2[_c];
	                var sss = [];
	                for (var _d = 0, q0_1 = q0; _d < q0_1.length; _d++) {
	                    var q = q0_1[_d];
	                    var abamap = aba.transition[q];
	                    var bfml = abamap[a];
	                    var ss_2 = makeNextState(bfml, false);
	                    sss.push(ss_2);
	                }
	                for (var _e = 0, q1_2 = q1; _e < q1_2.length; _e++) {
	                    var q = q1_2[_e];
	                    var abamap = aba.transition[q];
	                    var bfml = abamap[a];
	                    var ss_3 = makeNextState(bfml, true);
	                    sss.push(ss_3);
	                }
	                var ss = makeAnd(sss);
	                map[a] = ss.map(function (_a) {
	                    var q0 = _a[0], q1 = _a[1];
	                    return alt_1.util.uniq(q0).sort().join(',') + ';' + alt_1.util.uniq(q1).sort().join(',');
	                });
	                queue.push.apply(queue, map[a]);
	            }
	        }
	        transition[ststr] = map;
	    }
	    return {
	        alphabet: alphabet,
	        states: states,
	        transition: transition,
	        initial: initial,
	        accepting: accepting,
	    };
	    // fever: resetモードでなくてQ1由来のstateのときの処理
	    function makeNextState(bfml, fever) {
	        // BFmlから次のstateを作る（MH84の方法で）
	        if (bfml instanceof bfml_1.BExp) {
	            var e = bfml.exp;
	            // q0かq1のどちらかに入れる
	            if (fever || aba.accepting.indexOf(e.hash) >= 0) {
	                return [[[], [e.hash]]];
	            }
	            else {
	                return [[[e.hash], []]];
	            }
	        }
	        else if (bfml instanceof bfml_1.BConst) {
	            if (bfml.value) {
	                // trueは0個のandと同じなんだよ
	                return [[[], []]];
	            }
	            else {
	                // falseは行き先がない
	                return [];
	            }
	        }
	        else if (bfml instanceof bfml_1.BOr) {
	            var ss1 = makeNextState(bfml.op1, fever);
	            var ss2 = makeNextState(bfml.op2, fever);
	            // or: nondeterministicに分岐
	            return ss1.concat(ss2);
	        }
	        else if (bfml instanceof bfml_1.BAnd) {
	            var ss1 = makeNextState(bfml.op1, fever);
	            var ss2 = makeNextState(bfml.op2, fever);
	            // universalな分岐のときは合併する
	            return makeAnd([ss1, ss2]);
	        }
	        else {
	            throw new Error('ぎゃあああああ');
	        }
	    }
	    // recursiveに直積をとる
	    function makeAnd(sss) {
	        if (sss.length === 0) {
	            return [[[], []]];
	        }
	        else {
	            var ss = sss[0], sss2 = sss.slice(1);
	            var ss2 = makeAnd(sss2);
	            var result = [];
	            for (var _i = 0, ss_4 = ss; _i < ss_4.length; _i++) {
	                var _a = ss_4[_i], q0 = _a[0], q1 = _a[1];
	                for (var _b = 0, ss2_1 = ss2; _b < ss2_1.length; _b++) {
	                    var _c = ss2_1[_b], q2 = _c[0], q3 = _c[1];
	                    result.push([q0.concat(q2), q1.concat(q3)]);
	                }
	            }
	            return result;
	        }
	    }
	}
	exports.toNBA = toNBA;


/***/ },
/* 28 */
/***/ function(module, exports) {

	"use strict";
	function toDot(nba) {
	    var alphabet = nba.alphabet, states = nba.states, transition = nba.transition, initial = nba.initial, accepting = nba.accepting;
	    var invMap = [];
	    var nodes = states.map(function (q, i) {
	        invMap[q] = i;
	        if (accepting.indexOf(q) >= 0) {
	            return "q" + i + " [shape = doublecircle];";
	        }
	        else {
	            return "q" + i + ";";
	        }
	    }).join('\n');
	    var edgesarr = [];
	    for (var q in transition) {
	        var map = transition[q];
	        // 同じtransitionはまとめる
	        var table = {};
	        for (var a in map) {
	            for (var _i = 0, _a = map[a]; _i < _a.length; _i++) {
	                var q2 = _a[_i];
	                if (!(q2 in table)) {
	                    table[q2] = [];
	                }
	                table[q2].push("{" + a + "}");
	            }
	        }
	        for (var q2 in table) {
	            var qs = table[q2].join(',');
	            var e = "q" + invMap[q] + " -> q" + invMap[q2] + " [label=\"" + qs + "\"];";
	            edgesarr.push(e);
	        }
	    }
	    var edges = edgesarr.join('\n');
	    return "digraph {\n    graph [\n        rankdir = LR;\n    ];\n    node [\n        shape = circle;\n    ];\n\n    \"\" [shape = none];\n    \"\" -> q0;\n\n    " + nodes + "\n\n    " + edges + "\n}";
	}
	exports.toDot = toDot;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.17 */
	/*
	  Returns a Parser object of the following structure:
	
	  Parser: {
	    yy: {}
	  }
	
	  Parser.prototype: {
	    yy: {},
	    trace: function(),
	    symbols_: {associative list: name ==> number},
	    terminals_: {associative list: number ==> name},
	    productions_: [...],
	    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
	    table: [...],
	    defaultActions: {...},
	    parseError: function(str, hash),
	    parse: function(input),
	
	    lexer: {
	        EOF: 1,
	        parseError: function(str, hash),
	        setInput: function(input),
	        input: function(),
	        unput: function(str),
	        more: function(),
	        less: function(n),
	        pastInput: function(),
	        upcomingInput: function(),
	        showPosition: function(),
	        test_match: function(regex_match_array, rule_index),
	        next: function(),
	        lex: function(),
	        begin: function(condition),
	        popState: function(),
	        _currentRules: function(),
	        topState: function(),
	        pushState: function(condition),
	
	        options: {
	            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
	            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
	            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
	        },
	
	        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
	        rules: [...],
	        conditions: {associative list: name ==> set},
	    }
	  }
	
	
	  token location info (@$, _$, etc.): {
	    first_line: n,
	    last_line: n,
	    first_column: n,
	    last_column: n,
	    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
	  }
	
	
	  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
	    text:        (matched text)
	    token:       (the produced terminal token, if any)
	    line:        (yylineno)
	  }
	  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
	    loc:         (yylloc)
	    expected:    (string describing the set of expected tokens)
	    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
	  }
	*/
	var ltl = (function(){
	var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,3],$V1=[1,4],$V2=[1,5],$V3=[1,6],$V4=[1,7],$V5=[1,8],$V6=[1,9],$V7=[1,10],$V8=[1,12],$V9=[1,13],$Va=[1,14],$Vb=[1,15],$Vc=[1,16],$Vd=[5,7,12,13,14,18,19];
	var parser = {trace: function trace() { },
	yy: {},
	symbols_: {"error":2,"formula":3,"exp":4,"EOF":5,"(":6,")":7,"TRUE":8,"FALSE":9,"IDENT":10,"NOT":11,"OR":12,"AND":13,"IMPLIES":14,"X":15,"F":16,"G":17,"U":18,"R":19,"$accept":0,"$end":1},
	terminals_: {2:"error",5:"EOF",6:"(",7:")",8:"TRUE",9:"FALSE",10:"IDENT",11:"NOT",12:"OR",13:"AND",14:"IMPLIES",15:"X",16:"F",17:"G",18:"U",19:"R"},
	productions_: [0,[3,2],[4,3],[4,1],[4,1],[4,1],[4,2],[4,3],[4,3],[4,3],[4,2],[4,2],[4,2],[4,3],[4,3]],
	performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
	/* this == yyval */
	
	var $0 = $$.length - 1;
	switch (yystate) {
	case 1:
	 return $$[$0-1] 
	break;
	case 2:
	 this.$ = $$[$0-1] 
	break;
	case 3:
	 this.$ = new ast.C(true) 
	break;
	case 4:
	 this.$ = new ast.C(false) 
	break;
	case 5:
	 this.$ = new ast.Prop($$[$0]) 
	break;
	case 6:
	 this.$ = new ast.Not($$[$0]) 
	break;
	case 7:
	 this.$ = new ast.Or($$[$0-2], $$[$0]) 
	break;
	case 8:
	 this.$ = new ast.And($$[$0-2], $$[$0]) 
	break;
	case 9:
	 this.$ = new ast.Implies($$[$0-2], $$[$0]) 
	break;
	case 10:
	 this.$ = new ast.X($$[$0]) 
	break;
	case 11:
	 this.$ = new ast.F($$[$0]) 
	break;
	case 12:
	 this.$ = new ast.G($$[$0]) 
	break;
	case 13:
	 this.$ = new ast.U($$[$0-2], $$[$0]) 
	break;
	case 14:
	 this.$ = new ast.R($$[$0-2], $$[$0]) 
	break;
	}
	},
	table: [{3:1,4:2,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{1:[3]},{5:[1,11],12:$V8,13:$V9,14:$Va,18:$Vb,19:$Vc},{4:17,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},o($Vd,[2,3]),o($Vd,[2,4]),o($Vd,[2,5]),{4:18,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:19,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:20,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:21,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{1:[2,1]},{4:22,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:23,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:24,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:25,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{4:26,6:$V0,8:$V1,9:$V2,10:$V3,11:$V4,15:$V5,16:$V6,17:$V7},{7:[1,27],12:$V8,13:$V9,14:$Va,18:$Vb,19:$Vc},o($Vd,[2,6]),o($Vd,[2,10]),o($Vd,[2,11]),o($Vd,[2,12]),o([5,7,12,14],[2,7],{13:$V9,18:$Vb,19:$Vc}),o([5,7,12,13,14],[2,8],{18:$Vb,19:$Vc}),o([5,7],[2,9],{12:$V8,13:$V9,14:$Va,18:$Vb,19:$Vc}),o($Vd,[2,13]),o($Vd,[2,14]),o($Vd,[2,2])],
	defaultActions: {11:[2,1]},
	parseError: function parseError(str, hash) {
	    if (hash.recoverable) {
	        this.trace(str);
	    } else {
	        function _parseError (msg, hash) {
	            this.message = msg;
	            this.hash = hash;
	        }
	        _parseError.prototype = Error;
	
	        throw new _parseError(str, hash);
	    }
	},
	parse: function parse(input) {
	    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
	    var args = lstack.slice.call(arguments, 1);
	    var lexer = Object.create(this.lexer);
	    var sharedState = { yy: {} };
	    for (var k in this.yy) {
	        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
	            sharedState.yy[k] = this.yy[k];
	        }
	    }
	    lexer.setInput(input, sharedState.yy);
	    sharedState.yy.lexer = lexer;
	    sharedState.yy.parser = this;
	    if (typeof lexer.yylloc == 'undefined') {
	        lexer.yylloc = {};
	    }
	    var yyloc = lexer.yylloc;
	    lstack.push(yyloc);
	    var ranges = lexer.options && lexer.options.ranges;
	    if (typeof sharedState.yy.parseError === 'function') {
	        this.parseError = sharedState.yy.parseError;
	    } else {
	        this.parseError = Object.getPrototypeOf(this).parseError;
	    }
	    function popStack(n) {
	        stack.length = stack.length - 2 * n;
	        vstack.length = vstack.length - n;
	        lstack.length = lstack.length - n;
	    }
	    _token_stack:
	        var lex = function () {
	            var token;
	            token = lexer.lex() || EOF;
	            if (typeof token !== 'number') {
	                token = self.symbols_[token] || token;
	            }
	            return token;
	        };
	    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
	    while (true) {
	        state = stack[stack.length - 1];
	        if (this.defaultActions[state]) {
	            action = this.defaultActions[state];
	        } else {
	            if (symbol === null || typeof symbol == 'undefined') {
	                symbol = lex();
	            }
	            action = table[state] && table[state][symbol];
	        }
	                    if (typeof action === 'undefined' || !action.length || !action[0]) {
	                var errStr = '';
	                expected = [];
	                for (p in table[state]) {
	                    if (this.terminals_[p] && p > TERROR) {
	                        expected.push('\'' + this.terminals_[p] + '\'');
	                    }
	                }
	                if (lexer.showPosition) {
	                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
	                } else {
	                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
	                }
	                this.parseError(errStr, {
	                    text: lexer.match,
	                    token: this.terminals_[symbol] || symbol,
	                    line: lexer.yylineno,
	                    loc: yyloc,
	                    expected: expected
	                });
	            }
	        if (action[0] instanceof Array && action.length > 1) {
	            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
	        }
	        switch (action[0]) {
	        case 1:
	            stack.push(symbol);
	            vstack.push(lexer.yytext);
	            lstack.push(lexer.yylloc);
	            stack.push(action[1]);
	            symbol = null;
	            if (!preErrorSymbol) {
	                yyleng = lexer.yyleng;
	                yytext = lexer.yytext;
	                yylineno = lexer.yylineno;
	                yyloc = lexer.yylloc;
	                if (recovering > 0) {
	                    recovering--;
	                }
	            } else {
	                symbol = preErrorSymbol;
	                preErrorSymbol = null;
	            }
	            break;
	        case 2:
	            len = this.productions_[action[1]][1];
	            yyval.$ = vstack[vstack.length - len];
	            yyval._$ = {
	                first_line: lstack[lstack.length - (len || 1)].first_line,
	                last_line: lstack[lstack.length - 1].last_line,
	                first_column: lstack[lstack.length - (len || 1)].first_column,
	                last_column: lstack[lstack.length - 1].last_column
	            };
	            if (ranges) {
	                yyval._$.range = [
	                    lstack[lstack.length - (len || 1)].range[0],
	                    lstack[lstack.length - 1].range[1]
	                ];
	            }
	            r = this.performAction.apply(yyval, [
	                yytext,
	                yyleng,
	                yylineno,
	                sharedState.yy,
	                action[1],
	                vstack,
	                lstack
	            ].concat(args));
	            if (typeof r !== 'undefined') {
	                return r;
	            }
	            if (len) {
	                stack = stack.slice(0, -1 * len * 2);
	                vstack = vstack.slice(0, -1 * len);
	                lstack = lstack.slice(0, -1 * len);
	            }
	            stack.push(this.productions_[action[1]][0]);
	            vstack.push(yyval.$);
	            lstack.push(yyval._$);
	            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	            stack.push(newState);
	            break;
	        case 3:
	            return true;
	        }
	    }
	    return true;
	}};
	
	
	var ast=__webpack_require__(1);
	
	
	/* generated by jison-lex 0.3.4 */
	var lexer = (function(){
	var lexer = ({
	
	EOF:1,
	
	parseError:function parseError(str, hash) {
	        if (this.yy.parser) {
	            this.yy.parser.parseError(str, hash);
	        } else {
	            throw new Error(str);
	        }
	    },
	
	// resets the lexer, sets new input
	setInput:function (input, yy) {
	        this.yy = yy || this.yy || {};
	        this._input = input;
	        this._more = this._backtrack = this.done = false;
	        this.yylineno = this.yyleng = 0;
	        this.yytext = this.matched = this.match = '';
	        this.conditionStack = ['INITIAL'];
	        this.yylloc = {
	            first_line: 1,
	            first_column: 0,
	            last_line: 1,
	            last_column: 0
	        };
	        if (this.options.ranges) {
	            this.yylloc.range = [0,0];
	        }
	        this.offset = 0;
	        return this;
	    },
	
	// consumes and returns one char from the input
	input:function () {
	        var ch = this._input[0];
	        this.yytext += ch;
	        this.yyleng++;
	        this.offset++;
	        this.match += ch;
	        this.matched += ch;
	        var lines = ch.match(/(?:\r\n?|\n).*/g);
	        if (lines) {
	            this.yylineno++;
	            this.yylloc.last_line++;
	        } else {
	            this.yylloc.last_column++;
	        }
	        if (this.options.ranges) {
	            this.yylloc.range[1]++;
	        }
	
	        this._input = this._input.slice(1);
	        return ch;
	    },
	
	// unshifts one char (or a string) into the input
	unput:function (ch) {
	        var len = ch.length;
	        var lines = ch.split(/(?:\r\n?|\n)/g);
	
	        this._input = ch + this._input;
	        this.yytext = this.yytext.substr(0, this.yytext.length - len);
	        //this.yyleng -= len;
	        this.offset -= len;
	        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	        this.match = this.match.substr(0, this.match.length - 1);
	        this.matched = this.matched.substr(0, this.matched.length - 1);
	
	        if (lines.length - 1) {
	            this.yylineno -= lines.length - 1;
	        }
	        var r = this.yylloc.range;
	
	        this.yylloc = {
	            first_line: this.yylloc.first_line,
	            last_line: this.yylineno + 1,
	            first_column: this.yylloc.first_column,
	            last_column: lines ?
	                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
	                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
	              this.yylloc.first_column - len
	        };
	
	        if (this.options.ranges) {
	            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	        }
	        this.yyleng = this.yytext.length;
	        return this;
	    },
	
	// When called from action, caches matched text and appends it on next action
	more:function () {
	        this._more = true;
	        return this;
	    },
	
	// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
	reject:function () {
	        if (this.options.backtrack_lexer) {
	            this._backtrack = true;
	        } else {
	            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
	                text: "",
	                token: null,
	                line: this.yylineno
	            });
	
	        }
	        return this;
	    },
	
	// retain first n characters of the match
	less:function (n) {
	        this.unput(this.match.slice(n));
	    },
	
	// displays already matched input, i.e. for error messages
	pastInput:function () {
	        var past = this.matched.substr(0, this.matched.length - this.match.length);
	        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
	    },
	
	// displays upcoming input, i.e. for error messages
	upcomingInput:function () {
	        var next = this.match;
	        if (next.length < 20) {
	            next += this._input.substr(0, 20-next.length);
	        }
	        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
	    },
	
	// displays the character position where the lexing error occurred, i.e. for error messages
	showPosition:function () {
	        var pre = this.pastInput();
	        var c = new Array(pre.length + 1).join("-");
	        return pre + this.upcomingInput() + "\n" + c + "^";
	    },
	
	// test the lexed token: return FALSE when not a match, otherwise return token
	test_match:function (match, indexed_rule) {
	        var token,
	            lines,
	            backup;
	
	        if (this.options.backtrack_lexer) {
	            // save context
	            backup = {
	                yylineno: this.yylineno,
	                yylloc: {
	                    first_line: this.yylloc.first_line,
	                    last_line: this.last_line,
	                    first_column: this.yylloc.first_column,
	                    last_column: this.yylloc.last_column
	                },
	                yytext: this.yytext,
	                match: this.match,
	                matches: this.matches,
	                matched: this.matched,
	                yyleng: this.yyleng,
	                offset: this.offset,
	                _more: this._more,
	                _input: this._input,
	                yy: this.yy,
	                conditionStack: this.conditionStack.slice(0),
	                done: this.done
	            };
	            if (this.options.ranges) {
	                backup.yylloc.range = this.yylloc.range.slice(0);
	            }
	        }
	
	        lines = match[0].match(/(?:\r\n?|\n).*/g);
	        if (lines) {
	            this.yylineno += lines.length;
	        }
	        this.yylloc = {
	            first_line: this.yylloc.last_line,
	            last_line: this.yylineno + 1,
	            first_column: this.yylloc.last_column,
	            last_column: lines ?
	                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
	                         this.yylloc.last_column + match[0].length
	        };
	        this.yytext += match[0];
	        this.match += match[0];
	        this.matches = match;
	        this.yyleng = this.yytext.length;
	        if (this.options.ranges) {
	            this.yylloc.range = [this.offset, this.offset += this.yyleng];
	        }
	        this._more = false;
	        this._backtrack = false;
	        this._input = this._input.slice(match[0].length);
	        this.matched += match[0];
	        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
	        if (this.done && this._input) {
	            this.done = false;
	        }
	        if (token) {
	            return token;
	        } else if (this._backtrack) {
	            // recover context
	            for (var k in backup) {
	                this[k] = backup[k];
	            }
	            return false; // rule action called reject() implying the next rule should be tested instead.
	        }
	        return false;
	    },
	
	// return next match in input
	next:function () {
	        if (this.done) {
	            return this.EOF;
	        }
	        if (!this._input) {
	            this.done = true;
	        }
	
	        var token,
	            match,
	            tempMatch,
	            index;
	        if (!this._more) {
	            this.yytext = '';
	            this.match = '';
	        }
	        var rules = this._currentRules();
	        for (var i = 0; i < rules.length; i++) {
	            tempMatch = this._input.match(this.rules[rules[i]]);
	            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                match = tempMatch;
	                index = i;
	                if (this.options.backtrack_lexer) {
	                    token = this.test_match(tempMatch, rules[i]);
	                    if (token !== false) {
	                        return token;
	                    } else if (this._backtrack) {
	                        match = false;
	                        continue; // rule action called reject() implying a rule MISmatch.
	                    } else {
	                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
	                        return false;
	                    }
	                } else if (!this.options.flex) {
	                    break;
	                }
	            }
	        }
	        if (match) {
	            token = this.test_match(match, rules[index]);
	            if (token !== false) {
	                return token;
	            }
	            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
	            return false;
	        }
	        if (this._input === "") {
	            return this.EOF;
	        } else {
	            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
	                text: "",
	                token: null,
	                line: this.yylineno
	            });
	        }
	    },
	
	// return next match that has a token
	lex:function lex() {
	        var r = this.next();
	        if (r) {
	            return r;
	        } else {
	            return this.lex();
	        }
	    },
	
	// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
	begin:function begin(condition) {
	        this.conditionStack.push(condition);
	    },
	
	// pop the previously active lexer condition state off the condition stack
	popState:function popState() {
	        var n = this.conditionStack.length - 1;
	        if (n > 0) {
	            return this.conditionStack.pop();
	        } else {
	            return this.conditionStack[0];
	        }
	    },
	
	// produce the lexer rule set which is active for the currently active lexer condition state
	_currentRules:function _currentRules() {
	        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
	            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
	        } else {
	            return this.conditions["INITIAL"].rules;
	        }
	    },
	
	// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
	topState:function topState(n) {
	        n = this.conditionStack.length - 1 - Math.abs(n || 0);
	        if (n >= 0) {
	            return this.conditionStack[n];
	        } else {
	            return "INITIAL";
	        }
	    },
	
	// alias for begin(condition)
	pushState:function pushState(condition) {
	        this.begin(condition);
	    },
	
	// return the number of states currently on the stack
	stateStackSize:function stateStackSize() {
	        return this.conditionStack.length;
	    },
	options: {},
	performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
	var YYSTATE=YY_START;
	switch($avoiding_name_collisions) {
	case 0:/* skip whitespace */
	break;
	case 1:return 15
	break;
	case 2:return 18
	break;
	case 3:return 17
	break;
	case 4:return 16
	break;
	case 5:return 19
	break;
	case 6:return 8
	break;
	case 7:return 9
	break;
	case 8:return 10
	break;
	case 9:return 6
	break;
	case 10:return 7
	break;
	case 11:return 14
	break;
	case 12:return 11
	break;
	case 13:return 11
	break;
	case 14:return 12
	break;
	case 15:return 12
	break;
	case 16:return 13
	break;
	case 17:return 13
	break;
	case 18:return 5
	break;
	case 19:return 'INVALID'
	break;
	}
	},
	rules: [/^(?: |\t|\r|\n)/,/^(?:[X])/,/^(?:[U])/,/^(?:[G])/,/^(?:[F])/,/^(?:[R])/,/^(?:true\b)/,/^(?:false\b)/,/^(?:[a-z_][a-z0-9_]*)/,/^(?:\()/,/^(?:\))/,/^(?:->)/,/^(?:~)/,/^(?:NOT\b)/,/^(?:\\\/)/,/^(?:OR\b)/,/^(?:\/\\)/,/^(?:AND\b)/,/^(?:$)/,/^(?:.)/],
	conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],"inclusive":true}}
	});
	return lexer;
	})();
	parser.lexer = lexer;
	function Parser () {
	  this.yy = {};
	}
	Parser.prototype = parser;parser.Parser = Parser;
	return new Parser;
	})();
	
	
	if (true) {
	exports.parser = ltl;
	exports.Parser = ltl.Parser;
	exports.parse = function () { return ltl.parse.apply(ltl, arguments); };
	exports.main = function commonjsMain(args) {
	    if (!args[1]) {
	        console.log('Usage: '+args[0]+' FILE');
	        process.exit(1);
	    }
	    var source = __webpack_require__(31).readFileSync(__webpack_require__(32).normalize(args[1]), "utf8");
	    return exports.parser.parse(source);
	};
	if (typeof module !== 'undefined' && __webpack_require__.c[0] === module) {
	  exports.main(process.argv.slice(1));
	}
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14), __webpack_require__(30)(module)))

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 31 */
/***/ function(module, exports) {



/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }
	
	  return parts;
	}
	
	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};
	
	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;
	
	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();
	
	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }
	
	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }
	
	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)
	
	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');
	
	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};
	
	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';
	
	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');
	
	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }
	
	  return (isAbsolute ? '/' : '') + path;
	};
	
	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};
	
	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};
	
	
	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);
	
	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }
	
	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }
	
	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }
	
	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));
	
	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }
	
	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }
	
	  outputParts = outputParts.concat(toParts.slice(samePartsLength));
	
	  return outputParts.join('/');
	};
	
	exports.sep = '/';
	exports.delimiter = ':';
	
	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];
	
	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }
	
	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }
	
	  return root + dir;
	};
	
	
	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};
	
	
	exports.extname = function(path) {
	  return splitPath(path)[3];
	};
	
	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}
	
	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, __dirname, module, Buffer) {(function(global) {
	var Module = function(Module) {
	  Module = Module || {};
	
	var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_NODE=typeof process==="object"&&"function"==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=function print(x){process["stdout"].write(x+"\n")};if(!Module["printErr"])Module["printErr"]=function printErr(x){process["stderr"].write(x+"\n")};var nodeFS=__webpack_require__(31);var nodePath=__webpack_require__(32);Module["read"]=function read(filename,binary){filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);if(!ret&&filename!=nodePath["resolve"](filename)){filename=path.join(__dirname,"..","src",filename);ret=nodeFS["readFileSync"](filename)}if(ret&&!binary)ret=ret.toString();return ret};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};Module["load"]=function load(f){globalEval(read(f))};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}else{Module["thisProgram"]="unknown-program"}}Module["arguments"]=process["argv"].slice(2);if(true){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read}else{Module["read"]=function read(){throw"no read() available (jsc?)"}}Module["readBinary"]=function readBinary(f){if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}var data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.log(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(ENVIRONMENT_IS_WORKER){Module["load"]=importScripts}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title})}}else{throw"Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x)}if(!Module["load"]&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f))}}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}var Runtime={setTempRet0:(function(value){tempRet0=value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4}}else{assert((ptr&3)===0)}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){if(!args.splice)args=Array.prototype.slice.call(args);args.splice(0,0,ptr);return Module["dynCall_"+sig].apply(null,args)}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,arguments)}}return sigCache[func]}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+15&-16;if(DYNAMICTOP>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){DYNAMICTOP=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var __THREW__=0;var ABORT=false;var EXITSTATUS=0;var undef=0;var tempValue,tempInt,tempBigInt,tempInt2,tempBigInt2,tempPair,tempBigIntI,tempBigIntR,tempBigIntS,tempBigIntP,tempBigIntD,tempDouble,tempFloat;var tempI64,tempI64b;var tempRet0,tempRet1,tempRet2,tempRet3,tempRet4,tempRet5,tempRet6,tempRet7,tempRet8,tempRet9;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident)}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var JSfuncs={"stackSave":(function(){Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore()}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc((str.length<<2)+1);writeStringToMemory(str,ret)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){if(opts&&opts.async){EmterpreterAsync.asyncFinalizers.push((function(){Runtime.stackRestore(stack)}));return}Runtime.stackRestore(stack)}return ret};var sourceRegex=/^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return{arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun])}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return"$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){funcstr+="var stack = "+JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"="+convertCode.returnValue+";"}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);"}if(!numericArgs){funcstr+=JSsource["stackRestore"].body.replace("()","(stack)")+";"}funcstr+="return ret})";return eval(funcstr)}}))();Module["ccall"]=ccall;Module["cwrap"]=cwrap;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type)}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[_malloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(typeof _sbrk!=="undefined"&&!_sbrk.called||!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;function UTF8ArrayToString(u8Array,idx){var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;function UTF16ToString(ptr){var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}Module["UTF16ToString"]=UTF16ToString;function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}Module["stringToUTF16"]=stringToUTF16;function lengthBytesUTF16(str){return str.length*2}Module["lengthBytesUTF16"]=lengthBytesUTF16;function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}Module["UTF32ToString"]=UTF32ToString;function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}Module["stringToUTF32"]=stringToUTF32;function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}Module["lengthBytesUTF32"]=lengthBytesUTF32;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret)}}var i=3;var basicTypes={"v":"void","b":"bool","c":"char","s":"short","i":"int","l":"long","f":"float","d":"double","w":"wchar_t","a":"signed char","h":"unsigned char","t":"unsigned short","j":"unsigned int","m":"unsigned long","x":"long long","y":"unsigned long long","z":"..."};var subs=[];var first=true;function dump(x){if(x)Module.print(x);Module.print(func);var pre="";for(var a=0;a<i;a++)pre+=" ";Module.print(pre+"^")}function parseNested(){i++;if(func[i]==="K")i++;var parts=[];while(func[i]!=="E"){if(func[i]==="S"){i++;var next=func.indexOf("_",i);var num=func.substring(i,next)||0;parts.push(subs[num]||"?");i=next+1;continue}if(func[i]==="C"){parts.push(parts[parts.length-1]);i+=2;continue}var size=parseInt(func.substr(i));var pre=size.toString().length;if(!size||!pre){i--;break}var curr=func.substr(i+pre,size);parts.push(curr);subs.push(curr);i+=pre+size}i++;return parts}function parse(rawList,limit,allowVoid){limit=limit||Infinity;var ret="",list=[];function flushList(){return"("+list.join(", ")+")"}var name;if(func[i]==="N"){name=parseNested().join("::");limit--;if(limit===0)return rawList?[name]:name}else{if(func[i]==="K"||first&&func[i]==="L")i++;var size=parseInt(func.substr(i));if(size){var pre=size.toString().length;name=func.substr(i+pre,size);i+=pre+size}}first=false;if(func[i]==="I"){i++;var iList=parse(true);var iRet=parse(true,1,true);ret+=iRet[0]+" "+name+"<"+iList.join(", ")+">"}else{ret=name}paramLoop:while(i<func.length&&limit-->0){var c=func[i++];if(c in basicTypes){list.push(basicTypes[c])}else{switch(c){case"P":list.push(parse(true,1,true)[0]+"*");break;case"R":list.push(parse(true,1,true)[0]+"&");break;case"L":{i++;var end=func.indexOf("E",i);var size=end-i;list.push(func.substr(i,size));i+=size+2;break};case"A":{var size=parseInt(func.substr(i));i+=size.toString().length;if(func[i]!=="_")throw"?";i++;list.push(parse(true,1,true)[0]+" ["+size+"]");break};case"E":break paramLoop;default:ret+="?"+c;break paramLoop}}}if(!allowVoid&&list.length===1&&list[0]==="void")list=[];if(rawList){if(ret){list.push(ret+"?")}return list}else{return ret+flushList()}}var parsed=func;try{if(func=="Object._main"||func=="_main"){return"main()"}if(typeof func==="number")func=Pointer_stringify(func);if(func[0]!=="_")return func;if(func[1]!=="_")return func;if(func[2]!=="Z")return func;switch(func[3]){case"n":return"operator new()";case"d":return"operator delete()"}parsed=parse()}catch(e){parsed+="?"}if(parsed.indexOf("?")>=0&&!hasLibcxxabi){Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling")}return parsed}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){return demangleAll(jsStackTrace())}Module["stackTrace"]=stackTrace;var PAGE_SIZE=4096;function alignMemoryPage(x){if(x%4096>0){x+=4096-x%4096}return x}var HEAP;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;var totalMemory=64*1024;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2}else{totalMemory+=16*1024*1024}}if(totalMemory!==TOTAL_MEMORY){TOTAL_MEMORY=totalMemory}assert(typeof Int32Array!=="undefined"&&typeof Float64Array!=="undefined"&&!!(new Int32Array(1))["subarray"]&&!!(new Int32Array(1))["set"],"JS engine does not provide full typed array support");var buffer;if(Module["buffer"]){buffer=Module["buffer"];assert(buffer.byteLength===TOTAL_MEMORY,"provided buffer should be "+TOTAL_MEMORY+" bytes, but it is "+buffer.byteLength)}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}HEAP8=new Int8Array(buffer);HEAP16=new Int16Array(buffer);HEAP32=new Int32Array(buffer);HEAPU8=new Uint8Array(buffer);HEAPU16=new Uint16Array(buffer);HEAPU32=new Uint32Array(buffer);HEAPF32=new Float32Array(buffer);HEAPF64=new Float64Array(buffer);HEAP32[0]=255;assert(HEAPU8[0]===255&&HEAPU8[3]===0,"Typed arrays 2 must be run on a little-endian system");Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func)}else{Runtime.dynCall("vi",func,[callback.arg])}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];HEAP8[buffer+i>>0]=chr;i=i+1}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){HEAP8[buffer++>>0]=array[i]}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}Module["writeAsciiToMemory"]=writeAsciiToMemory;function unSign(value,bits,ignore){if(value>=0){return value}return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}function reSign(value,bits,ignore){if(value<=0){return value}var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}return value}if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];if(!Math["clz32"])Math["clz32"]=(function(x){x=x>>>0;for(var i=0;i<32;i++){if(x&1<<31-i)return i}return 32});Math.clz32=Math["clz32"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_min=Math.min;var Math_clz32=Math.clz32;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var ASM_CONSTS=[(function($0){{appendError($0)}})];function _emscripten_asm_const_1(code,a0){return ASM_CONSTS[code](a0)}STATIC_BASE=8;STATICTOP=STATIC_BASE+193488;__ATINIT__.push();allocate([0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,32,193,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,2,16,0,0,0,0,0,0,0,0,0,0,0,0,16,64,184,176,0,0,8,0,0,0,1,0,0,0,0,0,0,0,2,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,150,64,0,0,0,0,0,128,150,64,4,144,195,0,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,64,0,0,0,0,0,0,88,64,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,64,0,0,0,0,0,0,88,64,0,32,3,2,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,66,64,0,0,0,0,0,32,131,64,0,0,0,0,0,192,136,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,66,64,0,0,0,0,0,32,131,64,0,0,0,0,0,192,136,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64,0,176,193,0,0,0,0,0,0,0,0,0,0,0,16,64,176,182,0,0,147,0,0,0,1,0,0,0,0,0,0,0,64,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64,0,16,0,2,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,64,0,0,0,0,0,0,88,64,0,176,193,0,0,0,0,0,0,0,0,0,0,0,0,0,176,186,0,0,16,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,64,0,0,0,0,0,0,88,64,64,32,62,3,0,0,0,0,0,0,0,0,0,0,16,64,184,187,0,0,122,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,82,64],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE);allocate([255,255,255,255,255,255,239,127,255,255,255,255,255,255,239,127,255,255,255,255,255,255,239,255,255,255,255,255,255,255,239,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,51,51,51,51,51,211,63,0,0,0,0,0,0,248,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,154,153,153,153,153,153,169,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,154,153,153,153,153,153,169,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,169,241,210,77,98,80,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,38,245,107,12,195,1,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,2,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,224,63,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,4,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,51,51,51,51,51,51,243,63,5,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,154,153,153,153,153,153,233,63,6,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,7,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,224,63,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,51,51,51,51,51,211,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,128,70,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,154,153,153,153,153,153,217,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,51,51,51,51,51,227,63,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,228,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,128,102,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,128,102,64,154,153,153,153,153,153,217,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,128,102,64,123,20,174,71,225,122,228,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,128,70,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,223,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,81,218,27,124,97,50,227,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,244,108,86,125,174,182,214,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,196,66,173,105,222,113,236,63,16,122,54,171,62,87,229,63,245,219,215,129,115,70,204,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,136,133,90,211,188,227,216,63,1,77,132,13,79,175,226,63,211,188,227,20,29,201,209,63,88,168,53,205,59,78,213,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,1,77,132,13,79,175,226,63,1,77,132,13,79,175,226,63,1,77,132,13,79,175,226,63,181,21,251,203,238,201,225,63,204,93,75,200,7,61,240,63,16,122,54,171,62,87,229,63,16,122,54,171,62,87,229,63,210,111,95,7,206,25,231,63,210,111,95,7,206,25,231,63,16,122,54,171,62,87,229,63,120,11,36,40,126,140,227,63,106,222,113,138,142,228,232,63,210,111,95,7,206,25,231,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,224,63,16,122,54,171,62,87,229,63,181,21,251,203,238,201,225,63,44,212,154,230,29,167,234,63,210,111,95,7,206,25,231,63,106,222,113,138,142,228,232,63,16,122,54,171,62,87,229,63,106,222,113,138,142,228,232,63,210,111,95,7,206,25,231,63,16,122,54,171,62,87,229,63,120,11,36,40,126,140,227,63,210,111,95,7,206,25,231,63,16,122,54,171,62,87,229,63,134,56,214,197,109,52,238,63,16,122,54,171,62,87,229,63,16,122,54,171,62,87,229,63,120,11,36,40,126,140,227,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,166,10,70,37,117,2,222,63,181,21,251,203,238,201,225,63,72,191,125,29,56,103,204,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,0,0,0,0,0,0,224,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,211,188,227,20,29,201,209,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,72,191,125,29,56,103,204,63,72,191,125,29,56,103,204,63,0,0,0,0,0,0,224,63,72,191,125,29,56,103,204,63,44,212,154,230,29,167,234,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,224,63,211,188,227,20,29,201,209,63,181,21,251,203,238,201,225,63,0,0,0,0,0,0,224,63,210,111,95,7,206,25,231,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,2,154,8,27,158,94,213,63,224,190,14,156,51,162,208,63,2,154,8,27,158,94,213,63,1,77,132,13,79,175,226,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,88,168,53,205,59,78,213,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,62,232,217,172,250,92,197,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,29,56,103,68,105,111,200,63,88,168,53,205,59,78,213,63,181,21,251,203,238,201,225,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,211,188,227,20,29,201,209,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,231,29,167,232,72,46,225,63,162,180,55,248,194,100,214,63,72,191,125,29,56,103,204,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,181,21,251,203,238,201,225,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,211,188,227,20,29,201,209,63,120,11,36,40,126,140,227,63,211,188,227,20,29,201,209,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,211,188,227,20,29,201,209,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,211,188,227,20,29,201,209,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,240,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,240,63,211,188,227,20,29,201,209,63,234,149,178,12,113,172,215,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,181,21,251,203,238,201,225,63,106,222,113,138,142,228,232,63,0,0,0,0,0,0,240,63,152,221,147,135,133,90,215,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,196,66,173,105,222,113,236,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,72,191,125,29,56,103,204,63,120,11,36,40,126,140,227,63,134,56,214,197,109,52,238,63,120,11,36,40,126,140,227,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,88,168,53,205,59,78,213,63,37,117,2,154,8,27,218,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,44,212,154,230,29,167,234,63,106,222,113,138,142,228,232,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,224,63,93,220,70,3,120,11,226,63,0,0,0,0,0,0,208,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,208,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,93,220,70,3,120,11,226,63,93,220,70,3,120,11,226,63,93,220,70,3,120,11,226,63,13,113,172,139,219,104,220,63,100,93,220,70,3,120,237,63,210,111,95,7,206,25,231,63,16,122,54,171,62,87,229,63,16,122,54,171,62,87,229,63,210,111,95,7,206,25,231,63,120,11,36,40,126,140,227,63,181,21,251,203,238,201,225,63,210,111,95,7,206,25,231,63,210,111,95,7,206,25,231,63,88,168,53,205,59,78,213,63,136,133,90,211,188,227,216,63,210,111,95,7,206,25,231,63,120,11,36,40,126,140,227,63,196,66,173,105,222,113,236,63,210,111,95,7,206,25,231,63,210,111,95,7,206,25,231,63,181,21,251,203,238,201,225,63,210,111,95,7,206,25,231,63,16,122,54,171,62,87,229,63,181,21,251,203,238,201,225,63,120,11,36,40,126,140,227,63,210,111,95,7,206,25,231,63,210,111,95,7,206,25,231,63,134,56,214,197,109,52,238,63,210,111,95,7,206,25,231,63,210,111,95,7,206,25,231,63,120,11,36,40,126,140,227,63,88,168,53,205,59,78,213,63,211,188,227,20,29,201,209,63,88,168,53,205,59,78,213,63,166,10,70,37,117,2,222,63,0,0,0,0,0,0,224,63,88,168,53,205,59,78,213,63,13,113,172,139,219,104,220,63,0,0,0,0,0,0,224,63,13,113,172,139,219,104,220,63,0,0,0,0,0,0,224,63,13,113,172,139,219,104,220,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,211,188,227,20,29,201,209,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,224,63,211,188,227,20,29,201,209,63,106,222,113,138,142,228,232,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,88,168,53,205,59,78,213,63,136,133,90,211,188,227,216,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,210,111,95,7,206,25,231,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,13,113,172,139,219,104,220,63,244,108,86,125,174,182,222,63,17,54,60,189,82,150,201,63,244,108,86,125,174,182,222,63,59,1,77,132,13,79,225,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,62,232,217,172,250,92,197,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,130,115,70,148,246,6,199,63,13,113,172,139,219,104,220,63,0,0,0,0,0,0,224,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,181,21,251,203,238,201,225,63,181,21,251,203,238,201,225,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,7,240,22,72,80,252,220,63,162,180,55,248,194,100,214,63,88,168,53,205,59,78,213,63,13,113,172,139,219,104,220,63,13,113,172,139,219,104,220,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,208,63,13,113,172,139,219,104,220,63,0,0,0,0,0,0,208,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,208,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,208,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,88,168,53,205,59,78,213,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,196,66,173,105,222,113,236,63,0,0,0,0,0,0,208,63,127,217,61,121,88,168,209,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,120,11,36,40,126,140,227,63,210,111,95,7,206,25,231,63,196,66,173,105,222,113,236,63,19,242,65,207,102,213,211,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,16,122,54,171,62,87,229,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,211,188,227,20,29,201,209,63,0,0,0,0,0,0,224,63,210,111,95,7,206,25,231,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,0,0,0,0,0,0,208,63,132,245,127,14,243,101,15,64,96,118,79,30,22,42,43,192,98,189,81,43,76,223,205,191,23,133,184,205,175,65,138,63,212,130,23,125,5,105,241,191,93,134,255,116,3,133,235,63,247,21,214,83,204,189,55,63,186,205,91,66,44,5,46,63,58,205,2,237,14,41,238,191,250,185,161,41,59,253,216,63,249,97,41,55,246,145,128,63,167,57,30,216,150,166,125,63,155,200,204,5,46,143,231,191,198,51,104,232,159,224,202,63,54,130,67,94,197,152,138,63,26,142,66,237,18,48,133,63,122,52,213,147,249,71,217,191,205,228,155,109,110,76,27,64,229,103,126,144,192,122,185,63,254,198,232,202,177,6,137,63,115,243,141,232,158,117,225,191,231,86,99,100,36,214,179,63,209,99,239,32,209,95,155,63,231,208,216,77,223,33,139,63,7,242,71,172,32,97,171,63,15,149,235,18,122,162,182,191,179,181,190,72,104,203,137,63,124,90,234,197,245,148,161,63,7,234,148,71,55,194,202,63,70,227,154,76,38,184,174,191,51,242,129,54,156,166,125,191,45,30,197,214,191,45,128,63,210,26,131,78,8,29,182,63,88,57,180,200,118,30,39,192,85,193,168,164,78,128,5,192,246,9,160,24,89,50,199,63,137,149,209,200,231,21,207,63,98,45,62,5,192,248,252,191,11,94,244,21,164,25,249,63,129,236,245,238,143,247,250,63,43,47,249,159,252,221,205,63,115,187,151,251,228,40,221,191,250,210,219,159,139,134,204,63,235,201,252,163,111,210,217,63,230,44,162,220,108,98,175,63,228,132,9,163,89,217,186,191,225,188,147,170,72,224,166,63,204,197,8,118,54,195,129,63,88,55,222,29,25,171,157,63,234,178,152,216,124,188,26,64,206,0,23,100,203,242,197,63,117,250,139,234,190,173,149,63,192,189,33,67,125,129,159,63,171,93,19,210,26,131,170,191,36,176,222,77,92,51,150,63,170,17,85,83,237,46,179,191,9,198,28,95,214,31,168,191,63,198,220,181,132,124,192,63,82,147,133,84,246,2,180,191,0,0,0,0,0,0,0,64,111,210,217,110,39,182,159,191,60,37,49,82,57,55,171,63,66,108,250,253,172,67,151,191,197,80,243,250,56,63,166,63,123,20,174,71,225,122,148,63,164,112,61,10,215,163,6,64,0,0,0,0,0,0,192,63,123,20,174,71,225,122,132,63,81,160,79,228,73,210,14,64,180,200,118,190,159,58,53,192,58,34,223,165,212,37,213,191,243,130,62,71,154,46,138,63,159,229,121,112,119,214,249,191,126,253,16,27,44,156,230,63,150,236,216,8,196,235,204,63,205,206,162,119,42,224,208,63,176,227,191,64,16,32,237,191],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+33272);allocate([173,161,212,94,68,219,216,63,59,161,124,230,81,150,118,63,211,110,112,249,122,132,123,63,129,204,206,162,119,42,228,191,209,173,215,244,160,160,200,63,106,223,55,25,176,63,132,63,190,202,144,25,94,255,132,63,28,150,6,126,84,195,196,191,165,73,41,232,246,226,35,64,169,217,3,173,192,144,193,63,8,196,144,65,147,105,137,63,250,68,158,36,93,51,208,191,1,240,153,54,45,194,94,63,13,156,125,47,207,148,151,63,137,181,248,20,0,227,137,63,229,169,88,70,52,203,177,191,143,0,201,207,161,103,166,191,92,181,198,251,204,180,136,63,77,164,143,84,58,179,144,63,230,199,4,161,97,214,160,191,199,105,103,28,19,247,130,191,42,127,107,229,45,112,92,191,228,87,98,84,8,154,117,63,209,241,135,85,114,4,183,63,149,212,9,104,34,60,51,192,100,35,16,175,235,119,16,192,167,33,170,240,103,120,199,63,218,255,0,107,213,174,193,63,78,40,68,192,33,84,247,191,170,72,133,177,133,32,245,63,157,104,87,33,229,39,246,63,77,46,198,192,58,142,205,63,89,107,40,181,23,209,220,191,3,63,170,97,191,39,204,63,166,71,83,61,153,127,218,63,182,129,59,80,167,60,174,63,81,76,222,0,51,223,185,191,245,118,149,255,218,11,166,63,212,165,53,188,15,246,148,63,31,173,32,188,44,220,144,63,40,44,241,128,178,201,35,64,35,90,225,76,2,138,183,63,72,163,101,81,150,41,127,63,187,180,134,247,193,158,147,63,23,168,123,83,71,125,160,191,33,43,174,224,109,148,139,63,51,115,220,132,214,30,181,191,160,120,132,137,245,252,143,63,105,53,36,238,177,244,145,191,184,205,51,122,94,191,106,63,146,62,173,162,63,52,205,191,126,176,231,198,79,62,152,191,7,35,155,80,45,199,164,63,62,24,194,123,88,185,145,191,45,124,125,173,75,141,198,63,252,169,241,210,77,98,80,63,236,81,184,30,133,235,19,64,229,208,34,219,249,126,202,63,83,150,33,142,117,113,123,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,255,255,255,223,65,0,0,0,64,251,33,249,63,0,0,0,0,45,68,116,62,0,0,0,128,152,70,248,60,0,0,0,96,81,204,120,59,0,0,0,128,131,27,240,57,0,0,0,64,32,37,122,56,0,0,0,128,34,130,227,54,0,0,0,0,29,243,105,53,0,0,0,0,0,0,0,0,0,0,0,0,93,153,1,0,116,172,0,0,3,0,0,0,64,174,0,0,3,0,0,0,144,176,0,0,3,0,0,0,52,177,0,0,3,0,0,0,104,178,0,0,3,0,0,0,136,182,0,0,3,0,0,0,172,185,0,0,3,0,0,0,120,186,0,0,3,0,0,0,72,190,0,0,3,0,0,0,144,187,0,0,0,0,0,0,4,174,0,0,0,0,0,0,104,176,0,0,0,0,0,0,12,177,0,0,0,0,0,0,64,178,0,0,0,0,0,0,96,182,0,0,0,0,0,0,132,185,0,0,0,0,0,0,80,186,0,0,0,0,0,0,32,190,0,0,0,0,0,0,104,187,0,0,4,0,0,0,152,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,209,24,2,0,1,0,0,0,20,173,0,0,8,0,0,0,4,0,0,0,101,153,1,0,1,0,0,0,140,173,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,106,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,114,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,1,0,0,0,121,153,1,0,1,0,0,0,0,0,0,0,72,0,0,0,2,0,0,0,131,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,3,0,0,0,141,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,4,0,0,0,155,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,5,0,0,0,165,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,6,0,0,0,178,153,1,0,1,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,175,0,0,128,175,0,0,144,175,0,0,160,175,0,0,176,175,0,0,192,175,0,0,208,175,0,0,224,175,0,0,128,175,0,0,128,175,0,0,192,175,0,0,192,175,0,0,0,0,0,0,31,0,0,0,63,0,0,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,6,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,120,154,1,0,1,0,0,0,240,175,0,0,24,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,124,154,1,0,1,0,0,0,0,0,0,0,56,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,69,171,2,0,74,148,2,0,219,149,2,0,27,156,2,0,18,163,2,0,81,167,2,0,209,170,2,0,226,170,2,0,0,0,0,0,69,171,2,0,74,148,2,0,27,156,2,0,219,149,2,0,81,167,2,0,18,163,2,0,226,170,2,0,209,170,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,72,156,1,0,1,0,0,0,192,177,0,0,112,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,76,156,1,0,1,0,0,0,0,0,0,0,144,1,0,0,2,0,0,0,86,156,1,0,1,0,0,0,0,0,0,0,200,1,0,0,0,0,0,0,95,156,1,0,1,0,0,0,0,0,0,0,200,1,0,0,3,0,0,0,104,156,1,0,1,0,0,0,0,0,0,0,200,1,0,0,0,0,0,0,114,156,1,0,1,0,0,0,0,0,0,0,144,1,0,0,3,0,0,0,126,156,1,0,1,0,0,0,0,0,0,0,144,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,125,33,2,0,1,0,0,0,184,178,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,217,1,0,1,0,0,0,0,0,0,0,32,2,0,0,1,0,0,0,197,157,1,0,1,0,0,0,0,0,0,0,32,2,0,0,2,0,0,0,42,217,1,0,1,0,0,0,0,0,0,0,88,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,3,0,0,0,9,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,196,161,1,0,210,161,1,0,232,161,1,0,86,185,2,0,246,161,1,0,5,162,1,0,10,162,1,0,40,162,1,0,86,185,2,0,58,162,1,0,106,162,1,0,86,185,2,0,136,162,1,0,176,162,1,0,190,162,1,0,237,162,1,0,33,163,1,0,50,163,1,0,87,163,1,0,122,163,1,0,128,163,1,0,156,163,1,0,185,163,1,0,212,163,1,0,245,163,1,0,15,164,1,0,49,164,1,0,80,164,1,0,118,164,1,0,142,164,1,0,174,164,1,0,203,164,1,0,239,164,1,0,251,164,1,0,86,185,2,0,6,165,1,0,44,165,1,0,80,165,1,0,118,165,1,0,86,185,2,0,172,165,1,0,196,165,1,0,209,165,1,0,0,166,1,0,251,164,1,0,86,185,2,0,13,166,1,0,22,166,1,0,55,166,1,0,114,166,1,0,189,166,1,0,17,167,1,0,51,167,1,0,72,167,1,0,95,167,1,0,117,167,1,0,141,167,1,0,86,185,2,0,163,167,1,0,190,167,1,0,226,167,1,0,6,168,1,0,43,168,1,0,86,185,2,0,76,168,1,0,102,168,1,0,120,168,1,0,133,168,1,0,146,168,1,0,166,168,1,0,181,168,1,0,189,168,1,0,210,168,1,0,224,168,1,0,30,169,1,0,41,169,1,0,251,164,1,0,86,185,2,0,47,169,1,0,59,169,1,0,74,169,1,0,122,163,1,0,86,185,2,0,93,169,1,0,134,169,1,0,164,169,1,0,180,169,1,0,197,169,1,0,204,169,1,0,219,169,1,0,235,169,1,0,47,170,1,0,54,170,1,0,122,163,1,0,86,185,2,0,64,170,1,0,108,170,1,0,119,170,1,0,128,170,1,0,137,170,1,0,154,170,1,0,171,170,1,0,191,170,1,0,251,164,1,0,86,185,2,0,203,170,1,0,219,170,1,0,233,170,1,0,247,170,1,0,4,171,1,0,17,171,1,0,39,171,1,0,48,171,1,0,63,171,1,0,76,171,1,0,93,171,1,0,251,164,1,0,86,185,2,0,104,171,1,0,135,171,1,0,86,185,2,0,153,171,1,0,168,171,1,0,216,171,1,0,226,171,1,0,239,171,1,0,252,171,1,0,9,172,1,0,22,172,1,0,25,172,1,0,86,185,2,0,29,172,1,0,86,185,2,0,64,172,1,0,113,172,1,0,160,172,1,0,183,172,1,0,210,172,1,0,237,172,1,0,251,164,1,0,86,185,2,0,9,173,1,0,86,185,2,0,49,173,1,0,61,173,1,0,80,173,1,0,99,173,1,0,120,173,1,0,141,173,1,0,145,173,1,0,122,163,1,0,86,185,2,0,157,173,1,0,86,185,2,0,173,173,1,0,187,173,1,0,199,173,1,0,212,173,1,0,244,173,1,0,4,174,1,0,26,174,1,0,86,185,2,0,46,174,1,0,119,174,1,0,189,174,1,0,237,174,1,0,32,175,1,0,39,175,1,0,78,175,1,0,117,175,1,0,86,185,2,0,122,175,1,0,0,0,0,0,26,0,0,0,0,0,0,0,27,0,0,0,28,0,0,0,5,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,4,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,11,0,0,0,6,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,128,33,2,0,1,0,0,0,232,181,0,0,144,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,218,1,0,1,0,0,0,0,0,0,0,176,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,147,2,0,108,147,2,0,50,184,1,0,177,147,2,0,236,147,2,0,14,148,2,0,20,148,2,0,69,171,2,0,59,148,2,0,74,148,2,0,103,148,2,0,114,148,2,0,148,148,2,0,202,148,2,0,0,149,2,0,59,149,2,0,113,149,2,0,147,149,2,0,162,149,2,0,211,149,2,0,219,149,2,0,238,175,1,0,247,175,1,0,248,149,2,0,0,176,1,0,66,150,2,0,9,176,1,0,76,150,2,0,18,176,1,0,86,150,2,0,165,150,2,0,224,150,2,0,30,176,1,0,27,151,2,0,38,151,2,0,107,151,2,0,121,151,2,0,195,151,2,0,209,151,2,0,223,151,2,0,234,151,2,0,27,152,2,0,91,152,2,0,99,152,2,0,107,152,2,0,166,152,2,0,220,152,2,0,232,152,2,0,55,184,1,0,244,152,2,0,254,152,2,0,9,153,2,0,38,153,2,0,92,153,2,0,27,156,2,0,61,156,2,0,73,156,2,0,8,159,2,0,57,159,2,0,101,159,2,0,155,159,2,0,168,159,2,0,202,159,2,0,236,159,2,0,245,159,2,0,63,160,2,0,73,160,2,0,142,160,2,0,196,160,2,0,207,160,2,0,84,161,2,0,105,161,2,0,38,176,1,0,115,161,2,0,125,161,2,0,179,161,2,0,243,161,2,0,1,162,2,0,85,162,2,0,100,162,2,0,115,162,2,0,194,162,2,0,63,184,1,0,2,163,2,0,12,163,2,0,18,163,2,0,62,163,2,0,101,163,2,0,118,163,2,0,129,163,2,0,198,163,2,0,11,164,2,0,26,164,2,0,42,164,2,0,60,164,2,0,76,164,2,0,92,164,2,0,105,164,2,0,115,164,2,0,169,164,2,0,178,164,2,0,242,164,2,0,5,165,2,0,68,184,1,0,13,165,2,0,67,165,2,0,106,165,2,0,160,165,2,0,199,165,2,0,213,165,2,0,11,166,2,0,85,166,2,0,159,166,2,0,170,166,2,0,224,166,2,0,229,166,2,0,2,167,2,0,31,167,2,0,42,167,2,0,81,167,2,0,105,167,2,0,159,167,2,0,213,167,2,0,225,167,2,0,8,168,2,0,19,168,2,0,68,168,2,0,117,168,2,0,111,196,1,0,156,168,2,0,200,168,2,0,254,168,2,0,52,169,2,0,62,169,2,0,91,169,2,0,155,169,2,0,209,169,2,0,74,184,1,0,233,169,2,0,21,170,2,0,60,170,2,0,114,170,2,0,175,170,2,0,209,170,2,0,215,170,2,0,226,170,2,0,9,171,2,0,214,176,1,0,210,176,1,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,14,0,0,0,7,0,0,0,5,0,0,0,15,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,195,182,1,0,1,0,0,0,12,185,0,0,232,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,198,182,1,0,1,0,0,0,0,0,0,0,8,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,44,0,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,17,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,38,184,1,0,1,0,0,0,216,185,0,0,64,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,184,1,0,1,0,0,0,0,0,0,0,96,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,184,1,0,69,171,2,0,74,148,2,0,55,184,1,0,92,153,2,0,27,156,2,0,63,184,1,0,62,163,2,0,242,164,2,0,68,184,1,0,42,167,2,0,81,167,2,0,111,196,1,0,74,184,1,0,209,170,2,0,226,170,2,0,47,0,0,0,0,0,0,0,48,0,0,0,49,0,0,0,9,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,0,0,0,0,20,0,0,0,10,0,0,0,7,0,0,0,21,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,249,194,1,0,1,0,0,0,240,186,0,0,152,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,194,1,0,1,0,0,0,0,0,0,0,184,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,177,147,2,0,5,195,1,0,69,171,2,0,74,148,2,0,103,148,2,0,16,195,1,0,22,195,1,0,33,195,1,0,40,195,1,0,114,148,2,0,202,148,2,0,48,195,1,0,54,195,1,0,65,195,1,0,113,149,2,0,147,149,2,0,219,149,2,0,72,195,1,0,66,150,2,0,86,150,2,0,224,150,2,0,82,195,1,0,107,151,2,0,121,151,2,0,195,151,2,0,93,195,1,0,209,151,2,0,101,195,1,0,110,195,1,0,124,195,1,0,134,195,1,0,166,152,2,0,143,195,1,0,232,152,2,0,9,153,2,0,38,153,2,0,149,195,1,0,109,153,2,0,152,153,2,0,193,153,2,0,228,153,2,0,13,154,2,0,48,154,2,0,89,154,2,0,124,154,2,0,165,154,2,0,200,154,2,0,241,154,2,0,20,155,2,0,61,155,2,0,96,155,2,0,137,155,2,0,172,155,2,0,213,155,2,0,248,155,2,0,27,156,2,0,156,195,1,0,61,156,2,0,168,195,1,0,101,159,2,0,202,159,2,0,142,160,2,0,181,195,1,0,115,162,2,0,194,195,1,0,2,163,2,0,18,163,2,0,204,195,1,0,62,163,2,0,101,163,2,0,118,163,2,0,219,195,1,0,237,195,1,0,129,163,2,0,11,164,2,0,26,164,2,0,42,164,2,0,60,164,2,0,76,164,2,0,253,195,1,0,8,196,1,0,19,196,1,0,92,164,2,0,242,164,2,0,247,164,2,0,24,196,1,0,33,196,1,0,42,196,1,0,58,196,1,0,65,196,1,0,67,165,2,0,106,165,2,0,160,165,2,0,213,165,2,0,229,166,2,0,2,167,2,0,73,196,1,0,81,167,2,0,80,196,1,0,225,167,2,0,89,196,1,0,19,168,2,0,97,196,1,0,117,168,2,0,111,196,1,0,156,168,2,0,200,168,2,0,118,196,1,0,91,169,2,0,155,169,2,0,128,196,1,0,209,169,2,0,233,169,2,0,60,170,2,0,138,196,1,0,152,196,1,0,114,170,2,0,121,170,2,0,175,170,2,0,209,170,2,0,226,170,2,0,9,171,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,59,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,61,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,0,0,0,23,0,0,0,11,0,0,0,8,0,0,0,24,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,206,1,0,255,255,255,255,168,189,0,0,240,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,206,1,0,255,255,255,255,0,0,0,0,16,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,206,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,66,0,0,160,52,2,0,65,73,0,0,122,52,2,0,65,82,0,0,77,52,2,0,65,88,0,0,181,52,2,0,66,32,0,0,241,54,2,0,66,73,0,0,2,55,2,0,67,66,0,0,58,53,2,0,67,79,0,0,40,53,2,0,67,88,0,0,71,53,2,0,72,32,0,0,107,53,2,0,72,66,0,0,117,53,2,0,72,73,0,0,1,54,2,0,72,88,0,0,132,53,2,0,72,98,0,0,181,53,2,0,72,105,0,0,232,53,2,0,72,114,0,0,154,53,2,0,72,120,0,0,203,53,2,0,73,32,0,0,19,55,2,0,75,66,0,0,204,52,2,0,75,73,0,0,20,53,2,0,75,82,0,0,0,53,2,0,75,88,0,0,237,52,2,0,78,66,0,0,19,54,2,0,78,73,0,0,90,54,2,0,78,82,0,0,114,54,2,0,78,88,0,0,62,54,2,0,80,65,0,0,211,54,2,0,80,66,0,0,143,54,2,0,80,73,0,0,195,54,2,0,80,88,0,0,175,54,2,0,82,32,0,0,193,56,2,0,83,32,0,0,226,54,2,0,90,68,0,0,80,55,2,0,0,0,0,0,0,0,0,0,1,0,0,0,15,0,0,0,170,216,1,0,1,0,0,0,128,195,0,0,0,0,0,0,16,0,0,0,178,216,1,0,1,0,0,0,128,195,0,0,0,0,0,0,17,0,0,0,186,216,1,0,1,0,0,0,128,195,0,0,0,0,0,0,17,0,0,0,195,216,1,0,1,0,0,0,128,195,0,0,0,0,0,0,17,0,0,0,203,216,1,0,1,0,0,0,128,195,0,0,0,0,0,0,19,0,0,0,211,216,1,0,1,0,0,0,132,195,0,0,0,0,0,0,20,0,0,0,219,216,1,0,1,0,0,0,132,195,0,0,0,0,0,0,21,0,0,0,227,216,1,0,1,0,0,0,132,195,0,0,0,0,0,0,21,0,0,0,236,216,1,0,1,0,0,0,132,195,0,0,0,0,0,0,21,0,0,0,244,216,1,0,1,0,0,0,132,195,0,0,0,0,0,0,22,0,0,0,252,216,1,0,1,0,0,0,136,195,0,0,0,0,0,0,23,0,0,0,5,217,1,0,1,0,0,0,136,195,0,0,0,0,0,0,24,0,0,0,14,217,1,0,1,0,0,0,136,195,0,0,0,0,0,0,24,0,0,0,24,217,1,0,1,0,0,0,136,195,0,0,0,0,0,0,24,0,0,0,33,217,1,0,1,0,0,0,136,195,0,0,0,0,0,0,25,0,0,0,42,217,1,0,1,0,0,0,140,195,0,0,0,0,0,0,25,0,0,0,49,217,1,0,1,0,0,0,140,195,0,0,0,0,0,0,26,0,0,0,55,217,1,0,1,0,0,0,144,195,0,0,0,0,0,0,10,0,0,0,64,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,11,0,0,0,72,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,12,0,0,0,80,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,12,0,0,0,89,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,12,0,0,0,97,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,14,0,0,0,105,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,14,0,0,0,112,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,13,0,0,0,120,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,5,0,0,0,128,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,6,0,0,0,136,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,7,0,0,0,144,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,7,0,0,0,153,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,7,0,0,0,161,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,9,0,0,0,169,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,9,0,0,0,176,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,8,0,0,0,184,217,1,0,1,0,0,0,148,195,0,0,0,0,0,0,0,0,0,0,192,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,1,0,0,0,201,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,2,0,0,0,210,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,2,0,0,0,220,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,2,0,0,0,229,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,4,0,0,0,238,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,4,0,0,0,246,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,3,0,0,0,255,217,1,0,1,0,0,0,152,195,0,0,0,0,0,0,18,0,0,0,8,218,1,0,1,0,0,0,128,195,0,0,0,0,0,0,27,0,0,0,16,218,1,0,1,0,0,0,156,195,0,0,0,0,0,0,28,0,0,0,24,218,1,0,1,0,0,0,156,195,0,0,0,0,0,0,29,0,0,0,32,218,1,0,1,0,0,0,156,195,0,0,0,0,0,0,29,0,0,0,41,218,1,0,1,0,0,0,156,195,0,0,0,0,0,0,29,0,0,0,49,218,1,0,1,0,0,0,156,195,0,0,0,0,0,0,30,0,0,0,57,218,1,0,1,0,0,0,160,195,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,164,221,1,0,172,195,0,0,1,0,0,0,200,195,0,0,0,0,0,0,0,0,0,0,63,0,0,0,64,0,0,0,1,0,0,0,0,0,0,0,209,24,2,0,0,0,0,0,188,195,0,0,196,195,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,1,0,0,48,1,0,0,176,0,0,0,47,229,1,0,52,229,1,0,56,229,1,0,63,229,1,0,67,229,1,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,234,1,0,120,197,0,0,1,0,0,0,212,197,0,0,0,0,0,0,0,0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0,69,0,0,0,70,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,74,0,0,0,75,0,0,0,66,0,0,0,76,0,0,0,66,0,0,0,77,0,0,0,78,0,0,0,79,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,50,234,1,0,0,0,0,0,136,197,0,0,208,197,0,0,1,0,0,0,56,234,1,0,0,0,0,0,144,197,0,0,208,197,0,0,2,0,0,0,60,234,1,0,0,0,0,0,152,197,0,0,208,197,0,0,3,0,0,0,65,234,1,0,0,0,0,0,160,197,0,0,208,197,0,0,4,0,0,0,71,234,1,0,0,0,0,0,168,197,0,0,208,197,0,0,5,0,0,0,77,234,1,0,0,0,0,0,192,197,0,0,208,197,0,0,6,0,0,0,87,234,1,0,0,0,0,0,200,197,0,0,208,197,0,0,7,0,0,0,93,234,1,0,0,0,0,0,176,197,0,0,208,197,0,0,7,0,0,0,97,234,1,0,0,0,0,0,176,197,0,0,208,197,0,0,7,0,0,0,102,234,1,0,0,0,0,0,184,197,0,0,208,197,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,242,236,1,0,8,0,0,0,48,0,0,0,0,0,0,0,1,0,0,0,28,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,185,2,0,0,0,0,0,0,165,2,0,1,0,0,0,245,252,1,0,7,0,0,0,253,252,1,0,3,0,0,0,63,186,2,0,5,0,0,0,5,253,1,0,15,0,0,0,101,33,2,0,8,0,0,0,101,33,2,0,16,0,0,0,13,253,1,0,4,0,0,0,13,253,1,0,17,0,0,0,18,253,1,0,5,0,0,0,18,253,1,0,2,0,0,0,24,253,1,0,6,0,0,0,31,253,1,0,4,0,0,0,43,253,1,0,7,0,0,0,51,253,1,0,7,0,0,0,67,253,1,0,5,0,0,0,73,253,1,0,8,0,0,0,96,253,1,0,8,0,0,0,73,253,1,0,9,0,0,0,105,253,1,0,7,0,0,0,113,253,1,0,10,0,0,0,139,253,1,0,7,0,0,0,147,253,1,0,11,0,0,0,173,253,1,0,6,0,0,0,180,253,1,0,12,0,0,0,210,253,1,0,9,0,0,0,180,253,1,0,13,0,0,0,220,253,1,0,8,0,0,0,229,253,1,0,14,0,0,0,6,254,1,0,8,0,0,0,15,254,1,0,18,0,0,0,48,254,1,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,12,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,3,0,0,0,29,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,30,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,64,0,0,0,228,202,0,0,109,11,2,0,8,203,0,0,16,203,0,0,6,0,0,0,4,0,0,0,252,202,0,0,6,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,8,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,11,2,0,0,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,9,0,0,0,11,0,0,0,8,0,0,0,10,0,0,0,196,204,0,0,68,204,0,0,172,204,0,0,0,0,0,0,1,0,0,0,1,0,0,0,7,0,0,0,32,0,0,0,8,0,0,0,81,0,0,0,33,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,9,0,0,0,2,0,0,0,5,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,3,0,0,0,12,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,14,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,4,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,1,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,12,0,0,0,1,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,19,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,1,0,0,0,30,0,0,0,1,0,0,0,1,0,0,0,19,0,0,0,1,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,19,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,19,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,46,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,47,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,48,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+43512);allocate([19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,5,0,0,0,1,0,0,0,6,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,70,2,0,87,70,2,0,213,14,2,0,106,70,2,0,112,70,2,0,97,70,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,19,2,0,96,19,2,0,133,70,2,0,103,19,2,0,110,19,2,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,145,20,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,220,20,2,0,8,0,0,0,3,0,0,0,229,20,2,0,233,20,2,0,11,0,0,0,6,0,0,0,125,33,2,0,245,20,2,0,2,0,0,0,1,0,0,0,248,20,2,0,252,20,2,0,4,0,0,0,2,0,0,0,1,21,2,0,5,21,2,0,4,0,0,0,4,0,0,0,10,21,2,0,15,21,2,0,5,0,0,0,5,0,0,0,21,21,2,0,25,21,2,0,4,0,0,0,7,0,0,0,30,21,2,0,34,21,2,0,5,0,0,0,9,0,0,0,40,21,2,0,44,21,2,0,4,0,0,0,10,0,0,0,49,21,2,0,54,21,2,0,4,0,0,0,12,0,0,0,59,21,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,29,2,0,0,0,0,0,1,0,0,0,94,29,2,0,1,0,0,0,0,0,0,0,47,69,2,0,1,0,0,0,1,0,0,0,0,165,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,243,24,2,0,49,0,0,0,0,0,0,0,0,0,0,0,230,57,2,0,16,0,0,0,142,177,2,0,128,0,0,0,236,24,2,0,64,0,0,0,23,47,2,0,16,0,0,0,238,24,2,0,64,0,0,0,0,0,0,0,0,0,0,0,193,24,2,0,1,0,0,0,200,24,2,0,2,0,0,0,205,24,2,0,3,0,0,0,212,64,2,0,4,0,0,0,107,47,2,0,5,0,0,0,209,24,2,0,6,0,0,0,0,165,2,0,8,0,0,0,213,24,2,0,33,0,0,0,217,24,2,0,34,0,0,0,221,24,2,0,34,0,0,0,225,24,2,0,1,0,0,0,230,24,2,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,228,28,2,0,235,28,2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,208,132,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,122,33,2,0,125,33,2,0,128,33,2,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,61,33,2,0,67,33,2,0,0,165,2,0,0,0,0,0,100,0,0,0,101,0,0,0,102,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,39,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,11,0,0,0,40,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,212,64,2,0,208,222,0,0,80,133,0,0,0,0,0,0,58,47,2,0,208,222,0,0,128,133,0,0,0,0,0,0,185,56,2,0,208,222,0,0,176,133,0,0,0,0,0,0,66,47,2,0,208,222,0,0,176,133,0,0,0,0,0,0,71,47,2,0,208,222,0,0,224,133,0,0,0,0,0,0,78,47,2,0,232,222,0,0,224,133,0,0,0,0,0,0,84,47,2,0,208,222,0,0,16,134,0,0,0,0,0,0,88,47,2,0,208,222,0,0,64,134,0,0,0,0,0,0,0,165,2,0,208,222,0,0,112,134,0,0,0,0,0,0,97,47,2,0,208,222,0,0,112,134,0,0,0,0,0,0,107,47,2,0,208,222,0,0,160,134,0,0,0,0,0,0,115,47,2,0,208,222,0,0,208,134,0,0,0,0,0,0,125,47,2,0,208,222,0,0,0,135,0,0,0,0,0,0,139,47,2,0,208,222,0,0,48,135,0,0,0,0,0,0,145,47,2,0,208,222,0,0,96,135,0,0,0,0,0,0,154,47,2,0,208,222,0,0,144,135,0,0,0,0,0,0,162,47,2,0,208,222,0,0,192,135,0,0,0,0,0,0,171,47,2,0,208,222,0,0,240,135,0,0,0,0,0,0,179,47,2,0,208,222,0,0,32,136,0,0,0,0,0,0,184,47,2,0,208,222,0,0,80,136,0,0,0,0,0,0,188,47,2,0,208,222,0,0,128,136,0,0,0,0,0,0,195,47,2,0,208,222,0,0,176,136,0,0,0,0,0,0,201,47,2,0,208,222,0,0,224,136,0,0,0,0,0,0,211,47,2,0,208,222,0,0,80,133,0,0,0,0,0,0,216,47,2,0,208,222,0,0,80,133,0,0,0,0,0,0,226,47,2,0,208,222,0,0,16,137,0,0,0,0,0,0,233,47,2,0,208,222,0,0,64,137,0,0,0,0,0,0,246,47,2,0,208,222,0,0,112,137,0,0,0,0,0,0,4,48,2,0,208,222,0,0,160,137,0,0,0,0,0,0,18,48,2,0,208,222,0,0,208,137,0,0,0,0,0,0,30,48,2,0,208,222,0,0,0,138,0,0,0,0,0,0,43,48,2,0,208,222,0,0,48,138,0,0,0,0,0,0,52,48,2,0,208,222,0,0,96,138,0,0,0,0,0,0,62,48,2,0,208,222,0,0,144,138,0,0,0,0,0,0,71,48,2,0,208,222,0,0,192,138,0,0,0,0,0,0,79,48,2,0,208,222,0,0,240,138,0,0,0,0,0,0,87,48,2,0,208,222,0,0,32,139,0,0,0,0,0,0,96,48,2,0,208,222,0,0,80,139,0,0,0,0,0,0,100,48,2,0,208,222,0,0,128,139,0,0,0,0,0,0,111,48,2,0,208,222,0,0,176,139,0,0,0,0,0,0,115,48,2,0,208,222,0,0,224,139,0,0,0,0,0,0,125,48,2,0,208,222,0,0,16,140,0,0,0,0,0,0,134,48,2,0,208,222,0,0,64,140,0,0,0,0,0,0,142,48,2,0,208,222,0,0,112,140,0,0,0,0,0,0,155,48,2,0,208,222,0,0,160,140,0,0,0,0,0,0,167,48,2,0,208,222,0,0,208,140,0,0,0,0,0,0,178,48,2,0,208,222,0,0,0,141,0,0,0,0,0,0,194,48,2,0,208,222,0,0,48,141,0,0,0,0,0,0,208,48,2,0,208,222,0,0,96,141,0,0,0,0,0,0,223,48,2,0,208,222,0,0,144,141,0,0,0,0,0,0,233,48,2,0,208,222,0,0,192,141,0,0,0,0,0,0,242,48,2,0,208,222,0,0,240,141,0,0,0,0,0,0,252,48,2,0,208,222,0,0,32,142,0,0,0,0,0,0,6,49,2,0,208,222,0,0,80,142,0,0,0,0,0,0,13,49,2,0,208,222,0,0,128,142,0,0,0,0,0,0,20,49,2,0,208,222,0,0,176,142,0,0,0,0,0,0,30,49,2,0,0,223,0,0,0,0,0,0,0,0,0,0,37,49,2,0,0,223,0,0,0,0,0,0,0,0,0,0,9,47,2,0,24,223,0,0,0,0,0,0,0,0,0,0,45,49,2,0,48,223,0,0,224,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,47,2,0,23,47,2,0,233,177,2,0,25,47,2,0,82,0,0,0,83,0,0,0,21,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,84,0,0,0,83,0,0,0,21,0,0,0,5,0,0,0,0,0,0,0,11,0,0,0,85,0,0,0,86,0,0,0,22,0,0,0,6,0,0,0,3,0,0,0,12,0,0,0,87,0,0,0,88,0,0,0,21,0,0,0,7,0,0,0,0,0,0,0,13,0,0,0,82,0,0,0,83,0,0,0,21,0,0,0,8,0,0,0,2,0,0,0,10,0,0,0,14,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,50,2,0,54,50,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,4,0,0,0,6,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,9,0,0,0,8,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,74,0,0,0,75,0,0,0,76,0,0,0,77,0,0,0,78,0,0,0,81,0,0,0,82,0,0,0,83,0,0,0,84,0,0,0,85,0,0,0,86,0,0,0,87,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,52,2,0,93,52,2,0,106,52,2,0,0,0,0,0,0,0,0,0,4,0,0,0,111,52,2,0,0,0,0,0,0,0,0,0,122,52,2,0,93,52,2,0,106,52,2,0,0,0,0,0,145,52,2,0,5,0,0,0,111,52,2,0,0,0,0,0,153,52,2,0,160,52,2,0,93,52,2,0,176,52,2,0,0,0,0,0,0,0,0,0,6,0,0,0,111,52,2,0,165,68,2,0,0,0,0,0,181,52,2,0,93,52,2,0,176,52,2,0,0,0,0,0,145,52,2,0,7,0,0,0,111,52,2,0,165,68,2,0,153,52,2,0,204,52,2,0,217,52,2,0,176,52,2,0,0,0,0,0,0,0,0,0,10,0,0,0,231,52,2,0,165,68,2,0,0,0,0,0,237,52,2,0,217,52,2,0,176,52,2,0,0,0,0,0,153,52,2,0,11,0,0,0,231,52,2,0,165,68,2,0,153,52,2,0,0,53,2,0,217,52,2,0,14,53,2,0,0,0,0,0,0,0,0,0,8,0,0,0,231,52,2,0,0,0,0,0,0,0,0,0,20,53,2,0,217,52,2,0,14,53,2,0,0,0,0,0,153,52,2,0,9,0,0,0,231,52,2,0,0,0,0,0,153,52,2,0,40,53,2,0,40,53,2,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,53,2,0,0,0,0,0,0,0,0,0,58,53,2,0,40,53,2,0,165,68,2,0,0,0,0,0,0,0,0,0,14,0,0,0,48,53,2,0,165,68,2,0,0,0,0,0,71,53,2,0,40,53,2,0,165,68,2,0,0,0,0,0,145,52,2,0,15,0,0,0,48,53,2,0,165,68,2,0,153,52,2,0,91,53,2,0,40,53,2,0,0,0,0,0,0,0,0,0,145,52,2,0,13,0,0,0,48,53,2,0,0,0,0,0,153,52,2,0,107,53,2,0,107,53,2,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,111,52,2,0,0,0,0,0,0,0,0,0,117,53,2,0,107,53,2,0,165,68,2,0,0,0,0,0,0,0,0,0,18,0,0,0,111,52,2,0,165,68,2,0,0,0,0,0,132,53,2,0,107,53,2,0,165,68,2,0,0,0,0,0,145,52,2,0,19,0,0,0,111,52,2,0,165,68,2,0,153,52,2,0,154,53,2,0,107,53,2,0,0,0,0,0,171,53,2,0,0,0,0,0,20,0,0,0,111,52,2,0,0,0,0,0,0,0,0,0,181,53,2,0,107,53,2,0,165,68,2,0,171,53,2,0,0,0,0,0,22,0,0,0,111,52,2,0,165,68,2,0,0,0,0,0,203,53,2,0,107,53,2,0,165,68,2,0,171,53,2,0,145,52,2,0,23,0,0,0,111,52,2,0,165,68,2,0,153,52,2,0,232,53,2,0,107,53,2,0,0,0,0,0,171,53,2,0,145,52,2,0,21,0,0,0,111,52,2,0,0,0,0,0,153,52,2,0,1,54,2,0,107,53,2,0,0,0,0,0,0,0,0,0,145,52,2,0,17,0,0,0,111,52,2,0,0,0,0,0,153,52,2,0,19,54,2,0,41,54,2,0,165,68,2,0,0,0,0,0,0,0,0,0,26,0,0,0,231,52,2,0,165,68,2,0,0,0,0,0,62,54,2,0,41,54,2,0,165,68,2,0,0,0,0,0,153,52,2,0,27,0,0,0,231,52,2,0,165,68,2,0,153,52,2,0,90,54,2,0,41,54,2,0,0,0,0,0,0,0,0,0,153,52,2,0,25,0,0,0,231,52,2,0,0,0,0,0,153,52,2,0,114,54,2,0,41,54,2,0,137,54,2,0,0,0,0,0,0,0,0,0,24,0,0,0,231,52,2,0,0,0,0,0,0,0,0,0,143,54,2,0,157,54,2,0,165,68,2,0,0,0,0,0,0,0,0,0,30,0,0,0,231,52,2,0,165,68,2,0,0,0,0,0,175,54,2,0,157,54,2,0,165,68,2,0,0,0,0,0,153,52,2,0,31,0,0,0,231,52,2,0,165,68,2,0,153,52,2,0,195,54,2,0,157,54,2,0,0,0,0,0,0,0,0,0,153,52,2,0,29,0,0,0,231,52,2,0,0,0,0,0,153,52,2,0,211,54,2,0,157,54,2,0,137,54,2,0,0,0,0,0,0,0,0,0,28,0,0,0,231,52,2,0,0,0,0,0,0,0,0,0,226,54,2,0,226,54,2,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,233,54,2,0,0,0,0,0,0,0,0,0,241,54,2,0,252,54,2,0,165,68,2,0,0,0,0,0,0,0,0,0,2,0,0,0,231,52,2,0,165,68,2,0,0,0,0,0,2,55,2,0,252,54,2,0,165,68,2,0,0,0,0,0,153,52,2,0,3,0,0,0,231,52,2,0,165,68,2,0,153,52,2,0,19,55,2,0,252,54,2,0,0,0,0,0,0,0,0,0,153,52,2,0,1,0,0,0,231,52,2,0,0,0,0,0,153,52,2,0,193,56,2,0,252,54,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,231,52,2,0,0,0,0,0,0,0,0,0,32,55,2,0,58,55,2,0,73,55,2,0,0,0,0,0,153,52,2,0,33,0,0,0,231,52,2,0,0,0,0,0,153,52,2,0,80,55,2,0,93,55,2,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,233,54,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,12,0,0,0,42,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,58,2,0,198,0,0,0,80,58,2,0,193,0,0,0,87,58,2,0,194,0,0,0,93,58,2,0,192,0,0,0,100,58,2,0,145,3,0,0,106,58,2,0,197,0,0,0,112,58,2,0,195,0,0,0,119,58,2,0,196,0,0,0,124,58,2,0,146,3,0,0,129,58,2,0,199,0,0,0,136,58,2,0,167,3,0,0,140,58,2,0,33,32,0,0,147,58,2,0,148,3,0,0,153,58,2,0,208,0,0,0,157,58,2,0,201,0,0,0,164,58,2,0,202,0,0,0,170,58,2,0,200,0,0,0,177,58,2,0,149,3,0,0,185,58,2,0,151,3,0,0,189,58,2,0,203,0,0,0,194,58,2,0,147,3,0,0,200,58,2,0,205,0,0,0,207,58,2,0,206,0,0,0,213,58,2,0,204,0,0,0,220,58,2,0,153,3,0,0,225,58,2,0,207,0,0,0,230,58,2,0,154,3,0,0,236,58,2,0,155,3,0,0,243,58,2,0,156,3,0,0,246,58,2,0,209,0,0,0,253,58,2,0,157,3,0,0,0,59,2,0,82,1,0,0,6,59,2,0,211,0,0,0,13,59,2,0,212,0,0,0,19,59,2,0,210,0,0,0,26,59,2,0,169,3,0,0,32,59,2,0,159,3,0,0,40,59,2,0,216,0,0,0,47,59,2,0,213,0,0,0,54,59,2,0,214,0,0,0,59,59,2,0,166,3,0,0,63,59,2,0,160,3,0,0,66,59,2,0,51,32,0,0,72,59,2,0,168,3,0,0,76,59,2,0,161,3,0,0,80,59,2,0,96,1,0,0,87,59,2,0,163,3,0,0,93,59,2,0,222,0,0,0,99,59,2,0,164,3,0,0,103,59,2,0,152,3,0,0,109,59,2,0,218,0,0,0,116,59,2,0,219,0,0,0,122,59,2,0,217,0,0,0,129,59,2,0,165,3,0,0,137,59,2,0,220,0,0,0,142,59,2,0,158,3,0,0,145,59,2,0,221,0,0,0,152,59,2,0,120,1,0,0,157,59,2,0,150,3,0,0,162,59,2,0,225,0,0,0,169,59,2,0,226,0,0,0,175,59,2,0,180,0,0,0,181,59,2,0,230,0,0,0,187,59,2,0,224,0,0,0,194,59,2,0,53,33,0,0,202,59,2,0,177,3,0,0,208,59,2,0,38,0,0,0,212,59,2,0,39,34,0,0,216,59,2,0,32,34,0,0,220,59,2,0,229,0,0,0,226,59,2,0,72,34,0,0,232,59,2,0,227,0,0,0,239,59,2,0,228,0,0,0,244,59,2,0,30,32,0,0,250,59,2,0,178,3,0,0,255,59,2,0,166,0,0,0,6,60,2,0,34,32,0,0,11,60,2,0,41,34,0,0,15,60,2,0,231,0,0,0,22,60,2,0,184,0,0,0,28,60,2,0,162,0,0,0,33,60,2,0,199,3,0,0,37,60,2,0,198,2,0,0,42,60,2,0,99,38,0,0,48,60,2,0,69,34,0,0,53,60,2,0,169,0,0,0,58,60,2,0,181,33,0,0,64,60,2,0,42,34,0,0,68,60,2,0,164,0,0,0,75,60,2,0,211,33,0,0,80,60,2,0,32,32,0,0,87,60,2,0,147,33,0,0,92,60,2,0,176,0,0,0,96,60,2,0,180,3,0,0,102,60,2,0,102,38,0,0,108,60,2,0,247,0,0,0,115,60,2,0,233,0,0,0,122,60,2,0,234,0,0,0,128,60,2,0,232,0,0,0,135,60,2,0,5,34,0,0,141,60,2,0,3,32,0,0,146,60,2,0,2,32,0,0,151,60,2,0,181,3,0,0,159,60,2,0,97,34,0,0,165,60,2,0,183,3,0,0,169,60,2,0,240,0,0,0,173,60,2,0,235,0,0,0,178,60,2,0,172,32,0,0,183,60,2,0,3,34,0,0,189,60,2,0,146,1,0,0,194,60,2,0,0,34,0,0,201,60,2,0,189,0,0,0,208,60,2,0,188,0,0,0,215,60,2,0,190,0,0,0,222,60,2,0,68,32,0,0,228,60,2,0,179,3,0,0,234,60,2,0,101,34,0,0,237,60,2,0,62,0,0,0,240,60,2,0,212,33,0,0,245,60,2,0,148,33,0,0,250,60,2,0,101,38,0,0,1,61,2,0,38,32,0,0,8,61,2,0,237,0,0,0,15,61,2,0,238,0,0,0,21,61,2,0,161,0,0,0,27,61,2,0,236,0,0,0,34,61,2,0,17,33,0,0,40,61,2,0,30,34,0,0,46,61,2,0,43,34,0,0,50,61,2,0,185,3,0,0,55,61,2,0,191,0,0,0,62,61,2,0,8,34,0,0,67,61,2,0,239,0,0,0,72,61,2,0,186,3,0,0,78,61,2,0,208,33,0,0,83,61,2,0,187,3,0,0,90,61,2,0,41,35,0,0,95,61,2,0,171,0,0,0,101,61,2,0,144,33,0,0,106,61,2,0,8,35,0,0,112,61,2,0,28,32,0,0,118,61,2,0,100,34,0,0,121,61,2,0,10,35,0,0,128,61,2,0,23,34,0,0,135,61,2,0,202,37,0,0,139,61,2,0,14,32,0,0,143,61,2,0,57,32,0,0,150,61,2,0,24,32,0,0,156,61,2,0,60,0,0,0,159,61,2,0,175,0,0,0,164,61,2,0,20,32,0,0,170,61,2,0,181,0,0,0,176,61,2,0,183,0,0,0,32,70,2,0,18,34,0,0,183,61,2,0,188,3,0,0,186,61,2,0,7,34,0,0,192,61,2,0,160,0,0,0,197,61,2,0,19,32,0,0,203,61,2,0,96,34,0,0,206,61,2,0,11,34,0,0,209,61,2,0,172,0,0,0,213,61,2,0,9,34,0,0,219,61,2,0,132,34,0,0,224,61,2,0,241,0,0,0,231,61,2,0,189,3,0,0,234,61,2,0,243,0,0,0,241,61,2,0,244,0,0,0,247,61,2,0,83,1,0,0,253,61,2,0,242,0,0,0,4,62,2,0,62,32,0,0,10,62,2,0,201,3,0,0,16,62,2,0,191,3,0,0,24,62,2,0,149,34,0,0,30,62,2,0,40,34,0,0,33,62,2,0,170,0,0,0,38,62,2,0,186,0,0,0,43,62,2,0,248,0,0,0,50,62,2,0,245,0,0,0,57,62,2,0,151,34,0,0,64,62,2,0,246,0,0,0,69,62,2,0,182,0,0,0,74,62,2,0,2,34,0,0,79,62,2,0,48,32,0,0,86,62,2,0,165,34,0,0,91,62,2,0,198,3,0,0,95,62,2,0,192,3,0,0,98,62,2,0,214,3,0,0,102,62,2,0,177,0,0,0,109,62,2,0,163,0,0,0,115,62,2,0,50,32,0,0,121,62,2,0,15,34,0,0,126,62,2,0,29,34,0,0,131,62,2,0,200,3,0,0,135,62,2,0,34,0,0,0,140,62,2,0,210,33,0,0,145,62,2,0,26,34,0,0,151,62,2,0,42,35,0,0,156,62,2,0,187,0,0,0,162,62,2,0,146,33,0,0,167,62,2,0,9,35,0,0,173,62,2,0,29,32,0,0,179,62,2,0,28,33,0,0,184,62,2,0,174,0,0,0,188,62,2,0,11,35,0,0,195,62,2,0,193,3,0,0,199,62,2,0,15,32,0,0,203,62,2,0,58,32,0,0,210,62,2,0,25,32,0,0,216,62,2,0,26,32,0,0,222,62,2,0,97,1,0,0,229,62,2,0,197,34,0,0,234,62,2,0,167,0,0,0,239,62,2,0,173,0,0,0,243,62,2,0,195,3,0,0,249,62,2,0,194,3,0,0,0,63,2,0,60,34,0,0,4,63,2,0,96,38,0,0,11,63,2,0,130,34,0,0,15,63,2,0,134,34,0,0,20,63,2,0,17,34,0,0,24,63,2,0,131,34,0,0,28,63,2,0,185,0,0,0,33,63,2,0,178,0,0,0,38,63,2,0,179,0,0,0,43,63,2,0,135,34,0,0,48,63,2,0,223,0,0,0,54,63,2,0,196,3,0,0,58,63,2,0,52,34,0,0,65,63,2,0,184,3,0,0,71,63,2,0,209,3,0,0,80,63,2,0,9,32,0,0,87,63,2,0,254,0,0,0,93,63,2,0,220,2,0,0,99,63,2,0,215,0,0,0,105,63,2,0,34,33,0,0,111,63,2,0,209,33,0,0,116,63,2,0,250,0,0,0,123,63,2,0,145,33,0,0,128,63,2,0,251,0,0,0,134,63,2,0,249,0,0,0,141,63,2,0,168,0,0,0,145,63,2,0,210,3,0,0,151,63,2,0,197,3,0,0,159,63,2,0,252,0,0,0,164,63,2,0,24,33,0,0,171,63,2,0,190,3,0,0,174,63,2,0,253,0,0,0,181,63,2,0,165,0,0,0,185,63,2,0,255,0,0,0,190,63,2,0,182,3,0,0,195,63,2,0,13,32,0,0,199,63,2,0,12,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,8,0,0,0,1,1,0,0,239,65,2,0,131,65,2,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,44,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,45,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,69,2,0,203,69,2,0,210,69,2,0,0,0,0,0,0,0,0,0,224,69,2,0,9,0,0,0,226,69,2,0,10,0,0,0,231,69,2,0,10,0,0,0,239,69,2,0,11,0,0,0,245,69,2,0,11,0,0,0,254,69,2,0,12,0,0,0,1,70,2,0,12,0,0,0,7,70,2,0,13,0,0,0,12,70,2,0,13,0,0,0,20,70,2,0,14,0,0,0,25,70,2,0,14,0,0,0,32,70,2,0,15,0,0,0,38,70,2,0,15,0,0,0,50,70,2,0,16,0,0,0,14,0,0,0,89,0,0,0,46,0,0,0,47,0,0,0,16,0,0,0,48,0,0,0,90,0,0,0,49,0,0,0,17,0,0,0,50,0,0,0,166,187,2,0,87,70,2,0,78,70,2,0,69,70,2,0,65,70,2,0,120,187,2,0,61,70,2,0,92,70,2,0,112,70,2,0,106,70,2,0,97,70,2,0,8,0,0,0,4,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,134,71,2,0,85,93,201,127,201,127,255,0,145,71,2,0,187,45,212,190,174,212,255,0,156,71,2,0,20,119,253,253,192,134,255,0,167,71,2,0,85,93,201,127,201,127,255,0,178,71,2,0,187,45,212,190,174,212,255,0,189,71,2,0,20,119,253,253,192,134,255,0,200,71,2,0,42,102,255,255,255,153,255,0,211,71,2,0,85,93,201,127,201,127,255,0,222,71,2,0,187,45,212,190,174,212,255,0,233,71,2,0,20,119,253,253,192,134,255,0,244,71,2,0,42,102,255,255,255,153,255,0,255,71,2,0,151,173,176,56,108,176,255,0,10,72,2,0,85,93,201,127,201,127,255,0,21,72,2,0,187,45,212,190,174,212,255,0,32,72,2,0,20,119,253,253,192,134,255,0,43,72,2,0,42,102,255,255,255,153,255,0,54,72,2,0,151,173,176,56,108,176,255,0,65,72,2,0,232,252,240,240,2,127,255,0,76,72,2,0,85,93,201,127,201,127,255,0,87,72,2,0,187,45,212,190,174,212,255,0,98,72,2,0,20,119,253,253,192,134,255,0,109,72,2,0,42,102,255,255,255,153,255,0,120,72,2,0,151,173,176,56,108,176,255,0,131,72,2,0,232,252,240,240,2,127,255,0,142,72,2,0,17,224,191,191,91,23,255,0,153,72,2,0,85,93,201,127,201,127,255,0,164,72,2,0,187,45,212,190,174,212,255,0,175,72,2,0,20,119,253,253,192,134,255,0,186,72,2,0,42,102,255,255,255,153,255,0,197,72,2,0,151,173,176,56,108,176,255,0,208,72,2,0,232,252,240,240,2,127,255,0,219,72,2,0,17,224,191,191,91,23,255,0,230,72,2,0,0,0,102,102,102,102,255,0,241,72,2,0,147,25,247,222,235,247,255,0,251,72,2,0,142,75,225,158,202,225,255,0,5,73,2,0,145,188,189,49,130,189,255,0,15,73,2,0,159,16,255,239,243,255,255,0,25,73,2,0,143,46,231,189,215,231,255,0,35,73,2,0,143,127,214,107,174,214,255,0,45,73,2,0,147,208,181,33,113,181,255,0,55,73,2,0,159,16,255,239,243,255,255,0,65,73,2,0,143,46,231,189,215,231,255,0,75,73,2,0,143,127,214,107,174,214,255,0,85,73,2,0,145,188,189,49,130,189,255,0,95,73,2,0,149,241,156,8,81,156,255,0,105,73,2,0,159,16,255,239,243,255,255,0,115,73,2,0,148,43,239,198,219,239,255,0,125,73,2,0,142,75,225,158,202,225,255,0,135,73,2,0,143,127,214,107,174,214,255,0,145,73,2,0,145,188,189,49,130,189,255,0,155,73,2,0,149,241,156,8,81,156,255,0,165,73,2,0,159,16,255,239,243,255,255,0,175,73,2,0,148,43,239,198,219,239,255,0,185,73,2,0,142,75,225,158,202,225,255,0,195,73,2,0,143,127,214,107,174,214,255,0,205,73,2,0,144,169,198,66,146,198,255,0,215,73,2,0,147,208,181,33,113,181,255,0,225,73,2,0,151,241,148,8,69,148,255,0,235,73,2,0,148,8,255,247,251,255,255,0,245,73,2,0,147,25,247,222,235,247,255,0,255,73,2,0,148,43,239,198,219,239,255,0,9,74,2,0,142,75,225,158,202,225,255,0,19,74,2,0,143,127,214,107,174,214,255,0,29,74,2,0,144,169,198,66,146,198,255,0,39,74,2,0,147,208,181,33,113,181,255,0,49,74,2,0,151,241,148,8,69,148,255,0,59,74,2,0,148,8,255,247,251,255,255,0,69,74,2,0,147,25,247,222,235,247,255,0,79,74,2,0,148,43,239,198,219,239,255,0,89,74,2,0,142,75,225,158,202,225,255,0,99,74,2,0,143,127,214,107,174,214,255,0,109,74,2,0,144,169,198,66,146,198,255,0,119,74,2,0,147,208,181,33,113,181,255,0,129,74,2,0,149,241,156,8,81,156,255,0,139,74,2,0,152,235,107,8,48,107,255,0,149,74,2,0,23,239,84,84,48,5,255,0,159,74,2,0,119,255,60,0,60,48,255,0,170,74,2,0,23,236,140,140,81,10,255,0,180,74,2,0,24,194,191,191,129,45,255,0,190,74,2,0,29,112,223,223,194,125,255,0,200,74,2,0,30,52,246,246,232,195,255,0,210,74,2,0,121,38,234,199,234,229,255,0,220,74,2,0,120,95,205,128,205,193,255,0,230,74,2,0,124,165,151,53,151,143,255,0,240,74,2,0,124,252,102,1,102,94,255,0,250,74,2,0,23,239,84,84,48,5,255,0,4,75,2,0,124,252,102,1,102,94,255,0,15,75,2,0,119,255,60,0,60,48,255,0,26,75,2,0,23,236,140,140,81,10,255,0,36,75,2,0,24,194,191,191,129,45,255,0,46,75,2,0,29,112,223,223,194,125,255,0,56,75,2,0,30,52,246,246,232,195,255,0,66,75,2,0,0,0,245,245,245,245,255,0,76,75,2,0,121,38,234,199,234,229,255,0,86,75,2,0,120,95,205,128,205,193,255,0,96,75,2,0,124,165,151,53,151,143,255,0,106,75,2,0,28,135,216,216,179,101,255,0,115,75,2,0,0,0,245,245,245,245,255,0,124,75,2,0,123,127,180,90,180,172,255,0,133,75,2,0,21,215,166,166,97,26,255,0,142,75,2,0,29,112,223,223,194,125,255,0,151,75,2,0,120,95,205,128,205,193,255,0,160,75,2,0,121,253,133,1,133,113,255,0,169,75,2,0,21,215,166,166,97,26,255,0,178,75,2,0,29,112,223,223,194,125,255,0,187,75,2,0,0,0,245,245,245,245,255,0,196,75,2,0,120,95,205,128,205,193,255,0,205,75,2,0,121,253,133,1,133,113,255,0,214,75,2,0,23,236,140,140,81,10,255,0,223,75,2,0,28,135,216,216,179,101,255,0,232,75,2,0,30,52,246,246,232,195,255,0,241,75,2,0,121,38,234,199,234,229,255,0,250,75,2,0,123,127,180,90,180,172,255,0,3,76,2,0,124,252,102,1,102,94,255,0,12,76,2,0,23,236,140,140,81,10,255,0,21,76,2,0,28,135,216,216,179,101,255,0,30,76,2,0,30,52,246,246,232,195,255,0,39,76,2,0,0,0,245,245,245,245,255,0,48,76,2,0,121,38,234,199,234,229,255,0,57,76,2,0,123,127,180,90,180,172,255,0,66,76,2,0,124,252,102,1,102,94,255,0,75,76,2,0,23,236,140,140,81,10,255,0,84,76,2,0,24,194,191,191,129,45,255,0,93,76,2,0,29,112,223,223,194,125,255,0,102,76,2,0,30,52,246,246,232,195,255,0,111,76,2,0,121,38,234,199,234,229,255,0,120,76,2,0,120,95,205,128,205,193,255,0,129,76,2,0,124,165,151,53,151,143,255,0,138,76,2,0,124,252,102,1,102,94,255,0,147,76,2,0,23,236,140,140,81,10,255,0,156,76,2,0,24,194,191,191,129,45,255,0,165,76,2,0,29,112,223,223,194,125,255,0,174,76,2,0,30,52,246,246,232,195,255,0,183,76,2,0,0,0,245,245,245,245,255,0,192,76,2,0,121,38,234,199,234,229,255,0,201,76,2,0,120,95,205,128,205,193,255,0,210,76,2,0,124,165,151,53,151,143,255,0,219,76,2,0,124,252,102,1,102,94,255,0,228,76,2,0,135,20,249,229,245,249,255,0,237,76,2,0,117,74,216,153,216,201,255,0,246,76,2,0,103,185,162,44,162,95,255,0,255,76,2,0,136,14,251,237,248,251,255,0,8,77,2,0,127,54,226,178,226,226,255,0,17,77,2,0,113,120,194,102,194,164,255,0,26,77,2,0,98,190,139,35,139,69,255,0,35,77,2,0,136,14,251,237,248,251,255,0,44,77,2,0,127,54,226,178,226,226,255,0,53,77,2,0,113,120,194,102,194,164,255,0,62,77,2,0,103,185,162,44,162,95,255,0,71,77,2,0,102,255,109,0,109,44,255,0,80,77,2,0,136,14,251,237,248,251,255,0,89,77,2,0,119,34,236,204,236,230,255,0,98,77,2,0,117,74,216,153,216,201,255,0,107,77,2,0,113,120,194,102,194,164,255,0,116,77,2,0,103,185,162,44,162,95,255,0,125,77,2,0,102,255,109,0,109,44,255,0,134,77,2,0,136,14,251,237,248,251,255,0,143,77,2,0,119,34,236,204,236,230,255,0,152,77,2,0,117,74,216,153,216,201,255,0,161,77,2,0,113,120,194,102,194,164,255,0,170,77,2,0,105,159,174,65,174,118,255,0,179,77,2,0,98,190,139,35,139,69,255,0,188,77,2,0,102,255,88,0,88,36,255,0,197,77,2,0,134,6,253,247,252,253,255,0,206,77,2,0,135,20,249,229,245,249,255,0,215,77,2,0,119,34,236,204,236,230,255,0,224,77,2,0,117,74,216,153,216,201,255,0,233,77,2,0,113,120,194,102,194,164,255,0,242,77,2,0,105,159,174,65,174,118,255,0,251,77,2,0,98,190,139,35,139,69,255,0,4,78,2,0,102,255,88,0,88,36,255,0,13,78,2,0,134,6,253,247,252,253,255,0,22,78,2,0,135,20,249,229,245,249,255,0,31,78,2,0,119,34,236,204,236,230,255,0,40,78,2,0,117,74,216,153,216,201,255,0,49,78,2,0,113,120,194,102,194,164,255,0,58,78,2,0,105,159,174,65,174,118,255,0,67,78,2,0,98,190,139,35,139,69,255,0,76,78,2,0,102,255,109,0,109,44,255,0,85,78,2,0,101,255,68,0,68,27,255,0,94,78,2,0,144,20,244,224,236,244,255,0,103,78,2,0,148,70,218,158,188,218,255,0,112,78,2,0,196,123,167,136,86,167,255,0,121,78,2,0,136,14,251,237,248,251,255,0,130,78,2,0,146,53,227,179,205,227,255,0,139,78,2,0,162,74,198,140,150,198,255,0,148,78,2,0,202,149,157,136,65,157,255,0,157,78,2,0,136,14,251,237,248,251,255,0,166,78,2,0,146,53,227,179,205,227,255,0,175,78,2,0,162,74,198,140,150,198,255,0,184,78,2,0,196,123,167,136,86,167,255,0,193,78,2,0,214,225,129,129,15,124,255,0,202,78,2,0,136,14,251,237,248,251,255,0,211,78,2,0,148,43,230,191,211,230,255,0,220,78,2,0,148,70,218,158,188,218,255,0,229,78,2,0,162,74,198,140,150,198,255,0,238,78,2,0,196,123,167,136,86,167,255,0,247,78,2,0,214,225,129,129,15,124,255,0,0,79,2,0,136,14,251,237,248,251,255,0,9,79,2,0,148,43,230,191,211,230,255,0,18,79,2,0,148,70,218,158,188,218,255,0,27,79,2,0,162,74,198,140,150,198,255,0,36,79,2,0,190,100,177,140,107,177,255,0,45,79,2,0,202,149,157,136,65,157,255,0,54,79,2,0,213,252,110,110,1,107,255,0,63,79,2,0,134,6,253,247,252,253,255,0,72,79,2,0,144,20,244,224,236,244,255,0,81,79,2,0,148,43,230,191],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+53752);allocate([211,230,255,0,90,79,2,0,148,70,218,158,188,218,255,0,99,79,2,0,162,74,198,140,150,198,255,0,108,79,2,0,190,100,177,140,107,177,255,0,117,79,2,0,202,149,157,136,65,157,255,0,126,79,2,0,213,252,110,110,1,107,255,0,135,79,2,0,134,6,253,247,252,253,255,0,144,79,2,0,144,20,244,224,236,244,255,0,153,79,2,0,148,43,230,191,211,230,255,0,162,79,2,0,148,70,218,158,188,218,255,0,171,79,2,0,162,74,198,140,150,198,255,0,180,79,2,0,190,100,177,140,107,177,255,0,189,79,2,0,202,149,157,136,65,157,255,0,198,79,2,0,214,225,129,129,15,124,255,0,207,79,2,0,213,255,77,77,0,75,255,0,216,79,2,0,114,211,158,27,158,119,255,0,226,79,2,0,18,252,217,217,95,2,255,0,236,79,2,0,173,95,179,117,112,179,255,0,246,79,2,0,114,211,158,27,158,119,255,0,0,80,2,0,18,252,217,217,95,2,255,0,10,80,2,0,173,95,179,117,112,179,255,0,20,80,2,0,233,209,231,231,41,138,255,0,30,80,2,0,114,211,158,27,158,119,255,0,40,80,2,0,18,252,217,217,95,2,255,0,50,80,2,0,173,95,179,117,112,179,255,0,60,80,2,0,233,209,231,231,41,138,255,0,70,80,2,0,62,208,166,102,166,30,255,0,80,80,2,0,114,211,158,27,158,119,255,0,90,80,2,0,18,252,217,217,95,2,255,0,100,80,2,0,173,95,179,117,112,179,255,0,110,80,2,0,233,209,231,231,41,138,255,0,120,80,2,0,62,208,166,102,166,30,255,0,130,80,2,0,31,252,230,230,171,2,255,0,140,80,2,0,114,211,158,27,158,119,255,0,150,80,2,0,18,252,217,217,95,2,255,0,160,80,2,0,173,95,179,117,112,179,255,0,170,80,2,0,233,209,231,231,41,138,255,0,180,80,2,0,62,208,166,102,166,30,255,0,190,80,2,0,31,252,230,230,171,2,255,0,200,80,2,0,27,210,166,166,118,29,255,0,210,80,2,0,114,211,158,27,158,119,255,0,220,80,2,0,18,252,217,217,95,2,255,0,230,80,2,0,173,95,179,117,112,179,255,0,240,80,2,0,233,209,231,231,41,138,255,0,250,80,2,0,62,208,166,102,166,30,255,0,4,81,2,0,31,252,230,230,171,2,255,0,14,81,2,0,27,210,166,166,118,29,255,0,24,81,2,0,0,0,102,102,102,102,255,0,34,81,2,0,76,25,243,224,243,219,255,0,43,81,2,0,95,61,221,168,221,181,255,0,52,81,2,0,140,170,202,67,162,202,255,0,61,81,2,0,65,17,249,240,249,232,255,0,70,81,2,0,87,46,228,186,228,188,255,0,79,81,2,0,123,101,204,123,204,196,255,0,88,81,2,0,141,197,190,43,140,190,255,0,97,81,2,0,65,17,249,240,249,232,255,0,106,81,2,0,87,46,228,186,228,188,255,0,115,81,2,0,123,101,204,123,204,196,255,0,124,81,2,0,140,170,202,67,162,202,255,0,133,81,2,0,145,243,172,8,104,172,255,0,142,81,2,0,65,17,249,240,249,232,255,0,151,81,2,0,77,41,235,204,235,197,255,0,160,81,2,0,95,61,221,168,221,181,255,0,169,81,2,0,123,101,204,123,204,196,255,0,178,81,2,0,140,170,202,67,162,202,255,0,187,81,2,0,145,243,172,8,104,172,255,0,196,81,2,0,65,17,249,240,249,232,255,0,205,81,2,0,77,41,235,204,235,197,255,0,214,81,2,0,95,61,221,168,221,181,255,0,223,81,2,0,123,101,204,123,204,196,255,0,232,81,2,0,137,160,211,78,179,211,255,0,241,81,2,0,141,197,190,43,140,190,255,0,250,81,2,0,147,242,158,8,88,158,255,0,3,82,2,0,60,12,252,247,252,240,255,0,12,82,2,0,76,25,243,224,243,219,255,0,21,82,2,0,77,41,235,204,235,197,255,0,30,82,2,0,95,61,221,168,221,181,255,0,39,82,2,0,123,101,204,123,204,196,255,0,48,82,2,0,137,160,211,78,179,211,255,0,57,82,2,0,141,197,190,43,140,190,255,0,66,82,2,0,147,242,158,8,88,158,255,0,75,82,2,0,60,12,252,247,252,240,255,0,84,82,2,0,76,25,243,224,243,219,255,0,93,82,2,0,77,41,235,204,235,197,255,0,102,82,2,0,95,61,221,168,221,181,255,0,111,82,2,0,123,101,204,123,204,196,255,0,120,82,2,0,137,160,211,78,179,211,255,0,129,82,2,0,141,197,190,43,140,190,255,0,138,82,2,0,145,243,172,8,104,172,255,0,147,82,2,0,150,239,129,8,64,129,255,0,156,82,2,0,74,21,245,229,245,224,255,0,167,82,2,0,80,72,217,161,217,155,255,0,178,82,2,0,98,178,163,49,163,84,255,0,189,82,2,0,73,15,248,237,248,233,255,0,200,82,2,0,78,54,228,186,228,179,255,0,211,82,2,0,86,104,196,116,196,118,255,0,222,82,2,0,98,190,139,35,139,69,255,0,233,82,2,0,73,15,248,237,248,233,255,0,244,82,2,0,78,54,228,186,228,179,255,0,255,82,2,0,86,104,196,116,196,118,255,0,10,83,2,0,98,178,163,49,163,84,255,0,21,83,2,0,102,255,109,0,109,44,255,0,32,83,2,0,73,15,248,237,248,233,255,0,43,83,2,0,77,44,233,199,233,192,255,0,54,83,2,0,80,72,217,161,217,155,255,0,65,83,2,0,86,104,196,116,196,118,255,0,76,83,2,0,98,178,163,49,163,84,255,0,87,83,2,0,102,255,109,0,109,44,255,0,98,83,2,0,73,15,248,237,248,233,255,0,109,83,2,0,77,44,233,199,233,192,255,0,120,83,2,0,80,72,217,161,217,155,255,0,131,83,2,0,86,104,196,116,196,118,255,0,142,83,2,0,96,158,171,65,171,93,255,0,153,83,2,0,98,190,139,35,139,69,255,0,164,83,2,0,108,255,90,0,90,50,255,0,175,83,2,0,72,7,252,247,252,245,255,0,186,83,2,0,74,21,245,229,245,224,255,0,197,83,2,0,77,44,233,199,233,192,255,0,208,83,2,0,80,72,217,161,217,155,255,0,219,83,2,0,86,104,196,116,196,118,255,0,230,83,2,0,96,158,171,65,171,93,255,0,241,83,2,0,98,190,139,35,139,69,255,0,252,83,2,0,108,255,90,0,90,50,255,0,7,84,2,0,72,7,252,247,252,245,255,0,18,84,2,0,74,21,245,229,245,224,255,0,29,84,2,0,77,44,233,199,233,192,255,0,40,84,2,0,80,72,217,161,217,155,255,0,51,84,2,0,86,104,196,116,196,118,255,0,62,84,2,0,96,158,171,65,171,93,255,0,73,84,2,0,98,190,139,35,139,69,255,0,84,84,2,0,102,255,109,0,109,44,255,0,95,84,2,0,101,255,68,0,68,27,255,0,106,84,2,0,0,0,240,240,240,240,255,0,116,84,2,0,0,0,189,189,189,189,255,0,126,84,2,0,0,0,99,99,99,99,255,0,136,84,2,0,0,0,247,247,247,247,255,0,146,84,2,0,0,0,204,204,204,204,255,0,156,84,2,0,0,0,150,150,150,150,255,0,166,84,2,0,0,0,82,82,82,82,255,0,176,84,2,0,0,0,247,247,247,247,255,0,186,84,2,0,0,0,204,204,204,204,255,0,196,84,2,0,0,0,150,150,150,150,255,0,206,84,2,0,0,0,99,99,99,99,255,0,216,84,2,0,0,0,37,37,37,37,255,0,226,84,2,0,0,0,247,247,247,247,255,0,236,84,2,0,0,0,217,217,217,217,255,0,246,84,2,0,0,0,189,189,189,189,255,0,0,85,2,0,0,0,150,150,150,150,255,0,10,85,2,0,0,0,99,99,99,99,255,0,20,85,2,0,0,0,37,37,37,37,255,0,30,85,2,0,0,0,247,247,247,247,255,0,40,85,2,0,0,0,217,217,217,217,255,0,50,85,2,0,0,0,189,189,189,189,255,0,60,85,2,0,0,0,150,150,150,150,255,0,70,85,2,0,0,0,115,115,115,115,255,0,80,85,2,0,0,0,82,82,82,82,255,0,90,85,2,0,0,0,37,37,37,37,255,0,100,85,2,0,0,0,255,255,255,255,255,0,110,85,2,0,0,0,240,240,240,240,255,0,120,85,2,0,0,0,217,217,217,217,255,0,130,85,2,0,0,0,189,189,189,189,255,0,140,85,2,0,0,0,150,150,150,150,255,0,150,85,2,0,0,0,115,115,115,115,255,0,160,85,2,0,0,0,82,82,82,82,255,0,170,85,2,0,0,0,37,37,37,37,255,0,180,85,2,0,0,0,255,255,255,255,255,0,190,85,2,0,0,0,240,240,240,240,255,0,200,85,2,0,0,0,217,217,217,217,255,0,210,85,2,0,0,0,189,189,189,189,255,0,220,85,2,0,0,0,150,150,150,150,255,0,230,85,2,0,0,0,115,115,115,115,255,0,240,85,2,0,0,0,82,82,82,82,255,0,250,85,2,0,0,0,37,37,37,37,255,0,4,86,2,0,0,0,0,0,0,0,255,0,14,86,2,0,21,48,254,254,230,206,255,0,26,86,2,0,19,147,253,253,174,107,255,0,38,86,2,0,14,240,230,230,85,13,255,0,50,86,2,0,19,32,254,254,237,222,255,0,62,86,2,0,20,120,253,253,190,133,255,0,74,86,2,0,17,194,253,253,141,60,255,0,86,86,2,0,13,253,217,217,71,1,255,0,98,86,2,0,19,32,254,254,237,222,255,0,110,86,2,0,20,120,253,253,190,133,255,0,122,86,2,0,17,194,253,253,141,60,255,0,134,86,2,0,14,240,230,230,85,13,255,0,146,86,2,0,13,250,166,166,54,3,255,0,158,86,2,0,19,32,254,254,237,222,255,0,170,86,2,0,21,91,253,253,208,162,255,0,182,86,2,0,19,147,253,253,174,107,255,0,194,86,2,0,17,194,253,253,141,60,255,0,206,86,2,0,14,240,230,230,85,13,255,0,218,86,2,0,13,250,166,166,54,3,255,0,230,86,2,0,19,32,254,254,237,222,255,0,242,86,2,0,21,91,253,253,208,162,255,0,254,86,2,0,19,147,253,253,174,107,255,0,10,87,2,0,17,194,253,253,141,60,255,0,22,87,2,0,16,234,241,241,105,19,255,0,34,87,2,0,13,253,217,217,72,1,255,0,46,87,2,0,12,247,140,140,45,4,255,0,58,87,2,0,21,20,255,255,245,235,255,0,70,87,2,0,21,48,254,254,230,206,255,0,82,87,2,0,21,91,253,253,208,162,255,0,94,87,2,0,19,147,253,253,174,107,255,0,106,87,2,0,17,194,253,253,141,60,255,0,118,87,2,0,16,234,241,241,105,19,255,0,130,87,2,0,13,253,217,217,72,1,255,0,142,87,2,0,12,247,140,140,45,4,255,0,154,87,2,0,21,20,255,255,245,235,255,0,166,87,2,0,21,48,254,254,230,206,255,0,178,87,2,0,21,91,253,253,208,162,255,0,190,87,2,0,19,147,253,253,174,107,255,0,202,87,2,0,17,194,253,253,141,60,255,0,214,87,2,0,16,234,241,241,105,19,255,0,226,87,2,0,13,253,217,217,72,1,255,0,238,87,2,0,13,250,166,166,54,3,255,0,250,87,2,0,12,246,127,127,39,4,255,0,6,88,2,0,25,54,254,254,232,200,255,0,15,88,2,0,19,121,253,253,187,132,255,0,24,88,2,0,5,197,227,227,74,51,255,0,33,88,2,0,26,37,254,254,240,217,255,0,42,88,2,0,24,115,253,253,204,138,255,0,51,88,2,0,13,164,252,252,141,89,255,0,60,88,2,0,3,218,215,215,48,31,255,0,69,88,2,0,26,37,254,254,240,217,255,0,78,88,2,0,24,115,253,253,204,138,255,0,87,88,2,0,13,164,252,252,141,89,255,0,96,88,2,0,5,197,227,227,74,51,255,0,105,88,2,0,0,255,179,179,0,0,255,0,114,88,2,0,26,37,254,254,240,217,255,0,123,88,2,0,24,95,253,253,212,158,255,0,132,88,2,0,19,121,253,253,187,132,255,0,141,88,2,0,13,164,252,252,141,89,255,0,150,88,2,0,5,197,227,227,74,51,255,0,159,88,2,0,0,255,179,179,0,0,255,0,168,88,2,0,26,37,254,254,240,217,255,0,177,88,2,0,24,95,253,253,212,158,255,0,186,88,2,0,19,121,253,253,187,132,255,0,195,88,2,0,13,164,252,252,141,89,255,0,204,88,2,0,7,178,239,239,101,72,255,0,213,88,2,0,3,218,215,215,48,31,255,0,222,88,2,0,0,255,153,153,0,0,255,0,231,88,2,0,24,18,255,255,247,236,255,0,240,88,2,0,25,54,254,254,232,200,255,0,249,88,2,0,24,95,253,253,212,158,255,0,2,89,2,0,19,121,253,253,187,132,255,0,11,89,2,0,13,164,252,252,141,89,255,0,20,89,2,0,7,178,239,239,101,72,255,0,29,89,2,0,3,218,215,215,48,31,255,0,38,89,2,0,0,255,153,153,0,0,255,0,47,89,2,0,24,18,255,255,247,236,255,0,56,89,2,0,25,54,254,254,232,200,255,0,65,89,2,0,24,95,253,253,212,158,255,0,74,89,2,0,19,121,253,253,187,132,255,0,83,89,2,0,13,164,252,252,141,89,255,0,92,89,2,0,7,178,239,239,101,72,255,0,101,89,2,0,3,218,215,215,48,31,255,0,110,89,2,0,0,255,179,179,0,0,255,0,119,89,2,0,0,255,127,127,0,0,255,0,128,89,2,0,142,68,227,166,206,227,255,0,140,89,2,0,190,153,154,106,61,154,255,0,153,89,2,0,144,211,180,31,120,180,255,0,165,89,2,0,65,97,223,178,223,138,255,0,177,89,2,0,82,184,160,51,160,44,255,0,189,89,2,0,0,99,251,251,154,153,255,0,201,89,2,0,254,225,227,227,26,28,255,0,213,89,2,0,23,143,253,253,191,111,255,0,225,89,2,0,21,255,255,255,127,0,255,0,237,89,2,0,198,42,214,202,178,214,255,0,249,89,2,0,142,68,227,166,206,227,255,0,5,90,2,0,190,153,154,106,61,154,255,0,18,90,2,0,42,102,255,255,255,153,255,0,31,90,2,0,144,211,180,31,120,180,255,0,43,90,2,0,65,97,223,178,223,138,255,0,55,90,2,0,82,184,160,51,160,44,255,0,67,90,2,0,0,99,251,251,154,153,255,0,79,90,2,0,254,225,227,227,26,28,255,0,91,90,2,0,23,143,253,253,191,111,255,0,103,90,2,0,21,255,255,255,127,0,255,0,115,90,2,0,198,42,214,202,178,214,255,0,127,90,2,0,142,68,227,166,206,227,255,0,139,90,2,0,190,153,154,106,61,154,255,0,152,90,2,0,42,102,255,255,255,153,255,0,165,90,2,0,15,197,177,177,89,40,255,0,178,90,2,0,144,211,180,31,120,180,255,0,190,90,2,0,65,97,223,178,223,138,255,0,202,90,2,0,82,184,160,51,160,44,255,0,214,90,2,0,0,99,251,251,154,153,255,0,226,90,2,0,254,225,227,227,26,28,255,0,238,90,2,0,23,143,253,253,191,111,255,0,250,90,2,0,21,255,255,255,127,0,255,0,6,91,2,0,198,42,214,202,178,214,255,0,18,91,2,0,142,68,227,166,206,227,255,0,29,91,2,0,144,211,180,31,120,180,255,0,40,91,2,0,65,97,223,178,223,138,255,0,51,91,2,0,142,68,227,166,206,227,255,0,62,91,2,0,144,211,180,31,120,180,255,0,73,91,2,0,65,97,223,178,223,138,255,0,84,91,2,0,82,184,160,51,160,44,255,0,95,91,2,0,142,68,227,166,206,227,255,0,106,91,2,0,144,211,180,31,120,180,255,0,117,91,2,0,65,97,223,178,223,138,255,0,128,91,2,0,82,184,160,51,160,44,255,0,139,91,2,0,0,99,251,251,154,153,255,0,150,91,2,0,142,68,227,166,206,227,255,0,161,91,2,0,144,211,180,31,120,180,255,0,172,91,2,0,65,97,223,178,223,138,255,0,183,91,2,0,82,184,160,51,160,44,255,0,194,91,2,0,0,99,251,251,154,153,255,0,205,91,2,0,254,225,227,227,26,28,255,0,216,91,2,0,142,68,227,166,206,227,255,0,227,91,2,0,144,211,180,31,120,180,255,0,238,91,2,0,65,97,223,178,223,138,255,0,249,91,2,0,82,184,160,51,160,44,255,0,4,92,2,0,0,99,251,251,154,153,255,0,15,92,2,0,254,225,227,227,26,28,255,0,26,92,2,0,23,143,253,253,191,111,255,0,37,92,2,0,142,68,227,166,206,227,255,0,48,92,2,0,144,211,180,31,120,180,255,0,59,92,2,0,65,97,223,178,223,138,255,0,70,92,2,0,82,184,160,51,160,44,255,0,81,92,2,0,0,99,251,251,154,153,255,0,92,92,2,0,254,225,227,227,26,28,255,0,103,92,2,0,23,143,253,253,191,111,255,0,114,92,2,0,21,255,255,255,127,0,255,0,125,92,2,0,142,68,227,166,206,227,255,0,136,92,2,0,144,211,180,31,120,180,255,0,147,92,2,0,65,97,223,178,223,138,255,0,158,92,2,0,82,184,160,51,160,44,255,0,169,92,2,0,0,99,251,251,154,153,255,0,180,92,2,0,254,225,227,227,26,28,255,0,191,92,2,0,23,143,253,253,191,111,255,0,202,92,2,0,21,255,255,255,127,0,255,0,213,92,2,0,198,42,214,202,178,214,255,0,224,92,2,0,3,78,251,251,180,174,255,0,236,92,2,0,146,53,227,179,205,227,255,0,248,92,2,0,77,41,235,204,235,197,255,0,4,93,2,0,3,78,251,251,180,174,255,0,16,93,2,0,146,53,227,179,205,227,255,0,28,93,2,0,77,41,235,204,235,197,255,0,40,93,2,0,202,27,228,222,203,228,255,0,52,93,2,0,3,78,251,251,180,174,255,0,64,93,2,0,146,53,227,179,205,227,255,0,76,93,2,0,77,41,235,204,235,197,255,0,88,93,2,0,202,27,228,222,203,228,255,0,100,93,2,0,24,88,254,254,217,166,255,0,112,93,2,0,3,78,251,251,180,174,255,0,124,93,2,0,146,53,227,179,205,227,255,0,136,93,2,0,77,41,235,204,235,197,255,0,148,93,2,0,202,27,228,222,203,228,255,0,160,93,2,0,24,88,254,254,217,166,255,0,172,93,2,0,42,50,255,255,255,204,255,0,184,93,2,0,3,78,251,251,180,174,255,0,196,93,2,0,146,53,227,179,205,227,255,0,208,93,2,0,77,41,235,204,235,197,255,0,220,93,2,0,202,27,228,222,203,228,255,0,232,93,2,0,24,88,254,254,217,166,255,0,244,93,2,0,42,50,255,255,255,204,255,0,0,94,2,0,28,44,229,229,216,189,255,0,12,94,2,0,3,78,251,251,180,174,255,0,24,94,2,0,146,53,227,179,205,227,255,0,36,94,2,0,77,41,235,204,235,197,255,0,48,94,2,0,202,27,228,222,203,228,255,0,60,94,2,0,24,88,254,254,217,166,255,0,72,94,2,0,42,50,255,255,255,204,255,0,84,94,2,0,28,44,229,229,216,189,255,0,96,94,2,0,233,35,253,253,218,236,255,0,108,94,2,0,3,78,251,251,180,174,255,0,120,94,2,0,146,53,227,179,205,227,255,0,132,94,2,0,77,41,235,204,235,197,255,0,144,94,2,0,202,27,228,222,203,228,255,0,156,94,2,0,24,88,254,254,217,166,255,0,168,94,2,0,42,50,255,255,255,204,255,0,180,94,2,0,28,44,229,229,216,189,255,0,192,94,2,0,233,35,253,253,218,236,255,0,204,94,2,0,0,0,242,242,242,242,255,0,216,94,2,0,108,53,226,179,226,205,255,0,228,94,2,0,17,81,253,253,205,172,255,0,240,94,2,0,155,31,232,203,213,232,255,0,252,94,2,0,108,53,226,179,226,205,255,0,8,95,2,0,17,81,253,253,205,172,255,0,20,95,2,0,155,31,232,203,213,232,255,0,32,95,2,0,228,43,244,244,202,228,255,0,44,95,2,0,108,53,226,179,226,205,255,0,56,95,2,0,17,81,253,253,205,172,255,0,68,95,2,0,155,31,232,203,213,232,255,0,80,95,2,0,228,43,244,244,202,228,255,0,92,95,2,0,56,45,245,230,245,201,255,0,104,95,2,0,108,53,226,179,226,205,255,0,116,95,2,0,17,81,253,253,205,172,255,0,128,95,2,0,155,31,232,203,213,232,255,0,140,95,2,0,228,43,244,244,202,228,255,0,152,95,2,0,56,45,245,230,245,201,255,0,164,95,2,0,35,81,255,255,242,174,255,0,176,95,2,0,108,53,226,179,226,205,255,0,188,95,2,0,17,81,253,253,205,172,255,0,200,95,2,0,155,31,232,203,213,232,255,0,212,95,2,0,228,43,244,244,202,228,255,0,224,95,2,0,56,45,245,230,245,201,255,0,236,95,2,0,35,81,255,255,242,174,255,0,248,95,2,0,25,39,241,241,226,204,255,0,4,96,2,0,108,53,226,179,226,205,255,0,16,96,2,0,17,81,253,253,205,172,255,0,28,96,2,0,155,31,232,203,213,232,255,0,40,96,2,0,228,43,244,244,202,228,255,0,52,96,2,0,56,45,245,230,245,201,255,0,64,96,2,0,35,81,255,255,242,174,255,0,76,96,2,0,25,39,241,241,226,204,255,0,88,96,2,0,0,0,204,204,204,204,255,0,100,96,2,0,230,253,142,142,1,82,255,0,110,96,2,0,77,191,100,39,100,25,255,0,121,96,2,0,230,220,197,197,27,125,255,0,131,96,2,0,232,118,222,222,119,174,255,0,141,96,2,0,229,62,241,241,182,218,255,0,151,96,2,0,233,29,253,253,224,239,255,0,161,96,2,0,59,38,245,230,245,208,255,0,171,96,2,0,61,103,225,184,225,134,255,0,181,96,2,0,63,166,188,127,188,65,255,0,191,96,2,0,68,197,146,77,146,33,255,0,201,96,2,0,230,253,142,142,1,82,255,0,211,96,2,0,68,197,146,77,146,33,255,0,222,96,2,0,77,191,100,39,100,25,255,0,233,96,2,0,230,220,197,197,27,125,255,0,243,96,2,0,232,118,222,222,119,174,255,0,253,96,2,0,229,62,241,241,182,218,255,0,7,97,2,0,233,29,253,253,224,239,255,0,17,97,2,0,0,0,247,247,247,247,255,0,27,97,2,0,59,38,245,230,245,208,255,0,37,97,2,0,61,103,225,184,225,134,255,0,47,97,2,0,63,166,188,127,188,65,255,0,57,97,2,0,231,76,233,233,163,201,255,0,66,97,2,0,0,0,247,247,247,247,255,0,75,97,2,0,63,129,215,161,215,106,255,0,84,97,2,0,228,220,208,208,28,139,255,0,93,97,2,0,229,62,241,241,182,218,255,0,102,97,2,0,61,103,225,184,225,134,255,0,111,97,2,0,72,198,172,77,172,38,255,0,120,97,2,0,228,220,208,208,28,139,255,0,129,97,2,0,229,62,241,241,182,218,255,0,138,97,2,0,0,0,247,247,247,247,255,0,147,97,2,0,61,103,225,184,225,134,255,0,156,97,2,0,72,198,172,77,172,38,255,0,165,97,2,0,230,220,197,197,27,125,255,0,174,97,2,0,231,76,233,233,163,201,255,0,183,97,2,0,233,29,253,253,224,239,255,0,192,97,2,0,59,38,245,230,245,208,255,0,201,97,2,0,63,129,215,161,215,106,255,0,210,97,2,0,68,197,146,77,146,33,255,0,219,97,2,0,230,220,197,197,27,125,255,0,228,97,2,0,231,76,233,233,163,201,255,0,237,97,2,0,233,29,253,253,224,239,255,0,246,97,2,0,0,0,247,247,247,247,255,0,255,97,2,0,59,38,245,230,245,208,255,0,8,98,2,0,63,129,215,161,215,106,255,0,17,98,2,0,68,197,146,77,146,33,255,0,26,98,2,0,230,220,197,197,27,125,255,0,35,98,2,0,232,118,222,222,119,174,255,0,44,98,2,0,229,62,241,241,182,218,255,0,53,98,2,0,233,29,253,253,224,239,255,0,62,98,2,0,59,38,245,230,245,208,255,0,71,98,2,0,61,103,225,184,225,134,255,0,80,98,2,0,63,166,188,127,188,65,255,0,89,98,2,0,68,197,146,77,146,33,255,0,98,98,2,0,230,220,197,197,27,125,255,0,107,98,2,0,232,118,222,222,119,174,255,0,116,98,2,0,229,62,241,241,182,218,255,0,125,98,2,0,233,29,253,253,224,239,255,0,134,98,2,0,0,0,247,247,247,247,255,0,143,98,2,0,59,38,245,230,245,208,255,0,152,98,2,0,61,103,225,184,225,134,255,0,161,98,2,0,63,166,188,127,188,65,255,0,170,98,2,0,68,197,146,77,146,33,255,0,179,98,2,0,206,255,75,64,0,75,255,0,189,98,2,0,101,255,68,0,68,27,255,0,200,98,2,0,206,173,131,118,42,131,255,0,210,98,2,0,199,87,171,153,112,171,255,0,220,98,2,0,199,51,207,194,165,207,255,0,230,98,2,0,210,21,232,231,212,232,255,0,240,98,2,0,76,30,240,217,240,211,255,0,250,98,2,0,80,68,219,166,219,160,255,0,4,99,2,0,88,123,174,90,174,97,255,0,14,99,2,0,97,197,120,27,120,55,255,0,24,99,2,0,206,255,75,64,0,75,255,0,34,99,2,0,97,197,120,27,120,55,255,0,45,99,2,0,101,255,68,0,68,27,255,0,56,99,2,0,206,173,131,118,42,131,255,0,66,99,2,0,199,87,171,153,112,171,255,0,76,99,2,0,199,51,207,194,165,207,255,0,86,99,2,0,210,21,232,231,212,232,255,0,96,99,2,0,0,0,247,247,247,247,255,0,106,99,2,0,76,30,240,217,240,211,255,0,116,99,2,0,80,68,219,166,219,160,255,0,126,99,2,0,88,123,174,90,174,97,255,0,136,99,2,0,196,70,195,175,141,195,255,0,145,99,2,0,0,0,247,247,247,247,255,0,154,99,2,0,82,90,191,127,191,123,255,0,163,99,2,0,201,168,148,123,50,148,255,0,172,99,2,0,199,51,207,194,165,207,255,0,181,99,2,0,80,68,219,166,219,160,255,0,190,99,2,0,102,255,136,0,136,55,255,0,199,99,2,0,201,168,148,123,50,148,255,0,208,99,2,0,199,51,207,194,165,207,255,0,217,99,2,0,0,0,247,247,247,247,255,0,226,99,2,0,80,68,219,166,219,160,255,0,235,99,2,0,102,255,136,0,136,55,255,0,244,99,2,0,206,173,131,118,42,131,255,0,253,99,2,0,196,70,195,175,141,195,255,0,6,100,2,0,210,21,232,231,212,232,255,0,15,100,2,0,76,30,240,217,240,211,255,0,24,100,2,0,82,90,191,127,191,123,255,0,33,100,2,0,97,197,120,27,120,55,255,0,42,100,2,0,206,173,131,118,42,131,255,0,51,100,2,0,196,70,195,175,141,195,255,0,60,100,2,0,210,21,232,231,212,232,255,0,69,100,2,0,0,0,247,247,247,247,255,0,78,100,2,0,76,30,240,217,240,211,255,0,87,100,2,0,82,90,191,127,191,123,255,0,96,100,2,0,97,197,120,27,120,55,255,0,105,100,2,0,206,173,131,118,42,131,255,0,114,100,2,0,199,87,171,153,112,171,255,0,123,100,2,0,199,51,207,194,165,207,255,0,132,100,2,0,210,21,232,231,212,232,255,0,141,100,2,0,76,30,240,217,240,211,255,0,150,100,2,0,80,68,219,166,219,160,255,0,159,100,2,0,88,123,174,90,174,97,255,0,168,100,2,0,97,197,120,27,120,55,255,0,177,100,2,0,206,173,131,118,42,131,255,0,186,100,2,0,199,87,171,153,112,171,255,0,195,100,2,0,199,51,207,194,165,207,255,0,204,100,2,0,210,21,232,231,212,232,255,0,213,100,2,0,0,0,247,247,247,247,255,0,222,100,2,0,76,30,240,217,240,211,255,0,231,100,2,0,80,68,219,166,219,160,255,0,240,100,2,0,88,123,174,90,174,97,255,0,249,100,2,0,97,197,120,27,120,55,255,0,2,101,2,0,189,11,242,236,231,242,255,0,11,101,2,0,151,61,219,166,189,219,255,0,20,101,2,0,141,197,190,43,140,190,255,0,29,101,2,0,185,8,246,241,238,246,255,0,38,101,2,0,155,40,225,189,201,225,255,0,47,101,2,0,145,112,207,116,169,207,255,0,56,101,2,0,143,247,176,5,112,176,255,0,65,101,2,0,185,8,246,241,238,246,255,0,74,101,2,0,155,40,225,189,201,225,255,0,83,101,2,0,145,112,207,116,169,207,255,0,92,101,2,0,141,197,190,43,140,190,255,0,101,101,2,0,143,247,141,4,90,141,255,0,110,101,2,0,185,8,246,241,238,246,255,0,119,101,2,0,168,24,230,208,209,230,255,0,128,101,2,0,151,61,219,166,189,219,255,0,137,101,2,0,145,112,207,116,169,207,255,0,146,101,2,0,141,197,190,43,140,190,255,0,155,101,2,0,143,247,141,4,90,141,255,0,164,101,2,0,185,8,246,241,238,246,255,0,173,101,2,0,168,24,230,208,209,230,255,0,182,101,2,0,151,61,219,166,189,219,255,0,191,101,2,0,145,112,207,116,169,207,255,0,200,101,2,0,142,183,192,54,144,192,255,0,209,101,2,0,143,247,176,5,112,176,255,0,218,101,2,0,143,248,123,3,78,123,255,0,227,101,2,0,233,8,255,255,247,251,255,0,236,101,2,0,189,11,242,236,231,242,255,0,245,101,2,0,168,24,230,208,209,230,255,0,254,101,2,0,151,61,219,166,189,219,255,0,7,102,2,0,145,112,207,116,169,207,255,0,16,102,2,0,142,183,192,54,144,192,255,0,25,102,2,0,143,247,176,5,112,176,255,0,34,102,2,0,143,248,123,3,78,123,255,0,43,102,2,0,233,8,255,255,247,251,255,0,52,102,2,0,189,11,242,236,231,242,255,0,61,102,2,0,168,24,230,208,209,230,255,0,70,102,2,0,151,61,219,166,189,219,255,0,79,102,2,0,145,112,207,116,169,207,255,0,88,102,2,0,142,183,192,54,144,192,255,0,97,102,2,0,143,247,176,5,112,176,255,0,106,102,2,0,143,247,141,4,90,141,255,0,115,102,2,0,143,249,88,2,56,88,255,0,124,102,2,0,200,14,240,236,226,240,255,0,135,102,2,0,151,61,219,166,189,219,255,0,146,102,2,0,130,208,153,28,144,153,255,0,157,102,2,0,207,8,247,246,239,247,255,0,168,102,2,0,155,40,225,189,201,225,255,0,179,102,2,0,143,128,207,103,169,207,255,0,190,102,2,0,130,251,138,2,129,138,255,0,201,102,2,0,207,8,247,246,239,247,255,0,212,102,2,0,155,40,225,189,201,225,255,0,223,102,2,0,143,128,207,103,169,207,255,0,234,102,2,0,130,208,153,28,144,153,255,0,245,102,2,0,119,252,108,1,108,89,255,0,0,103,2,0,207,8,247,246,239,247,255,0,11,103,2,0,168,24,230,208,209,230,255,0,22,103,2,0,151,61,219,166,189,219,255,0,33,103,2,0,143,128,207,103,169,207,255,0,44,103,2,0,130,208,153,28,144,153,255,0,55,103,2,0,119,252,108,1,108,89,255,0,66,103,2,0,207,8,247,246,239,247,255,0,77,103,2,0,168,24,230,208,209,230,255,0,88,103,2,0,151,61,219,166,189,219,255,0,99,103,2,0,143,128,207,103,169,207,255,0,110,103,2,0,142,183,192,54,144,192,255,0,121,103,2,0,130,251,138,2,129,138,255,0,132,103,2,0,118,252,100,1,100,80,255,0,143,103,2,0,233,8,255,255,247,251,255,0,154,103,2,0,200,14,240,236,226,240,255,0,165,103,2,0,168,24,230,208,209,230,255,0,176,103,2,0,151,61,219,166,189,219,255,0,187,103,2,0,143,128,207,103,169,207,255,0,198,103,2,0,142,183,192,54,144,192,255,0,209,103,2,0,130,251,138,2,129,138,255,0,220,103,2,0,118,252,100,1,100,80,255,0,231,103,2,0,233,8,255,255,247,251,255,0,242,103,2,0,200,14,240,236,226,240,255,0,253,103,2,0,168,24,230,208,209,230,255,0,8,104,2,0,151,61,219,166,189,219,255,0,19,104,2,0,143,128,207,103,169,207,255,0,30,104,2,0,142,183,192,54,144,192,255,0,41,104,2,0,130,251,138,2,129,138,255,0,52,104,2,0,119,252,108,1,108,89,255,0,63,104,2,0,117,251,70,1,70,54,255,0,74,104,2,0,18,238,127,127,59,8,255,0,84,104,2,0,195,255,75,45,0,75,255,0,95,104,2,0,20,246,179,179,88,6,255,0,105,104,2,0,22,232,224,224,130,20,255,0,115,104,2,0,23,155,253,253,184,99,255,0,125,104,2,0,24,72,254,254,224,182,255,0,135,104,2,0,165,20,235,216,218,235,255,0,145,104,2,0,177,47,210,178,171,210,255,0,155,104,2,0,179,84,172,128,115,172,255,0,165,104,2,0,189,181,136,84,39,136,255,0,175,104,2,0,18,238,127,127,59,8,255,0,185,104,2,0,189,181,136,84,39,136,255,0,196,104,2,0,195,255,75,45,0,75,255,0,207,104,2,0,20,246,179,179,88,6,255,0,217,104,2,0,22,232,224,224,130,20,255,0,227,104,2,0,23,155,253,253,184,99,255,0,237,104,2,0,24,72,254,254,224,182,255,0,247,104,2,0,0,0,247,247,247,247,255,0,1,105,2,0,165,20,235,216,218,235,255,0,11,105,2,0,177,47,210,178,171,210,255,0,21,105,2,0,179,84,172,128,115,172,255,0,31,105,2,0,23,187,241,241,163,64,255,0,40,105,2,0,0,0,247,247,247,247,255,0,49,105,2,0,178,69,195,153,142,195,255,0,58,105,2,0,17,253,230,230,97,1,255,0,67,105,2,0,23,155,253,253,184,99,255,0,76,105,2,0,177,47,210,178,171,210,255,0,85,105,2,0,185,155,153,94,60,153,255,0,94,105,2,0,17,253,230,230,97,1,255,0,103,105,2,0,23,155,253,253,184,99,255,0,112,105,2,0,0,0,247,247,247,247,255,0,121,105,2,0,177,47,210,178,171,210,255,0,130,105,2,0,185,155,153,94,60,153,255,0,139,105,2,0,20,246,179,179,88,6,255,0,148,105,2,0,23,187,241,241,163,64,255,0,157,105,2,0,24,72,254,254,224,182,255,0,166,105,2,0,165,20,235,216,218,235,255,0,175,105,2,0,178,69,195,153,142,195,255,0,184,105,2,0,189,181,136,84,39,136,255,0,193,105,2,0,20,246,179,179,88,6,255,0,202,105,2,0,23,187,241,241,163,64,255,0,211,105,2,0,24,72,254,254,224,182,255,0,220,105,2,0,0,0,247,247,247,247,255,0,229,105,2,0,165,20,235,216,218,235,255,0,238,105,2,0,178,69,195,153,142,195,255,0,247,105,2,0,189,181,136,84,39,136,255,0,0,106,2,0,20,246,179,179,88,6,255,0,9,106,2,0,22,232,224,224,130,20,255,0,18,106,2,0,23,155,253,253,184,99,255,0,27,106,2,0,24,72,254,254,224,182,255,0,36,106,2,0,165,20,235,216,218,235,255,0,45,106,2,0,177,47,210,178,171,210,255,0,54,106,2,0,179,84,172,128,115,172,255,0,63,106,2,0,189,181,136,84,39,136,255,0,72,106,2,0,20,246,179,179,88,6,255,0,81,106,2,0,22,232,224,224,130,20,255,0,90,106,2,0,23,155,253,253,184,99,255,0,99,106,2,0,24,72,254,254,224,182,255,0,108,106,2,0,0,0,247,247,247,247,255,0,117,106,2,0,165,20,235,216,218,235,255,0,126,106,2,0,177,47,210,178,171,210,255,0,135,106,2,0,179,84,172,128,115,172,255,0,144,106,2,0,189,181,136,84,39,136,255,0,153,106,2,0,188,14,239,231,225,239,255,0,162,106,2,0,214,67,201,201,148,199,255,0,171,106,2,0,234,222,221,221,28,119,255,0,180,106,2,0,185,8,246,241,238,246,255,0,189,106,2,0,211,41,216,215,181,216,255,0,198,106,2,0,228,139,223,223,101,176,255,0,207,106,2,0,239,232,206,206,18,86,255,0,216,106,2,0,185,8,246,241,238,246,255,0,225,106,2,0,211,41,216,215,181,216,255,0,234,106,2,0,228,139,223,223,101,176,255,0,243,106,2,0,234,222,221,221,28,119,255,0,252,106,2,0,236,255,152,152,0,67,255,0,5,107,2,0,185,8,246,241,238,246,255,0,14,107,2,0,204,38,218,212,185,218,255,0,23,107,2,0,214,67,201,201,148,199,255,0,32,107,2,0,228,139,223,223,101,176,255,0,41,107,2,0,234,222,221,221,28,119,255,0,50,107,2,0,236,255,152,152,0,67,255,0,59,107,2,0,185,8,246,241,238,246,255,0,68,107,2,0,204,38,218,212,185,218,255,0,77,107,2,0,214,67,201,201,148,199,255,0,86,107,2,0,228,139,223,223,101,176,255,0,95,107,2,0,233,209,231,231,41,138,255,0,104,107,2,0,239,232,206,206,18,86,255,0,113,107,2,0,236,255,145,145,0,63,255,0,122,107,2,0,195,5,249,247,244,249,255,0,131,107,2,0,188,14,239,231,225,239,255,0,140,107,2,0,204,38,218,212,185,218,255,0,149,107,2,0,214,67,201,201,148,199,255,0,158,107,2,0,228,139,223,223,101,176,255,0,167,107,2,0,233,209,231,231,41,138,255,0,176,107,2,0,239,232,206,206,18,86,255,0,185,107,2,0,236,255,145,145,0,63,255,0,194,107,2,0,195,5,249,247,244,249,255,0,203,107,2,0,188,14,239,231,225,239,255,0,212,107,2,0,204,38,218,212,185,218,255,0,221,107,2,0,214,67,201,201,148,199,255,0,230,107,2,0,228,139,223,223,101,176,255,0,239,107,2,0,233,209,231,231,41,138,255,0,248,107,2,0,239,232,206,206,18,86,255,0,1,108,2,0,236,255,152,152,0,67,255,0,10,108,2,0,242,255,103,103,0,31,255,0,19,108,2,0,180,8,245,239,237,245,255,0,31,108,2,0,168,37,220,188,189,220,255,0,43,108,2,0,176,100,177,117,107,177,255,0,55,108,2,0,182,7,247,242,240,247,255,0,67,108,2,0,173,28,226,203,201,226,255,0,79,108,2,0,173,58,200,158,154,200,255,0,91,108,2,0,182,128,163,106,81,163,255,0,103,108,2,0,182,7,247,242,240,247,255,0,115,108,2,0,173,28,226,203,201,226,255,0,127,108,2,0,173,58,200,158,154,200,255,0,139,108,2,0,176,100,177,117,107,177,255,0,151,108,2,0,188,185,143,84,39,143,255,0,163,108,2,0,182,7,247,242,240,247,255,0,175,108,2,0,170,18,235,218,218,235,255,0,187,108,2,0,168,37,220,188,189,220,255,0,199,108,2,0,173,58,200,158,154,200,255,0,211,108,2,0,176,100,177,117,107,177,255,0,223,108,2,0,188,185,143,84,39,143,255,0,235,108,2,0,182,7,247,242,240,247,255,0,247,108,2,0,170,18,235,218,218,235,255,0,3,109,2,0,168,37,220,188,189,220,255,0,15,109,2,0,173,58,200,158,154,200,255,0,27,109,2,0,172,83,186,128,125,186,255,0,39,109,2,0,182,128,163,106,81,163,255,0,51,109,2,0,190,216,134,74,20,134,255,0,63,109,2,0,191,2,253,252,251,253,255,0,75,109,2,0,180,8,245,239,237,245,255,0,87,109,2,0,170,18,235,218,218,235,255,0,99,109,2,0,168,37,220,188,189,220,255,0,111,109,2,0,173,58,200,158,154,200,255,0,123,109,2,0,172,83,186,128,125,186,255,0,135,109,2,0,182,128,163,106,81,163,255,0,147,109,2,0,190,216,134,74,20,134,255,0,159,109,2,0,191,2,253,252,251,253,255,0,171,109,2,0,180,8,245,239,237,245,255,0,183,109,2,0,170,18,235,218,218,235,255,0,195,109,2,0,168,37,220,188,189,220,255,0,207,109,2,0,173,58,200,158,154,200,255,0,219,109,2,0,172,83,186,128,125,186,255,0,231,109,2,0,182,128,163,106,81,163,255,0,243,109,2,0,188,185,143,84,39,143,255,0,255,109,2,0,191,255,125,63,0,125,255,0,11,110,2,0,242,255,103,103,0,31,255,0,21,110,2,0,150,241,97,5,48,97,255,0,32,110,2,0,249,220,178,178,24,43,255,0,42,110,2,0,5,163,214,214,96,77,255,0,52,110,2,0,13,119,244,244,165,130,255,0,62,110,2,0,15,54,253,253,219,199,255,0,72,110,2,0,142,32,240,209,229,240,255,0,82,110,2,0,141,87,222,146,197,222,255,0,92,110,2,0,143,167,195,67,147,195,255,0,102,110,2,0,148,206,172,33,102,172,255,0,112,110,2,0,242,255,103,103,0,31,255,0,122,110,2,0,148,206,172,33,102,172,255,0,133,110,2,0,150,241,97,5,48,97,255,0,144,110,2,0,249,220,178,178,24,43,255,0,154,110,2,0,5,163,214,214,96,77,255,0,164,110,2,0,13,119,244,244,165,130,255,0,174,110,2,0,15,54,253,253,219,199,255,0,184,110,2,0,0,0,247,247,247,247,255,0,194,110,2,0,142,32,240,209,229,240,255,0,204,110,2,0,141,87,222,146,197,222,255,0,214,110,2,0,143,167,195,67,147,195,255,0,224,110,2,0,12,150,239,239,138,98,255,0,233,110,2,0,0,0,247,247,247,247,255,0,242,110,2,0,143,128,207,103,169,207,255,0,251,110,2,0,248,255,202,202,0,32,255,0,4,111,2,0,13,119,244,244,165,130,255,0,13,111,2,0,141,87,222,146,197,222,255,0,22,111,2,0,143,247,176,5,113,176,255,0,31,111,2,0,248,255,202,202,0,32,255,0,40,111,2,0,13,119,244,244,165,130,255,0,49,111,2,0,0,0,247,247,247,247,255,0,58,111,2,0,141,87,222,146,197,222,255,0,67,111,2,0,143,247,176,5,113,176,255,0,76,111,2,0,249,220,178,178,24,43,255,0,85,111,2,0,12,150,239,239,138,98,255,0,94,111,2,0,15,54,253,253,219,199,255,0,103,111,2,0,142,32,240,209,229,240,255,0,112,111,2,0,143,128,207,103,169,207,255,0,121,111,2,0,148,206,172,33,102,172,255,0,130,111,2,0,249,220,178,178,24,43,255,0,139,111,2,0,12,150,239,239,138,98,255,0,148,111,2,0,15,54,253,253,219,199,255,0,157,111,2,0,0,0,247,247,247,247,255,0,166,111,2,0,142,32,240,209,229,240,255,0,175,111,2,0,143,128,207,103,169,207,255,0,184,111,2,0,148,206,172,33,102,172,255,0,193,111,2,0,249,220,178,178,24,43,255,0,202,111,2,0,5,163,214,214,96,77,255,0,211,111,2,0,13,119,244,244,165,130,255,0,220,111,2,0,15,54,253,253,219,199,255,0,229,111,2,0,142,32,240,209,229,240,255,0,238,111,2,0,141,87,222,146,197,222,255,0,247,111,2,0,143,167,195,67,147,195,255,0,0,112,2,0,148,206,172,33,102,172,255,0,9,112,2,0,249,220,178,178,24,43,255,0,18,112,2,0,5,163,214,214,96,77,255,0,27,112,2,0,13,119,244,244,165,130,255,0,36,112,2,0,15,54,253,253,219,199,255,0,45,112,2,0,0,0,247,247,247,247,255,0,54,112,2,0,142,32,240,209,229,240,255,0,63,112,2,0,141,87,222,146,197,222,255,0,72,112,2,0,143,167,195,67,147,195,255,0,81,112,2,0,148,206,172,33,102,172,255,0,90,112,2,0,242,255,103,103,0,31,255,0,100,112,2,0,0,0,26,26,26,26,255,0,111,112,2,0,249,220,178,178,24,43,255,0,121,112,2,0,5,163,214,214,96,77,255,0,131,112,2,0,13,119,244,244,165,130,255,0,141,112,2,0,15,54,253,253,219,199,255,0,151,112,2,0,0,0,224,224,224,224,255,0,161,112,2,0,0,0,186,186,186,186,255,0,171,112,2,0,0,0,135,135,135,135,255,0,181,112,2,0,0,0,77,77,77,77,255,0,191,112,2,0,242,255,103,103,0,31,255,0,201,112,2,0,0,0,77,77,77,77,255,0,212,112,2,0,0,0,26,26,26,26,255,0,223,112,2,0,249,220,178,178,24,43,255,0,233,112,2,0,5,163,214,214,96,77,255,0,243,112,2,0,13,119,244,244,165,130,255,0,253,112,2,0,15,54,253,253,219,199,255,0,7,113,2,0,0,0,255,255,255,255,255,0,17,113,2,0,0,0,224,224,224,224,255,0,27,113,2,0,0,0,186,186,186,186,255,0,37,113,2,0,0,0,135,135,135,135,255,0,47,113,2,0,12,150,239,239,138,98,255,0,56,113,2,0,0,0,255,255,255,255,255,0,65,113,2,0,0,0,153,153,153,153,255,0,74,113,2,0,248,255,202,202,0,32,255,0,83,113,2,0,13,119,244,244,165,130,255],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+63992);allocate([92,113,2,0,0,0,186,186,186,186,255,0,101,113,2,0,0,0,64,64,64,64,255,0,110,113,2,0,248,255,202,202,0,32,255,0,119,113,2,0,13,119,244,244,165,130,255,0,128,113,2,0,0,0,255,255,255,255,255,0,137,113,2,0,0,0,186,186,186,186,255,0,146,113,2,0,0,0,64,64,64,64,255,0,155,113,2,0,249,220,178,178,24,43,255,0,164,113,2,0,12,150,239,239,138,98,255,0,173,113,2,0,15,54,253,253,219,199,255,0,182,113,2,0,0,0,224,224,224,224,255,0,191,113,2,0,0,0,153,153,153,153,255,0,200,113,2,0,0,0,77,77,77,77,255,0,209,113,2,0,249,220,178,178,24,43,255,0,218,113,2,0,12,150,239,239,138,98,255,0,227,113,2,0,15,54,253,253,219,199,255,0,236,113,2,0,0,0,255,255,255,255,255,0,245,113,2,0,0,0,224,224,224,224,255,0,254,113,2,0,0,0,153,153,153,153,255,0,7,114,2,0,0,0,77,77,77,77,255,0,16,114,2,0,249,220,178,178,24,43,255,0,25,114,2,0,5,163,214,214,96,77,255,0,34,114,2,0,13,119,244,244,165,130,255,0,43,114,2,0,15,54,253,253,219,199,255,0,52,114,2,0,0,0,224,224,224,224,255,0,61,114,2,0,0,0,186,186,186,186,255,0,70,114,2,0,0,0,135,135,135,135,255,0,79,114,2,0,0,0,77,77,77,77,255,0,88,114,2,0,249,220,178,178,24,43,255,0,97,114,2,0,5,163,214,214,96,77,255,0,106,114,2,0,13,119,244,244,165,130,255,0,115,114,2,0,15,54,253,253,219,199,255,0,124,114,2,0,0,0,255,255,255,255,255,0,133,114,2,0,0,0,224,224,224,224,255,0,142,114,2,0,0,0,186,186,186,186,255,0,151,114,2,0,0,0,135,135,135,135,255,0,160,114,2,0,0,0,77,77,77,77,255,0,169,114,2,0,3,32,253,253,224,221,255,0,178,114,2,0,244,92,250,250,159,181,255,0,187,114,2,0,227,220,197,197,27,138,255,0,196,114,2,0,13,28,254,254,235,226,255,0,205,114,2,0,252,72,251,251,180,185,255,0,214,114,2,0,238,147,247,247,104,161,255,0,223,114,2,0,224,253,174,174,1,126,255,0,232,114,2,0,13,28,254,254,235,226,255,0,241,114,2,0,252,72,251,251,180,185,255,0,250,114,2,0,238,147,247,247,104,161,255,0,3,115,2,0,227,220,197,197,27,138,255,0,12,115,2,0,213,252,122,122,1,119,255,0,21,115,2,0,13,28,254,254,235,226,255,0,30,115,2,0,3,60,252,252,197,192,255,0,39,115,2,0,244,92,250,250,159,181,255,0,48,115,2,0,238,147,247,247,104,161,255,0,57,115,2,0,227,220,197,197,27,138,255,0,66,115,2,0,213,252,122,122,1,119,255,0,75,115,2,0,13,28,254,254,235,226,255,0,84,115,2,0,3,60,252,252,197,192,255,0,93,115,2,0,244,92,250,250,159,181,255,0,102,115,2,0,238,147,247,247,104,161,255,0,111,115,2,0,230,195,221,221,52,151,255,0,120,115,2,0,224,253,174,174,1,126,255,0,129,115,2,0,213,252,122,122,1,119,255,0,138,115,2,0,14,12,255,255,247,243,255,0,147,115,2,0,3,32,253,253,224,221,255,0,156,115,2,0,3,60,252,252,197,192,255,0,165,115,2,0,244,92,250,250,159,181,255,0,174,115,2,0,238,147,247,247,104,161,255,0,183,115,2,0,230,195,221,221,52,151,255,0,192,115,2,0,224,253,174,174,1,126,255,0,201,115,2,0,213,252,122,122,1,119,255,0,210,115,2,0,14,12,255,255,247,243,255,0,219,115,2,0,3,32,253,253,224,221,255,0,228,115,2,0,3,60,252,252,197,192,255,0,237,115,2,0,244,92,250,250,159,181,255,0,246,115,2,0,238,147,247,247,104,161,255,0,255,115,2,0,230,195,221,221,52,151,255,0,8,116,2,0,224,253,174,174,1,126,255,0,17,116,2,0,213,252,122,122,1,119,255,0,26,116,2,0,199,255,106,73,0,106,255,0,35,116,2,0,245,255,165,165,0,38,255,0,47,116,2,0,167,171,149,49,54,149,255,0,60,116,2,0,2,208,215,215,48,39,255,0,72,116,2,0,10,184,244,244,109,67,255,0,84,116,2,0,20,157,253,253,174,97,255,0,96,116,2,0,30,110,254,254,224,144,255,0,108,116,2,0,136,24,248,224,243,248,255,0,120,116,2,0,138,67,233,171,217,233,255,0,132,116,2,0,143,113,209,116,173,209,255,0,144,116,2,0,151,157,180,69,117,180,255,0,156,116,2,0,245,255,165,165,0,38,255,0,168,116,2,0,151,157,180,69,117,180,255,0,181,116,2,0,167,171,149,49,54,149,255,0,194,116,2,0,2,208,215,215,48,39,255,0,206,116,2,0,10,184,244,244,109,67,255,0,218,116,2,0,20,157,253,253,174,97,255,0,230,116,2,0,30,110,254,254,224,144,255,0,242,116,2,0,42,64,255,255,255,191,255,0,254,116,2,0,136,24,248,224,243,248,255,0,10,117,2,0,138,67,233,171,217,233,255,0,22,117,2,0,143,113,209,116,173,209,255,0,34,117,2,0,13,164,252,252,141,89,255,0,45,117,2,0,42,64,255,255,255,191,255,0,56,117,2,0,143,86,219,145,191,219,255,0,67,117,2,0,254,225,215,215,25,28,255,0,78,117,2,0,20,157,253,253,174,97,255,0,89,117,2,0,138,67,233,171,217,233,255,0,100,117,2,0,145,193,182,44,123,182,255,0,111,117,2,0,254,225,215,215,25,28,255,0,122,117,2,0,20,157,253,253,174,97,255,0,133,117,2,0,42,64,255,255,255,191,255,0,144,117,2,0,138,67,233,171,217,233,255,0,155,117,2,0,145,193,182,44,123,182,255,0,166,117,2,0,2,208,215,215,48,39,255,0,177,117,2,0,13,164,252,252,141,89,255,0,188,117,2,0,30,110,254,254,224,144,255,0,199,117,2,0,136,24,248,224,243,248,255,0,210,117,2,0,143,86,219,145,191,219,255,0,221,117,2,0,151,157,180,69,117,180,255,0,232,117,2,0,2,208,215,215,48,39,255,0,243,117,2,0,13,164,252,252,141,89,255,0,254,117,2,0,30,110,254,254,224,144,255,0,9,118,2,0,42,64,255,255,255,191,255,0,20,118,2,0,136,24,248,224,243,248,255,0,31,118,2,0,143,86,219,145,191,219,255,0,42,118,2,0,151,157,180,69,117,180,255,0,53,118,2,0,2,208,215,215,48,39,255,0,64,118,2,0,10,184,244,244,109,67,255,0,75,118,2,0,20,157,253,253,174,97,255,0,86,118,2,0,30,110,254,254,224,144,255,0,97,118,2,0,136,24,248,224,243,248,255,0,108,118,2,0,138,67,233,171,217,233,255,0,119,118,2,0,143,113,209,116,173,209,255,0,130,118,2,0,151,157,180,69,117,180,255,0,141,118,2,0,2,208,215,215,48,39,255,0,152,118,2,0,10,184,244,244,109,67,255,0,163,118,2,0,20,157,253,253,174,97,255,0,174,118,2,0,30,110,254,254,224,144,255,0,185,118,2,0,42,64,255,255,255,191,255,0,196,118,2,0,136,24,248,224,243,248,255,0,207,118,2,0,138,67,233,171,217,233,255,0,218,118,2,0,143,113,209,116,173,209,255,0,229,118,2,0,151,157,180,69,117,180,255,0,240,118,2,0,245,255,165,165,0,38,255,0,252,118,2,0,107,255,104,0,104,55,255,0,9,119,2,0,2,208,215,215,48,39,255,0,21,119,2,0,10,184,244,244,109,67,255,0,33,119,2,0,20,157,253,253,174,97,255,0,45,119,2,0,31,115,254,254,224,139,255,0,57,119,2,0,51,106,239,217,239,139,255,0,69,119,2,0,62,130,217,166,217,106,255,0,81,119,2,0,83,121,189,102,189,99,255,0,93,119,2,0,103,211,152,26,152,80,255,0,105,119,2,0,245,255,165,165,0,38,255,0,117,119,2,0,103,211,152,26,152,80,255,0,130,119,2,0,107,255,104,0,104,55,255,0,143,119,2,0,2,208,215,215,48,39,255,0,155,119,2,0,10,184,244,244,109,67,255,0,167,119,2,0,20,157,253,253,174,97,255,0,179,119,2,0,31,115,254,254,224,139,255,0,191,119,2,0,42,64,255,255,255,191,255,0,203,119,2,0,51,106,239,217,239,139,255,0,215,119,2,0,62,130,217,166,217,106,255,0,227,119,2,0,83,121,189,102,189,99,255,0,239,119,2,0,13,164,252,252,141,89,255,0,250,119,2,0,42,64,255,255,255,191,255,0,5,120,2,0,66,136,207,145,207,96,255,0,16,120,2,0,254,225,215,215,25,28,255,0,27,120,2,0,20,157,253,253,174,97,255,0,38,120,2,0,62,130,217,166,217,106,255,0,49,120,2,0,98,210,150,26,150,65,255,0,60,120,2,0,254,225,215,215,25,28,255,0,71,120,2,0,20,157,253,253,174,97,255,0,82,120,2,0,42,64,255,255,255,191,255,0,93,120,2,0,62,130,217,166,217,106,255,0,104,120,2,0,98,210,150,26,150,65,255,0,115,120,2,0,2,208,215,215,48,39,255,0,126,120,2,0,13,164,252,252,141,89,255,0,137,120,2,0,31,115,254,254,224,139,255,0,148,120,2,0,51,106,239,217,239,139,255,0,159,120,2,0,66,136,207,145,207,96,255,0,170,120,2,0,103,211,152,26,152,80,255,0,181,120,2,0,2,208,215,215,48,39,255,0,192,120,2,0,13,164,252,252,141,89,255,0,203,120,2,0,31,115,254,254,224,139,255,0,214,120,2,0,42,64,255,255,255,191,255,0,225,120,2,0,51,106,239,217,239,139,255,0,236,120,2,0,66,136,207,145,207,96,255,0,247,120,2,0,103,211,152,26,152,80,255,0,2,121,2,0,2,208,215,215,48,39,255,0,13,121,2,0,10,184,244,244,109,67,255,0,24,121,2,0,20,157,253,253,174,97,255,0,35,121,2,0,31,115,254,254,224,139,255,0,46,121,2,0,51,106,239,217,239,139,255,0,57,121,2,0,62,130,217,166,217,106,255,0,68,121,2,0,83,121,189,102,189,99,255,0,79,121,2,0,103,211,152,26,152,80,255,0,90,121,2,0,2,208,215,215,48,39,255,0,101,121,2,0,10,184,244,244,109,67,255,0,112,121,2,0,20,157,253,253,174,97,255,0,123,121,2,0,31,115,254,254,224,139,255,0,134,121,2,0,42,64,255,255,255,191,255,0,145,121,2,0,51,106,239,217,239,139,255,0,156,121,2,0,62,130,217,166,217,106,255,0,167,121,2,0,83,121,189,102,189,99,255,0,178,121,2,0,103,211,152,26,152,80,255,0,189,121,2,0,13,44,254,254,224,210,255,0,198,121,2,0,9,139,252,252,146,114,255,0,207,121,2,0,1,211,222,222,45,38,255,0,216,121,2,0,13,37,254,254,229,217,255,0,225,121,2,0,11,108,252,252,174,145,255,0,234,121,2,0,7,179,251,251,106,74,255,0,243,121,2,0,253,224,203,203,24,29,255,0,252,121,2,0,13,37,254,254,229,217,255,0,5,122,2,0,11,108,252,252,174,145,255,0,14,122,2,0,7,179,251,251,106,74,255,0,23,122,2,0,1,211,222,222,45,38,255,0,32,122,2,0,253,231,165,165,15,21,255,0,41,122,2,0,13,37,254,254,229,217,255,0,50,122,2,0,12,92,252,252,187,161,255,0,59,122,2,0,9,139,252,252,146,114,255,0,68,122,2,0,7,179,251,251,106,74,255,0,77,122,2,0,1,211,222,222,45,38,255,0,86,122,2,0,253,231,165,165,15,21,255,0,95,122,2,0,13,37,254,254,229,217,255,0,104,122,2,0,12,92,252,252,187,161,255,0,113,122,2,0,9,139,252,252,146,114,255,0,122,122,2,0,7,179,251,251,106,74,255,0,131,122,2,0,3,208,239,239,59,44,255,0,140,122,2,0,253,224,203,203,24,29,255,0,149,122,2,0,251,255,153,153,0,13,255,0,158,122,2,0,14,15,255,255,245,240,255,0,167,122,2,0,13,44,254,254,224,210,255,0,176,122,2,0,12,92,252,252,187,161,255,0,185,122,2,0,9,139,252,252,146,114,255,0,194,122,2,0,7,179,251,251,106,74,255,0,203,122,2,0,3,208,239,239,59,44,255,0,212,122,2,0,253,224,203,203,24,29,255,0,221,122,2,0,251,255,153,153,0,13,255,0,230,122,2,0,14,15,255,255,245,240,255,0,239,122,2,0,13,44,254,254,224,210,255,0,248,122,2,0,12,92,252,252,187,161,255,0,1,123,2,0,9,139,252,252,146,114,255,0,10,123,2,0,7,179,251,251,106,74,255,0,19,123,2,0,3,208,239,239,59,44,255,0,28,123,2,0,253,224,203,203,24,29,255,0,37,123,2,0,253,231,165,165,15,21,255,0,46,123,2,0,249,255,103,103,0,13,255,0,55,123,2,0,254,225,228,228,26,28,255,0,64,123,2,0,146,178,184,55,126,184,255,0,73,123,2,0,83,147,175,77,175,74,255,0,82,123,2,0,254,225,228,228,26,28,255,0,91,123,2,0,146,178,184,55,126,184,255,0,100,123,2,0,83,147,175,77,175,74,255,0,109,123,2,0,207,132,163,152,78,163,255,0,118,123,2,0,254,225,228,228,26,28,255,0,127,123,2,0,146,178,184,55,126,184,255,0,136,123,2,0,83,147,175,77,175,74,255,0,145,123,2,0,207,132,163,152,78,163,255,0,154,123,2,0,21,255,255,255,127,0,255,0,163,123,2,0,254,225,228,228,26,28,255,0,172,123,2,0,146,178,184,55,126,184,255,0,181,123,2,0,83,147,175,77,175,74,255,0,190,123,2,0,207,132,163,152,78,163,255,0,199,123,2,0,21,255,255,255,127,0,255,0,208,123,2,0,42,204,255,255,255,51,255,0,217,123,2,0,254,225,228,228,26,28,255,0,226,123,2,0,146,178,184,55,126,184,255,0,235,123,2,0,83,147,175,77,175,74,255,0,244,123,2,0,207,132,163,152,78,163,255,0,253,123,2,0,21,255,255,255,127,0,255,0,6,124,2,0,42,204,255,255,255,51,255,0,15,124,2,0,15,193,166,166,86,40,255,0,24,124,2,0,254,225,228,228,26,28,255,0,33,124,2,0,146,178,184,55,126,184,255,0,42,124,2,0,83,147,175,77,175,74,255,0,51,124,2,0,207,132,163,152,78,163,255,0,60,124,2,0,21,255,255,255,127,0,255,0,69,124,2,0,42,204,255,255,255,51,255,0,78,124,2,0,15,193,166,166,86,40,255,0,87,124,2,0,232,121,247,247,129,191,255,0,96,124,2,0,254,225,228,228,26,28,255,0,105,124,2,0,146,178,184,55,126,184,255,0,114,124,2,0,83,147,175,77,175,74,255,0,123,124,2,0,207,132,163,152,78,163,255,0,132,124,2,0,21,255,255,255,127,0,255,0,141,124,2,0,42,204,255,255,255,51,255,0,150,124,2,0,15,193,166,166,86,40,255,0,159,124,2,0,232,121,247,247,129,191,255,0,168,124,2,0,0,0,153,153,153,153,255,0,177,124,2,0,114,120,194,102,194,165,255,0,186,124,2,0,11,155,252,252,141,98,255,0,195,124,2,0,156,77,203,141,160,203,255,0,204,124,2,0,114,120,194,102,194,165,255,0,213,124,2,0,11,155,252,252,141,98,255,0,222,124,2,0,156,77,203,141,160,203,255,0,231,124,2,0,228,102,231,231,138,195,255,0,240,124,2,0,114,120,194,102,194,165,255,0,249,124,2,0,11,155,252,252,141,98,255,0,2,125,2,0,156,77,203,141,160,203,255,0,11,125,2,0,228,102,231,231,138,195,255,0,20,125,2,0,58,155,216,166,216,84,255,0,29,125,2,0,114,120,194,102,194,165,255,0,38,125,2,0,11,155,252,252,141,98,255,0,47,125,2,0,156,77,203,141,160,203,255,0,56,125,2,0,228,102,231,231,138,195,255,0,65,125,2,0,58,155,216,166,216,84,255,0,74,125,2,0,34,208,255,255,217,47,255,0,83,125,2,0,114,120,194,102,194,165,255,0,92,125,2,0,11,155,252,252,141,98,255,0,101,125,2,0,156,77,203,141,160,203,255,0,110,125,2,0,228,102,231,231,138,195,255,0,119,125,2,0,58,155,216,166,216,84,255,0,128,125,2,0,34,208,255,255,217,47,255,0,137,125,2,0,25,90,229,229,196,148,255,0,146,125,2,0,114,120,194,102,194,165,255,0,155,125,2,0,11,155,252,252,141,98,255,0,164,125,2,0,156,77,203,141,160,203,255,0,173,125,2,0,228,102,231,231,138,195,255,0,182,125,2,0,58,155,216,166,216,84,255,0,191,125,2,0,34,208,255,255,217,47,255,0,200,125,2,0,25,90,229,229,196,148,255,0,209,125,2,0,0,0,179,179,179,179,255,0,218,125,2,0,120,84,211,141,211,199,255,0,228,125,2,0,211,82,189,188,128,189,255,0,239,125,2,0,42,76,255,255,255,179,255,0,249,125,2,0,175,37,218,190,186,218,255,0,3,126,2,0,4,139,251,251,128,114,255,0,13,126,2,0,144,100,211,128,177,211,255,0,23,126,2,0,22,156,253,253,180,98,255,0,33,126,2,0,58,134,222,179,222,105,255,0,43,126,2,0,233,47,252,252,205,229,255,0,53,126,2,0,0,0,217,217,217,217,255,0,63,126,2,0,120,84,211,141,211,199,255,0,73,126,2,0,211,82,189,188,128,189,255,0,84,126,2,0,77,41,235,204,235,197,255,0,95,126,2,0,42,76,255,255,255,179,255,0,105,126,2,0,175,37,218,190,186,218,255,0,115,126,2,0,4,139,251,251,128,114,255,0,125,126,2,0,144,100,211,128,177,211,255,0,135,126,2,0,22,156,253,253,180,98,255,0,145,126,2,0,58,134,222,179,222,105,255,0,155,126,2,0,233,47,252,252,205,229,255,0,165,126,2,0,0,0,217,217,217,217,255,0,175,126,2,0,120,84,211,141,211,199,255,0,185,126,2,0,211,82,189,188,128,189,255,0,196,126,2,0,77,41,235,204,235,197,255,0,207,126,2,0,37,144,255,255,237,111,255,0,218,126,2,0,42,76,255,255,255,179,255,0,228,126,2,0,175,37,218,190,186,218,255,0,238,126,2,0,4,139,251,251,128,114,255,0,248,126,2,0,144,100,211,128,177,211,255,0,2,127,2,0,22,156,253,253,180,98,255,0,12,127,2,0,58,134,222,179,222,105,255,0,22,127,2,0,233,47,252,252,205,229,255,0,32,127,2,0,0,0,217,217,217,217,255,0,42,127,2,0,120,84,211,141,211,199,255,0,51,127,2,0,42,76,255,255,255,179,255,0,60,127,2,0,175,37,218,190,186,218,255,0,69,127,2,0,120,84,211,141,211,199,255,0,78,127,2,0,42,76,255,255,255,179,255,0,87,127,2,0,175,37,218,190,186,218,255,0,96,127,2,0,4,139,251,251,128,114,255,0,105,127,2,0,120,84,211,141,211,199,255,0,114,127,2,0,42,76,255,255,255,179,255,0,123,127,2,0,175,37,218,190,186,218,255,0,132,127,2,0,4,139,251,251,128,114,255,0,141,127,2,0,144,100,211,128,177,211,255,0,150,127,2,0,120,84,211,141,211,199,255,0,159,127,2,0,42,76,255,255,255,179,255,0,168,127,2,0,175,37,218,190,186,218,255,0,177,127,2,0,4,139,251,251,128,114,255,0,186,127,2,0,144,100,211,128,177,211,255,0,195,127,2,0,22,156,253,253,180,98,255,0,204,127,2,0,120,84,211,141,211,199,255,0,213,127,2,0,42,76,255,255,255,179,255,0,222,127,2,0,175,37,218,190,186,218,255,0,231,127,2,0,4,139,251,251,128,114,255,0,240,127,2,0,144,100,211,128,177,211,255,0,249,127,2,0,22,156,253,253,180,98,255,0,2,128,2,0,58,134,222,179,222,105,255,0,11,128,2,0,120,84,211,141,211,199,255,0,20,128,2,0,42,76,255,255,255,179,255,0,29,128,2,0,175,37,218,190,186,218,255,0,38,128,2,0,4,139,251,251,128,114,255,0,47,128,2,0,144,100,211,128,177,211,255,0,56,128,2,0,22,156,253,253,180,98,255,0,65,128,2,0,58,134,222,179,222,105,255,0,74,128,2,0,233,47,252,252,205,229,255,0,83,128,2,0,120,84,211,141,211,199,255,0,92,128,2,0,42,76,255,255,255,179,255,0,101,128,2,0,175,37,218,190,186,218,255,0,110,128,2,0,4,139,251,251,128,114,255,0,119,128,2,0,144,100,211,128,177,211,255,0,128,128,2,0,22,156,253,253,180,98,255,0,137,128,2,0,58,134,222,179,222,105,255,0,146,128,2,0,233,47,252,252,205,229,255,0,155,128,2,0,0,0,217,217,217,217,255,0,164,128,2,0,237,253,158,158,1,66,255,0,178,128,2,0,177,130,162,94,79,162,255,0,193,128,2,0,250,180,213,213,62,79,255,0,207,128,2,0,10,184,244,244,109,67,255,0,221,128,2,0,20,157,253,253,174,97,255,0,235,128,2,0,31,115,254,254,224,139,255,0,249,128,2,0,49,96,245,230,245,152,255,0,7,129,2,0,79,65,221,171,221,164,255,0,21,129,2,0,114,120,194,102,194,165,255,0,35,129,2,0,143,187,189,50,136,189,255,0,49,129,2,0,237,253,158,158,1,66,255,0,63,129,2,0,143,187,189,50,136,189,255,0,78,129,2,0,177,130,162,94,79,162,255,0,93,129,2,0,250,180,213,213,62,79,255,0,107,129,2,0,10,184,244,244,109,67,255,0,121,129,2,0,20,157,253,253,174,97,255,0,135,129,2,0,31,115,254,254,224,139,255,0,149,129,2,0,42,64,255,255,255,191,255,0,163,129,2,0,49,96,245,230,245,152,255,0,177,129,2,0,79,65,221,171,221,164,255,0,191,129,2,0,114,120,194,102,194,165,255,0,205,129,2,0,13,164,252,252,141,89,255,0,218,129,2,0,42,64,255,255,255,191,255,0,231,129,2,0,81,77,213,153,213,148,255,0,244,129,2,0,254,225,215,215,25,28,255,0,1,130,2,0,20,157,253,253,174,97,255,0,14,130,2,0,79,65,221,171,221,164,255,0,27,130,2,0,143,196,186,43,131,186,255,0,40,130,2,0,254,225,215,215,25,28,255,0,53,130,2,0,20,157,253,253,174,97,255,0,66,130,2,0,42,64,255,255,255,191,255,0,79,130,2,0,79,65,221,171,221,164,255,0,92,130,2,0,143,196,186,43,131,186,255,0,105,130,2,0,250,180,213,213,62,79,255,0,118,130,2,0,13,164,252,252,141,89,255,0,131,130,2,0,31,115,254,254,224,139,255,0,144,130,2,0,49,96,245,230,245,152,255,0,157,130,2,0,81,77,213,153,213,148,255,0,170,130,2,0,143,187,189,50,136,189,255,0,183,130,2,0,250,180,213,213,62,79,255,0,196,130,2,0,13,164,252,252,141,89,255,0,209,130,2,0,31,115,254,254,224,139,255,0,222,130,2,0,42,64,255,255,255,191,255,0,235,130,2,0,49,96,245,230,245,152,255,0,248,130,2,0,81,77,213,153,213,148,255,0,5,131,2,0,143,187,189,50,136,189,255,0,18,131,2,0,250,180,213,213,62,79,255,0,31,131,2,0,10,184,244,244,109,67,255,0,44,131,2,0,20,157,253,253,174,97,255,0,57,131,2,0,31,115,254,254,224,139,255,0,70,131,2,0,49,96,245,230,245,152,255,0,83,131,2,0,79,65,221,171,221,164,255,0,96,131,2,0,114,120,194,102,194,165,255,0,109,131,2,0,143,187,189,50,136,189,255,0,122,131,2,0,250,180,213,213,62,79,255,0,135,131,2,0,10,184,244,244,109,67,255,0,148,131,2,0,20,157,253,253,174,97,255,0,161,131,2,0,31,115,254,254,224,139,255,0,174,131,2,0,42,64,255,255,255,191,255,0,187,131,2,0,49,96,245,230,245,152,255,0,200,131,2,0,79,65,221,171,221,164,255,0,213,131,2,0,114,120,194,102,194,165,255,0,226,131,2,0,143,187,189,50,136,189,255,0,239,131,2,0,147,15,255,240,248,255,255,0,254,131,2,0,24,35,250,250,235,215,255,0,16,132,2,0,127,255,255,0,255,255,255,0,26,132,2,0,113,128,255,127,255,212,255,0,42,132,2,0,127,15,255,240,255,255,255,0,53,132,2,0,42,26,245,245,245,220,255,0,64,132,2,0,23,58,255,255,228,196,255,0,76,132,2,0,0,0,0,0,0,0,255,0,87,132,2,0,25,49,255,255,235,205,255,0,107,132,2,0,170,255,255,0,0,255,255,0,117,132,2,0,192,206,226,138,43,226,255,0,133,132,2,0,0,190,165,165,42,42,255,0,144,132,2,0,23,99,222,222,184,135,255,0,159,132,2,0,128,103,160,95,158,160,255,0,174,132,2,0,63,255,255,127,255,0,255,0,190,132,2,0,17,218,210,210,105,30,255,0,205,132,2,0,11,175,255,255,127,80,255,0,216,132,2,0,154,147,237,100,149,237,255,0,236,132,2,0,33,34,255,255,248,220,255,0,250,132,2,0,246,231,220,220,20,60,255,0,7,133,2,0,127,255,255,0,255,255,255,0,17,133,2,0,170,255,139,0,0,139,255,0,31,133,2,0,127,255,139,0,139,139,255,0,45,133,2,0,30,239,184,184,134,11,255,0,64,133,2,0,0,0,169,169,169,169,255,0,78,133,2,0,85,255,100,0,100,0,255,0,93,133,2,0,0,0,169,169,169,169,255,0,107,133,2,0,39,110,189,189,183,107,255,0,122,133,2,0,212,255,139,139,0,139,255,0,139,133,2,0,58,142,107,85,107,47,255,0,159,133,2,0,23,255,255,255,140,0,255,0,175,133,2,0,198,192,204,153,50,204,255,0,191,133,2,0,0,255,139,139,0,0,255,0,204,133,2,0,10,121,233,233,150,122,255,0,220,133,2,0,85,61,188,143,188,143,255,0,238,133,2,0,175,143,139,72,61,139,255,0,1,134,2,0,127,103,79,47,79,79,255,0,20,134,2,0,127,103,79,47,79,79,255,0,39,134,2,0,128,255,209,0,206,209,255,0,58,134,2,0,199,255,211,148,0,211,255,0,74,134,2,0,232,235,255,255,20,147,255,0,88,134,2,0,138,255,255,0,191,255,255,0,105,134,2,0,0,0,105,105,105,105,255,0,118,134,2,0,0,0,105,105,105,105,255,0,131,134,2,0,148,225,255,30,144,255,255,0,147,134,2,0,0,206,178,178,34,34,255,0,162,134,2,0,28,15,255,255,250,240,255,0,179,134,2,0,85,192,139,34,139,34,255,0,196,134,2,0,212,255,255,255,0,255,255,0,209,134,2,0,0,0,220,220,220,220,255,0,224,134,2,0,170,7,255,248,248,255,255,0,240,134,2,0,35,255,255,255,215,0,255,0,250,134,2,0,30,217,218,218,165,32,255,0,9,135,2,0,0,0,128,128,128,128,255,0,19,135,2,0,85,255,128,0,128,0,255,0,30,135,2,0,59,208,255,173,255,47,255,0,47,135,2,0,0,0,128,128,128,128,255,0,57,135,2,0,85,15,255,240,255,240,255,0,71,135,2,0,233,150,255,255,105,180,255,0,84,135,2,0,0,140,205,205,92,92,255,0,99,135,2,0,194,255,130,75,0,130,255,0,111,135,2,0,42,15,255,255,255,240,255,0,122,135,2,0,38,106,240,240,230,140,255,0,133,135,2,0,170,20,250,230,230,250,255,0,147,135,2,0,240,15,255,255,240,245,255,0,166,135,2,0,64,255,252,124,252,0,255,0,181,135,2,0,38,49,255,255,250,205,255,0,199,135,2,0,137,63,230,173,216,230,255,0,214,135,2,0,0,119,240,240,128,128,255,0,230,135,2,0,127,31,255,224,255,255,255,0,245,135,2,0,42,40,250,250,250,210,255,0,15,136,2,0,0,0,211,211,211,211,255,0,30,136,2,0,85,100,238,144,238,144,255,0,46,136,2,0,0,0,211,211,211,211,255,0,61,136,2,0,248,73,255,255,182,193,255,0,76,136,2,0,12,132,255,255,160,122,255,0,93,136,2,0,125,209,178,32,178,170,255,0,112,136,2,0,143,117,250,135,206,250,255,0,130,136,2,0,148,56,153,119,136,153,255,0,150,136,2,0,148,56,153,119,136,153,255,0,170,136,2,0,151,52,222,176,196,222,255,0,190,136,2,0,42,31,255,255,255,224,255,0,207,136,2,0,85,255,255,0,255,0,255,0,217,136,2,0,85,192,205,50,205,50,255,0,232,136,2,0,21,20,250,250,240,230,255,0,243,136,2,0,212,255,255,255,0,255,255,0,0,137,2,0,0,255,128,128,0,0,255,0,12,137,2,0,113,128,205,102,205,170,255,0,34,137,2,0,170,255,205,0,0,205,255,0,50,137,2,0,204,152,211,186,85,211,255,0,68,137,2,0,183,124,219,147,112,219,255,0,86,137,2,0,103,169,179,60,179,113,255,0,106,137,2,0,176,143,238,123,104,238,255,0,127,137,2,0,111,255,250,0,250,154,255,0,150,137,2,0,125,167,209,72,209,204,255,0,171,137,2,0,228,228,199,199,21,133,255,0,192,137,2,0,170,198,112,25,25,112,255,0,210,137,2,0,106,9,255,245,255,250,255,0,225,137,2,0,4,30,255,255,228,225,255,0,240,137,2,0,26,73,255,255,228,181,255,0,254,137,2,0,25,81,255,255,222,173,255,0,15,138,2,0,170,255,128,0,0,128,255,0,25,138,2,0,27,23,253,253,245,230,255,0,38,138,2,0,42,255,128,128,128,0,255,0,49,138,2,0,56,192,142,107,142,35,255,0,64,138,2,0,27,255,255,255,165,0,255,0,76,138,2,0,11,255,255,255,69,0,255,0,91,138,2,0,214,123,218,218,112,214,255,0,103,138,2,0,38,72,238,238,232,170,255,0,122,138,2,0,85,100,251,152,251,152,255,0,137,138,2,0,127,67,238,175,238,238,255,0,156,138,2,0,241,124,219,219,112,147,255,0,175,138,2,0,26,41,255,255,239,213,255,0,191,138,2,0,20,70,255,255,218,185,255,0,206,138,2,0,20,176,205,205,133,63,255,0,216,138,2,0,247,63,255,255,192,203,255,0,226,138,2,0,212,70,221,221,160,221,255,0,236,138,2,0,132,59,230,176,224,230,255,0,252,138,2,0,212,255,128,128,0,128,255,0,8,139,2,0,0,255,255,255,0,0,255,0,17,139,2,0,0,61,188,188,143,143,255,0,32,139,2,0,159,181,225,65,105,225,255,0,47,139,2,0,17,220,139,139,69,19,255,0,64,139,2,0,4,138,250,250,128,114,255,0,76,139,2,0,19,154,244,244,164,96,255,0,92,139,2,0,103,170,139,46,139,87,255,0,106,139,2,0,17,16,255,255,245,238,255,0,120,139,2,0,13,183,160,160,82,45,255,0,132,139,2,0,0,0,192,192,192,192,255,0,144,139,2,0,139,108,235,135,206,235,255,0,157,139,2,0,175,143,205,106,90,205,255,0,172,139,2,0,148,56,144,112,128,144,255,0,187,139,2,0,148,56,144,112,128,144,255,0,202,139,2,0,0,5,255,255,250,250,255,0,212,139,2,0,106,255,255,0,255,127,255,0,229,139,2,0,146,155,180,70,130,180,255,0,244,139,2,0,24,84,210,210,180,140,255,0,253,139,2,0,127,255,128,0,128,128,255,0,7,140,2,0,212,29,216,216,191,216,255,0,20,140,2,0,6,184,255,255,99,71,255,0,32,140,2,0,123,182,224,64,224,208,255,0,47,140,2,0,212,115,238,238,130,238,255,0,59,140,2,0,27,68,245,245,222,179,255,0,70,140,2,0,0,0,255,255,255,255,255,0,81,140,2,0,0,0,245,245,245,245,255,0,97,140,2,0,42,255,255,255,255,0,255,0,109,140,2,0,56,192,205,154,205,50,255,0,126,140,2,0,45,67,252,247,252,185,255,0,135,140,2,0,68,91,221,173,221,142,255,0,144,140,2,0,98,178,163,49,163,84,255,0,153,140,2,0,42,50,255,255,255,204,255,0,162,140,2,0,62,85,230,194,230,153,255,0,171,140,2,0,85,100,198,120,198,121,255,0,180,140,2,0,99,187,132,35,132,67,255,0,189,140,2,0,42,50,255,255,255,204,255,0,198,140,2,0,62,85,230,194,230,153,255,0,207,140,2,0,85,100,198,120,198,121,255,0,216,140,2,0,98,178,163,49,163,84,255,0,225,140,2,0,107,255,104,0,104,55,255,0,234,140,2,0,42,50,255,255,255,204,255,0,243,140,2,0,55,81,240,217,240,163,255,0,252,140,2,0,68,91,221,173,221,142,255,0,5,141,2,0,85,100,198,120,198,121,255,0,14,141,2,0,98,178,163,49,163,84,255,0,23,141,2,0,107,255,104,0,104,55,255,0,32,141,2,0,42,50,255,255,255,204,255,0,41,141,2,0,55,81,240,217,240,163,255,0,50,141,2,0,68,91,221,173,221,142,255,0,59,141,2,0,85,100,198,120,198,121,255,0,68,141,2,0,96,158,171,65,171,93,255,0,77,141,2,0,99,187,132,35,132,67,255,0,86,141,2,0,108,255,90,0,90,50,255,0,95,141,2,0,42,25,255,255,255,229,255,0,104,141,2,0,45,67,252,247,252,185,255,0,113,141,2,0,55,81,240,217,240,163,255,0,122,141,2,0,68,91,221,173,221,142,255,0,131,141,2,0,85,100,198,120,198,121,255,0,140,141,2,0,96,158,171,65,171,93,255,0,149,141,2,0,99,187,132,35,132,67,255,0,158,141,2,0,108,255,90,0,90,50,255,0,167,141,2,0,42,25,255,255,255,229,255,0,176,141,2,0,45,67,252,247,252,185,255,0,185,141,2,0,55,81,240,217,240,163,255,0,194,141,2,0,68,91,221,173,221,142,255,0,203,141,2,0,85,100,198,120,198,121,255,0,212,141,2,0,96,158,171,65,171,93,255,0,221,141,2,0,99,187,132,35,132,67,255,0,230,141,2,0,107,255,104,0,104,55,255,0,239,141,2,0,110,255,69,0,69,41,255,0,248,141,2,0,49,73,248,237,248,177,255,0,3,142,2,0,117,97,205,127,205,187,255,0,14,142,2,0,144,194,184,44,127,184,255,0,25,142,2,0,42,50,255,255,255,204,255,0,36,142,2,0,99,66,218,161,218,180,255,0,47,142,2,0,132,170,196,65,182,196,255,0,58,142,2,0,150,203,168,34,94,168,255,0,69,142,2,0,42,50,255,255,255,204,255,0,80,142,2,0,99,66,218,161,218,180,255,0,91,142,2,0,132,170,196,65,182,196,255,0,102,142,2,0,144,194,184,44,127,184,255,0,113,142,2,0,164,191,148,37,52,148,255,0,124,142,2,0,42,50,255,255,255,204,255,0,135,142,2,0,69,58,233,199,233,180,255,0,146,142,2,0,117,97,205,127,205,187,255,0,157,142,2,0,132,170,196,65,182,196,255,0,168,142,2,0,144,194,184,44,127,184,255,0,179,142,2,0,164,191,148,37,52,148,255,0,190,142,2,0,42,50,255,255,255,204,255,0,201,142,2,0,69,58,233,199,233,180,255,0,212,142,2,0,117,97,205,127,205,187,255,0,223,142,2,0,132,170,196,65,182,196,255,0,234,142,2,0,139,216,192,29,145,192,255,0,245,142,2,0,150,203,168,34,94,168,255,0,0,143,2,0,158,231,132,12,44,132,255,0,11,143,2,0,42,38,255,255,255,217,255,0,22,143,2,0,49,73,248,237,248,177,255,0,33,143,2,0,69,58,233,199,233,180,255,0,44,143,2,0,117,97,205,127,205,187,255,0,55,143,2,0,132,170,196,65,182,196,255,0,66,143,2,0,139,216,192,29,145,192,255,0,77,143,2,0,150,203,168,34,94,168,255,0,88,143,2,0,158,231,132,12,44,132,255,0,99,143,2,0,42,38,255,255,255,217,255,0,110,143,2,0,49,73,248,237,248,177,255,0,121,143,2,0,69,58,233,199,233,180,255,0,132,143,2,0,117,97,205,127,205,187,255,0,143,143,2,0,132,170,196,65,182,196,255,0,154,143,2,0,139,216,192,29,145,192,255,0,165,143,2,0,150,203,168,34,94,168,255,0,176,143,2,0,164,191,148,37,52,148,255,0,187,143,2,0,158,231,88,8,29,88,255,0,198,143,2,0,37,66,255,255,247,188,255,0,209,143,2,0,28,175,254,254,196,79,255,0,220,143,2,0,16,238,217,217,95,14,255,0,231,143,2,0,42,42,255,255,255,212,255,0,242,143,2,0,28,112,254,254,217,142,255,0,253,143,2,0,22,213,254,254,153,41,255,0,8,144,2,0,15,252,204,204,76,2,255,0,19,144,2,0,42,42,255,255,255,212,255,0,30,144,2,0,28,112,254,254,217,142,255,0,41,144,2,0,22,213,254,254,153,41,255,0,52,144,2,0,16,238,217,217,95,14,255,0,63,144,2,0,13,248,153,153,52,4,255,0,74,144,2,0,42,42,255,255,255,212,255,0,85,144,2,0,31,109,254,254,227,145,255,0,96,144,2,0,28,175,254,254,196,79,255,0,107,144,2,0,22,213,254,254,153,41,255,0,118,144,2,0,16,238,217,217,95,14,255,0,129,144,2,0,13,248,153,153,52,4,255,0,140,144,2,0,42,42,255,255,255,212,255,0,151,144,2,0,31,109,254,254,227,145,255,0,162,144,2,0,28,175,254,254,196,79,255,0,173,144,2,0,22,213,254,254,153,41,255,0,184,144,2,0,18,233,236,236,112,20,255,0,195,144,2,0,15,252,204,204,76,2,255,0,206,144,2,0,12,247,140,140,45,4,255,0,217,144,2,0,42,25,255,255,255,229,255,0,228,144,2,0,37,66,255,255,247,188,255,0,239,144,2,0,31,109,254,254,227,145,255,0,250,144,2,0,28,175,254,254,196,79,255,0,5,145,2,0,22,213,254,254,153,41,255,0,16,145,2,0,18,233,236,236,112,20,255,0,27,145,2,0,15,252,204,204,76,2,255,0,38,145,2,0,12,247,140,140,45,4,255,0,49,145,2,0,42,25,255,255,255,229,255,0,60,145,2,0,37,66,255,255,247,188,255,0,71,145,2,0,31,109,254,254,227,145,255,0,82,145,2,0,28,175,254,254,196,79,255,0,93,145,2,0,22,213,254,254,153,41,255,0,104,145,2,0,18,233,236,236,112,20,255,0,115,145,2,0,15,252,204,204,76,2,255,0,126,145,2,0,13,248,153,153,52,4,255,0,137,145,2,0,13,240,102,102,37,6,255,0,148,145,2,0,34,95,255,255,237,160,255,0,159,145,2,0,24,178,254,254,178,76,255,0,170,145,2,0,5,221,240,240,59,32,255,0,181,145,2,0,42,77,255,255,255,178,255,0,192,145,2,0,29,162,254,254,204,92,255,0,203,145,2,0,17,194,253,253,141,60,255,0,214,145,2,0,254,225,227,227,26,28,255,0,225,145,2,0,42,77,255,255,255,178,255,0,236,145,2,0,29,162,254,254,204,92,255,0,247,145,2,0,17,194,253,253,141,60,255,0,2,146,2,0,5,221,240,240,59,32,255,0,13,146,2,0,246,255,189,189,0,38,255,0,24,146,2,0,42,77,255,255,255,178,255,0,35,146,2,0,30,136,254,254,217,118,255,0,46,146,2,0,24,178,254,254,178,76,255,0,57,146,2,0,17,194,253,253,141,60,255,0,68,146,2,0,5,221,240,240,59,32,255,0,79,146,2,0,246,255,189,189,0,38,255,0,90,146,2,0,42,77,255,255,255,178,255,0,101,146,2,0,30,136,254,254,217,118,255,0,112,146,2,0,24,178,254,254,178,76,255,0,123,146,2,0,17,194,253,253,141,60,255,0,134,146,2,0,7,212,252,252,78,42,255,0,145,146,2,0,254,225,227,227,26,28,255,0,156,146,2,0,245,255,177,177,0,38,255,0,167,146,2,0,42,50,255,255,255,204,255,0,178,146,2,0,34,95,255,255,237,160,255,0,189,146,2,0,30,136,254,254,217,118,255,0,200,146,2,0,24,178,254,254,178,76,255,0,211,146,2,0,17,194,253,253,141,60,255,0,222,146,2,0,7,212,252,252,78,42,255,0,233,146,2,0,254,225,227,227,26,28,255,0,244,146,2,0,245,255,177,177,0,38,255,0,255,146,2,0,42,50,255,255,255,204,255,0,10,147,2,0,34,95,255,255,237,160,255,0,21,147,2,0,30,136,254,254,217,118,255,0,32,147,2,0,24,178,254,254,178,76,255,0,43,147,2,0,17,194,253,253,141,60,255,0,54,147,2,0,7,212,252,252,78,42,255,0,65,147,2,0,254,225,227,227,26,28,255,0,76,147,2,0,246,255,189,189,0,38,255,0,87,147,2,0,242,255,128,128,0,38,255,0,98,147,2,0,147,15,255,240,248,255,255,0,108,147,2,0,24,35,250,250,235,215,255,0,121,147,2,0,23,36,255,255,239,219,255,0,135,147,2,0,23,36,238,238,223,204,255,0,149,147,2,0,23,36,205,205,192,176,255,0,163,147,2,0,24,34,139,139,131,120,255,0,177,147,2,0,113,128,255,127,255,212,255,0,188,147,2,0,113,128,255,127,255,212,255,0,200,147,2,0,113,128,238,118,238,198,255,0,212,147,2,0,113,128,205,102,205,170,255,0,224,147,2,0,113,128,139,69,139,116,255,0,236,147,2,0,127,15,255,240,255,255,255,0,242,147,2,0,127,15,255,240,255,255,255,0,249,147,2,0,127,15,238,224,238,238,255,0,0,148,2,0,127,14,205,193,205,205,255,0,7,148,2,0,127,14,139,131,139,139,255,0,14,148,2,0,42,26,245,245,245,220,255,0,20,148,2,0,23,58,255,255,228,196,255,0,27,148,2,0,23,58,255,255,228,196,255,0,35,148,2,0,23,58,238,238,213,183,255,0,43,148,2,0,22,58,205,205,183,158,255,0,51,148,2,0,23,58,139,139,125,107,255,0,69,171,2,0,0,0,0,0,0,0,255,0,59,148,2,0,25,49,255,255,235,205,255,0,74,148,2,0,170,255,255,0,0,255,255,0,79,148,2,0,170,255,255,0,0,255,255,0,85,148,2,0,170,255,238,0,0,238,255,0,91,148,2,0,170,255,205,0,0,205,255,0,97,148,2,0,170,255,139,0,0,139,255,0,103,148,2,0,192,206,226,138,43,226,255,0,114,148,2,0,0,190,165,165,42,42,255,0,120,148,2,0,0,191,255,255,64,64,255,0,127,148,2,0,0,191,238,238,59,59,255,0,134,148,2,0,0,191,205,205,51,51,255,0,141,148,2,0,0,190,139,139,35,35,255,0,148,148,2,0,23,99,222,222,184,135,255,0,158,148,2,0,23,100,255,255,211,155,255,0,169,148,2,0,23,99,238,238,197,145,255,0,180,148,2,0,23,99,205,205,170,125,255,0,191,148,2,0,23,99,139,139,115,85,255,0,202,148,2,0,128,103,160,95,158,160,255,0,212,148,2,0,131,103,255,152,245,255,255,0,223,148,2,0,131,102,238,142,229,238,255,0,234,148,2,0,131,103,205,122,197,205,255,0,245,148,2,0,131,102,139,83,134,139,255,0,0,149,2,0,63,255,255,127,255,0,255,0,11,149,2,0,63,255,255,127,255,0,255,0,23,149,2,0,63,255,238,118,238,0,255,0,35,149,2,0,63,255,205,102,205,0,255,0,47,149,2,0,63,255,139,69,139,0,255,0,59,149,2,0,17,218,210,210,105,30,255,0,69,149,2,0,17,219,255,255,127,36,255,0,80,149,2,0,17,219,238,238,118,33,255,0,91,149,2,0,17,218,205,205,102,29,255,0,102,149,2,0,17,220,139,139,69,19,255,0,113,149,2,0,11,175,255,255,127,80,255,0,119,149,2,0,7,169,255,255,114,86,255,0,126,149,2,0,6,169,238,238,106,80,255,0,133,149,2,0,6,169,205,205,91,69,255,0,140,149,2,0,6,168,139,139,62,47,255,0,147,149,2,0,154,147,237,100,149,237,255,0,162,149,2,0,33,34,255,255,248,220,255,0,171,149,2,0,33,34,255,255,248,220,255,0,181,149,2,0,34,35,238,238,232,205,255,0,191,149,2,0,34,34,205,205,200,177,255,0,201,149,2,0,35,34,139,139,136,120,255,0,211,149,2,0,246,231,220,220,20,60,255,0,219,149,2,0,127,255,255,0,255,255,255,0,224,149,2,0,127,255,255,0,255,255,255,0,230,149,2,0,127,255,238,0,238,238,255,0,236,149,2,0,127,255,205,0,205,205,255,0,242,149,2,0,127,255,139,0,139,139,255,0,248,149,2,0,30,239,184,184,134,11,255,0,6,150,2,0,30,240,255,255,185,15,255,0,21,150,2,0,30,240,238,238,173,14,255,0,36,150,2,0,30,240,205,205,149,12,255,0,51,150,2,0,30,240,139,139,101,8,255,0,66,150,2,0,85,255,100,0,100,0,255,0,76,150,2],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+74232);allocate([39,110,189,189,183,107,255,0,86,150,2,0,58,142,107,85,107,47,255,0,101,150,2,0,58,143,255,202,255,112,255,0,117,150,2,0,58,143,238,188,238,104,255,0,133,150,2,0,58,143,205,162,205,90,255,0,149,150,2,0,58,143,139,110,139,61,255,0,165,150,2,0,23,255,255,255,140,0,255,0,176,150,2,0,21,255,255,255,127,0,255,0,188,150,2,0,21,255,238,238,118,0,255,0,200,150,2,0,21,255,205,205,102,0,255,0,212,150,2,0,21,255,139,139,69,0,255,0,224,150,2,0,198,192,204,153,50,204,255,0,235,150,2,0,198,193,255,191,62,255,255,0,247,150,2,0,198,192,238,178,58,238,255,0,3,151,2,0,198,192,205,154,50,205,255,0,15,151,2,0,198,192,139,104,34,139,255,0,27,151,2,0,10,121,233,233,150,122,255,0,38,151,2,0,85,61,188,143,188,143,255,0,51,151,2,0,85,62,255,193,255,193,255,0,65,151,2,0,85,62,238,180,238,180,255,0,79,151,2,0,85,62,205,155,205,155,255,0,93,151,2,0,85,62,139,105,139,105,255,0,107,151,2,0,175,143,139,72,61,139,255,0,121,151,2,0,127,103,79,47,79,79,255,0,135,151,2,0,127,104,255,151,255,255,255,0,150,151,2,0,127,103,238,141,238,238,255,0,165,151,2,0,127,104,205,121,205,205,255,0,180,151,2,0,127,104,139,82,139,139,255,0,195,151,2,0,127,103,79,47,79,79,255,0,209,151,2,0,128,255,209,0,206,209,255,0,223,151,2,0,199,255,211,148,0,211,255,0,234,151,2,0,232,235,255,255,20,147,255,0,243,151,2,0,232,235,255,255,20,147,255,0,253,151,2,0,232,235,238,238,18,137,255,0,7,152,2,0,232,235,205,205,16,118,255,0,17,152,2,0,231,236,139,139,10,80,255,0,27,152,2,0,138,255,255,0,191,255,255,0,39,152,2,0,138,255,255,0,191,255,255,0,52,152,2,0,138,255,238,0,178,238,255,0,65,152,2,0,138,255,205,0,154,205,255,0,78,152,2,0,138,255,139,0,104,139,255,0,91,152,2,0,0,0,105,105,105,105,255,0,99,152,2,0,0,0,105,105,105,105,255,0,107,152,2,0,148,225,255,30,144,255,255,0,118,152,2,0,148,225,255,30,144,255,255,0,130,152,2,0,148,225,238,28,134,238,255,0,142,152,2,0,148,225,205,24,116,205,255,0,154,152,2,0,148,225,139,16,78,139,255,0,166,152,2,0,0,206,178,178,34,34,255,0,176,152,2,0,0,207,255,255,48,48,255,0,187,152,2,0,0,207,238,238,44,44,255,0,198,152,2,0,0,207,205,205,38,38,255,0,209,152,2,0,0,207,139,139,26,26,255,0,220,152,2,0,28,15,255,255,250,240,255,0,232,152,2,0,85,192,139,34,139,34,255,0,244,152,2,0,0,0,220,220,220,220,255,0,254,152,2,0,170,7,255,248,248,255,255,0,9,153,2,0,35,255,255,255,215,0,255,0,14,153,2,0,35,255,255,255,215,0,255,0,20,153,2,0,35,255,238,238,201,0,255,0,26,153,2,0,35,255,205,205,173,0,255,0,32,153,2,0,35,255,139,139,117,0,255,0,38,153,2,0,30,217,218,218,165,32,255,0,48,153,2,0,30,218,255,255,193,37,255,0,59,153,2,0,30,218,238,238,180,34,255,0,70,153,2,0,30,218,205,205,155,29,255,0,81,153,2,0,30,218,139,139,105,20,255,0,92,153,2,0,0,0,192,192,192,192,255,0,97,153,2,0,0,0,0,0,0,0,255,0,103,153,2,0,0,0,3,3,3,3,255,0,109,153,2,0,0,0,26,26,26,26,255,0,116,153,2,0,0,0,255,255,255,255,255,0,124,153,2,0,0,0,28,28,28,28,255,0,131,153,2,0,0,0,31,31,31,31,255,0,138,153,2,0,0,0,33,33,33,33,255,0,145,153,2,0,0,0,36,36,36,36,255,0,152,153,2,0,0,0,38,38,38,38,255,0,159,153,2,0,0,0,41,41,41,41,255,0,166,153,2,0,0,0,43,43,43,43,255,0,173,153,2,0,0,0,46,46,46,46,255,0,180,153,2,0,0,0,48,48,48,48,255,0,187,153,2,0,0,0,5,5,5,5,255,0,193,153,2,0,0,0,51,51,51,51,255,0,200,153,2,0,0,0,54,54,54,54,255,0,207,153,2,0,0,0,56,56,56,56,255,0,214,153,2,0,0,0,59,59,59,59,255,0,221,153,2,0,0,0,61,61,61,61,255,0,228,153,2,0,0,0,64,64,64,64,255,0,235,153,2,0,0,0,66,66,66,66,255,0,242,153,2,0,0,0,69,69,69,69,255,0,249,153,2,0,0,0,71,71,71,71,255,0,0,154,2,0,0,0,74,74,74,74,255,0,7,154,2,0,0,0,8,8,8,8,255,0,13,154,2,0,0,0,77,77,77,77,255,0,20,154,2,0,0,0,79,79,79,79,255,0,27,154,2,0,0,0,82,82,82,82,255,0,34,154,2,0,0,0,84,84,84,84,255,0,41,154,2,0,0,0,87,87,87,87,255,0,48,154,2,0,0,0,89,89,89,89,255,0,55,154,2,0,0,0,92,92,92,92,255,0,62,154,2,0,0,0,94,94,94,94,255,0,69,154,2,0,0,0,97,97,97,97,255,0,76,154,2,0,0,0,99,99,99,99,255,0,83,154,2,0,0,0,10,10,10,10,255,0,89,154,2,0,0,0,102,102,102,102,255,0,96,154,2,0,0,0,105,105,105,105,255,0,103,154,2,0,0,0,107,107,107,107,255,0,110,154,2,0,0,0,110,110,110,110,255,0,117,154,2,0,0,0,112,112,112,112,255,0,124,154,2,0,0,0,115,115,115,115,255,0,131,154,2,0,0,0,117,117,117,117,255,0,138,154,2,0,0,0,120,120,120,120,255,0,145,154,2,0,0,0,122,122,122,122,255,0,152,154,2,0,0,0,125,125,125,125,255,0,159,154,2,0,0,0,13,13,13,13,255,0,165,154,2,0,0,0,127,127,127,127,255,0,172,154,2,0,0,0,130,130,130,130,255,0,179,154,2,0,0,0,133,133,133,133,255,0,186,154,2,0,0,0,135,135,135,135,255,0,193,154,2,0,0,0,138,138,138,138,255,0,200,154,2,0,0,0,140,140,140,140,255,0,207,154,2,0,0,0,143,143,143,143,255,0,214,154,2,0,0,0,145,145,145,145,255,0,221,154,2,0,0,0,148,148,148,148,255,0,228,154,2,0,0,0,150,150,150,150,255,0,235,154,2,0,0,0,15,15,15,15,255,0,241,154,2,0,0,0,153,153,153,153,255,0,248,154,2,0,0,0,156,156,156,156,255,0,255,154,2,0,0,0,158,158,158,158,255,0,6,155,2,0,0,0,161,161,161,161,255,0,13,155,2,0,0,0,163,163,163,163,255,0,20,155,2,0,0,0,166,166,166,166,255,0,27,155,2,0,0,0,168,168,168,168,255,0,34,155,2,0,0,0,171,171,171,171,255,0,41,155,2,0,0,0,173,173,173,173,255,0,48,155,2,0,0,0,176,176,176,176,255,0,55,155,2,0,0,0,18,18,18,18,255,0,61,155,2,0,0,0,179,179,179,179,255,0,68,155,2,0,0,0,181,181,181,181,255,0,75,155,2,0,0,0,184,184,184,184,255,0,82,155,2,0,0,0,186,186,186,186,255,0,89,155,2,0,0,0,189,189,189,189,255,0,96,155,2,0,0,0,191,191,191,191,255,0,103,155,2,0,0,0,194,194,194,194,255,0,110,155,2,0,0,0,196,196,196,196,255,0,117,155,2,0,0,0,199,199,199,199,255,0,124,155,2,0,0,0,201,201,201,201,255,0,131,155,2,0,0,0,20,20,20,20,255,0,137,155,2,0,0,0,204,204,204,204,255,0,144,155,2,0,0,0,207,207,207,207,255,0,151,155,2,0,0,0,209,209,209,209,255,0,158,155,2,0,0,0,212,212,212,212,255,0,165,155,2,0,0,0,214,214,214,214,255,0,172,155,2,0,0,0,217,217,217,217,255,0,179,155,2,0,0,0,219,219,219,219,255,0,186,155,2,0,0,0,222,222,222,222,255,0,193,155,2,0,0,0,224,224,224,224,255,0,200,155,2,0,0,0,227,227,227,227,255,0,207,155,2,0,0,0,23,23,23,23,255,0,213,155,2,0,0,0,229,229,229,229,255,0,220,155,2,0,0,0,232,232,232,232,255,0,227,155,2,0,0,0,235,235,235,235,255,0,234,155,2,0,0,0,237,237,237,237,255,0,241,155,2,0,0,0,240,240,240,240,255,0,248,155,2,0,0,0,242,242,242,242,255,0,255,155,2,0,0,0,245,245,245,245,255,0,6,156,2,0,0,0,247,247,247,247,255,0,13,156,2,0,0,0,250,250,250,250,255,0,20,156,2,0,0,0,252,252,252,252,255,0,27,156,2,0,85,255,255,0,255,0,255,0,33,156,2,0,85,255,255,0,255,0,255,0,40,156,2,0,85,255,238,0,238,0,255,0,47,156,2,0,85,255,205,0,205,0,255,0,54,156,2,0,85,255,139,0,139,0,255,0,61,156,2,0,59,208,255,173,255,47,255,0,73,156,2,0,0,0,192,192,192,192,255,0,78,156,2,0,0,0,0,0,0,0,255,0,84,156,2,0,0,0,3,3,3,3,255,0,90,156,2,0,0,0,26,26,26,26,255,0,97,156,2,0,0,0,255,255,255,255,255,0,105,156,2,0,0,0,28,28,28,28,255,0,112,156,2,0,0,0,31,31,31,31,255,0,119,156,2,0,0,0,33,33,33,33,255,0,126,156,2,0,0,0,36,36,36,36,255,0,133,156,2,0,0,0,38,38,38,38,255,0,140,156,2,0,0,0,41,41,41,41,255,0,147,156,2,0,0,0,43,43,43,43,255,0,154,156,2,0,0,0,46,46,46,46,255,0,161,156,2,0,0,0,48,48,48,48,255,0,168,156,2,0,0,0,5,5,5,5,255,0,174,156,2,0,0,0,51,51,51,51,255,0,181,156,2,0,0,0,54,54,54,54,255,0,188,156,2,0,0,0,56,56,56,56,255,0,195,156,2,0,0,0,59,59,59,59,255,0,202,156,2,0,0,0,61,61,61,61,255,0,209,156,2,0,0,0,64,64,64,64,255,0,216,156,2,0,0,0,66,66,66,66,255,0,223,156,2,0,0,0,69,69,69,69,255,0,230,156,2,0,0,0,71,71,71,71,255,0,237,156,2,0,0,0,74,74,74,74,255,0,244,156,2,0,0,0,8,8,8,8,255,0,250,156,2,0,0,0,77,77,77,77,255,0,1,157,2,0,0,0,79,79,79,79,255,0,8,157,2,0,0,0,82,82,82,82,255,0,15,157,2,0,0,0,84,84,84,84,255,0,22,157,2,0,0,0,87,87,87,87,255,0,29,157,2,0,0,0,89,89,89,89,255,0,36,157,2,0,0,0,92,92,92,92,255,0,43,157,2,0,0,0,94,94,94,94,255,0,50,157,2,0,0,0,97,97,97,97,255,0,57,157,2,0,0,0,99,99,99,99,255,0,64,157,2,0,0,0,10,10,10,10,255,0,70,157,2,0,0,0,102,102,102,102,255,0,77,157,2,0,0,0,105,105,105,105,255,0,84,157,2,0,0,0,107,107,107,107,255,0,91,157,2,0,0,0,110,110,110,110,255,0,98,157,2,0,0,0,112,112,112,112,255,0,105,157,2,0,0,0,115,115,115,115,255,0,112,157,2,0,0,0,117,117,117,117,255,0,119,157,2,0,0,0,120,120,120,120,255,0,126,157,2,0,0,0,122,122,122,122,255,0,133,157,2,0,0,0,125,125,125,125,255,0,140,157,2,0,0,0,13,13,13,13,255,0,146,157,2,0,0,0,127,127,127,127,255,0,153,157,2,0,0,0,130,130,130,130,255,0,160,157,2,0,0,0,133,133,133,133,255,0,167,157,2,0,0,0,135,135,135,135,255,0,174,157,2,0,0,0,138,138,138,138,255,0,181,157,2,0,0,0,140,140,140,140,255,0,188,157,2,0,0,0,143,143,143,143,255,0,195,157,2,0,0,0,145,145,145,145,255,0,202,157,2,0,0,0,148,148,148,148,255,0,209,157,2,0,0,0,150,150,150,150,255,0,216,157,2,0,0,0,15,15,15,15,255,0,222,157,2,0,0,0,153,153,153,153,255,0,229,157,2,0,0,0,156,156,156,156,255,0,236,157,2,0,0,0,158,158,158,158,255,0,243,157,2,0,0,0,161,161,161,161,255,0,250,157,2,0,0,0,163,163,163,163,255,0,1,158,2,0,0,0,166,166,166,166,255,0,8,158,2,0,0,0,168,168,168,168,255,0,15,158,2,0,0,0,171,171,171,171,255,0,22,158,2,0,0,0,173,173,173,173,255,0,29,158,2,0,0,0,176,176,176,176,255,0,36,158,2,0,0,0,18,18,18,18,255,0,42,158,2,0,0,0,179,179,179,179,255,0,49,158,2,0,0,0,181,181,181,181,255,0,56,158,2,0,0,0,184,184,184,184,255,0,63,158,2,0,0,0,186,186,186,186,255,0,70,158,2,0,0,0,189,189,189,189,255,0,77,158,2,0,0,0,191,191,191,191,255,0,84,158,2,0,0,0,194,194,194,194,255,0,91,158,2,0,0,0,196,196,196,196,255,0,98,158,2,0,0,0,199,199,199,199,255,0,105,158,2,0,0,0,201,201,201,201,255,0,112,158,2,0,0,0,20,20,20,20,255,0,118,158,2,0,0,0,204,204,204,204,255,0,125,158,2,0,0,0,207,207,207,207,255,0,132,158,2,0,0,0,209,209,209,209,255,0,139,158,2,0,0,0,212,212,212,212,255,0,146,158,2,0,0,0,214,214,214,214,255,0,153,158,2,0,0,0,217,217,217,217,255,0,160,158,2,0,0,0,219,219,219,219,255,0,167,158,2,0,0,0,222,222,222,222,255,0,174,158,2,0,0,0,224,224,224,224,255,0,181,158,2,0,0,0,227,227,227,227,255,0,188,158,2,0,0,0,23,23,23,23,255,0,194,158,2,0,0,0,229,229,229,229,255,0,201,158,2,0,0,0,232,232,232,232,255,0,208,158,2,0,0,0,235,235,235,235,255,0,215,158,2,0,0,0,237,237,237,237,255,0,222,158,2,0,0,0,240,240,240,240,255,0,229,158,2,0,0,0,242,242,242,242,255,0,236,158,2,0,0,0,245,245,245,245,255,0,243,158,2,0,0,0,247,247,247,247,255,0,250,158,2,0,0,0,250,250,250,250,255,0,1,159,2,0,0,0,252,252,252,252,255,0,8,159,2,0,85,15,255,240,255,240,255,0,17,159,2,0,85,15,255,240,255,240,255,0,27,159,2,0,85,15,238,224,238,224,255,0,37,159,2,0,85,14,205,193,205,193,255,0,47,159,2,0,85,14,139,131,139,131,255,0,57,159,2,0,233,150,255,255,105,180,255,0,65,159,2,0,234,145,255,255,110,180,255,0,74,159,2,0,235,141,238,238,106,167,255,0,83,159,2,0,236,135,205,205,96,144,255,0,92,159,2,0,234,148,139,139,58,98,255,0,101,159,2,0,0,140,205,205,92,92,255,0,111,159,2,0,0,148,255,255,106,106,255,0,122,159,2,0,0,148,238,238,99,99,255,0,133,159,2,0,0,149,205,205,85,85,255,0,144,159,2,0,0,148,139,139,58,58,255,0,155,159,2,0,194,255,130,75,0,130,255,0,162,159,2,0,42,0,255,255,255,254,0,0,168,159,2,0,42,15,255,255,255,240,255,0,174,159,2,0,42,15,255,255,255,240,255,0,181,159,2,0,42,15,238,238,238,224,255,0,188,159,2,0,42,14,205,205,205,193,255,0,195,159,2,0,42,14,139,139,139,131,255,0,202,159,2,0,38,106,240,240,230,140,255,0,208,159,2,0,39,112,255,255,246,143,255,0,215,159,2,0,39,112,238,238,230,133,255,0,222,159,2,0,39,111,205,205,198,115,255,0,229,159,2,0,39,111,139,139,134,78,255,0,236,159,2,0,170,20,250,230,230,250,255,0,245,159,2,0,240,15,255,255,240,245,255,0,3,160,2,0,240,15,255,255,240,245,255,0,18,160,2,0,239,15,238,238,224,229,255,0,33,160,2,0,240,14,205,205,193,197,255,0,48,160,2,0,239,14,139,139,131,134,255,0,63,160,2,0,64,255,252,124,252,0,255,0,73,160,2,0,38,49,255,255,250,205,255,0,86,160,2,0,38,49,255,255,250,205,255,0,100,160,2,0,37,50,238,238,233,191,255,0,114,160,2,0,38,49,205,205,201,165,255,0,128,160,2,0,39,49,139,139,137,112,255,0,142,160,2,0,137,63,230,173,216,230,255,0,152,160,2,0,138,64,255,191,239,255,255,0,163,160,2,0,138,64,238,178,223,238,255,0,174,160,2,0,138,63,205,154,192,205,255,0,185,160,2,0,137,64,139,104,131,139,255,0,196,160,2,0,0,119,240,240,128,128,255,0,207,160,2,0,127,31,255,224,255,255,255,0,217,160,2,0,127,31,255,224,255,255,255,0,228,160,2,0,127,31,238,209,238,238,255,0,239,160,2,0,127,31,205,180,205,205,255,0,250,160,2,0,127,31,139,122,139,139,255,0,5,161,2,0,35,115,238,238,221,130,255,0,20,161,2,0,35,116,255,255,236,139,255,0,36,161,2,0,35,115,238,238,220,130,255,0,52,161,2,0,35,115,205,205,190,112,255,0,68,161,2,0,35,115,139,139,129,76,255,0,84,161,2,0,42,40,250,250,250,210,255,0,105,161,2,0,0,0,211,211,211,211,255,0,115,161,2,0,0,0,211,211,211,211,255,0,125,161,2,0,248,73,255,255,182,193,255,0,135,161,2,0,249,81,255,255,174,185,255,0,146,161,2,0,248,81,238,238,162,173,255,0,157,161,2,0,249,80,205,205,140,149,255,0,168,161,2,0,249,80,139,139,95,101,255,0,179,161,2,0,12,132,255,255,160,122,255,0,191,161,2,0,12,132,255,255,160,122,255,0,204,161,2,0,11,132,238,238,149,114,255,0,217,161,2,0,12,133,205,205,129,98,255,0,230,161,2,0,12,133,139,139,87,66,255,0,243,161,2,0,125,209,178,32,178,170,255,0,1,162,2,0,143,117,250,135,206,250,255,0,14,162,2,0,143,79,255,176,226,255,255,0,28,162,2,0,143,79,238,164,211,238,255,0,42,162,2,0,142,79,205,141,182,205,255,0,56,162,2,0,143,78,139,96,123,139,255,0,70,162,2,0,175,143,255,132,112,255,255,0,85,162,2,0,148,56,153,119,136,153,255,0,100,162,2,0,148,56,153,119,136,153,255,0,115,162,2,0,151,52,222,176,196,222,255,0,130,162,2,0,151,53,255,202,225,255,255,0,146,162,2,0,151,53,238,188,210,238,255,0,162,162,2,0,151,53,205,162,181,205,255,0,178,162,2,0,150,53,139,110,123,139,255,0,194,162,2,0,42,31,255,255,255,224,255,0,206,162,2,0,42,31,255,255,255,224,255,0,219,162,2,0,42,31,238,238,238,209,255,0,232,162,2,0,42,31,205,205,205,180,255,0,245,162,2,0,42,31,139,139,139,122,255,0,2,163,2,0,85,192,205,50,205,50,255,0,12,163,2,0,21,20,250,250,240,230,255,0,18,163,2,0,212,255,255,255,0,255,255,0,26,163,2,0,212,255,255,255,0,255,255,0,35,163,2,0,212,255,238,238,0,238,255,0,44,163,2,0,212,255,205,205,0,205,255,0,53,163,2,0,212,255,139,139,0,139,255,0,62,163,2,0,239,185,176,176,48,96,255,0,69,163,2,0,228,203,255,255,52,179,255,0,77,163,2,0,228,203,238,238,48,167,255,0,85,163,2,0,228,204,205,205,41,144,255,0,93,163,2,0,228,203,139,139,28,98,255,0,101,163,2,0,113,128,205,102,205,170,255,0,118,163,2,0,170,255,205,0,0,205,255,0,129,163,2,0,204,152,211,186,85,211,255,0,142,163,2,0,203,153,255,224,102,255,255,0,156,163,2,0,203,153,238,209,95,238,255,0,170,163,2,0,203,153,205,180,82,205,255,0,184,163,2,0,203,154,139,122,55,139,255,0,198,163,2,0,183,124,219,147,112,219,255,0,211,163,2,0,183,125,255,171,130,255,255,0,225,163,2,0,183,125,238,159,121,238,255,0,239,163,2,0,183,125,205,137,104,205,255,0,253,163,2,0,183,124,139,93,71,139,255,0,11,164,2,0,103,169,179,60,179,113,255,0,26,164,2,0,176,143,238,123,104,238,255,0,42,164,2,0,111,255,250,0,250,154,255,0,60,164,2,0,125,167,209,72,209,204,255,0,76,164,2,0,228,228,199,199,21,133,255,0,92,164,2,0,170,198,112,25,25,112,255,0,105,164,2,0,106,9,255,245,255,250,255,0,115,164,2,0,4,30,255,255,228,225,255,0,125,164,2,0,4,30,255,255,228,225,255,0,136,164,2,0,4,30,238,238,213,210,255,0,147,164,2,0,3,29,205,205,183,181,255,0,158,164,2,0,5,29,139,139,125,123,255,0,169,164,2,0,26,73,255,255,228,181,255,0,178,164,2,0,25,81,255,255,222,173,255,0,190,164,2,0,25,81,255,255,222,173,255,0,203,164,2,0,25,82,238,238,207,161,255,0,216,164,2,0,25,82,205,205,179,139,255,0,229,164,2,0,25,82,139,139,121,94,255,0,242,164,2,0,170,255,128,0,0,128,255,0,247,164,2,0,170,255,128,0,0,128,255,0,0,165,2,0,42,0,255,255,255,254,0,0,5,165,2,0,27,23,253,253,245,230,255,0,13,165,2,0,56,192,142,107,142,35,255,0,23,165,2,0,56,193,255,192,255,62,255,0,34,165,2,0,56,192,238,179,238,58,255,0,45,165,2,0,56,192,205,154,205,50,255,0,56,165,2,0,56,192,139,105,139,34,255,0,67,165,2,0,27,255,255,255,165,0,255,0,74,165,2,0,27,255,255,255,165,0,255,0,82,165,2,0,27,255,238,238,154,0,255,0,90,165,2,0,27,255,205,205,133,0,255,0,98,165,2,0,27,255,139,139,90,0,255,0,106,165,2,0,11,255,255,255,69,0,255,0,116,165,2,0,11,255,255,255,69,0,255,0,127,165,2,0,11,255,238,238,64,0,255,0,138,165,2,0,11,255,205,205,55,0,255,0,149,165,2,0,11,255,139,139,37,0,255,0,160,165,2,0,214,123,218,218,112,214,255,0,167,165,2,0,214,124,255,255,131,250,255,0,175,165,2,0,214,124,238,238,122,233,255,0,183,165,2,0,214,124,205,205,105,201,255,0,191,165,2,0,213,124,139,139,71,137,255,0,199,165,2,0,38,72,238,238,232,170,255,0,213,165,2,0,85,100,251,152,251,152,255,0,223,165,2,0,85,101,255,154,255,154,255,0,234,165,2,0,85,100,238,144,238,144,255,0,245,165,2,0,85,100,205,124,205,124,255,0,0,166,2,0,85,100,139,84,139,84,255,0,11,166,2,0,127,67,238,175,238,238,255,0,25,166,2,0,127,68,255,187,255,255,255,0,40,166,2,0,127,68,238,174,238,238,255,0,55,166,2,0,127,68,205,150,205,205,255,0,70,166,2,0,127,67,139,102,139,139,255,0,85,166,2,0,241,124,219,219,112,147,255,0,99,166,2,0,241,125,255,255,130,171,255,0,114,166,2,0,241,125,238,238,121,159,255,0,129,166,2,0,241,125,205,205,104,137,255,0,144,166,2,0,241,124,139,139,71,93,255,0,159,166,2,0,26,41,255,255,239,213,255,0,170,166,2,0,20,70,255,255,218,185,255,0,180,166,2,0,20,70,255,255,218,185,255,0,191,166,2,0,19,69,238,238,203,173,255,0,202,166,2,0,19,69,205,205,175,149,255,0,213,166,2,0,20,69,139,139,119,101,255,0,224,166,2,0,20,176,205,205,133,63,255,0,229,166,2,0,247,63,255,255,192,203,255,0,234,166,2,0,245,73,255,255,181,197,255,0,240,166,2,0,245,73,238,238,169,184,255,0,246,166,2,0,245,74,205,205,145,158,255,0,252,166,2,0,245,73,139,139,99,108,255,0,2,167,2,0,212,70,221,221,160,221,255,0,7,167,2,0,212,68,255,255,187,255,255,0,13,167,2,0,212,68,238,238,174,238,255,0,19,167,2,0,212,68,205,205,150,205,255,0,25,167,2,0,212,67,139,139,102,139,255,0,31,167,2,0,132,59,230,176,224,230,255,0,42,167,2,0,196,221,240,160,32,240,255,0,49,167,2,0,191,207,255,155,48,255,255,0,57,167,2,0,192,207,238,145,44,238,255,0,65,167,2,0,192,207,205,125,38,205,255,0,73,167,2,0,192,207,139,85,26,139,255,0,81,167,2,0,0,255,255,255,0,0,255,0,85,167,2,0,0,255,255,255,0,0,255,0,90,167,2,0,0,255,238,238,0,0,255,0,95,167,2,0,0,255,205,205,0,0,255,0,100,167,2,0,0,255,139,139,0,0,255,0,105,167,2,0,0,61,188,188,143,143,255,0,115,167,2,0,0,62,255,255,193,193,255,0,126,167,2,0,0,62,238,238,180,180,255,0,137,167,2,0,0,62,205,205,155,155,255,0,148,167,2,0,0,62,139,139,105,105,255,0,159,167,2,0,159,181,225,65,105,225,255,0,169,167,2,0,159,183,255,72,118,255,255,0,180,167,2,0,159,183,238,67,110,238,255,0,191,167,2,0,159,182,205,58,95,205,255,0,202,167,2,0,159,183,139,39,64,139,255,0,213,167,2,0,17,220,139,139,69,19,255,0,225,167,2,0,4,138,250,250,128,114,255,0,232,167,2,0,9,150,255,255,140,105,255,0,240,167,2,0,9,150,238,238,130,98,255,0,248,167,2,0,9,150,205,205,112,84,255,0,0,168,2,0,9,150,139,139,76,57,255,0,8,168,2,0,19,154,244,244,164,96,255,0,19,168,2,0,103,170,139,46,139,87,255,0,28,168,2,0,103,171,255,84,255,159,255,0,38,168,2,0,103,171,238,78,238,148,255,0,48,168,2,0,103,171,205,67,205,128,255,0,58,168,2,0,103,170,139,46,139,87,255,0,68,168,2,0,17,16,255,255,245,238,255,0,77,168,2,0,17,16,255,255,245,238,255,0,87,168,2,0,18,17,238,238,229,222,255,0,97,168,2,0,18,17,205,205,197,191,255,0,107,168,2,0,18,16,139,139,134,130,255,0,117,168,2,0,13,183,160,160,82,45,255,0,124,168,2,0,13,184,255,255,130,71,255,0,132,168,2,0,13,184,238,238,121,66,255,0,140,168,2,0,13,184,205,205,104,57,255,0,148,168,2,0,13,185,139,139,71,38,255,0,156,168,2,0,139,108,235,135,206,235,255,0,164,168,2,0,144,120,255,135,206,255,255,0,173,168,2,0,144,120,238,126,192,238,255,0,182,168,2,0,144,120,205,108,166,205,255,0,191,168,2,0,145,119,139,74,112,139,255,0,200,168,2,0,175,143,205,106,90,205,255,0,210,168,2,0,175,144,255,131,111,255,255,0,221,168,2,0,175,144,238,122,103,238,255,0,232,168,2,0,175,144,205,105,89,205,255,0,243,168,2,0,175,144,139,71,60,139,255,0,254,168,2,0,148,56,144,112,128,144,255,0,8,169,2,0,149,56,255,198,226,255,255,0,19,169,2,0,149,56,238,185,211,238,255,0,30,169,2,0,148,57,205,159,182,205,255,0,41,169,2,0,149,56,139,108,123,139,255,0,52,169,2,0,148,56,144,112,128,144,255,0,62,169,2,0,0,5,255,255,250,250,255,0,67,169,2,0,0,5,255,255,250,250,255,0,73,169,2,0,0,5,238,238,233,233,255,0,79,169,2,0,0,4,205,205,201,201,255,0,85,169,2,0,0,3,139,139,137,137,255,0,91,169,2,0,106,255,255,0,255,127,255,0,103,169,2,0,106,255,255,0,255,127,255,0,116,169,2,0,106,255,238,0,238,118,255,0,129,169,2,0,106,255,205,0,205,102,255,0,142,169,2,0,106,255,139,0,139,69,255,0,155,169,2,0,146,155,180,70,130,180,255,0,165,169,2,0,146,156,255,99,184,255,255,0,176,169,2,0,146,156,238,92,172,238,255,0,187,169,2,0,146,156,205,79,148,205,255,0,198,169,2,0,147,155,139,54,100,139,255,0,209,169,2,0,24,84,210,210,180,140,255,0,213,169,2,0,20,176,255,255,165,79,255,0,218,169,2,0,20,176,238,238,154,73,255,0,223,169,2,0,20,176,205,205,133,63,255,0,228,169,2,0,20,176,139,139,90,43,255,0,233,169,2,0,212,29,216,216,191,216,255,0,241,169,2,0,212,30,255,255,225,255,255,0,250,169,2,0,212,30,238,238,210,238,255,0,3,170,2,0,212,29,205,205,181,205,255,0,12,170,2,0,212,29,139,139,123,139,255,0,21,170,2,0,6,184,255,255,99,71,255,0,28,170,2,0,6,184,255,255,99,71,255,0,36,170,2,0,6,184,238,238,92,66,255,0,44,170,2,0,6,184,205,205,79,57,255,0,52,170,2,0,6,185,139,139,54,38,255,0,70,173,2,0,42,0,255,255,255,254,0,0,60,170,2,0,123,182,224,64,224,208,255,0,70,170,2,0,129,255,255,0,245,255,255,0,81,170,2,0,129,255,238,0,229,238,255,0,92,170,2,0,129,255,205,0,197,205,255,0,103,170,2,0,129,255,139,0,134,139,255,0,114,170,2,0,212,115,238,238,130,238,255,0,121,170,2,0,227,215,208,208,32,144,255,0,131,170,2,0,235,193,255,255,62,150,255,0,142,170,2,0,235,192,238,238,58,140,255,0,153,170,2,0,235,192,205,205,50,120,255,0,164,170,2,0,235,192,139,139,34,82,255,0,175,170,2,0,27,68,245,245,222,179,255,0,181,170,2,0,27,69,255,255,231,186,255,0,188,170,2,0,27,68,238,238,216,174,255,0,195,170,2,0,27,68,205,205,186,150,255,0,202,170,2,0,27,67,139,139,126,102,255,0,209,170,2,0,0,0,255,255,255,255,255,0,215,170,2,0,0,0,245,245,245,245,255,0,226,170,2,0,42,255,255,255,255,0,255,0,233,170,2,0,42,255,255,255,255,0,255,0,241,170,2,0,42,255,238,238,238,0,255,0,249,170,2,0,42,255,205,205,205,0,255,0,1,171,2,0,42,255,139,139,139,0,255,0,9,171,2,0,56,192,205,154,205,50,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,227,175,2,0,228,172,2,0,230,172,2,0,232,172,2,0,234,172,2,0,236,172,2,0,238,172,2,0,240,172,2,0,242,172,2,0,244,172,2,0,246,172,2,0,249,172,2,0,252,172,2,0,255,172,2,0,2,173,2,0,5,173,2,0,8,173,2,0,11,173,2,0,14,173,2,0,17,173,2,0,20,173,2,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,13,0,0,0,51,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,173,2,0,175,174,2,0,8,0,0,0,16,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,16,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,173,185,2,0,165,185,2,0,63,186,2,0,9,0,0,0,69,186,2,0,10,0,0,0,78,186,2,0,11,0,0,0,144,186,2,0,12,0,0,0,150,186,2,0,13,0,0,0,155,186,2,0,14,0,0,0,78,186,2,0,15,0,0,0,35,187,2,0,16,0,0,0,42,187,2,0,17,0,0,0,50,187,2,0,18,0,0,0,57,187,2,0,19,0,0,0,69,187,2,0,20,0,0,0,144,186,2,0,21,0,0,0,81,187,2,0,22,0,0,0,89,187,2,0,23,0,0,0,99,187,2,0,24,0,0,0,113,187,2,0,25,0,0,0,120,187,2,0,26,0,0,0,125,187,2,0,27,0,0,0,128,187,2,0,28,0,0,0,133,187,2,0,29,0,0,0,141,187,2,0,30,0,0,0,147,187,2,0,31,0,0,0,153,187,2,0,32,0,0,0,160,187,2,0,33,0,0,0,166,187,2,0,33,0,0,0,174,187,2,0,34,0,0,0,181,187,2,0,35,0,0,0,78,186,2,0,36,0,0,0,42,187,2,0,17,0,0,0,50,187,2,0,18,0,0,0,172,189,2,0,37,0,0,0,57,187,2,0,19,0,0,0,69,187,2,0,20,0,0,0,144,186,2,0,21,0,0,0,183,189,2,0,38,0,0,0,89,187,2,0,23,0,0,0,99,187,2,0,24,0,0,0,113,187,2,0,25,0,0,0,120,187,2,0,26,0,0,0,125,187,2,0,27,0,0,0,128,187,2,0,28,0,0,0,191,189,2,0,39,0,0,0,141,187,2,0,30,0,0,0,147,187,2,0,31,0,0,0,153,187,2,0,32,0,0,0,160,187,2,0,33,0,0,0,166,187,2,0,33,0,0,0,174,187,2,0,34,0,0,0,181,187,2,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,164,191,2,0,178,191,2,0,191,191,2,0,208,191,2,0,240,191,2,0,255,191,2,0,17,192,2,0,32,192,2,0,52,192,2,0,80,192,2,0,115,192,2,0,132,192,2,0,159,192,2,0,179,192,2,0,217,192,2,0,244,192,2,0,30,193,2,0,77,193,2,0,94,193,2,0,145,193,2,0,168,193,2,0,214,193,2,0,241,193,2,0,36,194,2,0,72,194,2,0,124,194,2,0,169,194,2,0,184,194,2,0,210,194,2,0,248,194,2,0,24,195,2,0,57,195,2,0,91,195,2,0,108,195,2,0,129,195,2,0,145,195,2,0,162,195,2,0,206,195,2,0,30,196,2,0,89,196,2,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,6,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,4,254,255,255,135,254,255,255,7,0,0,0,0,0,0,0,0,255,255,127,255,255,255,127,255,255,255,255,255,255,255,243,127,254,253,255,255,255,255,255,127,255,255,255,255,255,255,255,255,15,224,255,255,255,255,49,252,255,255,255,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,1,0,248,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,215,255,255,251,255,255,255,255,127,127,84,253,255,15,0,254,223,255,255,255,255,255,255,255,255,254,223,255,255,255,255,3,0,255,255,255,255,255,255,159,25,255,255,255,207,63,3,0,0,0,0,0,0,254,255,255,255,127,2,254,255,255,255,127,0,0,0,0,0,0,0,0,0,255,255,255,7,7,0,0,0,0,0,254,255,255,7,254,7,0,0,0,0,254,255,255,255,255,255,255,255,255,124,255,127,47,0,96,0,0,0,224,255,255,255,255,255,255,35,0,0,0,255,3,0,0,0,224,159,249,255,255,253,197,3,0,0,0,176,3,0,3,0,224,135,249,255,255,253,109,3,0,0,0,94,0,0,28,0,224,175,251,255,255,253,237,35,0,0,0,0,1,0,0,0,224,159,249,255,255,253,205,35,0,0,0,176,3,0,0,0,224,199,61,214,24,199,191,3,0,0,0,0,0,0,0,0,224,223,253,255,255,253,239,3,0,0,0,0,3,0,0,0,224,223,253,255,255,253,239,3,0,0,0,64,3,0,0,0,224,223,253,255,255,253,255,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,127,13,0,63,0,0,0,0,0,0,0,150,37,240,254,174,108,13,32,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,254,255,255,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,63,0,255,255,255,255,127,0,237,218,7,0,0,0,0,80,1,80,49,130,171,98,44,0,0,0,0,64,0,201,128,245,7,0,0,0,0,8,1,2,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,255,255,255,255,255,255,255,255,255,255,255,3,255,255,63,63,255,255,255,255,63,63,255,170,255,255,255,63,255,255,255,255,255,255,223,95,220,31,207,15,255,31,220,31,0,0,0,0,64,76,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,254,3,0,0,254,255,255,255,255,255,255,255,255,255,31,0,254,255,255,255,255,255,255,255,255,255,255,7,224,255,255,255,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,255,7,254,255,255,135,254,255,255,7,0,0,0,0,0,0,128,0,255,255,127,255,255,255,127,255,255,255,255,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,1,0,248,3,0,3,0,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,3,0,0,0,192,215,255,255,251,255,255,255,255,127,127,84,253,255,15,0,254,223,255,255,255,255,255,255,255,255,254,223,255,255,255,255,123,0,255,255,255,255,255,255,159,25,255,255,255,207,63,3,0,0,0,0,0,0,254,255,255,255,127,2,254,255,255,255,127,0,254,255,251,255,255,187,22,0,255,255,255,7,7,0,0,0,0,0,254,255,255,7,255,255,7,0,255,3,255,255,255,255,255,255,255,255,255,124,255,127,239,255,255,61,255,3,238,255,255,255,255,255,255,243,255,63,30,255,207,255,0,0,238,159,249,255,255,253,197,211,159,57,128,176,207,255,3,0,228,135,249,255,255,253,109,211,135,57,0,94,192,255,31,0,238,175,251,255,255,253,237,243,191,59,0,0,193,255,0,0,238,159,249,255,255,253,205,243,143,57,192,176,195,255,0,0,236,199,61,214,24,199,191,195,199,61,128,0,128,255,0,0,238,223,253,255,255,253,239,195,223,61,96,0,195,255,0,0,236,223,253,255,255,253,239,195,223,61,96,64,195,255,0,0,236,223,253,255,255,253,255,195,207,61,128,0,195,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,127,255,7,255,127,255,3,0,0,0,0,150,37,240,254,174,108,255,59,95,63,255,3,0,0,0,0,0,0,0,3,255,3,160,194,255,254,255,255,255,3,254,255,223,15,191,254,255,63,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,31,2,0,0,0,160,0,0,0,254,255,62,0,254,255,255,255,255,255,255,255,255,255,31,102,254,255,255,255,255,255,255,255,255,255,255,119,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,8,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+84472);allocate([22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,45,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,8,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,45,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,92,116,1,0,204,117,1,0,60,119,1,0,172,120,1,0,172,120,1,0,28,122,1,0,60,119,1,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,6,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,10,0,0,0,7,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,8,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,45,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,16,0,0,0,38,0,0,0,51,0,0,0,52,0,0,0,39,0,0,0,53,0,0,0,17,0,0,0,24,0,0,0,40,0,0,0,11,0,0,0,12,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,18,0,0,0,47,0,0,0,54,0,0,0,55,0,0,0,48,0,0,0,56,0,0,0,19,0,0,0,25,0,0,0,49,0,0,0,13,0,0,0,14,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,106,1,0,168,123,1,0,24,125,1,0,136,126,1,0,136,126,1,0,248,127,1,0,24,125,1,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,10,0,0,0,7,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,14,0,0,0,29,0,0,0,40,0,0,0,41,0,0,0,30,0,0,0,42,0,0,0,15,0,0,0,23,0,0,0,31,0,0,0,8,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,45,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,16,0,0,0,38,0,0,0,51,0,0,0,52,0,0,0,39,0,0,0,53,0,0,0,17,0,0,0,24,0,0,0,40,0,0,0,11,0,0,0,12,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,18,0,0,0,47,0,0,0,54,0,0,0,55,0,0,0,48,0,0,0,56,0,0,0,19,0,0,0,25,0,0,0,49,0,0,0,13,0,0,0,14,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,33,2,0,127,199,2,0,8,33,2,0,74,199,2,0,136,199,2,0,145,199,2,0,240,199,2,0,246,199,2,0,249,199,2,0,255,199,2,0,154,199,2,0,6,200,2,0,15,200,2,0,23,200,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,184,132,1,0,40,133,1,0,152,133,1,0,152,133,1,0,32,0,0,0,9,0,0,0,10,0,0,0,13,0,0,0,11,0,0,0,12,0,0,0,133,0,0,0,0,32,0,0,1,32,0,0,2,32,0,0,3,32,0,0,4,32,0,0,5,32,0,0,6,32,0,0,8,32,0,0,9,32,0,0,10,32,0,0,40,32,0,0,41,32,0,0,95,32,0,0,0,48,0,0,0,0,0,0,0,0,0,0,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,3,0,0,0,4,0,0,0,4,0,0,0,6,0,0,0,131,249,162,0,68,78,110,0,252,41,21,0,209,87,39,0,221,52,245,0,98,219,192,0,60,153,149,0,65,144,67,0,99,81,254,0,187,222,171,0,183,97,197,0,58,110,36,0,210,77,66,0,73,6,224,0,9,234,46,0,28,146,209,0,235,29,254,0,41,177,28,0,232,62,167,0,245,53,130,0,68,187,46,0,156,233,132,0,180,38,112,0,65,126,95,0,214,145,57,0,83,131,57,0,156,244,57,0,139,95,132,0,40,249,189,0,248,31,59,0,222,255,151,0,15,152,5,0,17,47,239,0,10,90,139,0,109,31,109,0,207,126,54,0,9,203,39,0,70,79,183,0,158,102,63,0,45,234,95,0,186,39,117,0,229,235,199,0,61,123,241,0,247,57,7,0,146,82,138,0,251,107,234,0,31,177,95,0,8,93,141,0,48,3,86,0,123,252,70,0,240,171,107,0,32,188,207,0,54,244,154,0,227,169,29,0,94,97,145,0,8,27,230,0,133,153,101,0,160,20,95,0,141,64,104,0,128,216,255,0,39,115,77,0,6,6,49,0,202,86,21,0,201,168,115,0,123,226,96,0,107,140,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,22,0,0,0,88,241,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,0,0,0,22,0,0,0,80,237,2,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,22,0,0,0,72,233,2,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,0,0,0,110,243,2,0,110,0,0,0,112,243,2,0,114,0,0,0,114,243,2,0,102,0,0,0,116,243,2,0,97,0,0,0,118,243,2,0,101,0,0,0,120,243,2,0,119,0,0,0,122,243,2,0,87,0,0,0,135,243,2,0,115,0,0,0,149,243,2,0,83,0,0,0,161,243,2,0,100,0,0,0,174,243,2,0,68,0,0,0,186,243,2],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+94712);allocate([4,0,4,0,27,0,27,0,32,0,32,0,35,0,33,0,10,0,2,0,22,0,9,0,33,0,33,0,33,0,21,0,28,0,1,0,20,0,20,0,20,0,20,0,20,0,20,0,20,0,8,0,4,0,5,0,27,0,2,0,23,0,27,0,32,0,31,0,30,0,29,0,9,0,19,0,0,0,21,0,18,0,21,0,3,0,7,0,21,0,21,0,20,0,20,0,20,0,20,0,20,0,20,0,20,0,20,0,8,0,4,0,5,0,5,0,6,0,27,0,26,0,24,0,25,0,32,0,7,0,21,0,20,0,20,0,20,0,20,0,20,0,20,0,11,0,20,0,13,0,20,0,12,0,20,0,20,0,20,0,14,0,20,0,20,0,20,0,16,0,20,0,15,0,20,0,17,0,0,0,0,0,0,0,142,0,46,0,47,0,51,0,53,0,48,0,55,0,146,0,230,0,230,0,230,0,230,0,0,0,61,0,125,0,55,0,55,0,230,0,230,0,0,0,40,0,53,0,46,0,50,0,47,0,81,0,0,0,0,0,71,0,0,0,0,0,230,0,81,0,0,0,230,0,230,0,230,0,0,0,230,0,113,0,85,0,230,0,86,0,230,0,0,0,89,0,230,0,0,0,62,0,66,0,75,0,83,0,77,0,86,0,67,0,0,0,0,0,98,0,99,0,230,0,0,0,230,0,230,0,230,0,0,0,0,0,102,0,83,0,95,0,90,0,98,0,98,0,101,0,0,0,108,0,0,0,103,0,0,0,110,0,102,0,104,0,0,0,104,0,120,0,117,0,0,0,116,0,0,0,121,0,0,0,230,0,158,0,165,0,172,0,179,0,182,0,73,0,188,0,195,0,202,0,209,0,216,0,222,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3,0,4,0,7,0,3,0,4,0,5,0,5,0,6,0,6,0,8,0,7,0,7,0,17,0,22,0,18,0,17,0,18,0,8,0,8,0,15,0,15,0,23,0,15,0,24,0,15,0,25,0,26,0,26,0,30,0,22,0,98,0,30,0,5,0,50,0,6,0,34,0,34,0,51,0,23,0,24,0,52,0,25,0,26,0,26,0,42,0,44,0,42,0,44,0,47,0,50,0,47,0,53,0,55,0,51,0,54,0,59,0,60,0,52,0,59,0,60,0,69,0,68,0,34,0,68,0,70,0,56,0,71,0,72,0,53,0,55,0,54,0,73,0,74,0,76,0,41,0,78,0,69,0,80,0,27,0,81,0,82,0,70,0,71,0,84,0,72,0,85,0,16,0,73,0,74,0,86,0,76,0,78,0,88,0,90,0,80,0,81,0,82,0,9,0,2,0,84,0,0,0,0,0,85,0,0,0,0,0,86,0,0,0,0,0,88,0,90,0,93,0,93,0,93,0,93,0,93,0,93,0,93,0,94,0,94,0,94,0,94,0,94,0,94,0,94,0,95,0,95,0,95,0,95,0,95,0,95,0,95,0,96,0,0,0,96,0,96,0,96,0,96,0,96,0,97,0,97,0,99,0,0,0,99,0,99,0,99,0,99,0,99,0,100,0,0,0,100,0,0,0,100,0,100,0,100,0,101,0,0,0,101,0,101,0,101,0,101,0,101,0,102,0,102,0,0,0,102,0,102,0,102,0,102,0,103,0,0,0,103,0,103,0,103,0,103,0,104,0,0,0,104,0,104,0,104,0,104,0,104,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,0,0,92,0,1,0,93,0,93,0,94,0,94,0,95,0,95,0,92,0,92,0,92,0,92,0,92,0,96,0,92,0,92,0,92,0,97,0,92,0,92,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,99,0,100,0,101,0,102,0,102,0,92,0,92,0,103,0,92,0,92,0,92,0,96,0,92,0,92,0,97,0,92,0,97,0,92,0,104,0,97,0,92,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,99,0,100,0,101,0,101,0,92,0,102,0,92,0,92,0,92,0,103,0,104,0,97,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,98,0,0,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,0,0,10,0,11,0,12,0,13,0,14,0,10,0,15,0,16,0,17,0,18,0,19,0,10,0,20,0,21,0,21,0,21,0,22,0,23,0,21,0,24,0,21,0,21,0,25,0,21,0,21,0,21,0,26,0,21,0,21,0,10,0,21,0,21,0,21,0,22,0,23,0,24,0,21,0,21,0,25,0,21,0,21,0,21,0,26,0,21,0,21,0,21,0,21,0,27,0,12,0,12,0,36,0,30,0,30,0,32,0,33,0,32,0,33,0,36,0,37,0,38,0,45,0,50,0,47,0,46,0,42,0,37,0,38,0,40,0,41,0,51,0,42,0,52,0,43,0,53,0,54,0,55,0,60,0,50,0,49,0,61,0,34,0,69,0,34,0,63,0,64,0,70,0,51,0,52,0,71,0,53,0,54,0,55,0,47,0,92,0,42,0,44,0,92,0,69,0,68,0,72,0,74,0,70,0,73,0,92,0,60,0,71,0,92,0,61,0,76,0,92,0,65,0,68,0,77,0,75,0,78,0,79,0,72,0,74,0,73,0,80,0,81,0,82,0,44,0,83,0,76,0,84,0,56,0,85,0,86,0,77,0,78,0,87,0,79,0,88,0,44,0,80,0,81,0,89,0,82,0,83,0,90,0,91,0,84,0,85,0,86,0,92,0,28,0,87,0,92,0,92,0,88,0,92,0,92,0,89,0,92,0,92,0,90,0,91,0,29,0,29,0,29,0,29,0,29,0,29,0,29,0,31,0,31,0,31,0,31,0,31,0,31,0,31,0,35,0,35,0,35,0,35,0,35,0,35,0,35,0,39,0,92,0,39,0,39,0,39,0,39,0,39,0,48,0,48,0,57,0,92,0,57,0,57,0,57,0,57,0,57,0,58,0,92,0,58,0,92,0,58,0,58,0,58,0,59,0,92,0,59,0,59,0,59,0,59,0,59,0,62,0,62,0,92,0,62,0,62,0,62,0,62,0,66,0,92,0,66,0,66,0,66,0,66,0,67,0,92,0,67,0,67,0,67,0,67,0,67,0,9,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,92,0,8,0,174,255,209,0,10,0,174,255,174,255,11,0,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,5,0,209,0,174,255,209,0,209,0,209,0,209,0,209,0,209,0,209,0,209,0,174,255,251,255,174,255,14,0,236,255,174,255,174,255,174,255,174,255,209,0,209,0,209,0,209,0,209,0,13,0,37,0,12,0,66,0,16,0,80,0,19,0,109,0,123,0,20,0,152,0,15,0,166,0,195,0,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,23,0,174,255,119,0,174,255,7,0,46,0,174,255,38,0,174,255,23,0,17,0,35,0,174,255,13,0,174,255,174,255,174,255,174,255,58,0,174,255,174,255,53,0,174,255,174,255,174,255,40,0,174,255,7,0,174,255,59,0,69,0,174,255,72,0,174,255,174,255,174,255,174,255,174,255,174,255,174,255,252,255,232,0,246,255,255,255,26,0,0,0,39,0,1,0,50,0,174,255,174,255,2,0,36,0,3,0,47,0,174,255,174,255,174,255,174,255,174,255,254,255,148,0,174,255,9,0,27,0,174,255,188,255,174,255,174,255,175,255,174,255,174,255,174,255,174,255,174,255,174,255,174,255,0,0,0,0,0,0,109,230,236,222,5,0,11,0,0,0,0,0,0,0,73,0,49,1,83,0,127,1,48,1,105,0,120,1,255,0,129,1,83,2,130,1,131,1,132,1,133,1,134,1,84,2,135,1,136,1,137,1,86,2,138,1,87,2,139,1,140,1,142,1,221,1,143,1,89,2,144,1,91,2,145,1,146,1,147,1,96,2,148,1,99,2,150,1,105,2,151,1,104,2,152,1,153,1,156,1,111,2,157,1,114,2,159,1,117,2,166,1,128,2,167,1,168,1,169,1,131,2,172,1,173,1,174,1,136,2,175,1,176,1,177,1,138,2,178,1,139,2,183,1,146,2,184,1,185,1,188,1,189,1,196,1,198,1,196,1,197,1,197,1,198,1,199,1,201,1,199,1,200,1,200,1,201,1,202,1,204,1,202,1,203,1,203,1,204,1,241,1,243,1,241,1,242,1,242,1,243,1,244,1,245,1,246,1,149,1,247,1,191,1,32,2,158,1,134,3,172,3,136,3,173,3,137,3,174,3,138,3,175,3,140,3,204,3,142,3,205,3,143,3,206,3,153,3,69,3,153,3,190,31,163,3,194,3,247,3,248,3,250,3,251,3,96,30,155,30,223,0,223,0,158,30,223,0,89,31,81,31,91,31,83,31,93,31,85,31,95,31,87,31,188,31,179,31,204,31,195,31,236,31,229,31,252,31,243,31,58,2,101,44,59,2,60,2,61,2,154,1,62,2,102,44,65,2,66,2,67,2,128,1,68,2,137,2,69,2,140,2,244,3,184,3,249,3,242,3,253,3,123,3,254,3,124,3,255,3,125,3,192,4,207,4,38,33,201,3,42,33,107,0,43,33,229,0,50,33,78,33,131,33,132,33,96,44,97,44,98,44,107,2,99,44,125,29,100,44,125,2,109,44,81,2,110,44,113,2,111,44,80,2,112,44,82,2,114,44,115,44,117,44,118,44,126,44,63,2,127,44,64,2,242,44,243,44,125,167,121,29,139,167,140,167,141,167,101,2,170,167,102,2,199,16,39,45,205,16,45,45,118,3,119,3,156,3,181,0,146,3,208,3,152,3,209,3,166,3,213,3,160,3,214,3,154,3,240,3,161,3,241,3,149,3,245,3,207,3,215,3,0,0,0,0,65,0,32,26,192,0,32,31,0,1,1,47,50,1,1,5,57,1,1,15,74,1,1,45,121,1,1,5,112,3,1,3,145,3,32,17,163,3,32,9,0,4,80,16,16,4,32,32,96,4,1,33,138,4,1,53,193,4,1,13,208,4,1,63,20,5,1,19,49,5,48,38,160,1,1,5,179,1,1,3,205,1,1,15,222,1,1,17,248,1,1,39,34,2,1,17,216,3,1,23,0,30,1,149,160,30,1,95,8,31,248,8,24,31,248,6,40,31,248,8,56,31,248,8,72,31,248,6,104,31,248,8,136,31,248,8,152,31,248,8,168,31,248,8,184,31,248,2,186,31,182,2,200,31,170,4,216,31,248,2,218,31,156,2,232,31,248,2,234,31,144,2,248,31,128,2,250,31,130,2,70,2,1,9,16,5,1,3,96,33,16,16,0,44,48,47,103,44,1,5,128,44,1,99,235,44,1,3,64,166,1,45,128,166,1,23,34,167,1,13,50,167,1,61,121,167,1,3,126,167,1,9,144,167,1,3,160,167,1,9,33,255,32,26,0,0,0,0,123,32,97,112,112,101,110,100,69,114,114,111,114,40,36,48,41,59,32,125,0,99,111,114,101,0,73,32,0,120,100,111,116,0,100,111,116,58,100,111,116,0,103,118,58,100,111,116,0,99,97,110,111,110,58,100,111,116,0,112,108,97,105,110,58,100,111,116,0,112,108,97,105,110,45,101,120,116,58,100,111,116,0,120,100,111,116,58,120,100,111,116,0,120,100,111,116,49,46,50,58,120,100,111,116,0,120,100,111,116,49,46,52,58,120,100,111,116,0,32,37,100,32,0,0,0,0,0,0,0,0,0,0,0,35,37,48,50,120,37,48,50,120,37,48,50,120,37,48,50,120,0,115,101,116,108,105,110,101,119,105,100,116,104,40,0,37,46,51,102,0,83,32,0,67,32,0,50,32,0,37,115,37,100,32,45,0,69,32,0,101,32,0,70,32,0,116,32,37,117,32,0,84,32,0,120,100,111,116,118,101,114,115,105,111,110,0,49,46,52,0,49,46,50,0,49,46,55,0,95,108,100,114,97,119,95,0,95,104,100,114,97,119,95,0,95,116,100,114,97,119,95,0,95,104,108,100,114,97,119,95,0,95,116,108,100,114,97,119,95,0,120,100,111,116,32,118,101,114,115,105,111,110,32,34,37,115,34,32,116,111,111,32,108,111,110,103,0,37,46,48,50,102,0,102,105,103,0,102,105,103,58,102,105,103,0,35,32,37,115,10,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,46,49,102,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,110,32,62,61,32,52,0,103,118,114,101,110,100,101,114,95,99,111,114,101,95,102,105,103,46,99,0,102,105,103,95,98,101,122,105,101,114,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,46,49,102,32,37,100,32,37,100,32,37,100,32,37,100,10,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,46,51,102,32,37,100,32,37,46,52,102,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,37,100,32,37,100,32,35,37,48,50,120,37,48,50,120,37,48,50,120,10,0,102,105,103,95,114,101,115,111,108,118,101,95,99,111,108,111,114,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,46,49,102,32,37,46,52,102,32,37,100,32,37,46,49,102,32,37,46,49,102,32,37,100,32,37,100,32,37,115,92,48,48,49,10,0,35,32,101,110,100,32,111,102,32,70,73,71,32,102,105,108,101,10,0,35,70,73,71,32,51,46,50,10,0,35,32,71,101,110,101,114,97,116,101,100,32,98,121,32,37,115,32,118,101,114,115,105,111,110,32,37,115,32,40,37,115,41,10,0,35,32,84,105,116,108,101,58,32,37,115,10,0,35,32,80,97,103,101,115,58,32,37,100,10,0,80,111,114,116,114,97,105,116,10,0,67,101,110,116,101,114,10,0,73,110,99,104,101,115,10,0,76,101,116,116,101,114,10,0,49,48,48,46,48,48,10,0,83,105,110,103,108,101,10,0,45,50,10,0,49,50,48,48,0,32,50,10,0,109,97,112,0,105,115,109,97,112,58,109,97,112,0,99,109,97,112,58,109,97,112,0,105,109,97,112,58,109,97,112,0,99,109,97,112,120,58,109,97,112,0,105,109,97,112,95,110,112,58,109,97,112,0,99,109,97,112,120,95,110,112,58,109,97,112,0,114,101,99,116,32,37,115,32,37,100,44,37,100,32,37,100,44,37,100,10,0,99,105,114,99,108,101,32,37,115,32,37,100,44,37,100,44,37,100,10,0,112,111,108,121,32,37,115,0,32,37,100,44,37,100,0,103,118,114,101,110,100,101,114,95,99,111,114,101,95,109,97,112,46,99,0,109,97,112,95,111,117,116,112,117,116,95,115,104,97,112,101,0,114,101,99,116,97,110,103,108,101,32,40,37,100,44,37,100,41,32,40,37,100,44,37,100,41,32,37,115,32,37,115,10,0,60,97,114,101,97,32,115,104,97,112,101,61,34,99,105,114,99,108,101,34,0,60,97,114,101,97,32,115,104,97,112,101,61,34,114,101,99,116,34,0,60,97,114,101,97,32,115,104,97,112,101,61,34,112,111,108,121,34,0,32,105,100,61,34,0,32,104,114,101,102,61,34,0,32,116,105,116,108,101,61,34,0,32,97,108,116,61,34,34,0,32,99,111,111,114,100,115,61,34,0,37,100,44,37,100,44,37,100,0,37,100,44,37,100,44,37,100,44,37,100,0,37,100,44,37,100,0,44,37,100,44,37,100,0,34,62,10,0,60,47,109,97,112,62,10,0,98,97,115,101,32,114,101,102,101,114,101,114,10,0,100,101,102,97,117,108,116,32,0,60,109,97,112,32,105,100,61,34,0,34,32,110,97,109,101,61,34,0,112,115,50,58,112,115,0,32,93,32,32,37,100,32,116,114,117,101,32,37,115,10,0,32,93,32,32,37,100,32,102,97,108,115,101,32,37,115,10,0,32,115,101,116,108,105,110,101,119,105,100,116,104,10,0,37,115,32,0,115,101,116,104,115,98,0,37,46,53,103,32,37,46,53,103,32,37,46,53,103,32,37,115,99,111,108,111,114,10,0,37,32,0,110,101,119,112,97,116,104,32,0,32,109,111,118,101,116,111,10,0,32,108,105,110,101,116,111,10,0,115,116,114,111,107,101,10,0,32,99,117,114,118,101,116,111,10,0,99,108,111,115,101,112,97,116,104,32,102,105,108,108,10,0,99,108,111,115,101,112,97,116,104,32,115,116,114,111,107,101,10,0,32,101,108,108,105,112,115,101,95,112,97,116,104,32,102,105,108,108,10,0,32,101,108,108,105,112,115,101,95,112,97,116,104,32,115,116,114,111,107,101,10,0,32,47,37,115,32,115,101,116,95,102,111,110,116,10,0,32,109,111,118,101,116,111,32,0,32,37,115,32,97,108,105,103,110,101,100,116,101,120,116,10,0,91,32,47,82,101,99,116,32,91,32,0,32,93,10,0,32,32,47,66,111,114,100,101,114,32,91,32,48,32,48,32,48,32,93,10,32,32,47,65,99,116,105,111,110,32,60,60,32,47,83,117,98,116,121,112,101,32,47,85,82,73,32,47,85,82,73,32,37,115,32,62,62,10,32,32,47,83,117,98,116,121,112,101,32,47,76,105,110,107,10,47,65,78,78,32,112,100,102,109,97,114,107,10,0,103,115,97,118,101,10,0,37,37,32,37,115,10,0,48,32,48,32,48,32,101,100,103,101,99,111,108,111,114,10,0,101,110,100,112,97,103,101,10,115,104,111,119,112,97,103,101,10,103,114,101,115,116,111,114,101,10,0,37,37,80,97,103,101,84,114,97,105,108,101,114,10,0,37,37,37,37,69,110,100,80,97,103,101,58,32,37,100,10,0,37,37,37,37,80,97,103,101,58,32,37,100,32,37,100,10,0,37,37,37,37,80,97,103,101,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,0,76,97,110,100,115,99,97,112,101,0,80,111,114,116,114,97,105,116,0,37,37,37,37,80,97,103,101,79,114,105,101,110,116,97,116,105,111,110,58,32,37,115,10,0,60,60,32,47,80,97,103,101,83,105,122,101,32,91,37,100,32,37,100,93,32,62,62,32,115,101,116,112,97,103,101,100,101,118,105,99,101,10,0,37,100,32,37,100,32,37,100,32,98,101,103,105,110,112,97,103,101,10,0,103,115,97,118,101,10,37,100,32,37,100,32,37,100,32,37,100,32,98,111,120,112,114,105,109,32,99,108,105,112,32,110,101,119,112,97,116,104,10,0,37,103,32,37,103,32,115,101,116,95,115,99,97,108,101,32,37,100,32,114,111,116,97,116,101,32,37,103,32,37,103,32,116,114,97,110,115,108,97,116,101,10,0,99,97,110,118,97,115,32,115,105,122,101,32,40,37,100,44,37,100,41,32,101,120,99,101,101,100,115,32,80,68,70,32,108,105,109,105,116,32,40,37,100,41,10,9,40,115,117,103,103,101,115,116,32,115,101,116,116,105,110,103,32,97,32,98,111,117,110,100,105,110,103,32,98,111,120,32,115,105,122,101,44,32,115,101,101,32,100,111,116,40,49,41,41,10,0,91,32,47,67,114,111,112,66,111,120,32,91,37,100,32,37,100,32,37,100,32,37,100,93,32,47,80,65,71,69,83,32,112,100,102,109,97,114,107,10,0,37,100,32,37,100,32,115,101,116,108,97,121,101,114,10,0,0,37,37,37,37,84,105,116,108,101,58,32,37,115,10,0,37,37,80,97,103,101,115,58,32,40,97,116,101,110,100,41,10,0,37,37,80,97,103,101,115,58,32,49,10,0,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,40,97,116,101,110,100,41,10,0,37,37,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,0,37,37,69,110,100,67,111,109,109,101,110,116,115,10,115,97,118,101,10,0,115,101,116,117,112,76,97,116,105,110,49,10,0,91,32,123,67,97,116,97,108,111,103,125,32,60,60,32,47,85,82,73,32,60,60,32,47,66,97,115,101,32,37,115,32,62,62,32,62,62,10,47,80,85,84,32,112,100,102,109,97,114,107,10,0,37,37,66,101,103,105,110,80,114,111,108,111,103,0,47,68,111,116,68,105,99,116,32,50,48,48,32,100,105,99,116,32,100,101,102,0,68,111,116,68,105,99,116,32,98,101,103,105,110,0,47,115,101,116,117,112,76,97,116,105,110,49,32,123,0,109,97,114,107,0,47,69,110,99,111,100,105,110,103,86,101,99,116,111,114,32,50,53,54,32,97,114,114,97,121,32,100,101,102,0,32,69,110,99,111,100,105,110,103,86,101,99,116,111,114,32,48,0,73,83,79,76,97,116,105,110,49,69,110,99,111,100,105,110,103,32,48,32,50,53,53,32,103,101,116,105,110,116,101,114,118,97,108,32,112,117,116,105,110,116,101,114,118,97,108,0,69,110,99,111,100,105,110,103,86,101,99,116,111,114,32,52,53,32,47,104,121,112,104,101,110,32,112,117,116,0,37,32,83,101,116,32,117,112,32,73,83,79,32,76,97,116,105,110,32,49,32,99,104,97,114,97,99,116,101,114,32,101,110,99,111,100,105,110,103,0,47,115,116,97,114,110,101,116,73,83,79,32,123,0,32,32,32,32,32,32,32,32,100,117,112,32,100,117,112,32,102,105,110,100,102,111,110,116,32,100,117,112,32,108,101,110,103,116,104,32,100,105,99,116,32,98,101,103,105,110,0,32,32,32,32,32,32,32,32,123,32,49,32,105,110,100,101,120,32,47,70,73,68,32,110,101,32,123,32,100,101,102,32,125,123,32,112,111,112,32,112,111,112,32,125,32,105,102,101,108,115,101,0,32,32,32,32,32,32,32,32,125,32,102,111,114,97,108,108,0,32,32,32,32,32,32,32,32,47,69,110,99,111,100,105,110,103,32,69,110,99,111,100,105,110,103,86,101,99,116,111,114,32,100,101,102,0,32,32,32,32,32,32,32,32,99,117,114,114,101,110,116,100,105,99,116,32,101,110,100,32,100,101,102,105,110,101,102,111,110,116,0,125,32,100,101,102,0,47,84,105,109,101,115,45,82,111,109,97,110,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,84,105,109,101,115,45,73,116,97,108,105,99,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,84,105,109,101,115,45,66,111,108,100,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,84,105,109,101,115,45,66,111,108,100,73,116,97,108,105,99,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,72,101,108,118,101,116,105,99,97,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,72,101,108,118,101,116,105,99,97,45,79,98,108,105,113,117,101,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,72,101,108,118,101,116,105,99,97,45,66,111,108,100,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,72,101,108,118,101,116,105,99,97,45,66,111,108,100,79,98,108,105,113,117,101,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,67,111,117,114,105,101,114,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,67,111,117,114,105,101,114,45,79,98,108,105,113,117,101,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,67,111,117,114,105,101,114,45,66,111,108,100,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,47,67,111,117,114,105,101,114,45,66,111,108,100,79,98,108,105,113,117,101,32,115,116,97,114,110,101,116,73,83,79,32,100,101,102,0,99,108,101,97,114,116,111,109,97,114,107,0,125,32,98,105,110,100,32,100,101,102,0,37,37,66,101,103,105,110,82,101,115,111,117,114,99,101,58,32,112,114,111,99,115,101,116,32,103,114,97,112,104,118,105,122,32,48,32,48,0,47,99,111,111,114,100,45,102,111,110,116,45,102,97,109,105,108,121,32,47,84,105,109,101,115,45,82,111,109,97,110,32,100,101,102,0,47,100,101,102,97,117,108,116,45,102,111,110,116,45,102,97,109,105,108,121,32,47,84,105,109,101,115,45,82,111,109,97,110,32,100,101,102,0,47,99,111,111,114,100,102,111,110,116,32,99,111,111,114,100,45,102,111,110,116,45,102,97,109,105,108,121,32,102,105,110,100,102,111,110,116,32,56,32,115,99,97,108,101,102,111,110,116,32,100,101,102,0,47,73,110,118,83,99,97,108,101,70,97,99,116,111,114,32,49,46,48,32,100,101,102,0,47,115,101,116,95,115,99,97,108,101,32,123,0,32,32,32,32,32,32,32,100,117,112,32,49,32,101,120,99,104,32,100,105,118,32,47,73,110,118,83,99,97,108,101,70,97,99,116,111,114,32,101,120,99,104,32,100,101,102,0,32,32,32,32,32,32,32,115,99,97,108,101,0,37,32,115,116,121,108,101,115,0,47,115,111,108,105,100,32,123,32,91,93,32,48,32,115,101,116,100,97,115,104,32,125,32,98,105,110,100,32,100,101,102,0,47,100,97,115,104,101,100,32,123,32,91,57,32,73,110,118,83,99,97,108,101,70,97,99,116,111,114,32,109,117,108,32,100,117,112,32,93,32,48,32,115,101,116,100,97,115,104,32,125,32,98,105,110,100,32,100,101,102,0,47,100,111,116,116,101,100,32,123,32,91,49,32,73,110,118,83,99,97,108,101,70,97,99,116,111,114,32,109,117,108,32,54,32,73,110,118,83,99,97,108,101,70,97,99,116,111,114,32,109,117,108,93,32,48,32,115,101,116,100,97,115,104,32,125,32,98,105,110,100,32,100,101,102,0,47,105,110,118,105,115,32,123,47,102,105,108,108,32,123,110,101,119,112,97,116,104,125,32,100,101,102,32,47,115,116,114,111,107,101,32,123,110,101,119,112,97,116,104,125,32,100,101,102,32,47,115,104,111,119,32,123,112,111,112,32,110,101,119,112,97,116,104,125,32,100,101,102,125,32,98,105,110,100,32,100,101,102,0,47,98,111,108,100,32,123,32,50,32,115,101,116,108,105,110,101,119,105,100,116,104,32,125,32,98,105,110,100,32,100,101,102,0,47,102,105,108,108,101,100,32,123,32,125,32,98,105,110,100,32,100,101,102,0,47,117,110,102,105,108,108,101,100,32,123,32,125,32,98,105,110,100,32,100,101,102,0,47,114,111,117,110,100,101,100,32,123,32,125,32,98,105,110,100,32,100,101,102,0,47,100,105,97,103,111,110,97,108,115,32,123,32,125,32,98,105,110,100,32,100,101,102,0,47,116,97,112,101,114,101,100,32,123,32,125,32,98,105,110,100,32,100,101,102,0,37,32,104,111,111,107,115,32,102,111,114,32,115,101,116,116,105,110,103,32,99,111,108,111,114,32,0,47,110,111,100,101,99,111,108,111,114,32,123,32,115,101,116,104,115,98,99,111,108,111,114,32,125,32,98,105,110,100,32,100,101,102,0,47,101,100,103,101,99,111,108,111,114,32,123,32,115,101,116,104,115,98,99,111,108,111,114,32,125,32,98,105,110,100,32,100,101,102,0,47,103,114,97,112,104,99,111,108,111,114,32,123,32,115,101,116,104,115,98,99,111,108,111,114,32,125,32,98,105,110,100,32,100,101,102,0,47,110,111,112,99,111,108,111,114,32,123,112,111,112,32,112,111,112,32,112,111,112,125,32,98,105,110,100,32,100,101,102,0,47,98,101,103,105,110,112,97,103,101,32,123,9,37,32,105,32,106,32,110,112,97,103,101,115,0,9,47,110,112,97,103,101,115,32,101,120,99,104,32,100,101,102,0,9,47,106,32,101,120,99,104,32,100,101,102,0,9,47,105,32,101,120,99,104,32,100,101,102,0,9,47,115,116,114,32,49,48,32,115,116,114,105,110,103,32,100,101,102,0,9,110,112,97,103,101,115,32,49,32,103,116,32,123,0,9,9,103,115,97,118,101,0,9,9,9,99,111,111,114,100,102,111,110,116,32,115,101,116,102,111,110,116,0,9,9,9,48,32,48,32,109,111,118,101,116,111,0,9,9,9,40,92,40,41,32,115,104,111,119,32,105,32,115,116,114,32,99,118,115,32,115,104,111,119,32,40,44,41,32,115,104,111,119,32,106,32,115,116,114,32,99,118,115,32,115,104,111,119,32,40,92,41,41,32,115,104,111,119,0,9,9,103,114,101,115,116,111,114,101,0,9,125,32,105,102,0,47,115,101,116,95,102,111,110,116,32,123,0,9,102,105,110,100,102,111,110,116,32,101,120,99,104,0,9,115,99,97,108,101,102,111,110,116,32,115,101,116,102,111,110,116,0,37,32,100,114,97,119,32,116,101,120,116,32,102,105,116,116,101,100,32,116,111,32,105,116,115,32,101,120,112,101,99,116,101,100,32,119,105,100,116,104,0,47,97,108,105,103,110,101,100,116,101,120,116,32,123,9,9,9,37,32,119,105,100,116,104,32,116,101,120,116,0,9,47,116,101,120,116,32,101,120,99,104,32,100,101,102,0,9,47,119,105,100,116,104,32,101,120,99,104,32,100,101,102,0,9,103,115,97,118,101,0,9,9,119,105,100,116,104,32,48,32,103,116,32,123,0,9,9,9,91,93,32,48,32,115,101,116,100,97,115,104,0,9,9,9,116,101,120,116,32,115,116,114,105,110,103,119,105,100,116,104,32,112,111,112,32,119,105,100,116,104,32,101,120,99,104,32,115,117,98,32,116,101,120,116,32,108,101,110,103,116,104,32,100,105,118,32,48,32,116,101,120,116,32,97,115,104,111,119,0,9,9,125,32,105,102,0,9,103,114,101,115,116,111,114,101,0,47,98,111,120,112,114,105,109,32,123,9,9,9,9,37,32,120,99,111,114,110,101,114,32,121,99,111,114,110,101,114,32,120,115,105,122,101,32,121,115,105,122,101,0,9,9,52,32,50,32,114,111,108,108,0,9,9,109,111,118,101,116,111,0,9,9,50,32,99,111,112,121,0,9,9,101,120,99,104,32,48,32,114,108,105,110,101,116,111,0,9,9,48,32,101,120,99,104,32,114,108,105,110,101,116,111,0,9,9,112,111,112,32,110,101,103,32,48,32,114,108,105,110,101,116,111,0,9,9,99,108,111,115,101,112,97,116,104,0,47,101,108,108,105,112,115,101,95,112,97,116,104,32,123,0,9,47,114,121,32,101,120,99,104,32,100,101,102,0,9,47,114,120,32,101,120,99,104,32,100,101,102,0,9,47,121,32,101,120,99,104,32,100,101,102,0,9,47,120,32,101,120,99,104,32,100,101,102,0,9,109,97,116,114,105,120,32,99,117,114,114,101,110,116,109,97,116,114,105,120,0,9,110,101,119,112,97,116,104,0,9,120,32,121,32,116,114,97,110,115,108,97,116,101,0,9,114,120,32,114,121,32,115,99,97,108,101,0,9,48,32,48,32,49,32,48,32,51,54,48,32,97,114,99,0,9,115,101,116,109,97,116,114,105,120,0,47,101,110,100,112,97,103,101,32,123,32,115,104,111,119,112,97,103,101,32,125,32,98,105,110,100,32,100,101,102,0,47,115,104,111,119,112,97,103,101,32,123,32,125,32,100,101,102,0,47,108,97,121,101,114,99,111,108,111,114,115,101,113,0,9,91,9,37,32,108,97,121,101,114,32,99,111,108,111,114,32,115,101,113,117,101,110,99,101,32,45,32,100,97,114,107,101,115,116,32,116,111,32,108,105,103,104,116,101,115,116,0,9,9,91,48,32,48,32,48,93,0,9,9,91,46,50,32,46,56,32,46,56,93,0,9,9,91,46,52,32,46,56,32,46,56,93,0,9,9,91,46,54,32,46,56,32,46,56,93,0,9,9,91,46,56,32,46,56,32,46,56,93,0,9,93,0,100,101,102,0,47,108,97,121,101,114,108,101,110,32,108,97,121,101,114,99,111,108,111,114,115,101,113,32,108,101,110,103,116,104,32,100,101,102,0,47,115,101,116,108,97,121,101,114,32,123,47,109,97,120,108,97,121,101,114,32,101,120,99,104,32,100,101,102,32,47,99,117,114,108,97,121,101,114,32,101,120,99,104,32,100,101,102,0,9,108,97,121,101,114,99,111,108,111,114,115,101,113,32,99,117,114,108,97,121,101,114,32,49,32,115,117,98,32,108,97,121,101,114,108,101,110,32,109,111,100,32,103,101,116,0,9,97,108,111,97,100,32,112,111,112,32,115,101,116,104,115,98,99,111,108,111,114,0,9,47,110,111,100,101,99,111,108,111,114,32,123,110,111,112,99,111,108,111,114,125,32,100,101,102,0,9,47,101,100,103,101,99,111,108,111,114,32,123,110,111,112,99,111,108,111,114,125,32,100,101,102,0,9,47,103,114,97,112,104,99,111,108,111,114,32,123,110,111,112,99,111,108,111,114,125,32,100,101,102,0,47,111,110,108,97,121,101,114,32,123,32,99,117,114,108,97,121,101,114,32,110,101,32,123,105,110,118,105,115,125,32,105,102,32,125,32,100,101,102,0,47,111,110,108,97,121,101,114,115,32,123,0,9,47,109,121,117,112,112,101,114,32,101,120,99,104,32,100,101,102,0,9,47,109,121,108,111,119,101,114,32,101,120,99,104,32,100,101,102,0,9,99,117,114,108,97,121,101,114,32,109,121,108,111,119,101,114,32,108,116,0,9,99,117,114,108,97,121,101,114,32,109,121,117,112,112,101,114,32,103,116,0,9,111,114,0,9,123,105,110,118,105,115,125,32,105,102,0,47,99,117,114,108,97,121,101,114,32,48,32,100,101,102,0,37,37,69,110,100,82,101,115,111,117,114,99,101,0,37,37,69,110,100,80,114,111,108,111,103,0,37,37,66,101,103,105,110,83,101,116,117,112,0,49,52,32,100,101,102,97,117,108,116,45,102,111,110,116,45,102,97,109,105,108,121,32,115,101,116,95,102,111,110,116,0,49,32,115,101,116,109,105,116,101,114,108,105,109,105,116,0,37,32,47,97,114,114,111,119,108,101,110,103,116,104,32,49,48,32,100,101,102,0,37,32,47,97,114,114,111,119,119,105,100,116,104,32,53,32,100,101,102,0,37,32,109,97,107,101,32,115,117,114,101,32,112,100,102,109,97,114,107,32,105,115,32,104,97,114,109,108,101,115,115,32,102,111,114,32,80,83,45,105,110,116,101,114,112,114,101,116,101,114,115,32,111,116,104,101,114,32,116,104,97,110,32,68,105,115,116,105,108,108,101,114,0,47,112,100,102,109,97,114,107,32,119,104,101,114,101,32,123,112,111,112,125,32,123,117,115,101,114,100,105,99,116,32,47,112,100,102,109,97,114,107,32,47,99,108,101,97,114,116,111,109,97,114,107,32,108,111,97,100,32,112,117,116,125,32,105,102,101,108,115,101,0,37,32,109,97,107,101,32,39,60,60,39,32,97,110,100,32,39,62,62,39,32,115,97,102,101,32,111,110,32,80,83,32,76,101,118,101,108,32,49,32,100,101,118,105,99,101,115,0,47,108,97,110,103,117,97,103,101,108,101,118,101,108,32,119,104,101,114,101,32,123,112,111,112,32,108,97,110,103,117,97,103,101,108,101,118,101,108,125,123,49,125,32,105,102,101,108,115,101,0,50,32,108,116,32,123,0,32,32,32,32,117,115,101,114,100,105,99,116,32,40,60,60,41,32,99,118,110,32,40,91,41,32,99,118,110,32,108,111,97,100,32,112,117,116,0,32,32,32,32,117,115,101,114,100,105,99,116,32,40,62,62,41,32,99,118,110,32,40,91,41,32,99,118,110,32,108,111,97,100,32,112,117,116,0,125,32,105,102,0,37,37,69,110,100,83,101,116,117,112,0,37,37,84,114,97,105,108,101,114,10,0,37,37,37,37,80,97,103,101,115,58,32,37,100,10,0,101,110,100,10,114,101,115,116,111,114,101,10,0,37,37,69,79,70,10,0,37,33,80,83,45,65,100,111,98,101,45,51,46,48,0,32,69,80,83,70,45,51,46,48,10,0,37,37,37,37,67,114,101,97,116,111,114,58,32,37,115,32,118,101,114,115,105,111,110,32,37,115,32,40,37,115,41,10,0,100,97,114,107,98,108,117,101,0,100,97,114,107,99,121,97,110,0,100,97,114,107,103,114,97,121,0,100,97,114,107,103,114,101,121,0,100,97,114,107,109,97,103,101,110,116,97,0,100,97,114,107,114,101,100,0,108,105,103,104,116,103,114,101,101,110,0,60,33,45,45,32,0,60,112,111,108,121,108,105,110,101,0,32,112,111,105,110,116,115,61,34,0,37,103,44,37,103,32,0,34,47,62,10,0,32,102,105,108,108,61,34,0,117,114,108,40,35,108,95,37,100,41,0,117,114,108,40,35,114,95,37,100,41,0,34,32,102,105,108,108,45,111,112,97,99,105,116,121,61,34,37,102,0,34,32,115,116,114,111,107,101,61,34,0,34,32,115,116,114,111,107,101,45,119,105,100,116,104,61,34,37,103,0,34,32,115,116,114,111,107,101,45,100,97,115,104,97,114,114,97,121,61,34,37,115,0,34,32,115,116,114,111,107,101,45,111,112,97,99,105,116,121,61,34,37,102,0,49,44,53,0,53,44,50,0,103,118,114,101,110,100,101,114,95,99,111,114,101,95,115,118,103,46,99,0,115,118,103,95,112,114,105,110,116,95,99,111,108,111,114,0,60,112,97,116,104,0,32,100,61,34,0,37,99,37,103,44,37,103,0,60,100,101,102,115,62,10,60,114,97,100,105,97,108,71,114,97,100,105,101,110,116,32,105,100,61,34,114,95,37,100,34,32,99,120,61,34,53,48,37,37,34,32,99,121,61,34,53,48,37,37,34,32,114,61,34,55,53,37,37,34,32,102,120,61,34,37,100,37,37,34,32,102,121,61,34,37,100,37,37,34,62,10,0,60,115,116,111,112,32,111,102,102,115,101,116,61,34,48,34,32,115,116,121,108,101,61,34,115,116,111,112,45,99,111,108,111,114,58,0,59,115,116,111,112,45,111,112,97,99,105,116,121,58,0,49,46,0,59,34,47,62,10,0,60,115,116,111,112,32,111,102,102,115,101,116,61,34,49,34,32,115,116,121,108,101,61,34,115,116,111,112,45,99,111,108,111,114,58,0,59,34,47,62,10,60,47,114,97,100,105,97,108,71,114,97,100,105,101,110,116,62,10,60,47,100,101,102,115,62,10,0,60,100,101,102,115,62,10,60,108,105,110,101,97,114,71,114,97,100,105,101,110,116,32,105,100,61,34,108,95,37,100,34,32,103,114,97,100,105,101,110,116,85,110,105,116,115,61,34,117,115,101,114,83,112,97,99,101,79,110,85,115,101,34,32,0,120,49,61,34,37,103,34,32,121,49,61,34,37,103,34,32,120,50,61,34,37,103,34,32,121,50,61,34,37,103,34,32,62,10,0,60,115,116,111,112,32,111,102,102,115,101,116,61,34,37,46,48,51,102,34,32,115,116,121,108,101,61,34,115,116,111,112,45,99,111,108,111,114,58,0,59,34,47,62,10,60,47,108,105,110,101,97,114,71,114,97,100,105,101,110,116,62,10,60,47,100,101,102,115,62,10,0,60,112,111,108,121,103,111,110,0,37,103,44,37,103,0,60,101,108,108,105,112,115,101,0,32,99,120,61,34,37,103,34,32,99,121,61,34,37,103,34,0,32,114,120,61,34,37,103,34,32,114,121,61,34,37,103,34,0,60,116,101,120,116,0,32,116,101,120,116,45,97,110,99,104,111,114,61,34,115,116,97,114,116,34,0,32,116,101,120,116,45,97,110,99,104,111,114,61,34,101,110,100,34,0,32,116,101,120,116,45,97,110,99,104,111,114,61,34,109,105,100,100,108,101,34,0,32,120,61,34,37,103,34,32,121,61,34,37,103,34,0,32,102,111,110,116,45,102,97,109,105,108,121,61,34,37,115,0,44,37,115,0,32,102,111,110,116,45,119,101,105,103,104,116,61,34,37,115,34,0,32,102,111,110,116,45,115,116,114,101,116,99,104,61,34,37,115,34,0,32,102,111,110,116,45,115,116,121,108,101,61,34,37,115,34,0,32,102,111,110,116,45,102,97,109,105,108,121,61,34,37,115,34,0,32,102,111,110,116,45,119,101,105,103,104,116,61,34,98,111,108,100,34,0,32,102,111,110,116,45,115,116,121,108,101,61,34,105,116,97,108,105,99,34,0,32,116,101,120,116,45,100,101,99,111,114,97,116,105,111,110,61,34,0,37,115,111,118,101,114,108,105,110,101,0,37,115,108,105,110,101,45,116,104,114,111,117,103,104,0,32,98,97,115,101,108,105,110,101,45,115,104,105,102,116,61,34,115,117,112,101,114,34,0,32,98,97,115,101,108,105,110,101,45,115,104,105,102,116,61,34,115,117,98,34,0,32,102,111,110,116,45,115,105,122,101,61,34,37,46,50,102,34,0,32,102,105,108,108,61,34,37,115,34,0,32,102,105,108,108,61,34,35,37,48,50,120,37,48,50,120,37,48,50,120,34,0,115,118,103,95,116,101,120,116,115,112,97,110,0,62,0,60,47,116,101,120,116,62,10,0,60,47,103,62,10,0,60,103,0,32,105,100,61,34,97,95,0,32,120,108,105,110,107,58,104,114,101,102,61,34,0,32,120,108,105,110,107,58,116,105,116,108,101,61,34,0,32,116,97,114,103,101,116,61,34,0,60,103,32,105,100,61,34,0,34,32,99,108,97,115,115,61,34,101,100,103,101,34,62,0,60,116,105,116,108,101,62,0,60,47,116,105,116,108,101,62,10,0,95,37,115,0,34,32,99,108,97,115,115,61,34,110,111,100,101,34,62,0,34,32,99,108,97,115,115,61,34,99,108,117,115,116,101,114,34,62,0,34,32,99,108,97,115,115,61,34,103,114,97,112,104,34,0,32,116,114,97,110,115,102,111,114,109,61,34,115,99,97,108,101,40,37,103,32,37,103,41,32,114,111,116,97,116,101,40,37,100,41,32,116,114,97,110,115,108,97,116,101,40,37,103,32,37,103,41,34,62,10,0,34,32,99,108,97,115,115,61,34,108,97,121,101,114,34,62,10,0,60,47,115,118,103,62,10,0,60,33,45,45,0,32,80,97,103,101,115,58,32,37,100,32,45,45,62,10,0,60,115,118,103,32,119,105,100,116,104,61,34,37,100,112,116,34,32,104,101,105,103,104,116,61,34,37,100,112,116,34,10,0,32,118,105,101,119,66,111,120,61,34,37,46,50,102,32,37,46,50,102,32,37,46,50,102,32,37,46,50,102,34,0,32,120,109,108,110,115,61,34,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,50,48,48,48,47,115,118,103,34,0,32,120,109,108,110,115,58,120,108,105,110,107,61,34,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,49,57,57,57,47,120,108,105,110,107,34,0,60,63,120,109,108,32,118,101,114,115,105,111,110,61,34,49,46,48,34,32,101,110,99,111,100,105,110,103,61,34,85,84,70,45,56,34,32,115,116,97,110,100,97,108,111,110,101,61,34,110,111,34,63,62,10,0,115,116,121,108,101,115,104,101,101,116,0,60,63,120,109,108,45,115,116,121,108,101,115,104,101,101,116,32,104,114,101,102,61,34,0,34,32,116,121,112,101,61,34,116,101,120,116,47,99,115,115,34,63,62,10,0,60,33,68,79,67,84,89,80,69,32,115,118,103,32,80,85,66,76,73,67,32,34,45,47,47,87,51,67],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+101982);allocate([47,47,68,84,68,32,83,86,71,32,49,46,49,47,47,69,78,34,10,0,32,34,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,71,114,97,112,104,105,99,115,47,83,86,71,47,49,46,49,47,68,84,68,47,115,118,103,49,49,46,100,116,100,34,62,10,0,60,33,45,45,32,71,101,110,101,114,97,116,101,100,32,98,121,32,0,116,107,0,116,107,58,116,107,0,35,32,0,32,99,114,101,97,116,101,32,108,105,110,101,32,0,32,45,102,105,108,108,32,0,32,45,100,97,115,104,32,53,0,32,45,100,97,115,104,32,50,0,103,114,97,112,104,32,108,97,98,101,108,0,103,118,114,101,110,100,101,114,95,99,111,114,101,95,116,107,46,99,0,116,107,103,101,110,95,112,114,105,110,116,95,116,97,103,115,0,32,45,116,97,103,115,32,123,37,100,37,115,37,100,125,0,116,107,103,101,110,95,112,114,105,110,116,95,99,111,108,111,114,0,36,99,0,32,45,119,105,100,116,104,32,0,32,45,115,109,111,111,116,104,32,98,101,122,105,101,114,32,0,32,99,114,101,97,116,101,32,112,111,108,121,103,111,110,32,0,32,45,111,117,116,108,105,110,101,32,0,32,99,114,101,97,116,101,32,111,118,97,108,32,0,32,99,114,101,97,116,101,32,116,101,120,116,32,0,32,45,116,101,120,116,32,123,0,125,0,32,45,102,111,110,116,32,123,0,32,37,100,125,0,32,45,97,110,99,104,111,114,32,119,0,32,45,97,110,99,104,111,114,32,101,0,35,0,32,84,105,116,108,101,58,32,0,32,80,97,103,101,115,58,32,37,100,10,0,35,32,71,101,110,101,114,97,116,101,100,32,98,121,32,0,41,10,0,69,114,114,111,114,32,100,117,114,105,110,103,32,99,111,110,118,101,114,115,105,111,110,32,116,111,32,34,85,84,70,45,56,34,46,32,32,81,117,105,116,105,110,103,46,10,0,118,109,108,0,118,109,108,58,118,109,108,0,97,113,117,97,0,102,117,99,104,115,105,97,0,108,105,109,101,0,111,108,105,118,101,0,116,101,97,108,0,32,32,32,32,32,32,60,33,45,45,32,0,32,45,45,62,10,0,32,60,118,58,115,104,97,112,101,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,97,98,115,111,108,117,116,101,59,32,0,32,119,105,100,116,104,58,32,37,100,59,32,104,101,105,103,104,116,58,32,37,100,34,32,102,105,108,108,101,100,61,34,102,97,108,115,101,34,62,0,60,118,58,112,97,116,104,32,118,61,34,0,32,109,32,0,37,46,48,102,44,37,46,48,102,32,0,32,108,32,0,32,101,32,0,34,47,62,0,60,47,118,58,115,104,97,112,101,62,10,0,60,118,58,115,116,114,111,107,101,32,99,111,108,111,114,61,34,0,34,32,119,101,105,103,104,116,61,34,37,46,48,102,112,116,0,34,32,100,97,115,104,115,116,121,108,101,61,34,100,97,115,104,0,34,32,100,97,115,104,115,116,121,108,101,61,34,100,111,116,0,34,32,47,62,0,35,37,48,50,120,37,48,50,120,37,48,50,120,0,103,118,114,101,110,100,101,114,95,99,111,114,101,95,118,109,108,46,99,0,118,109,108,95,112,114,105,110,116,95,99,111,108,111,114,0,32,119,105,100,116,104,58,32,37,100,59,32,104,101,105,103,104,116,58,32,37,100,34,0,32,62,0,60,118,58,112,97,116,104,32,32,118,61,34,0,47,62,60,47,118,58,115,104,97,112,101,62,10,0,109,32,0,37,115,37,46,48,102,44,37,46,48,102,32,0,99,32,0,32,102,105,108,108,101,100,61,34,116,114,117,101,34,32,102,105,108,108,99,111,108,111,114,61,34,0,34,32,0,32,102,105,108,108,101,100,61,34,102,97,108,115,101,34,32,0,37,46,48,102,32,37,46,48,102,32,0,108,32,0,120,32,101,32,34,47,62,0,32,32,60,118,58,111,118,97,108,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,97,98,115,111,108,117,116,101,59,0,32,108,101,102,116,58,32,37,46,50,102,59,32,116,111,112,58,32,37,46,50,102,59,0,32,119,105,100,116,104,58,32,37,46,50,102,59,32,104,101,105,103,104,116,58,32,37,46,50,102,34,0,60,47,118,58,111,118,97,108,62,10,0,60,118,58,114,101,99,116,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,97,98,115,111,108,117,116,101,59,32,0,32,115,116,114,111,107,101,100,61,34,102,97,108,115,101,34,32,102,105,108,108,101,100,61,34,102,97,108,115,101,34,62,10,0,60,118,58,116,101,120,116,98,111,120,32,105,110,115,101,116,61,34,48,44,48,44,48,44,48,34,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,97,98,115,111,108,117,116,101,59,32,118,45,116,101,120,116,45,119,114,97,112,112,105,110,103,58,39,102,97,108,115,101,39,59,112,97,100,100,105,110,103,58,39,48,39,59,0,102,111,110,116,45,102,97,109,105,108,121,58,32,39,37,115,39,59,0,102,111,110,116,45,119,101,105,103,104,116,58,32,37,115,59,0,102,111,110,116,45,115,116,114,101,116,99,104,58,32,37,115,59,0,102,111,110,116,45,115,116,121,108,101,58,32,37,115,59,0,32,102,111,110,116,45,115,105,122,101,58,32,37,46,50,102,112,116,59,0,99,111,108,111,114,58,37,115,59,0,99,111,108,111,114,58,35,37,48,50,120,37,48,50,120,37,48,50,120,59,0,118,109,108,95,116,101,120,116,115,112,97,110,0,34,62,60,99,101,110,116,101,114,62,0,60,47,99,101,110,116,101,114,62,60,47,118,58,116,101,120,116,98,111,120,62,10,0,60,47,118,58,114,101,99,116,62,10,0,60,47,97,62,10,0,60,97,0,32,104,114,101,102,61,34,37,115,34,0,32,116,105,116,108,101,61,34,37,115,34,0,32,116,97,114,103,101,116,61,34,37,115,34,0,62,10,0,60,47,118,58,103,114,111,117,112,62,10,0,60,47,68,73,86,62,10,0,60,68,73,86,32,105,100,61,39,95,86,77,76,50,95,39,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,114,101,108,97,116,105,118,101,59,118,105,115,105,98,105,108,105,116,121,58,104,105,100,100,101,110,34,62,10,0,60,33,45,45,32,105,110,115,101,114,116,32,97,110,121,32,111,116,104,101,114,32,104,116,109,108,32,99,111,110,116,101,110,116,32,104,101,114,101,32,45,45,62,10,0,60,68,73,86,32,105,100,61,39,95,110,111,116,86,77,76,49,95,39,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,114,101,108,97,116,105,118,101,59,34,62,10,0,60,33,45,45,32,116,104,105,115,32,115,104,111,117,108,100,32,111,110,108,121,32,100,105,115,112,108,97,121,32,111,110,32,78,79,78,45,73,69,32,98,114,111,119,115,101,114,115,32,45,45,62,10,0,60,72,50,62,83,111,114,114,121,44,32,116,104,105,115,32,100,105,97,103,114,97,109,32,119,105,108,108,32,111,110,108,121,32,100,105,115,112,108,97,121,32,99,111,114,114,101,99,116,108,121,32,111,110,32,73,110,116,101,114,110,101,116,32,69,120,112,108,111,114,101,114,32,53,32,40,97,110,100,32,117,112,41,32,98,114,111,119,115,101,114,115,46,60,47,72,50,62,10,0,60,68,73,86,32,105,100,61,39,95,110,111,116,86,77,76,50,95,39,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,114,101,108,97,116,105,118,101,59,34,62,10,0,60,33,45,45,32,105,110,115,101,114,116,32,97,110,121,32,111,116,104,101,114,32,78,79,78,45,73,69,32,104,116,109,108,32,99,111,110,116,101,110,116,32,104,101,114,101,32,45,45,62,10,0,60,47,66,79,68,89,62,10,60,47,72,84,77,76,62,10,0,60,72,69,65,68,62,0,60,77,69,84,65,32,104,116,116,112,45,101,113,117,105,118,61,34,67,111,110,116,101,110,116,45,84,121,112,101,34,32,99,111,110,116,101,110,116,61,34,116,101,120,116,47,104,116,109,108,59,32,99,104,97,114,115,101,116,61,85,84,70,45,56,34,62,10,0,60,84,73,84,76,69,62,0,60,47,84,73,84,76,69,62,0,60,33,45,45,32,80,97,103,101,115,58,32,37,100,32,45,45,62,10,0,32,32,32,60,83,67,82,73,80,84,32,76,65,78,71,85,65,71,69,61,39,74,97,118,97,115,99,114,105,112,116,39,62,10,0,32,32,32,102,117,110,99,116,105,111,110,32,98,114,111,119,115,101,114,99,104,101,99,107,40,41,10,0,32,32,32,123,10,0,32,32,32,32,32,32,118,97,114,32,117,97,32,61,32,119,105,110,100,111,119,46,110,97,118,105,103,97,116,111,114,46,117,115,101,114,65,103,101,110,116,10,0,32,32,32,32,32,32,118,97,114,32,109,115,105,101,32,61,32,117,97,46,105,110,100,101,120,79,102,32,40,32,39,77,83,73,69,32,39,32,41,10,0,32,32,32,32,32,32,118,97,114,32,105,101,118,101,114,115,59,10,0,32,32,32,32,32,32,118,97,114,32,105,116,101,109,59,10,0,32,32,32,32,32,32,118,97,114,32,86,77,76,121,101,115,61,110,101,119,32,65,114,114,97,121,40,39,95,86,77,76,49,95,39,44,39,95,86,77,76,50,95,39,41,59,10,0,32,32,32,32,32,32,118,97,114,32,86,77,76,110,111,61,110,101,119,32,65,114,114,97,121,40,39,95,110,111,116,86,77,76,49,95,39,44,39,95,110,111,116,86,77,76,50,95,39,41,59,10,0,32,32,32,32,32,32,105,102,32,40,32,109,115,105,101,32,62,32,48,32,41,123,32,32,32,32,32,32,47,47,32,73,102,32,73,110,116,101,114,110,101,116,32,69,120,112,108,111,114,101,114,44,32,114,101,116,117,114,110,32,118,101,114,115,105,111,110,32,110,117,109,98,101,114,10,0,32,32,32,32,32,32,32,32,32,105,101,118,101,114,115,61,32,112,97,114,115,101,73,110,116,32,40,117,97,46,115,117,98,115,116,114,105,110,103,32,40,109,115,105,101,43,53,44,32,117,97,46,105,110,100,101,120,79,102,32,40,39,46,39,44,32,109,115,105,101,32,41,41,41,10,0,32,32,32,32,32,32,125,10,0,32,32,32,32,32,32,105,102,32,40,105,101,118,101,114,115,62,61,53,41,123,10,0,32,32,32,32,32,32,32,102,111,114,32,40,120,32,105,110,32,86,77,76,121,101,115,41,123,10,0,32,32,32,32,32,32,32,32,32,105,116,101,109,32,61,32,100,111,99,117,109,101,110,116,46,103,101,116,69,108,101,109,101,110,116,66,121,73,100,40,86,77,76,121,101,115,91,120,93,41,59,10,0,32,32,32,32,32,32,32,32,32,105,102,32,40,105,116,101,109,41,32,123,10,0,32,32,32,32,32,32,32,32,32,32,32,105,116,101,109,46,115,116,121,108,101,46,118,105,115,105,98,105,108,105,116,121,61,39,118,105,115,105,98,108,101,39,59,10,0,32,32,32,32,32,32,32,32,32,125,10,0,32,32,32,32,32,32,32,125,10,0,32,32,32,32,32,32,32,102,111,114,32,40,120,32,105,110,32,86,77,76,110,111,41,123,10,0,32,32,32,32,32,32,32,32,32,105,116,101,109,32,61,32,100,111,99,117,109,101,110,116,46,103,101,116,69,108,101,109,101,110,116,66,121,73,100,40,86,77,76,110,111,91,120,93,41,59,10,0,32,32,32,32,32,32,32,32,32,32,32,105,116,101,109,46,115,116,121,108,101,46,118,105,115,105,98,105,108,105,116,121,61,39,104,105,100,100,101,110,39,59,10,0,32,32,32,32,32,125,101,108,115,101,123,10,0,32,32,32,32,32,125,10,0,32,32,32,125,10,0,32,32,32,60,47,83,67,82,73,80,84,62,10,0,60,47,72,69,65,68,62,0,60,66,79,68,89,32,111,110,108,111,97,100,61,39,98,114,111,119,115,101,114,99,104,101,99,107,40,41,59,39,62,10,0,60,68,73,86,32,105,100,61,39,95,86,77,76,49,95,39,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,114,101,108,97,116,105,118,101,59,32,100,105,115,112,108,97,121,58,105,110,108,105,110,101,59,32,118,105,115,105,98,105,108,105,116,121,58,104,105,100,100,101,110,0,32,119,105,100,116,104,58,32,37,100,112,116,59,32,104,101,105,103,104,116,58,32,37,100,112,116,34,62,10,0,60,83,84,89,76,69,62,10,0,118,92,58,42,32,123,32,98,101,104,97,118,105,111,114,58,32,117,114,108,40,35,100,101,102,97,117,108,116,35,86,77,76,41,59,100,105,115,112,108,97,121,58,105,110,108,105,110,101,45,98,108,111,99,107,125,10,0,60,47,83,84,89,76,69,62,10,0,60,120,109,108,58,110,97,109,101,115,112,97,99,101,32,110,115,61,34,117,114,110,58,115,99,104,101,109,97,115,45,109,105,99,114,111,115,111,102,116,45,99,111,109,58,118,109,108,34,32,112,114,101,102,105,120,61,34,118,34,32,47,62,10,0,32,60,118,58,103,114,111,117,112,32,115,116,121,108,101,61,34,112,111,115,105,116,105,111,110,58,114,101,108,97,116,105,118,101,59,32,0,32,119,105,100,116,104,58,32,37,100,112,116,59,32,104,101,105,103,104,116,58,32,37,100,112,116,34,0,32,99,111,111,114,100,111,114,105,103,105,110,61,34,48,44,48,34,32,99,111,111,114,100,115,105,122,101,61,34,37,100,44,37,100,34,32,62,0,60,72,84,77,76,62,10,0,10,60,33,45,45,32,71,101,110,101,114,97,116,101,100,32,98,121,32,0,32,118,101,114,115,105,111,110,32,0,32,40,0,41,10,45,45,62,10,0,112,111,118,32,114,101,110,100,101,114,101,114,58,101,108,32,45,32,37,115,10,0,112,111,118,0,112,111,118,58,112,111,118,0,98,97,107,101,114,115,99,104,111,99,0,98,114,97,115,115,0,98,114,105,103,104,116,103,111,108,100,0,98,114,111,110,122,101,0,98,114,111,110,122,101,50,0,99,108,101,97,114,0,99,111,111,108,99,111,112,112,101,114,0,99,111,112,112,101,114,0,100,97,114,107,98,114,111,119,110,0,100,97,114,107,112,117,114,112,108,101,0,100,97,114,107,116,97,110,0,100,97,114,107,119,111,111,100,0,100,107,103,114,101,101,110,99,111,112,112,101,114,0,100,117,115,116,121,114,111,115,101,0,102,101,108,100,115,112,97,114,0,102,108,101,115,104,0,103,114,97,121,48,53,0,103,114,101,101,110,99,111,112,112,101,114,0,104,117,110,116,101,114,115,103,114,101,101,110,0,108,105,103,104,116,95,112,117,114,112,108,101,0,108,105,103,104,116,119,111,111,100,0,109,97,110,100,97,114,105,110,111,114,97,110,103,101,0,109,101,100,105,117,109,102,111,114,101,115,116,103,114,101,101,110,0,109,101,100,105,117,109,103,111,108,100,101,110,114,111,100,0,109,101,100,105,117,109,119,111,111,100,0,109,101,100,95,112,117,114,112,108,101,0,109,105,99,97,0,110,101,111,110,98,108,117,101,0,110,101,111,110,112,105,110,107,0,110,101,119,109,105,100,110,105,103,104,116,98,108,117,101,0,110,101,119,116,97,110,0,111,108,100,103,111,108,100,0,113,117,97,114,116,122,0,114,105,99,104,98,108,117,101,0,115,99,97,114,108,101,116,0,115,101,109,105,83,119,101,101,116,67,104,111,99,0,115,105,108,118,101,114,0,115,112,105,99,121,112,105,110,107,0,115,117,109,109,101,114,115,107,121,0,118,101,114,121,100,97,114,107,98,114,111,119,110,0,118,101,114,121,95,108,105,103,104,116,95,112,117,114,112,108,101,0,47,47,42,42,42,32,99,111,109,109,101,110,116,58,32,37,115,10,0,47,47,42,42,42,32,112,111,108,121,108,105,110,101,10,0,115,99,97,108,101,32,32,32,32,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,10,0,114,111,116,97,116,101,32,32,32,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,10,0,116,114,97,110,115,108,97,116,101,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,10,0,115,112,104,101,114,101,95,115,119,101,101,112,32,123,10,32,32,32,32,37,115,10,32,32,32,32,37,100,44,10,0,108,105,110,101,97,114,95,115,112,108,105,110,101,0,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,44,32,37,46,51,102,10,0,37,115,32,32,32,32,37,115,0,32,32,32,32,116,111,108,101,114,97,110,99,101,32,48,46,48,49,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,37,115,37,115,0,37,115,32,116,114,97,110,115,109,105,116,32,37,46,51,102,0,82,101,100,0,71,114,101,101,110,0,66,108,117,101,0,114,103,98,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,32,116,114,97,110,115,109,105,116,32,37,46,51,102,0,111,111,112,115,44,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,117,110,104,97,110,100,108,101,100,32,99,111,108,111,114,32,116,121,112,101,61,37,100,32,37,115,10,0,103,118,114,101,110,100,101,114,95,99,111,114,101,95,112,111,118,46,99,0,112,111,118,95,99,111,108,111,114,95,97,115,95,115,116,114,0,112,105,103,109,101,110,116,32,123,32,99,111,108,111,114,32,37,115,32,125,10,0,47,47,42,42,42,32,98,101,122,105,101,114,10,0,98,95,115,112,108,105,110,101,0,32,32,32,32,32,32,32,32,116,111,108,101,114,97,110,99,101,32,48,46,48,49,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,47,47,42,42,42,32,112,111,108,121,103,111,110,10,0,32,32,32,32,116,111,108,101,114,97,110,99,101,32,48,46,49,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,112,111,108,121,103,111,110,32,123,32,37,100,44,10,0,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,0,37,115,10,32,32,32,32,37,115,0,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,47,47,42,42,42,32,101,108,108,105,112,115,101,10,0,116,111,114,117,115,32,123,32,37,46,51,102,44,32,37,46,51,102,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,115,112,104,101,114,101,32,123,60,37,57,46,51,102,44,32,37,57,46,51,102,44,32,37,57,46,51,102,62,44,32,49,46,48,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,47,47,42,42,42,32,116,101,120,116,115,112,97,110,58,32,37,115,44,32,102,111,110,116,115,105,122,101,32,61,32,37,46,51,102,44,32,102,111,110,116,110,97,109,101,32,61,32,37,115,10,0,115,99,97,108,101,32,37,46,51,102,10,0,116,101,120,116,32,123,10,32,32,32,32,116,116,102,32,34,37,115,34,44,10,32,32,32,32,34,37,115,34,44,32,37,46,51,102,44,32,37,46,51,102,10,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,32,32,32,32,37,115,125,10,0,32,32,32,32,110,111,95,115,104,97,100,111,119,10,0,47,47,42,42,42,32,101,110,100,95,101,100,103,101,10,0,47,47,42,42,42,32,98,101,103,105,110,95,101,100,103,101,10,0,47,47,42,42,42,32,101,110,100,95,110,111,100,101,10,0,47,47,42,42,42,32,98,101,103,105,110,95,110,111,100,101,58,32,37,115,10,0,47,47,42,42,42,32,101,110,100,95,99,108,117,115,116,101,114,10,0,47,47,42,42,42,32,98,101,103,105,110,95,99,108,117,115,116,101,114,10,0,47,47,42,42,42,32,101,110,100,95,112,97,103,101,10,0,47,47,42,42,42,32,98,101,103,105,110,95,112,97,103,101,10,0,47,47,42,42,42,32,101,110,100,95,108,97,121,101,114,10,0,47,47,42,42,42,32,98,101,103,105,110,95,108,97,121,101,114,58,32,37,115,44,32,37,100,47,37,100,10,0,47,47,42,42,42,32,101,110,100,95,103,114,97,112,104,10,0,47,47,42,42,42,32,98,101,103,105,110,95,103,114,97,112,104,32,37,115,10,0,99,97,109,101,114,97,32,123,32,108,111,99,97,116,105,111,110,32,60,37,46,51,102,32,44,32,37,46,51,102,32,44,32,37,46,51,102,62,10,32,32,32,32,32,32,32,32,32,108,111,111,107,95,97,116,32,32,60,37,46,51,102,32,44,32,37,46,51,102,32,44,32,37,46,51,102,62,10,32,32,32,32,32,32,32,32,32,114,105,103,104,116,32,120,32,42,32,105,109,97,103,101,95,119,105,100,116,104,32,47,32,105,109,97,103,101,95,104,101,105,103,104,116,10,32,32,32,32,32,32,32,32,32,97,110,103,108,101,32,37,46,51,102,10,125,10,0,47,47,115,107,121,10,112,108,97,110,101,32,123,32,60,48,44,32,49,44,32,48,62,44,32,49,32,104,111,108,108,111,119,10,32,32,32,32,116,101,120,116,117,114,101,32,123,10,32,32,32,32,32,32,32,32,112,105,103,109,101,110,116,32,123,32,98,111,122,111,32,116,117,114,98,117,108,101,110,99,101,32,48,46,57,53,10,32,32,32,32,32,32,32,32,32,32,32,32,99,111,108,111,114,95,109,97,112,32,123,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,91,48,46,48,48,32,114,103,98,32,60,48,46,48,53,44,32,48,46,50,48,44,32,48,46,53,48,62,93,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,91,48,46,53,48,32,114,103,98,32,60,48,46,48,53,44,32,48,46,50,48,44,32,48,46,53,48,62,93,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,91,48,46,55,53,32,114,103,98,32,60,49,46,48,48,44,32,49,46,48,48,44,32,49,46,48,48,62,93,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,91,48,46,55,53,32,114,103,98,32,60,48,46,50,53,44,32,48,46,50,53,44,32,48,46,50,53,62,93,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,91,49,46,48,48,32,114,103,98,32,60,48,46,53,48,44,32,48,46,53,48,44,32,48,46,53,48,62,93,10,32,32,32,32,32,32,32,32,32,32,32,32,125,10,32,32,32,32,32,32,32,32,32,32,32,32,115,99,97,108,101,32,60,49,46,48,48,44,32,49,46,48,48,44,32,49,46,53,48,62,32,42,32,50,46,53,48,10,32,32,32,32,32,32,32,32,32,32,32,32,116,114,97,110,115,108,97,116,101,32,60,48,46,48,48,44,32,48,46,48,48,44,32,48,46,48,48,62,10,32,32,32,32,32,32,32,32,125,10,32,32,32,32,32,32,32,32,102,105,110,105,115,104,32,123,32,97,109,98,105,101,110,116,32,49,32,100,105,102,102,117,115,101,32,48,32,125,10,32,32,32,32,125,10,32,32,32,32,115,99,97,108,101,32,49,48,48,48,48,10,125,10,47,47,109,105,115,116,10,102,111,103,32,123,32,102,111,103,95,116,121,112,101,32,50,10,32,32,32,32,100,105,115,116,97,110,99,101,32,53,48,10,32,32,32,32,99,111,108,111,114,32,114,103,98,32,60,49,46,48,48,44,32,49,46,48,48,44,32,49,46,48,48,62,32,42,32,48,46,55,53,10,32,32,32,32,102,111,103,95,111,102,102,115,101,116,32,48,46,49,48,10,32,32,32,32,102,111,103,95,97,108,116,32,49,46,53,48,10,32,32,32,32,116,117,114,98,117,108,101,110,99,101,32,49,46,55,53,10,125,10,47,47,103,110,100,10,112,108,97,110,101,32,123,32,60,48,46,48,48,44,32,49,46,48,48,44,32,48,46,48,48,62,44,32,48,10,32,32,32,32,116,101,120,116,117,114,101,32,123,10,32,32,32,32,32,32,32,32,112,105,103,109,101,110,116,123,32,99,111,108,111,114,32,114,103,98,32,60,48,46,50,53,44,32,48,46,52,53,44,32,48,46,48,48,62,32,125,10,32,32,32,32,32,32,32,32,110,111,114,109,97,108,32,123,32,98,117,109,112,115,32,48,46,55,53,32,115,99,97,108,101,32,48,46,48,49,32,125,10,32,32,32,32,32,32,32,32,102,105,110,105,115,104,32,123,32,112,104,111,110,103,32,48,46,49,48,32,125,10,32,32,32,32,125,10,125,10,0,108,105,103,104,116,95,115,111,117,114,99,101,32,123,32,60,49,53,48,48,44,51,48,48,48,44,45,50,53,48,48,62,32,99,111,108,111,114,32,87,104,105,116,101,32,125,10,0,35,118,101,114,115,105,111,110,32,51,46,54,59,10,0,103,108,111,98,97,108,95,115,101,116,116,105,110,103,115,32,123,32,97,115,115,117,109,101,100,95,103,97,109,109,97,32,49,46,48,32,125,10,0,35,100,101,102,97,117,108,116,32,123,32,102,105,110,105,115,104,32,123,32,97,109,98,105,101,110,116,32,48,46,49,32,100,105,102,102,117,115,101,32,48,46,57,32,125,32,125,10,0,35,105,110,99,108,117,100,101,32,34,99,111,108,111,114,115,46,105,110,99,34,10,35,105,110,99,108,117,100,101,32,34,116,101,120,116,117,114,101,115,46,105,110,99,34,10,35,105,110,99,108,117,100,101,32,34,115,104,97,112,101,115,46,105,110,99,34,10,0,35,100,101,99,108,97,114,101,32,37,115,32,61,32,37,115,59,10,0,66,108,97,99,107,0,87,104,105,116,101,0,112,105,99,0,112,105,99,58,112,105,99,0,37,115,32,37,115,10,0,46,92,34,32,0,32,37,100,32,37,100,0,32,37,115,10,0,32,37,100,0,102,105,108,108,32,0,101,108,108,105,112,115,101,32,97,116,116,114,115,37,100,32,37,115,119,105,100,32,37,46,53,102,32,104,116,32,37,46,53,102,32,97,116,32,40,37,46,53,102,44,37,46,53,102,41,59,10,0,46,102,116,32,37,115,10,0,46,112,115,32,37,100,42,92,110,40,83,70,117,47,37,46,48,102,117,10,0,34,37,115,34,32,97,116,32,40,37,46,53,102,44,37,46,53,102,41,59,10,0,37,48,51,111,0,37,115,37,115,32,105,115,32,110,111,116,32,97,32,116,114,111,102,102,32,102,111,110,116,10,0,100,111,116,32,112,105,99,32,112,108,117,103,105,110,58,32,0,82,0,93,10,46,80,69,10,0,46,80,83,32,37,46,53,102,32,37,46,53,102,10,0,37,115,32,116,111,32,99,104,97,110,103,101,32,100,114,97,119,105,110,103,32,115,105,122,101,44,32,109,117,108,116,105,112,108,121,32,116,104,101,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,111,110,32,116,104,101,32,46,80,83,32,108,105,110,101,32,97,98,111,118,101,32,97,110,100,32,116,104,101,32,110,117,109,98,101,114,32,111,110,32,116,104,101,32,116,119,111,32,108,105,110,101,115,32,98,101,108,111,119,32,40,114,111,117,110,100,101,100,32,116,111,32,116,104,101,32,110,101,97,114,101,115,116,32,105,110,116,101,103,101,114,41,32,98,121,32,97,32,115,99,97,108,101,32,102,97,99,116,111,114,10,0,46,110,114,32,83,70,32,37,46,48,102,10,115,99,97,108,101,116,104,105,99,107,110,101,115,115,32,61,32,37,46,48,102,10,0,37,115,32,100,111,110,39,116,32,99,104,97,110,103,101,32,97,110,121,116,104,105,110,103,32,98,101,108,111,119,32,116,104,105,115,32,108,105,110,101,32,105,110,32,116,104,105,115,32,100,114,97,119,105,110,103,10,0,37,115,32,110,111,110,45,102,97,116,97,108,32,114,117,110,45,116,105,109,101,32,112,105,99,32,118,101,114,115,105,111,110,32,100,101,116,101,114,109,105,110,97,116,105,111,110,44,32,118,101,114,115,105,111,110,32,50,10,0,98,111,120,114,97,100,61,50,46,48,32,37,115,32,119,105,108,108,32,98,101,32,114,101,115,101,116,32,116,111,32,48,46,48,32,98,121,32,103,112,105,99,32,111,110,108,121,10,0,115,99,97,108,101,61,49,46,48,32,37,115,32,114,101,113,117,105,114,101,100,32,102,111,114,32,99,111,109,112,97,114,105,115,111,110,115,10,0,37,115,32,98,111,120,114,97,100,32,105,115,32,110,111,119,32,48,46,48,32,105,110,32,103,112,105,99,44,32,101,108,115,101,32,105,116,32,114,101,109,97,105,110,115,32,50,46,48,10,0,37,115,32,100,97,115,104,119,105,100,32,105,115,32,48,46,49,32,105,110,32,49,48,116,104,32,69,100,105,116,105,111,110,44,32,48,46,48,53,32,105,110,32,68,87,66,32,50,32,97,110,100,32,105,110,32,103,112,105,99,10,0,37,115,32,102,105,108,108,118,97,108,32,105,115,32,48,46,51,32,105,110,32,49,48,116,104,32,69,100,105,116,105,111,110,32,40,102,105,108,108,32,48,32,109,101,97,110,115,32,98,108,97,99,107,41,44,32,48,46,53,32,105,110,32,103,112,105,99,32,40,102,105,108,108,32,48,32,109,101,97,110,115,32,119,104,105,116,101,41,44,32,117,110,100,101,102,105,110,101,100,32,105,110,32,68,87,66,32,50,10,0,37,115,32,102,105,108,108,32,104,97,115,32,110,111,32,109,101,97,110,105,110,103,32,105,110,32,68,87,66,32,50,44,32,103,112,105,99,32,99,97,110,32,117,115,101,32,102,105,108,108,32,111,114,32,102,105,108,108,101,100,44,32,49,48,116,104,32,69,100,105,116,105,111,110,32,117,115,101,115,32,102,105,108,108,32,111,110,108,121,10,0,37,115,32,68,87,66,32,50,32,100,111,101,115,110,39,116,32,117,115,101,32,102,105,108,108,32,97,110,100,32,100,111,101,115,110,39,116,32,100,101,102,105,110,101,32,102,105,108,108,118,97,108,10,0,37,115,32,114,101,115,101,116,32,119,111,114,107,115,32,105,110,32,103,112,105,99,32,97,110,100,32,49,48,116,104,32,101,100,105,116,105,111,110,44,32,98,117,116,32,105,115,110,39,116,32,100,101,102,105,110,101,100,32,105,110,32,68,87,66,32,50,10,0,37,115,32,68,87,66,32,50,32,99,111,109,112,97,116,105,98,105,108,105,116,121,32,100,101,102,105,110,105,116,105,111,110,115,10,0,105,102,32,98,111,120,114,97,100,32,62,32,49,46,48,32,38,38,32,100,97,115,104,119,105,100,32,60,32,48,46,48,55,53,32,116,104,101,110,32,88,10,9,102,105,108,108,118,97,108,32,61,32,49,59,10,9,100,101,102,105,110,101,32,102,105,108,108,32,89,32,89,59,10,9,100,101,102,105,110,101,32,115,111,108,105,100,32,89,32,89,59,10,9,100,101,102,105,110,101,32,114,101,115,101,116,32,89,32,115,99,97,108,101,61,49,46,48,32,89,59,10,88,10,0,114,101,115,101,116,32,37,115,32,115,101,116,32,116,111,32,107,110,111,119,110,32,115,116,97,116,101,10,0,37,115,32,71,78,85,32,112,105,99,32,118,115,46,32,49,48,116,104,32,69,100,105,116,105,111,110,32,100,92,40,101,39,116,101,110,116,101,10,0,105,102,32,102,105,108,108,118,97,108,32,62,32,48,46,52,32,116,104,101,110,32,88,10,9,100,101,102,105,110,101,32,115,101,116,102,105,108,108,118,97,108,32,89,32,102,105,108,108,118,97,108,32,61,32,49,32,45,32,89,59,10,9,100,101,102,105,110,101,32,98,111,108,100,32,89,32,116,104,105,99,107,110,101,115,115,32,50,32,89,59,10,0,9,37,115,32,105,102,32,121,111,117,32,117,115,101,32,103,112,105,99,32,97,110,100,32,105,116,32,98,97,114,102,115,32,111,110,32,101,110,99,111,117,110,116,101,114,105,110,103,32,34,115,111,108,105,100,34,44,10,0,9,37,115,9,105,110,115,116,97,108,108,32,97,32,109,111,114,101,32,114,101,99,101,110,116,32,118,101,114,115,105,111,110,32,111,102,32,103,112,105,99,32,111,114,32,115,119,105,116,99,104,32,116,111,32,68,87,66,32,111,114,32,49,48,116,104,32,69,100,105,116,105,111,110,32,112,105,99,59,10,0,9,37,115,9,115,111,114,114,121,44,32,116,104,101,32,103,114,111,102,102,32,102,111,108,107,115,32,99,104,97,110,103,101,100,32,103,112,105,99,59,32,115,101,110,100,32,97,110,121,32,99,111,109,112,108,97,105,110,116,32,116,111,32,116,104,101,109,59,10,0,88,32,101,108,115,101,32,90,10,9,100,101,102,105,110,101,32,115,101,116,102,105,108,108,118,97,108,32,89,32,102,105,108,108,118,97,108,32,61,32,89,59,10,9,100,101,102,105,110,101,32,98,111,108,100,32,89,32,89,59,10,9,100,101,102,105,110,101,32,102,105,108,108,101,100,32,89,32,102,105,108,108,32,89,59,10,90,10,0,37,115,32,97,114,114,111,119,104,101,97,100,32,104,97,115,32,110,111,32,109,101,97,110,105,110,103,32,105,110,32,68,87,66,32,50,44,32,97,114,114,111,119,104,101,97,100,32,61,32,55,32,109,97,107,101,115,32,102,105,108,108,101,100,32,97,114,114,111,119,104,101,97,100,115,32,105,110,32,103,112,105,99,32,97,110,100,32,105,110,32,49,48,116,104,32,69,100,105,116,105,111,110,10,0,37,115,32,97,114,114,111,119,104,101,97,100,32,105,115,32,117,110,100,101,102,105,110,101,100,32,105,110,32,68,87,66,32,50,44,32,105,110,105,116,105,97,108,108,121,32,49,32,105,110,32,103,112,105,99,44,32,50,32,105,110,32,49,48,116,104,32,69,100,105,116,105,111,110,10,0,97,114,114,111,119,104,101,97,100,32,61,32,55,32,37,115,32,110,111,116,32,117,115,101,100,32,98,121,32,103,114,97,112,104,118,105,122,10,0,37,115,32,71,78,85,32,112,105,99,32,115,117,112,112,111,114,116,115,32,97,32,98,111,120,114,97,100,32,118,97,114,105,97,98,108,101,32,116,111,32,100,114,97,119,32,98,111,120,101,115,32,119,105,116,104,32,114,111,117,110,100,101,100,32,99,111,114,110,101,114,115,59,32,68,87,66,32,97,110,100,32,49,48,116,104,32,69,100,46,32,100,111,32,110,111,116,10,0,98,111,120,114,97,100,32,61,32,48,32,37,115,32,110,111,32,114,111,117,110,100,101,100,32,99,111,114,110,101,114,115,32,105,110,32,103,114,97,112,104,118,105,122,10,0,37,115,32,71,78,85,32,112,105,99,32,115,117,112,112,111,114,116,115,32,97,32,108,105,110,101,116,104,105,99,107,32,118,97,114,105,97,98,108,101,32,116,111,32,115,101,116,32,108,105,110,101,32,116,104,105,99,107,110,101,115,115,59,32,68,87,66,32,97,110,100,32,49,48,116,104,32,69,100,46,32,100,111,32,110,111,116,10,0,108,105,110,101,116,104,105,99,107,32,61,32,48,59,32,111,108,100,108,105,110,101,116,104,105,99,107,32,61,32,108,105,110,101,116,104,105,99,107,10,0,37,115,32,46,80,83,32,119,47,111,32,97,114,103,115,32,99,97,117,115,101,115,32,71,78,85,32,112,105,99,32,116,111,32,115,99,97,108,101,32,100,114,97,119,105,110,103,32,116,111,32,102,105,116,32,56,46,53,120,49,49,32,112,97,112,101,114,59,32,68,87,66,32,100,111,101,115,32,110,111,116,10,0,37,115,32,109,97,120,112,115,104,116,32,97,110,100,32,109,97,120,112,115,119,105,100,32,104,97,118,101,32,110,111,32,109,101,97,110,105,110,103,32,105,110,32,68,87,66,32,50,46,48,44,32,115,101,116,32,112,97,103,101,32,98,111,117,110,100,97,114,105,101,115,32,105,110,32,103,112,105,99,32,97,110,100,32,105,110,32,49,48,116,104,32,69,100,105,116,105,111,110,10,0,37,115,32,109,97,120,112,115,104,116,32,97,110,100,32,109,97,120,112,115,119,105,100,32,97,114,101,32,112,114,101,100,101,102,105,110,101,100,32,116,111,32,49,49,46,48,32,97,110,100,32,56,46,53,32,105,110,32,103,112,105,99,10,0,109,97,120,112,115,104,116,32,61,32,37,102,10,109,97,120,112,115,119,105,100,32,61,32,37,102,10,0,68,111,116,58,32,91,10,0,100,101,102,105,110,101,32,97,116,116,114,115,48,32,37,37,32,37,37,59,32,100,101,102,105,110,101,32,117,110,102,105,108,108,101,100,32,37,37,32,37,37,59,32,100,101,102,105,110,101,32,114,111,117,110,100,101,100,32,37,37,32,37,37,59,32,100,101,102,105,110,101,32,100,105,97,103,111,110,97,108,115,32,37,37,32,37,37,10,0,37,115,37,115,32,117,110,115,117,112,112,111,114,116,101,100,10,0,37,115,32,114,101,115,116,111,114,101,32,112,111,105,110,116,32,115,105,122,101,32,97,110,100,32,102,111,110,116,10,46,112,115,32,92,110,40,46,83,10,46,102,116,32,92,110,40,68,70,10,0,37,115,32,67,114,101,97,116,111,114,58,32,37,115,32,118,101,114,115,105,111,110,32,37,115,32,40,37,115,41,10,0,37,115,32,84,105,116,108,101,58,32,37,115,10,0,37,115,32,115,97,118,101,32,112,111,105,110,116,32,115,105,122,101,32,97,110,100,32,102,111,110,116,10,46,110,114,32,46,83,32,92,110,40,46,115,10,46,110,114,32,68,70,32,92,110,40,46,102,10,0,112,110,103,58,115,118,103,0,103,105,102,58,115,118,103,0,106,112,101,103,58,115,118,103,0,106,112,101,58,115,118,103,0,106,112,103,58,115,118,103,0,112,110,103,58,102,105,103,0,103,105,102,58,102,105,103,0,106,112,101,103,58,102,105,103,0,106,112,101,58,102,105,103,0,106,112,103,58,102,105,103,0,112,110,103,58,118,114,109,108,0,103,105,102,58,118,114,109,108,0,106,112,101,103,58,118,114,109,108,0,106,112,101,58,118,114,109,108,0,106,112,103,58,118,114,109,108,0,101,112,115,58,112,115,0,112,115,58,112,115,0,40,108,105,98,41,58,112,115,0,112,110,103,58,109,97,112,0,103,105,102,58,109,97,112,0,106,112,101,103,58,109,97,112,0,106,112,101,58,109,97,112,0,106,112,103,58,109,97,112,0,112,115,58,109,97,112,0,101,112,115,58,109,97,112,0,115,118,103,58,109,97,112,0,112,110,103,58,100,111,116,0,103,105,102,58,100,111,116,0,106,112,101,103,58,100,111,116,0,106,112,101,58,100,111,116,0,106,112,103,58,100,111,116,0,112,115,58,100,111,116,0,101,112,115,58,100,111,116,0,115,118,103,58,100,111,116,0,112,110,103,58,120,100,111,116,0,103,105,102,58,120,100,111,116,0,106,112,101,103,58,120,100,111,116,0,106,112,101,58,120,100,111,116,0,106,112,103,58,120,100,111,116,0,112,115,58,120,100,111,116,0,101,112,115,58,120,100,111,116,0,115,118,103,58,120,100,111,116,0,115,118,103,58,115,118,103,0,112,110,103,58,118,109,108,0,103,105,102,58,118,109,108,0,106,112,101,103,58,118,109,108,0,106,112,101,58,118,109,108,0,106,112,103,58,118,109,108,0,103,105,102,58,116,107,0,105,109,97,103,101,32,99,114,101,97,116,101,32,112,104,111,116,111,32,34,112,104,111,116,111,95,37,115,34,32,45,102,105,108,101,32,34,37,115,34,10,0,36,99,32,99,114,101,97,116,101,32,105,109,97,103,101,32,37,46,50,102,32,37,46,50,102,32,45,105,109,97,103,101,32,34,112,104,111,116,111,95,37,115,34,10,0,60,118,58,105,109,97,103,101,32,115,114,99,61,34,37,115,34,32,115,116,121,108,101,61,34,32,112,111,115,105,116,105,111,110,58,97,98,115,111,108,117,116,101,59,32,119,105,100,116,104,58,37,46,50,102,59,32,104,101,105,103,104,116,58,37,46,50,102,59,32,108,101,102,116,58,37,46,50,102,32,59,32,116,111,112,58,37,46,50,102,34,0,32,47,62,10,0,103,118,108,111,97,100,105,109,97,103,101,95,99,111,114,101,46,99,0,99,111,114,101,95,108,111,97,100,105,109,97,103,101,95,112,115,108,105,98,0,91,32,0,37,103,32,37,103,32,0,93,32,32,37,100,32,116,114,117,101,32,37,115,10,0,93,32,32,37,100,32,102,97,108,115,101,32,37,115,10,0,99,111,114,101,95,108,111,97,100,105,109,97,103,101,95,112,115,0,103,115,97,118,101,32,37,103,32,37,103,32,116,114,97,110,115,108,97,116,101,32,110,101,119,112,97,116,104,10,0,117,115,101,114,95,115,104,97,112,101,95,37,100,10,0,103,114,101,115,116,111,114,101,10,0,99,111,114,101,95,108,111,97,100,105,109,97,103,101,95,118,114,109,108,0,83,104,97,112,101,32,123,10,0,32,32,97,112,112,101,97,114,97,110,99,101,32,65,112,112,101,97,114,97,110,99,101,32,123,10,0,32,32,32,32,109,97,116,101,114,105,97,108,32,77,97,116,101,114,105,97,108,32,123,10,0,32,32,32,32,32,32,97,109,98,105,101,110,116,73,110,116,101,110,115,105,116,121,32,48,46,51,51,10,0,32,32,32,32,32,32,32,32,100,105,102,102,117,115,101,67,111,108,111,114,32,49,32,49,32,49,10,0,32,32,32,32,125,10,0,32,32,32,32,116,101,120,116,117,114,101,32,73,109,97,103,101,84,101,120,116,117,114,101,32,123,32,117,114,108,32,34,37,115,34,32,125,10,0,32,32,125,10,0,99,111,114,101,95,108,111,97,100,105,109,97,103,101,95,102,105,103,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,46,49,102,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,32,37,100,32,37,115,10,0,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,99,111,114,101,95,108,111,97,100,105,109,97,103,101,95,115,118,103,0,60,105,109,97,103,101,32,120,108,105,110,107,58,104,114,101,102,61,34,0,34,32,119,105,100,116,104,61,34,37,103,112,120,34,32,104,101,105,103,104,116,61,34,37,103,112,120,34,32,112,114,101,115,101,114,118,101,65,115,112,101,99,116,82,97,116,105,111,61,34,120,77,105,100,89,77,105,100,32,109,101,101,116,34,32,120,61,34,37,103,34,32,121,61,34,37,103,34,0,32,116,114,97,110,115,102,111,114,109,61,34,114,111,116,97,116,101,40,37,100,32,37,103,32,37,103,41,34,0,34,32,119,105,100,116,104,61,34,37,103,112,120,34,32,104,101,105,103,104,116,61,34,37,103,112,120,34,32,112,114,101,115,101,114,118,101,65,115,112,101,99,116,82,97,116,105,111,61,34,120,77,105,110,89,77,105,110,32,109,101,101,116,34,32,120,61,34,37,103,34,32,121,61,34,37,103,34,0,47,62,10,0,100,111,116,95,108,97,121,111,117,116,0,112,104,97,115,101,0,100,111,116,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,97,115,112,101,99,116,32,97,116,116,114,105,98,117,116,101,32,102,111,114,32,100,105,115,99,111,110,110,101,99,116,101,100,32,103,114,97,112,104,115,32,111,114,32,103,114,97,112,104,115,32,119,105,116,104,32,99,108,117,115,116,101,114,115,10,0,99,111,109,112,111,117,110,100,0,118,32,61,61,32,110,0,100,111,116,105,110,105,116,46,99,0,114,101,109,111,118,101,95,102,114,111,109,95,114,97,110,107,0,111,114,100,101,114,0,101,100,103,101,32,108,97,98,101,108,115,32,119,105,116,104,32,115,112,108,105,110,101,115,61,99,117,114,118,101,100,32,110,111,116,32,115],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+112222);allocate([117,112,112,111,114,116,101,100,32,105,110,32,100,111,116,32,45,32,117,115,101,32,120,108,97,98,101,108,115,10,0,69,68,95,108,97,98,101,108,40,102,101,41,0,100,111,116,115,112,108,105,110,101,115,46,99,0,95,100,111,116,95,115,112,108,105,110,101,115,0,120,120,120,0,49,48,48,48,48,0,123,37,115,125,0,97,117,120,103,0,108,97,98,101,108,95,102,108,111,97,116,0,102,105,120,101,100,0,40,108,32,61,32,69,68,95,108,97,98,101,108,40,102,101,41,41,0,115,101,116,69,100,103,101,76,97,98,101,108,80,111,115,0,101,32,33,61,32,78,85,76,76,0,102,97,115,116,103,114,46,99,0,100,101,108,101,116,101,95,102,97,115,116,95,101,100,103,101,0,110,32,33,61,32,78,68,95,110,101,120,116,40,110,41,0,102,97,115,116,95,110,111,100,101,0,117,32,33,61,32,118,0,102,97,115,116,95,110,111,100,101,97,112,112,0,78,68,95,110,101,120,116,40,118,41,32,61,61,32,78,85,76,76,0,102,105,110,100,95,102,97,115,116,95,110,111,100,101,40,103,44,32,110,41,0,100,101,108,101,116,101,95,102,97,115,116,95,110,111,100,101,0,100,101,108,101,116,101,95,102,108,97,116,95,101,100,103,101,0,109,101,114,103,101,95,111,110,101,119,97,121,32,103,108,105,116,99,104,10,0,109,101,114,103,101,95,111,110,101,119,97,121,0,115,97,102,101,95,100,101,108,101,116,101,95,102,97,115,116,95,101,100,103,101,0,114,101,109,105,110,99,114,111,115,115,0,0,105,110,115,116,97,108,108,95,105,110,95,114,97,110,107,44,32,108,105,110,101,32,37,100,58,32,37,115,32,37,115,32,114,97,110,107,32,37,100,32,105,32,61,32,37,100,32,97,110,32,61,32,48,10,0,71,68,95,114,97,110,107,40,103,41,91,114,93,46,110,32,60,61,32,71,68,95,114,97,110,107,40,103,41,91,114,93,46,97,110,0,109,105,110,99,114,111,115,115,46,99,0,105,110,115,116,97,108,108,95,105,110,95,114,97,110,107,0,105,110,115,116,97,108,108,95,105,110,95,114,97,110,107,44,32,108,105,110,101,32,37,100,58,32,78,68,95,111,114,100,101,114,40,37,115,41,32,91,37,100,93,32,62,32,71,68,95,114,97,110,107,40,82,111,111,116,41,91,37,100,93,46,97,110,32,91,37,100,93,10,0,105,110,115,116,97,108,108,95,105,110,95,114,97,110,107,44,32,108,105,110,101,32,37,100,58,32,114,97,110,107,32,37,100,32,110,111,116,32,105,110,32,114,97,110,107,32,114,97,110,103,101,32,91,37,100,44,37,100,93,10,0,105,110,115,116,97,108,108,95,105,110,95,114,97,110,107,44,32,108,105,110,101,32,37,100,58,32,71,68,95,114,97,110,107,40,103,41,91,37,100,93,46,118,32,43,32,78,68,95,111,114,100,101,114,40,37,115,41,32,91,37,100,93,32,62,32,71,68,95,114,97,110,107,40,103,41,91,37,100,93,46,97,118,32,43,32,71,68,95,114,97,110,107,40,82,111,111,116,41,91,37,100,93,46,97,110,32,91,37,100,93,10,0,115,117,114,112,114,105,115,101,10,0,78,68,95,111,114,100,101,114,40,118,41,32,60,32,78,68,95,111,114,100,101,114,40,119,41,0,116,114,97,110,115,112,111,115,101,95,115,116,101,112,0,118,0,110,101,105,103,104,98,111,114,0,40,114,118,32,61,61,32,48,41,32,124,124,32,40,78,68,95,111,114,100,101,114,40,114,118,41,45,78,68,95,111,114,100,101,114,40,118,41,41,42,100,105,114,32,62,32,48,0,109,105,110,99,114,111,115,115,32,37,115,58,32,37,100,32,99,114,111,115,115,105,110,103,115,44,32,37,46,50,102,32,115,101,99,115,46,10,0,99,111,110,115,116,114,97,105,110,105,110,103,95,102,108,97,116,95,101,100,103,101,40,103,44,118,44,101,41,32,61,61,32,70,65,76,83,69,0,102,108,97,116,95,114,101,111,114,100,101,114,0,78,68,95,114,97,110,107,40,118,41,32,61,61,32,114,0,112,111,115,116,111,114,100,101,114,0,102,108,97,116,105,110,100,101,120,40,97,103,104,101,97,100,40,101,41,41,32,60,32,77,45,62,110,114,111,119,115,0,102,108,97,116,95,115,101,97,114,99,104,0,102,108,97,116,105,110,100,101,120,40,97,103,116,97,105,108,40,101,41,41,32,60,32,77,45,62,110,99,111,108,115,0,111,117,116,0,111,114,100,101,114,105,110,103,32,39,37,115,39,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,46,10,0,111,114,100,101,114,105,110,103,32,39,37,115,39,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,32,102,111,114,32,110,111,100,101,32,39,37,115,39,46,10,0,109,101,114,103,101,50,58,32,103,114,97,112,104,32,37,115,44,32,114,97,110,107,32,37,100,32,104,97,115,32,111,110,108,121,32,37,100,32,60,32,37,100,32,110,111,100,101,115,10,0,109,105,110,99,114,111,115,115,58,32,112,97,115,115,32,37,100,32,105,116,101,114,32,37,100,32,116,114,121,105,110,103,32,37,100,32,99,117,114,95,99,114,111,115,115,32,37,100,32,98,101,115,116,95,99,114,111,115,115,32,37,100,10,0,98,97,108,97,110,99,101,0,95,110,101,119,95,114,97,110,107,0,109,99,108,105,109,105,116,0,114,97,110,107,40,103,44,32,50,44,32,110,115,105,116,101,114,50,40,103,41,41,32,61,61,32,48,0,112,111,115,105,116,105,111,110,46,99,0,100,111,116,95,112,111,115,105,116,105,111,110,0,69,100,103,101,32,108,101,110,103,116,104,32,37,102,32,108,97,114,103,101,114,32,116,104,97,110,32,109,97,120,105,109,117,109,32,37,117,32,97,108,108,111,119,101,100,46,10,67,104,101,99,107,32,102,111,114,32,111,118,101,114,119,105,100,101,32,110,111,100,101,40,115,41,46,10,0,65,82,61,37,48,46,52,108,102,9,32,65,114,101,97,61,32,37,48,46,52,108,102,9,0,68,117,109,109,121,61,37,100,10,0,71,111,105,110,103,32,116,111,32,97,112,112,108,121,32,97,110,111,116,104,101,114,32,101,120,112,97,110,115,105,111,110,46,10,0,110,101,120,116,35,105,116,101,114,61,37,100,10,0,104,112,0,99,111,110,110,101,99,116,71,114,97,112,104,0,110,115,108,105,109,105,116,0,99,111,110,116,97,105,110,95,110,111,100,101,115,32,99,108,117,115,116,32,37,115,32,114,97,110,107,32,37,100,32,109,105,115,115,105,110,103,32,110,111,100,101,10,0,110,115,108,105,109,105,116,49,0,110,101,119,114,97,110,107,0,77,97,120,114,97,110,107,32,61,32,37,100,44,32,109,105,110,114,97,110,107,32,61,32,37,100,10,0,108,101,97,100,101,114,32,33,61,32,78,85,76,76,0,114,97,110,107,46,99,0,99,108,117,115,116,101,114,95,108,101,97,100,101,114,0,40,78,68,95,85,70,95,115,105,122,101,40,110,41,32,60,61,32,49,41,32,124,124,32,40,110,32,61,61,32,108,101,97,100,101,114,41,0,97,103,104,101,97,100,40,101,41,32,61,61,32,85,70,95,102,105,110,100,40,97,103,104,101,97,100,40,101,41,41,0,109,105,110,109,97,120,95,101,100,103,101,115,0,97,103,116,97,105,108,40,101,41,32,61,61,32,85,70,95,102,105,110,100,40,97,103,116,97,105,108,40,101,41,41,0,114,97,110,107,0,115,97,109,101,0,109,105,110,0,115,111,117,114,99,101,0,109,97,120,0,115,105,110,107,0,108,101,118,101,108,32,97,115,115,105,103,110,109,101,110,116,32,99,111,110,115,116,114,97,105,110,116,115,0,108,101,118,101,108,32,103,114,97,112,104,32,114,101,99,0,127,114,111,111,116,0,127,116,111,112,0,127,98,111,116,0,99,111,109,112,97,99,116,0,95,119,101,97,107,95,37,100,0,114,97,110,107,105,110,103,58,32,102,97,105,108,117,114,101,32,116,111,32,99,114,101,97,116,101,32,115,116,114,111,110,103,32,99,111,110,115,116,114,97,105,110,116,32,101,100,103,101,32,98,101,116,119,101,101,110,32,110,111,100,101,115,32,37,115,32,97,110,100,32,37,115,10,0,37,115,32,104,97,115,32,117,110,114,101,99,111,103,110,105,122,101,100,32,114,97,110,107,61,37,115,0,108,101,118,101,108,32,101,100,103,101,32,114,101,99,0,108,101,118,101,108,32,110,111,100,101,32,114,101,99,0,115,97,109,101,104,101,97,100,0,115,97,109,101,116,97,105,108,0,116,111,111,32,109,97,110,121,32,40,62,32,37,100,41,32,115,97,109,101,123,104,101,97,100,44,116,97,105,108,125,32,103,114,111,117,112,115,32,102,111,114,32,110,111,100,101,32,37,115,10,0,99,111,109,98,105,65,82,32,61,32,37,108,102,10,0,37,108,102,44,37,100,0,116,104,101,32,97,115,112,101,99,116,32,97,116,116,114,105,98,117,116,101,32,104,97,115,32,98,101,101,110,32,100,105,115,97,98,108,101,100,32,100,117,101,32,116,111,32,105,109,112,108,101,109,101,110,116,97,116,105,111,110,32,102,108,97,119,115,32,45,32,97,116,116,114,105,98,117,116,101,32,105,103,110,111,114,101,100,46,10,0,69,68,95,116,111,95,118,105,114,116,40,101,41,32,61,61,32,78,85,76,76,0,99,108,97,115,115,50,46,99,0,109,101,114,103,101,95,99,104,97,105,110,0,69,68,95,116,111,95,118,105,114,116,40,111,114,105,103,41,32,61,61,32,78,85,76,76,0,109,97,107,101,95,99,104,97,105,110,0,69,68,95,116,111,95,118,105,114,116,40,111,114,105,103,41,32,33,61,32,78,85,76,76,0,37,115,32,119,97,115,32,97,108,114,101,97,100,121,32,105,110,32,97,32,114,97,110,107,115,101,116,44,32,100,101,108,101,116,101,100,32,102,114,111,109,32,99,108,117,115,116,101,114,32,37,115,10,0,78,68,95,114,97,110,107,40,102,114,111,109,41,32,60,32,78,68,95,114,97,110,107,40,116,111,41,0,99,108,117,115,116,101,114,46,99,0,109,97,112,95,112,97,116,104,0,108,104,101,97,100,0,108,116,97,105,108,0,37,115,32,45,62,32,37,115,58,32,115,112,108,105,110,101,32,115,105,122,101,32,62,32,49,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,37,115,32,45,62,32,37,115,58,32,104,101,97,100,32,110,111,116,32,105,110,115,105,100,101,32,104,101,97,100,32,99,108,117,115,116,101,114,32,37,115,10,0,37,115,32,45,62,32,37,115,58,32,116,97,105,108,32,105,115,32,105,110,115,105,100,101,32,104,101,97,100,32,99,108,117,115,116,101,114,32,37,115,10,0,98,101,122,45,62,115,102,108,97,103,0,99,111,109,112,111,117,110,100,46,99,0,109,97,107,101,67,111,109,112,111,117,110,100,69,100,103,101,0,98,101,122,45,62,101,102,108,97,103,0,37,115,32,45,62,32,37,115,58,32,116,97,105,108,32,110,111,116,32,105,110,115,105,100,101,32,116,97,105,108,32,99,108,117,115,116,101,114,32,37,115,10,0,37,115,32,45,62,32,37,115,58,32,104,101,97,100,32,105,115,32,105,110,115,105,100,101,32,116,97,105,108,32,99,108,117,115,116,101,114,32,37,115,10,0,115,101,103,109,101,110,116,32,91,37,115,44,37,115,93,32,100,111,101,115,32,110,111,116,32,105,110,116,101,114,115,101,99,116,32,98,111,120,32,108,108,61,37,115,44,117,114,61,37,115,10,0,98,111,120,73,110,116,101,114,115,101,99,116,102,0,40,37,46,53,103,44,37,46,53,103,41,0,99,108,117,115,116,101,114,32,110,97,109,101,100,32,37,115,32,110,111,116,32,102,111,117,110,100,10,0,99,111,110,99,101,110,116,114,97,116,101,61,116,114,117,101,32,109,97,121,32,110,111,116,32,119,111,114,107,32,99,111,114,114,101,99,116,108,121,46,10,0,114,101,98,117,105,108,116,100,95,118,108,105,115,116,115,58,32,114,97,110,107,32,108,101,97,100,32,37,115,32,110,111,116,32,105,110,32,111,114,100,101,114,32,37,100,32,111,102,32,114,97,110,107,32,37,100,10,0,100,101,103,101,110,101,114,97,116,101,32,99,111,110,99,101,110,116,114,97,116,101,100,32,114,97,110,107,32,37,115,44,37,100,10,0,78,68,95,105,110,40,114,105,103,104,116,41,46,115,105,122,101,32,43,32,78,68,95,111,117,116,40,114,105,103,104,116,41,46,115,105,122,101,32,61,61,32,48,0,99,111,110,99,46,99,0,109,101,114,103,101,118,105,114,116,117,97,108,0,0,78,68,95,111,117,116,40,118,41,46,115,105,122,101,32,61,61,32,50,0,102,108,97,116,46,99,0,115,101,116,98,111,117,110,100,115,0,71,68,95,109,105,110,114,97,110,107,40,103,41,32,61,61,32,48,0,97,98,111,109,105,110,97,116,105,111,110,0,110,101,97,116,111,95,108,97,121,111,117,116,0,110,101,97,116,111,0,102,100,112,0,115,102,100,112,0,116,119,111,112,105,0,99,105,114,99,111,0,112,97,116,99,104,119,111,114,107,0,111,115,97,103,101,0,110,111,112,0,110,111,112,49,0,110,111,112,50,0,37,108,102,44,37,108,102,44,37,108,102,37,99,0,110,111,100,101,32,37,115,44,32,112,111,115,105,116,105,111,110,32,37,115,44,32,101,120,112,101,99,116,101,100,32,116,119,111,32,100,111,117,98,108,101,115,10,0,110,111,100,101,32,37,115,32,105,110,32,103,114,97,112,104,32,37,115,32,104,97,115,32,110,111,32,112,111,115,105,116,105,111,110,10,0,115,116,97,114,116,0,115,101,108,102,0,114,97,110,100,111,109,0,110,111,100,101,32,112,111,115,105,116,105,111,110,115,32,97,114,101,32,105,103,110,111,114,101,100,32,117,110,108,101,115,115,32,115,116,97,114,116,61,114,97,110,100,111,109,10,0,97,115,32,114,101,113,117,105,114,101,100,32,98,121,32,116,104,101,32,45,110,32,102,108,97,103,10,0,103,114,97,112,104,32,37,115,32,105,115,32,100,105,115,99,111,110,110,101,99,116,101,100,46,32,72,101,110,99,101,44,32,116,104,101,32,99,105,114,99,117,105,116,32,109,111,100,101,108,10,0,65,108,116,101,114,110,97,116,105,118,101,108,121,44,32,99,111,110,115,105,100,101,114,32,114,117,110,110,105,110,103,32,110,101,97,116,111,32,117,115,105,110,103,32,45,71,112,97,99,107,61,116,114,117,101,32,111,114,32,100,101,99,111,109,112,111,115,105,110,103,10,0,116,104,101,32,103,114,97,112,104,32,105,110,116,111,32,99,111,110,110,101,99,116,101,100,32,99,111,109,112,111,110,101,110,116,115,46,10,0,83,111,108,118,105,110,103,32,109,111,100,101,108,32,37,100,32,105,116,101,114,97,116,105,111,110,115,32,37,100,32,116,111,108,32,37,102,10,0,78,68,95,105,100,40,110,112,41,32,61,61,32,105,0,110,101,97,116,111,105,110,105,116,46,99,0,109,97,107,101,71,114,97,112,104,68,97,116,97,0,102,32,60,32,103,114,97,112,104,91,106,93,46,110,101,100,103,101,115,0,100,102,115,67,121,99,108,101,0,109,111,100,101,108,32,37,100,32,115,109,97,114,116,95,105,110,105,116,32,37,100,32,115,116,114,101,115,115,119,116,32,37,100,32,105,116,101,114,97,116,105,111,110,115,32,37,100,32,116,111,108,32,37,102,10,0,99,111,110,118,101,114,116,32,103,114,97,112,104,58,32,0,109,97,106,111,114,105,122,97,116,105,111,110,10,0,37,100,32,110,111,100,101,115,32,37,46,50,102,32,115,101,99,10,0,108,101,118,101,108,115,103,97,112,0,108,97,121,111,117,116,32,97,98,111,114,116,101,100,10,0,115,116,114,101,115,115,119,116,0,37,115,32,97,116,116,114,105,98,117,116,101,32,118,97,108,117,101,32,109,117,115,116,32,98,101,32,49,32,111,114,32,50,32,45,32,105,103,110,111,114,105,110,103,10,0,95,110,101,97,116,111,95,99,99,0,109,111,100,101,108,0,99,105,114,99,117,105,116,0,115,117,98,115,101,116,0,115,104,111,114,116,112,97,116,104,0,109,100,115,0,101,100,103,101,115,32,105,110,32,103,114,97,112,104,32,37,115,32,104,97,118,101,32,110,111,32,108,101,110,32,97,116,116,114,105,98,117,116,101,46,32,72,101,110,99,101,44,32,116,104,101,32,109,100,115,32,109,111,100,101,108,10,0,105,115,32,105,110,97,112,112,114,111,112,114,105,97,116,101,46,32,82,101,118,101,114,116,105,110,103,32,116,111,32,116,104,101,32,115,104,111,114,116,101,115,116,32,112,97,116,104,32,109,111,100,101,108,46,10,0,85,110,107,110,111,119,110,32,118,97,108,117,101,32,37,115,32,102,111,114,32,97,116,116,114,105,98,117,116,101,32,34,109,111,100,101,108,34,32,105,110,32,103,114,97,112,104,32,37,115,32,45,32,105,103,110,111,114,101,100,10,0,109,111,100,101,0,75,75,0,109,97,106,111,114,0,104,105,101,114,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,97,116,116,114,105,98,117,116,101,32,34,109,111,100,101,34,32,105,110,32,103,114,97,112,104,32,37,115,32,45,32,105,103,110,111,114,101,100,10,0,115,44,37,108,102,44,37,108,102,37,110,0,32,101,44,37,108,102,44,37,108,102,37,110,0,0,112,111,115,32,97,116,116,114,105,98,117,116,101,32,102,111,114,32,101,100,103,101,32,40,37,115,44,37,115,41,32,100,111,101,115,110,39,116,32,104,97,118,101,32,51,110,43,49,32,112,111,105,110,116,115,10,0,37,108,102,44,37,108,102,37,110,0,115,121,110,116,97,120,32,101,114,114,111,114,32,105,110,32,112,111,115,32,97,116,116,114,105,98,117,116,101,32,102,111,114,32,101,100,103,101,32,40,37,115,44,37,115,41,10,0,37,108,102,44,37,108,102,44,37,108,102,44,37,108,102,0,109,97,107,101,83,112,108,105,110,101,58,32,102,97,105,108,101,100,32,116,111,32,109,97,107,101,32,115,112,108,105,110,101,32,101,100,103,101,32,40,37,115,44,37,115,41,10,0,115,112,108,105,110,101,32,37,115,32,37,115,10,0,116,104,101,32,98,111,117,110,100,105,110,103,32,98,111,120,101,115,32,111,102,32,115,111,109,101,32,110,111,100,101,115,32,116,111,117,99,104,32,45,32,102,97,108,108,105,110,103,32,98,97,99,107,32,116,111,32,115,116,114,97,105,103,104,116,32,108,105,110,101,32,101,100,103,101,115,10,0,115,111,109,101,32,110,111,100,101,115,32,119,105,116,104,32,109,97,114,103,105,110,32,40,37,46,48,50,102,44,37,46,48,50,102,41,32,116,111,117,99,104,32,45,32,102,97,108,108,105,110,103,32,98,97,99,107,32,116,111,32,115,116,114,97,105,103,104,116,32,108,105,110,101,32,101,100,103,101,115,10,0,112,111,108,121,108,105,110,101,115,0,108,105,110,101,32,115,101,103,109,101,110,116,115,0,111,114,116,104,111,103,111,110,97,108,32,108,105,110,101,115,0,67,114,101,97,116,105,110,103,32,101,100,103,101,115,32,117,115,105,110,103,32,37,115,10,0,112,111,108,121,108,105,110,101,32,37,115,32,37,115,10,0,98,32,61,61,32,110,0,110,101,97,116,111,115,112,108,105,110,101,115,46,99,0,109,97,107,101,95,98,97,114,114,105,101,114,115,0,109,100,115,77,111,100,101,108,58,32,100,101,108,116,97,32,61,32,37,102,10,0,83,101,116,116,105,110,103,32,117,112,32,115,116,114,101,115,115,32,102,117,110,99,116,105,111,110,0,83,111,108,118,105,110,103,32,109,111,100,101,108,58,32,0,10,102,105,110,97,108,32,101,32,61,32,37,102,32,37,100,32,105,116,101,114,97,116,105,111,110,115,32,37,46,50,102,32,115,101,99,10,0,83,99,97,110,110,105,110,103,32,103,114,97,112,104,32,37,115,44,32,37,100,32,110,111,100,101,115,10,0,68,97,109,112,105,110,103,0,100,101,102,97,117,108,116,100,105,115,116,0,83,101,116,116,105,110,103,32,105,110,105,116,105,97,108,32,112,111,115,105,116,105,111,110,115,10,0,115,116,97,114,116,61,37,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,119,105,116,104,32,109,111,100,101,61,115,101,108,102,32,45,32,105,103,110,111,114,101,100,10,0,83,101,116,116,105,110,103,32,117,112,32,115,112,114,105,110,103,32,109,111,100,101,108,58,32,0,37,46,50,102,32,115,101,99,10,0,10,102,105,110,97,108,32,101,32,61,32,37,102,0,33,0,32,37,100,37,115,32,105,116,101,114,97,116,105,111,110,115,32,37,46,50,102,32,115,101,99,10,0,77,97,120,46,32,105,116,101,114,97,116,105,111,110,115,32,40,37,100,41,32,114,101,97,99,104,101,100,32,111,110,32,103,114,97,112,104,32,37,115,10,0,37,46,51,102,32,0,37,115,32,37,46,51,102,10,0,78,68,95,104,101,97,112,105,110,100,101,120,40,118,41,32,60,32,48,0,115,116,117,102,102,46,99,0,110,101,97,116,111,95,101,110,113,117,101,117,101,0,67,97,108,99,117,108,97,116,105,110,103,32,115,104,111,114,116,101,115,116,32,112,97,116,104,115,58,32,0,32,105,110,32,37,115,32,45,32,115,101,116,116,105,110,103,32,116,111,32,37,46,48,50,102,10,0,98,97,100,32,101,100,103,101,32,108,101,110,32,34,37,115,34,0,115,112,101,99,105,102,105,101,100,32,114,111,111,116,32,110,111,100,101,32,34,37,115,34,32,119,97,115,32,110,111,116,32,102,111,117,110,100,46,0,85,115,105,110,103,32,100,101,102,97,117,108,116,32,99,97,108,99,117,108,97,116,105,111,110,32,102,111,114,32,114,111,111,116,32,110,111,100,101,10,0,114,101,112,111,115,105,116,105,111,110,32,37,115,10,0,37,115,32,58,32,37,102,32,37,102,10,0,37,115,32,58,32,37,102,32,37,102,32,37,102,32,37,102,10,0,32,32,0,71,114,97,112,104,32,37,115,32,104,97,115,32,97,114,114,97,121,32,112,97,99,107,105,110,103,32,119,105,116,104,32,117,115,101,114,32,118,97,108,117,101,115,32,98,117,116,32,110,111,32,34,115,111,114,116,118,34,32,97,116,116,114,105,98,117,116,101,115,32,97,114,101,32,100,101,102,105,110,101,100,46,0,112,105,110,0,87,97,114,110,105,110,103,58,32,110,111,100,101,32,37,115,44,32,112,111,115,105,116,105,111,110,32,37,115,44,32,101,120,112,101,99,116,101,100,32,116,119,111,32,102,108,111,97,116,115,10,0,99,111,111,114,100,115,0,115,112,108,105,110,101,115,32,97,110,100,32,99,108,117,115,116,101,114,32,101,100,103,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,45,32,117,115,105,110,103,32,108,105,110,101,32,115,101,103,109,101,110,116,115,10,0,108,97,121,111,117,116,32,37,115,10,0,101,110,100,32,37,115,10,0,105,100,120,32,61,61,32,115,122,0,108,97,121,111,117,116,46,99,0,101,120,112,97,110,100,67,108,117,115,116,101,114,0,105,32,61,61,32,100,101,103,0,103,101,116,69,100,103,101,76,105,115,116,0,95,100,103,95,37,100,0,100,101,114,105,118,101,32,103,114,97,112,104,32,37,115,32,111,102,32,37,115,10,0,110,111,100,101,32,34,37,115,34,32,105,115,32,99,111,110,116,97,105,110,101,100,32,105,110,32,116,119,111,32,110,111,110,45,99,111,109,112,97,114,97,98,108,101,32,99,108,117,115,116,101,114,115,32,34,37,115,34,32,97,110,100,32,34,37,115,34,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,95,112,111,114,116,95,37,115,95,37,115,95,37,115,95,37,108,100,0,95,112,111,114,116,95,37,115,95,40,37,100,41,95,40,37,100,41,95,37,108,100,0,37,108,102,44,37,108,102,44,37,108,102,44,37,108,102,37,99,0,103,114,97,112,104,32,37,115,44,32,99,111,111,114,100,32,37,115,44,32,101,120,112,101,99,116,101,100,32,102,111,117,114,32,100,111,117,98,108,101,115,10,0,109,97,120,105,116,101,114,0,84,48,0,102,100,112,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,115,116,97,114,116,61,115,101,108,102,32,45,32,105,103,110,111,114,105,110,103,10,0,120,76,97,121,111,117,116,32,0,57,58,112,114,105,115,109,0,116,114,105,101,115,32,61,32,37,100,44,32,109,111,100,101,32,61,32,37,115,10,0,100,101,114,105,118,101,100,0,105,110,102,111,0,101,120,116,114,97,99,116,101,100,32,97,32,37,100,45,110,101,105,103,104,98,111,114,104,111,111,100,32,103,114,97,112,104,32,111,102,32,37,100,32,101,100,103,101,115,32,102,114,111,109,32,97,32,103,114,97,112,104,32,111,102,32,37,100,32,101,100,103,101,115,10,0,115,102,100,112,32,111,110,108,121,32,115,117,112,112,111,114,116,115,32,115,116,97,114,116,61,114,97,110,100,111,109,10,0,75,0,114,101,112,117,108,115,105,118,101,102,111,114,99,101,0,108,101,118,101,108,115,0,115,109,111,111,116,104,105,110,103,0,113,117,97,100,116,114,101,101,0,98,101,97,117,116,105,102,121,0,111,118,101,114,108,97,112,95,115,104,114,105,110,107,0,114,111,116,97,116,105,111,110,0,108,97,98,101,108,95,115,99,104,101,109,101,0,108,97,98,101,108,95,115,99,104,101,109,101,32,61,32,37,100,32,62,32,52,32,58,32,105,103,110,111,114,105,110,103,10,0,102,97,115,116,0,97,118,103,95,100,105,115,116,0,103,114,97,112,104,95,100,105,115,116,0,112,111,119,101,114,95,100,105,115,116,0,115,112,114,105,110,103,0,100,105,109,101,110,0,100,105,109,0,13,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,105,116,101,114,32,61,32,37,100,44,32,115,116,101,112,32,61,32,37,102,32,70,110,111,114,109,32,61,32,37,102,32,110,122,32,61,32,37,100,32,32,75,32,61,32,37,102,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,115,112,114,105,110,103,95,101,108,101,99,116,114,105,99,97,108,95,101,109,98,101,100,100,105,110,103,95,115,108,111,119,0,110,115,117,112,101,114,95,97,118,103,61,37,102,44,32,99,111,117,110,116,115,95,97,118,103,32,61,32,37,102,32,50,42,110,115,117,112,101,114,43,99,111,117,110,116,115,61,37,102,10,0,100,109,101,97,110,32,61,32,37,102,44,32,114,104,111,32,61,32,37,102,10,0,115,101,110,100,32,114,97,110,100,111,109,32,99,111,111,114,100,105,110,97,116,101,115,10,0,81,85,65,68,95,84,82,69,69,95,72,89,66,82,73,68,44,32,115,105,122,101,32,108,97,114,103,101,114,32,116,104,97,110,32,37,100,44,32,115,119,105,116,99,104,32,116,111,32,102,97,115,116,32,113,117,97,100,116,114,101,101,0,99,116,114,108,45,62,111,118,101,114,108,97,112,61,37,100,10,0,120,120,120,32,37,100,32,37,100,10,0,37,100,32,37,100,10,0,115,99,97,108,105,110,103,32,102,97,99,116,111,114,32,61,32,37,102,10,0,117,110,105,102,111,114,109,95,115,116,114,101,115,115,46,99,0,85,110,105,102,111,114,109,83,116,114,101,115,115,83,109,111,111,116,104,101,114,95,110,101,119,0,83,112,97,114,115,101,77,97,116,114,105,120,95,105,115,95,115,121,109,109,101,116,114,105,99,40,66,44,32,70,65,76,83,69,41,0,117,110,105,102,111,114,109,95,115,116,114,101,115,115,0,124,101,100,103,101,108,97,98,101,108,124,0,108,101,110,0,111,118,101,114,108,97,112,0,65,100,106,117,115,116,105,110,103,32,37,115,32,117,115,105,110,103,32,37,115,10,0,85,110,104,97,110,100,108,101,100,32,97,100,106,117,115,116,32,111,112,116,105,111,110,32,37,115,10,0,115,101,112,0,101,115,101,112,0,78,111,100,101,32,115,101,112,97,114,97,116,105,111,110,58,32,97,100,100,61,37,100,32,40,37,102,44,37,102,41,10,0,69,100,103,101,32,115,101,112,97,114,97,116,105,111,110,58,32,97,100,100,61,37,100,32,40,37,102,44,37,102,41,10,0,37,102,44,37,102,0,78,117,109,98,101,114,32,111,102,32,105,116,101,114,97,116,105,111,110,115,32,61,32,37,100,10,0,78,117,109,98,101,114,32,111,102,32,105,110,99,114,101,97,115,101,115,32,61,32,37,100,10,0,111,118,101,114,108,97,112,32,91,37,100,93,32,58,32,37,100,10,0,118,111,114,111,95,109,97,114,103,105,110,0,115,99,97,108,101,32,61,32,40,37,46,48,51,102,44,37,46,48,51,102,41,10,0,79,118,101,114,108,97,112,32,118,97,108,117,101,32,34,37,115,34,32,117,110,115,117,112,112,111,114,116,101,100,32,45,32,105,103,110,111,114,101,100,10,0,85,110,114,101,99,111,103,110,105,122,101,100,32,111,118,101,114,108,97,112,32,118,97,108,117,101,32,34,37,115,34,32,45,32,117,115,105,110,103,32,102,97,108,115,101,10,0,111,118,101,114,108,97,112,95,115,99,97,108,105,110,103,0,118,111,114,111,110,111,105,0,86,111,114,111,110,111,105,0,115,99,97,108,105,110,103,0,118,112,115,99,0,105,112,115,101,112,0,111,115,99,97,108,101,0,111,108,100,32,115,99,97,108,105,110,103,0,115,99,97,108,101,120,121,0,120,32,97,110,100,32,121,32,115,99,97,108,105,110,103,0,111,114,116,104,111,0,111,114,116,104,111,103,111,110,97,108,32,99,111,110,115,116,114,97,105,110,116,115,0,111,114,116,104,111,95,121,120,0,111,114,116,104,111,120,121,0,120,121,32,111,114,116,104,111,103,111,110,97,108,32,99,111,110,115,116,114,97,105,110,116,115,0,111,114,116,104,111,121,120,0,121,120,32,111,114,116,104,111,103,111,110,97,108,32,99,111,110,115,116,114,97,105,110,116,115,0,112,111,114,116,104,111,0,112,115,101,117,100,111,45,111,114,116,104,111,103,111,110,97,108,32,99,111,110,115,116,114,97,105,110,116,115,0,112,111,114,116,104,111,95,121,120,0,112,111,114,116,104,111,120,121,0,120,121,32,112,115,101,117,100,111,45,111,114,116,104,111,103,111,110,97,108,32,99,111,110,115,116,114,97,105,110,116,115,0,112,111,114,116,104,111,121,120,0,121,120,32,112,115,101,117,100,111,45,111,114,116,104,111,103,111,110,97,108,32,99,111,110,115,116,114,97,105,110,116,115,0,112,114,105,115,109,0,110,111,114,109,97,108,105,122,101,0,67,97,108,99,117,108,97,116,105,110,103,32,99,105,114,99,117,105,116,32,109,111,100,101,108,0,99,111,110,106,117,103,97,116,101,95,103,114,97,100,105,101,110,116,58,32,117,110,101,120,112,101,99,116,101,100,32,108,101,110,103,116,104,32,48,32,118,101,99,116,111,114,10,0,67,97,108,99,117,108,97,116,105,110,103,32,115,117,98,115,101,116,32,109,111,100,101,108,0,103,114,97,112,104,32,105,115,32,100,105,115,99,111,110,110,101,99,116,101,100,46,32,72,101,110,99,101,44,32,116,104,101,32,99,105,114,99,117,105,116,32,109,111,100,101,108,10,0,105,115,32,117,110,100,101,102,105,110,101,100,46,32,82,101,118,101,114,116,105,110,103,32,116,111,32,116,104,101,32,115,104,111,114,116,101,115,116,32,112,97,116,104,32,109,111,100,101,108,46,10,0,67,97,108,99,117,108,97,116,105,110,103,32,77,68,83,32,109,111,100,101,108,0,67,97,108,99,117,108,97,116,105,110,103,32,115,104,111,114,116,101,115,116,32,112,97,116,104,115,0,58,32,37,46,50,102,32,115,101,99,10,0,83,101,116,116,105,110,103,32,105,110,105,116,105,97,108,32,112,111,115,105,116,105,111,110,115,0,58,32,37,46,50,102,32,115,101,99,0,99,111,109,112,114,101,115,115,32,37,103,32,10,0,115,99,97,108,101,32,98,121,32,37,103,44,37,103,32,10,0,98,101,115,116,99,111,115,116,32,60,32,72,85,71,69,95,86,65,76,0,99,111,110,115,116,114,97,105,110,116,46,99,0,99,111,109,112,117,116,101,83,99,97,108,101,88,89,0,99,103,0,100,101,108,116,97,32,60,61,32,48,120,70,70,70,70,0,109,107,78,67,111,110,115,116,114,97,105,110,116,71,0,118,103,0,100,101,108,97,117,110,97,121,95,116,114,105,97,110,103,117,108,97,116,105,111,110,58,32,37,115,10,0,100,101,108,97,117,110,97,121,95,116,114,105,58,32,37,115,10,0,71,114,97,112,104,118,105,122,32,98,117,105,108,116,32,119,105,116,104,111,117,116,32,97,110,121,32,116,114,105,97,110,103,117,108,97,116,105,111,110,32,108,105,98,114,97,114,121,10,0,116,114,121,105,110,103,32,116,111,32,100,101,108,101,116,101,32,97,32,110,111,110,45,108,105,110,101,10,0,10,105,110,116,101,114,115,101,99,116,105,111,110,32,97,116,32,37,46,51,102,32,37,46,51,102,10,0,115,101,103,35,37,100,32,58,32,40,37,46,51,102,44,32,37,46,51,102,41,32,40,37,46,51,102,44,32,37,46,51,102,41,10,0,114,101,109,111,118,101,95,111,118,101,114,108,97,112,58,32,71,114,97,112,104,118,105,122,32,110,111,116,32,98,117,105,108,116,32,119,105,116,104,32,116,114,105,97,110,103,117,108,97,116,105,111,110,32,108,105,98,114,97,114,121,10,0,109,97,107,101,65,100,100,80,111,108,121,58,32,117,110,107,110,111,119,110,32,115,104,97,112,101,32,116,121,112,101,32,37,115,10,0,109,97,107,101,80,111,108,121,58,32,117,110,107,110,111,119,110,32,115,104,97,112,101,32,116,121,112,101,32,37,115,10,0,120,33,61,78,85,76,76,0,115,109,97,114,116,95,105,110,105,95,120,46,99,0,73,77,68,83,95,103,105,118,101,110,95,100,105,109,0,105,108,108,45,99,111,110,100,105,116,105,111,110,101,100,10,0,116,119,111,112,105,58,32,117,115,101,32,111,102,32,119,101,105,103,104,116,61,48,32,99,114,101,97,116,101,115,32,100,105,115,99,111,110,110,101,99,116,101,100,32,99,111,109,112,111,110,101,110,116,46,10,0,82,97,110,107,32,115,101,112,97,114,97,116,105,111,110,32,61,32,0,37,46,48,51,108,102,32,0,97,114,101,97,0,105,110,115,101,116,0,37,115,32,99,111,111,114,100,32,37,46,53,103,32,37,46,53,103,32,104,116,32,37,102,32,119,105,100,116,104,32,37,102,10,0,37,46,48,51,102,0,114,101,99,32,37,102,32,37,102,32,37,102,32,37,102,10,0,37,102,32,45,32,37,102,32,37,102,32,37,102,32,37,102,32,61,32,37,102,32,40,37,102,32,37,102,32,37,102,32,37,102,41,10,0,116,114,121,105,110,103,32,116,111,32,97,100,100,32,116,111,32,114,101,99,116,32,123,37,102,32,43,47,45,32,37,102,44,32,37,102,32,43,47,45,32,37,102,125,10,0,116,111,116,97,108,32,97,100,100,101,100,32,115,111,32,102,97,114,32,61,32,37,100,10,0,97,100,100,105,110,103,32,37,100,32,105,116,101,109,115,44,32,116,111,116,97,108,32,97,114,101,97,32,61,32,37,102,44,32,119,32,61,32,37,102,44,32,97,114,101,97,47,119,61,37,102,10,0,99,111,109,112,111,117,110,100,69,100,103,101,115,58,32,99,111,117,108,100,32,110,111,116,32,99,111,110,115,116,114,117,99,116,32,111,98,115,116,97,99,108,101,115,32,45,32,102,97,108,108,105,110,103,32,98,97,99,107,32,116,111,32,115,116,114,97,105,103,104,116,32,108,105,110,101,32,101,100,103,101,115,10,0,110,111,100,101,115,32,116,111,117,99,104,32,45,32,102,97,108,108,105,110,103,32,98,97,99,107,32,116,111,32,115,116,114,97,105,103,104,116,32,108,105,110,101,32,101,100,103,101,115,10,0,99,99,37,115,95,37,100,0,99,99,37,115,43,37,100,0,99,95,99,110,116,32,61,61,32,48,0,99,111,109,112,46,99,0,102,105,110,100,67,67,111,109,112,0,103,114,105,100,40,37,100,44,37,100,41,58,32,37,115,10,0,119,105,100,116,104,32,62,32,48,0,81,117,97,100,84,114,101,101,46,99,0,81,117,97,100,84,114,101,101,95,110,101,119,0,33,40,113,45,62,108,41,0,81,117,97,100,84,114,101,101,95,97,100,100,95,105,110,116,101,114,110,97,108,0,105,105,32,60,32,49,60,60,100,105,109,32,38,38,32,105,105,32,62,61,32,48,0,113,45,62,113,116,115,91,105,105,93,0,113,45,62,110,32,61,61,32,49,0,33,40,113,45,62,113,116,115,41,0,113,45,62,108,0,119,103,116,32,62,32,48,0,81,117,97,100,84,114,101,101,95,114,101,112,117,108,115,105,118,101,95,102,111,114,99,101,95,97,99,99,117,109,117,108,97,116,101,0,113,116,50,45,62,110,32,62,32,48,0,113,116,49,45,62,110,32,62,32,48,32,38,38,32,113,116,50,45,62,110,32,62,32,48,0,81,117,97,100,84,114,101,101,95,114,101,112,117,108,115,105,118,101,95,102,111,114,99,101,95,105,110,116,101,114,97,99,116,0,100,105,115,116,32,62,32,48,0,65,45,62,102,111,114,109,97,116,32,61,61,32,70,79,82,77,65,84,95,67,83,82,0,83,112,97,114,115,101,77,97,116,114,105,120,46,99,0,83,112,97,114,115,101,77,97,116,114,105,120,95,116,114,97,110,115,112,111,115,101,0,83,112,97,114,115,101,77,97,116,114,105,120,95,105,115,95,115,121,109,109,101,116,114,105,99,0,65,32,38,38,32,66,0,83,112,97,114,115,101,77,97,116,114,105,120,95,97,100,100,0,65,45,62,102,111,114,109,97,116,32,61,61,32,66,45,62,102,111,114,109,97,116,32,38,38,32,65,45,62,102,111,114,109,97,116,32,61,61,32,70,79,82,77,65,84,95,67,83,82,0,65,45,62,116,121,112,101,32,61,61,32,66,45,62,116,121,112,101,0,65,45,62,102,111,114,109,97,116,32,61,61,32,70,79,82,77,65,84,95,67,79,79,82,68,0,83,112,97,114,115,101,77,97,116,114,105,120,95,102,114,111,109,95,99,111,111,114,100,105,110,97,116,101,95,102,111,114,109,97,116,0,83,112,97,114,115,101,77,97,116,114,105,120,95,109,117,108,116,105,112,108,121,95,118,101,99,116,111,114,0,65,45,62,116,121,112,101,32,61,61,32,77,65,84,82,73,88,95,84,89,80,69,95,82,69,65,76,32,124,124,32,65,45,62,116,121,112,101,32,61,61,32,77,65,84,82,73,88,95,84,89,80,69,95,73,78,84,69,71,69,82,0,65,45,62,116,121,112,101,32,61,61,32,77,65,84,82,73,88,95,84,89,80,69,95,82,69,65,76,0,83,112,97,114,115,101,77,97,116,114,105,120,95,109,117,108,116,105,112,108,121,0,106,99,91,109,97,115,107,91,106,98,91,107,93,93,93,32,61,61,32,106,98,91,107,93,0,83,112,97,114,115,101,77,97,116,114,105,120,95,109,117,108,116,105,112,108,121,51,0,106,100,91,109,97,115,107,91,106,99,91,107,93,93,93,32,61,61,32,106,99,91,107,93,0,106,97,91,109,97,115,107,91,106,97,91,106,93,93,93,32,61,61,32,106,97,91,106,93,0,83,112,97,114,115,101,77,97,116,114,105,120,95,115,117,109,95,114,101,112,101,97,116,95,101,110,116,114,105,101,115,0,105,100,32,60,32,110,42,40,121,109,97,120,45,121,109,105,110,43,49,41,0,106,97,91,109,97,115],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+122462);allocate([107,91,105,100,93,93,32,61,61,32,106,97,91,106,93,0,83,112,97,114,115,101,77,97,116,114,105,120,95,99,111,111,114,100,105,110,97,116,101,95,102,111,114,109,95,97,100,100,95,101,110,116,114,105,101,115,0,83,112,97,114,115,101,77,97,116,114,105,120,95,100,105,118,105,100,101,95,114,111,119,95,98,121,95,100,101,103,114,101,101,0,114,111,111,116,32,62,61,32,48,32,38,38,32,114,111,111,116,32,60,32,109,0,83,112,97,114,115,101,77,97,116,114,105,120,95,108,101,118,101,108,95,115,101,116,115,95,105,110,116,101,114,110,97,108,0,109,32,61,61,32,65,45,62,110,0,83,112,97,114,115,101,77,97,116,114,105,120,95,105,115,95,115,121,109,109,101,116,114,105,99,40,65,44,32,84,82,85,69,41,0,109,32,61,61,32,110,0,83,112,97,114,115,101,77,97,116,114,105,120,95,100,105,115,116,97,110,99,101,95,109,97,116,114,105,120,95,107,104,111,112,115,0,110,108,101,118,101,108,45,49,32,60,61,32,107,104,111,112,115,0,109,97,115,107,91,108,101,118,101,108,115,101,116,91,106,93,93,32,61,61,32,105,43,49,0,68,105,106,107,115,116,114,97,95,105,110,116,101,114,110,97,108,0,104,0,104,101,97,112,95,105,100,115,91,114,111,111,116,93,32,62,61,32,48,0,110,100,97,116,97,45,62,105,100,32,61,61,32,106,106,0,83,112,97,114,115,101,77,97,116,114,105,120,95,109,117,108,116,105,112,108,121,95,100,101,110,115,101,50,0,83,112,97,114,115,101,77,97,116,114,105,120,95,109,117,108,116,105,112,108,121,95,100,101,110,115,101,49,0,109,32,62,32,48,32,38,38,32,110,32,62,32,48,32,38,38,32,110,122,32,62,61,32,48,0,83,112,97,114,115,101,77,97,116,114,105,120,95,102,114,111,109,95,99,111,111,114,100,105,110,97,116,101,95,97,114,114,97,121,115,95,105,110,116,101,114,110,97,108,0,65,0,110,32,62,32,49,0,103,101,110,101,114,97,108,46,99,0,105,114,97,110,100,0,111,110,101,98,108,111,99,107,0,109,105,110,100,105,115,116,0,97,114,116,105,99,117,108,97,116,105,111,110,95,112,111,115,0,114,111,111,116,0,80,114,105,111,114,105,116,121,81,117,101,117,101,46,99,0,80,114,105,111,114,105,116,121,81,117,101,117,101,95,112,117,115,104,0,103,97,105,110,32,60,61,32,113,45,62,110,103,97,105,110,0,83,112,97,114,115,101,77,97,116,114,105,120,95,105,115,95,115,121,109,109,101,116,114,105,99,40,65,44,32,70,65,76,83,69,41,0,112,111,115,116,95,112,114,111,99,101,115,115,46,99,0,105,100,101,97,108,95,100,105,115,116,97,110,99,101,95,109,97,116,114,105,120,0,108,101,110,32,62,32,48,0,83,116,114,101,115,115,77,97,106,111,114,105,122,97,116,105,111,110,83,109,111,111,116,104,101,114,50,95,110,101,119,0,110,122,32,62,32,48,0,105,100,101,97,108,95,100,105,115,116,95,115,99,104,101,109,101,32,118,97,108,117,101,32,119,114,111,110,103,0,83,112,97,114,115,101,77,97,116,114,105,120,95,105,115,95,115,121,109,109,101,116,114,105,99,40,65,44,32,70,65,76,83,69,41,32,38,38,32,65,45,62,116,121,112,101,32,61,61,32,77,65,84,82,73,88,95,84,89,80,69,95,82,69,65,76,0,83,112,97,114,115,101,83,116,114,101,115,115,77,97,106,111,114,105,122,97,116,105,111,110,83,109,111,111,116,104,101,114,95,110,101,119,0,105,100,105,97,103,32,62,61,32,48,0,83,116,114,101,115,115,77,97,106,111,114,105,122,97,116,105,111,110,83,109,111,111,116,104,101,114,95,115,109,111,111,116,104,0,84,114,105,97,110,103,108,101,83,109,111,111,116,104,101,114,95,110,101,119,0,106,100,105,97,103,32,62,61,32,48,0,83,112,114,105,110,103,83,109,111,111,116,104,101,114,95,110,101,119,0,33,102,108,97,103,0,83,112,114,105,110,103,83,109,111,111,116,104,101,114,95,115,109,111,111,116,104,0,40,33,106,99,110,41,32,38,38,32,40,33,118,97,108,41,0,103,101,116,95,101,100,103,101,95,108,97,98,101,108,95,109,97,116,114,105,120,0,110,101,105,103,104,98,61,37,100,10,0,104,45,62,105,100,95,116,111,95,112,111,115,91,105,100,93,32,61,61,32,112,111,115,0,66,105,110,97,114,121,72,101,97,112,46,99,0,66,105,110,97,114,121,72,101,97,112,95,105,110,115,101,114,116,0,104,45,62,112,111,115,95,116,111,95,105,100,91,112,111,115,93,32,61,61,32,105,100,0,112,111,115,32,60,32,104,45,62,108,101,110,0,66,105,110,97,114,121,72,101,97,112,95,101,120,116,114,97,99,116,95,105,116,101,109,0,112,97,114,101,110,116,80,111,115,32,60,32,104,45,62,108,101,110,0,115,119,97,112,0,110,111,100,101,80,111,115,32,60,32,104,45,62,108,101,110,0,114,111,111,116,32,61,32,37,115,10,0,95,98,108,111,99,107,95,37,100,0,115,45,62,115,122,32,62,32,48,0,98,108,111,99,107,116,114,101,101,46,99,0,112,111,112,0,97,99,116,117,97,108,0,110,111,100,101,108,105,115,116,46,99,0,105,110,115,101,114,116,78,111,100,101,108,105,115,116,0,95,115,112,97,110,95,37,100,0,95,99,108,111,110,101,95,37,100,0,105,112,0,100,101,103,108,105,115,116,46,99,0,114,101,109,111,118,101,68,101,103,108,105,115,116,0,10,64,40,35,41,36,73,100,36,0,10,0,69,114,114,111,114,0,87,97,114,110,105,110,103,0,37,115,58,32,0,117,115,101,114,111,117,116,58,32,99,111,117,108,100,32,110,111,116,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,10,0,95,65,71,95,100,97,116,97,100,105,99,116,0,97,103,100,105,99,116,111,102,58,32,117,110,107,110,111,119,110,32,107,105,110,100,32,37,100,10,0,95,65,71,95,115,116,114,100,97,116,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,99,37,108,100,0,109,101,109,111,114,121,32,97,108,108,111,99,97,116,105,111,110,32,102,97,105,108,117,114,101,0,97,103,100,101,108,101,116,101,32,111,110,32,119,114,111,110,103,32,103,114,97,112,104,0,95,65,71,95,112,101,110,100,105,110,103,0,97,103,114,101,99,111,114,100,95,99,97,108,108,98,97,99,107,32,111,102,32,97,32,98,97,100,32,111,98,106,101,99,116,0,112,101,110,100,32,100,105,99,116,111,102,32,97,32,98,97,100,32,111,98,106,101,99,116,0,109,111,118,101,32,116,111,32,102,114,111,110,116,32,108,111,99,107,32,105,110,99,111,110,115,105,115,116,101,110,99,121,0,0,92,92,0,102,97,116,97,108,32,102,108,101,120,32,115,99,97,110,110,101,114,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,45,45,110,111,32,97,99,116,105,111,110,32,102,111,117,110,100,0,111,117,116,32,111,102,32,100,121,110,97,109,105,99,32,109,101,109,111,114,121,32,105,110,32,97,97,103,95,99,114,101,97,116,101,95,98,117,102,102,101,114,40,41,0,58,32,0,32,105,110,32,108,105,110,101,32,37,100,32,110,101,97,114,32,39,0,39,10,0,102,108,101,120,32,115,99,97,110,110,101,114,32,112,117,115,104,45,98,97,99,107,32,111,118,101,114,102,108,111,119,0,37,115,10,0,102,97,116,97,108,32,102,108,101,120,32,115,99,97,110,110,101,114,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,45,45,101,110,100,32,111,102,32,98,117,102,102,101,114,32,109,105,115,115,101,100,0,102,97,116,97,108,32,101,114,114,111,114,32,45,32,115,99,97,110,110,101,114,32,105,110,112,117,116,32,98,117,102,102,101,114,32,111,118,101,114,102,108,111,119,0,105,110,112,117,116,32,105,110,32,102,108,101,120,32,115,99,97,110,110,101,114,32,102,97,105,108,101,100,0,111,117,116,32,111,102,32,100,121,110,97,109,105,99,32,109,101,109,111,114,121,32,105,110,32,97,97,103,95,103,101,116,95,110,101,120,116,95,98,117,102,102,101,114,40,41,0,105,110,112,117,116,0,115,121,110,116,97,120,32,97,109,98,105,103,117,105,116,121,32,45,32,98,97,100,108,121,32,100,101,108,105,109,105,116,101,100,32,110,117,109,98,101,114,32,39,0,39,32,105,110,32,108,105,110,101,32,37,100,32,111,102,32,0,32,115,112,108,105,116,115,32,105,110,116,111,32,116,119,111,32,116,111,107,101,110,115,10,0,108,105,110,101,0,37,100,32,37,49,91,34,93,37,110,0,111,117,116,32,111,102,32,100,121,110,97,109,105,99,32,109,101,109,111,114,121,32,105,110,32,97,97,103,101,110,115,117,114,101,95,98,117,102,102,101,114,95,115,116,97,99,107,40,41,0,108,105,110,101,108,101,110,103,116,104,0,59,10,0,32,91,107,101,121,61,0,93,0,32,91,0,44,10,0,61,0,95,37,108,100,95,83,85,83,80,69,67,84,0,0,100,105,0,115,116,114,105,99,116,32,0,123,10,0,93,59,10,0,34,34,0,115,116,114,105,99,116,0,18,238,238,20,9,3,238,254,238,238,238,1,238,238,238,1,238,238,10,254,238,19,25,21,238,19,1,238,238,238,238,11,17,238,238,238,238,238,238,238,238,238,1,238,238,22,9,1,1,29,15,23,238,238,26,23,27,238,238,28,238,238,238,238,1,25,251,238,238,238,1,238,16,238,238,30,238,238,238,238,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,23,17,2,2,2,2,2,2,2,2,2,2,2,2,2,18,16,2,19,2,2,22,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,20,2,21,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,14,2,15,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,3,4,5,6,7,8,9,10,11,12,13,11,3,4,5,15,7,3,12,13,6,12,13,14,12,13,26,21,22,0,1,0,3,7,14,6,15,8,12,13,18,19,42,16,17,9,16,47,48,17,50,23,19,13,20,18,46,18,20,65,19,50,19,44,64,42,66,25,44,66,70,34,12,13,14,35,15,9,16,17,10,16,17,201,16,17,45,69,70,252,1,6,246,15,7,246,36,2,16,17,47,48,54,77,78,40,38,59,60,42,54,49,57,61,63,47,58,64,216,68,48,62,37,55,67,53,75,43,56,73,76,0,3,9,0,0,0,1,14,2,11,12,8,35,36,37,54,59,61,0,13,16,18,27,22,28,18,39,50,34,23,51,30,60,6,7,53,5,15,17,20,24,41,0,19,41,0,0,0,0,0,55,21,40,29,30,0,33,38,52,31,48,62,25,44,0,27,0,32,26,42,0,43,58,46,47,0,49,56,57,45,0,2,2,1,0,3,3,1,0,1,0,1,1,1,0,2,1,1,0,2,2,3,1,1,0,0,5,0,1,3,1,3,5,3,1,1,1,1,2,0,1,0,4,2,0,2,1,1,3,2,1,0,3,2,1,0,1,1,0,1,1,1,3,0,24,25,25,25,26,27,28,28,29,29,30,30,31,31,32,32,33,33,34,34,35,36,36,38,39,37,37,40,40,41,41,41,42,42,43,43,43,44,44,45,45,46,47,47,48,49,49,50,51,52,54,53,55,55,55,56,56,56,57,57,58,58,238,238,255,238,238,238,238,238,238,31,32,238,0,239,238,238,238,12,238,238,238,8,13,238,238,238,248,238,238,238,238,238,238,245,238,255,3,8,4,33,5,11,18,19,39,20,21,22,41,50,65,23,24,25,26,44,51,52,66,71,72,27,74,28,29,46,30,79,31,32,0,1,8,25,27,29,0,14,26,3,6,30,3,4,5,7,12,13,31,32,34,35,36,40,41,42,43,50,52,53,55,57,58,28,57,57,15,34,16,33,9,37,17,33,44,57,54,18,19,23,38,45,46,41,57,45,46,19,26,57,57,13,36,20,18,39,47,57,37,21,22,48,49,50,51,57,57,16,17,56,107,101,121,0,97,116,116,114,105,98,117,116,101,32,109,97,99,114,111,115,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,37,115,58,37,115,0,67,111,117,108,100,32,110,111,116,32,111,112,101,110,32,34,37,115,34,32,102,111,114,32,119,114,105,116,105,110,103,32,58,32,37,115,10,0,78,111,32,108,105,98,122,32,115,117,112,112,111,114,116,46,10,0,103,118,119,114,105,116,101,95,110,111,95,122,32,112,114,111,98,108,101,109,32,37,100,10,0,78,111,32,108,105,98,122,32,115,117,112,112,111,114,116,10,0,103,118,112,114,105,110,116,102,58,32,37,115,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,45,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,46,57,57,0,109,101,109,111,114,121,32,97,108,108,111,99,97,116,105,111,110,32,102,97,105,108,117,114,101,10,0,46,37,100,0,110,111,110,97,109,101,46,103,118,0,100,121,110,97,109,105,99,32,108,111,97,100,105,110,103,32,110,111,116,32,97,118,97,105,108,97,98,108,101,10,0,60,98,117,105,108,116,105,110,62,0,65,99,116,105,118,97,116,101,100,32,112,108,117,103,105,110,32,108,105,98,114,97,114,121,58,32,37,115,10,0,85,115,105,110,103,32,37,115,58,32,37,115,58,37,115,10,0,114,101,110,100,101,114,0,108,97,121,111,117,116,0,100,101,118,105,99,101,0,108,111,97,100,105,109,97,103,101,0,103,118,117,115,101,114,115,104,97,112,101,46,99,0,103,118,117,115,101,114,115,104,97,112,101,95,102,105,110,100,0,103,118,117,115,101,114,115,104,97,112,101,95,102,105,108,101,95,97,99,99,101,115,115,0,70,105,108,101,110,97,109,101,32,34,37,115,34,32,105,115,32,117,110,115,97,102,101,10,0,37,115,32,119,104,105,108,101,32,111,112,101,110,105,110,103,32,37,115,10,0,117,115,45,62,102,0,103,118,117,115,101,114,115,104,97,112,101,95,111,112,101,110,0,34,37,115,34,32,119,97,115,32,110,111,116,32,102,111,117,110,100,32,97,115,32,97,32,102,105,108,101,32,111,114,32,97,115,32,97,32,115,104,97,112,101,32,108,105,98,114,97,114,121,32,109,101,109,98,101,114,10,0,47,77,101,100,105,97,66,111,120,0,99,97,110,110,111,116,32,99,111,109,112,105,108,101,32,114,101,103,117,108,97,114,32,101,120,112,114,101,115,115,105,111,110,32,37,115,0,37,108,102,37,50,115,0,112,116,0,118,105,101,119,66,111,120,0,37,108,102,32,37,108,102,32,37,108,102,32,37,108,102,0,105,110,0,112,120,0,112,99,0,34,0,99,109,0,109,109,0,40,91,97,45,122,93,91,97,45,122,65,45,90,93,42,41,61,34,40,91,94,34,93,42,41,34,0,37,37,66,111,117,110,100,105,110,103,66,111,120,58,0,1,208,209,210,211,212,213,214,215,216,217,0,60,115,118,103,0,87,69,66,80,0,119,101,98,112,0,40,108,105,98,41,0,137,80,78,71,13,10,26,10,0,112,110,103,0,37,33,80,83,45,65,100,111,98,101,45,0,66,77,0,98,109,112,0,71,73,70,56,0,103,105,102,0,255,216,255,224,0,106,112,101,103,0,37,80,68,70,45,0,112,100,102,0,197,208,211,198,0,101,112,115,0,60,63,120,109,108,0,120,109,108,0,82,73,70,70,0,114,105,102,102,0,0,0,1,0,0,105,99,111,0,76,97,121,111,117,116,32,116,121,112,101,58,32,34,37,115,34,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,46,32,85,115,101,32,111,110,101,32,111,102,58,37,115,10,0,37,100,32,37,100,32,37,100,32,37,100,0,70,111,114,109,97,116,58,32,34,37,115,34,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,46,32,85,115,101,32,111,110,101,32,111,102,58,37,115,10,0,76,97,121,111,117,116,32,119,97,115,32,110,111,116,32,100,111,110,101,10,0,102,97,105,108,117,114,101,32,109,97,108,108,111,99,39,105,110,103,32,102,111,114,32,114,101,115,117,108,116,32,115,116,114,105,110,103,0,99,99,103,114,97,112,104,105,110,102,111,0,99,99,103,110,111,100,101,105,110,102,111,0,40,37,52,108,100,41,32,37,55,108,100,32,110,111,100,101,115,32,37,55,108,100,32,101,100,103,101,115,10,0,32,32,32,32,32,32,32,37,55,100,32,110,111,100,101,115,32,37,55,100,32,101,100,103,101,115,32,37,55,108,100,32,99,111,109,112,111,110,101,110,116,115,32,37,115,10,0,100,103,0,69,114,114,111,114,58,32,110,111,100,101,32,34,37,115,34,32,98,101,108,111,110,103,115,32,116,111,32,116,119,111,32,110,111,110,45,110,101,115,116,101,100,32,99,108,117,115,116,101,114,115,32,34,37,115,34,32,97,110,100,32,34,37,115,34,10,0,103,99,58,32,79,117,116,32,111,102,32,109,101,109,111,114,121,10,0,95,99,99,95,0,115,111,114,116,118,0,112,105,110,102,111,0,112,97,99,107,46,99,0,103,101,116,80,97,99,107,73,110,102,111,0,32,32,109,97,114,103,105,110,32,37,100,10,0,112,97,114,115,101,80,97,99,107,77,111,100,101,73,110,102,111,0,97,114,114,97,121,0,97,115,112,101,99,116,0,37,102,0,112,97,99,107,32,105,110,102,111,58,10,0,32,32,109,111,100,101,32,32,32,37,115,10,0,32,32,97,115,112,101,99,116,32,37,102,10,0,32,32,115,105,122,101,32,32,32,37,100,10,0,32,32,102,108,97,103,115,32,32,37,100,10,0,112,97,99,107,109,111,100,101,0,112,97,99,107,0,117,110,100,101,102,105,110,101,100,0,115,116,101,112,32,115,105,122,101,32,61,32,37,100,10,0,112,111,115,91,37,100,93,32,37,100,32,37,100,10,0,99,99,32,40,37,100,32,99,101,108,108,115,41,32,97,116,32,40,37,100,44,37,100,41,32,40,37,100,44,37,100,41,10,0,37,115,32,110,111,46,32,99,101,108,108,115,32,37,100,32,87,32,37,100,32,72,32,37,100,10,0,32,32,37,100,32,37,100,32,99,101,108,108,10,0,108,105,98,112,97,99,107,58,32,100,105,115,99,32,61,32,37,102,32,40,32,60,32,48,41,10,0,80,97,99,107,105,110,103,58,32,99,111,109,112,117,116,101,32,103,114,105,100,32,115,105,122,101,10,0,97,32,37,102,32,98,32,37,102,32,99,32,37,102,32,100,32,37,102,32,114,32,37,102,10,0,114,111,111,116,32,37,100,32,40,37,102,41,32,37,100,32,40,37,102,41,10,0,32,114,49,32,37,102,32,114,50,32,37,102,10,0,114,111,119,32,109,97,106,111,114,0,99,111,108,117,109,110,32,109,97,106,111,114,0,97,114,114,97,121,32,112,97,99,107,105,110,103,58,32,37,115,32,37,100,32,114,111,119,115,32,37,100,32,99,111,108,117,109,110,115,10,0,98,98,91,37,115,93,32,37,46,53,103,32,37,46,53,103,32,37,46,53,103,32,37,46,53,103,10,0,99,99,32,40,37,100,32,99,101,108,108,115,41,32,97,116,32,40,37,100,44,37,100,41,10,0,65,114,114,111,119,32,116,121,112,101,32,34,37,115,34,32,117,110,107,110,111,119,110,32,45,32,105,103,110,111,114,105,110,103,10,0,110,111,114,109,97,108,0,99,114,111,119,0,116,101,101,0,100,111,116,0,105,110,118,0,118,101,101,0,112,101,110,0,109,112,116,121,0,99,117,114,118,101,0,108,0,104,97,108,102,0,105,110,118,101,109,112,116,121,0,95,98,97,99,107,103,114,111,117,110,100,0,95,100,114,97,119,95,0,67,111,117,108,100,32,110,111,116,32,112,97,114,115,101,32,34,95,98,97,99,107,103,114,111,117,110,100,34,32,97,116,116,114,105,98,117,116,101,32,105,110,32,103,114,97,112,104,32,37,115,10,0,32,32,34,37,115,34,10,0,110,111,32,109,101,109,111,114,121,32,102,114,111,109,32,122,109,97,108,108,111,99,40,41,10,0,111,98,106,0,101,109,105,116,46,99,0,112,111,112,95,111,98,106,95,115,116,97,116,101,0,99,108,117,115,116,0,37,108,100,0,108,110,114,99,111,108,111,114,115,99,104,101,109,101,0,105,110,32,99,108,117,115,116,101,114,32,37,115,10,0,77,111,114,101,32,116,104,97,110,32,50,32,99,111,108,111,114,115,32,115,112,101,99,105,102,105,101,100,32,102,111,114,32,97,32,103,114,97,100,105,101,110,116,32,45,32,105,103,110,111,114,105,110,103,32,114,101,109,97,105,110,105,110,103,10,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,110,101,115,116,105,110,103,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,32,115,116,121,108,101,58,32,37,115,10,0,117,110,109,97,116,99,104,101,100,32,39,41,39,32,105,110,32,115,116,121,108,101,58,32,37,115,10,0,116,114,117,110,99,97,116,105,110,103,32,115,116,121,108,101,32,39,37,115,39,10,0,117,110,109,97,116,99,104,101,100,32,39,40,39,32,105,110,32,115,116,121,108,101,58,32,37,115,10,0,67,0,76,97,121,111,117,116,32,119,97,115,32,110,111,116,32,100,111,110,101,46,32,32,77,105,115,115,105,110,103,32,108,97,121,111,117,116,32,112,108,117,103,105,110,115,63,32,10,0,103,118,82,101,110,100,101,114,74,111,98,115,32,37,115,58,32,37,46,50,102,32,115,101,99,115,46,10,0,108,97,121,111,117,116,32,119,97,115,32,110,111,116,32,100,111,110,101,10,0,114,101,110,100,101,114,101,114,32,102,111,114,32,37,115,32,105,115,32,117,110,97,118,97,105,108,97,98,108,101,10,0,112,97,103,101,100,105,114,61,37,115,32,105,103,110,111,114,101,100,10,0,118,105,101,119,112,111,114,116,0,37,108,102,44,37,108,102,44,37,108,102,44,39,37,91,94,39,93,39,0,37,108,102,44,37,108,102,44,37,108,102,44,37,91,94,44,93,37,115,0,37,108,102,44,37,108,102,44,37,108,102,44,37,108,102,44,37,108,102,0,111,117,116,112,117,116,111,114,100,101,114,0,111,100,101,115,102,105,114,115,116,0,100,103,101,115,102,105,114,115,116,0,108,97,121,101,114,115,0,108,97,121,101,114,115,101,108,101,99,116,0,84,104,101,32,108,97,121,101,114,115,101,108,101,99,116,32,97,116,116,114,105,98,117,116,101,32,34,37,115,34,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,97,110,121,32,108,97,121,101,114,32,115,112,101,99,105,102,101,100,32,98,121,32,116,104,101,32,108,97,121,101,114,115,32,97,116,116,114,105,98,117,116,101,32,45,32,105,103,110,111,114,101,100,46,10,0,97,108,108,0,108,97,121,101,114,115,101,112,0,58,9,32,0,108,97,121,101,114,108,105,115,116,115,101,112,0,44,0,84,104,101,32,99,104,97,114,97,99,116,101,114,32,39,37,99,39,32,97,112,112,101,97,114,115,32,105,110,32,98,111,116,104,32,116,104,101,32,108,97,121,101,114,115,101,112,32,97,110,100,32,108,97,121,101,114,108,105,115,116,115,101,112,32,97,116,116,114,105,98,117,116,101,115,32,45,32,108,97,121,101,114,108,105,115,116,115,101,112,32,105,103,110,111,114,101,100,46,10,0,112,97,100,0,66,76,0,112,97,103,101,100,105,114,0,115,111,108,105,100,0,0,115,101,116,108,105,110,101,119,105,100,116,104,0,49,0,0,115,112,108,45,62,115,105,122,101,32,62,32,48,0,105,110,105,116,95,115,112,108,105,110,101,115,95,98,98,0,98,122,46,115,105,122,101,32,62,32,48,0,98,101,122,105,101,114,95,98,98,0,98,122,46,115,105,122,101,32,37,32,51,32,61,61,32,49,0,101,109,105,116,95,101,100,103,101,95,108,97,98,101,108,0,37,115,45,37,115,0,102,111,114,119,97,114,100,0,98,97,99,107,0,32,45,62,32,0,32,45,45,32,0,105,110,32,101,100,103,101,32,37,115,37,115,37,115,10,0,101,100,103,101,104,114,101,102,0,101,100,103,101,85,82,76,0,108,97,98,101,108,104,114,101,102,0,108,97,98,101,108,85,82,76,0,116,97,105,108,104,114,101,102,0,116,97,105,108,85,82,76,0,104,101,97,100,104,114,101,102,0,104,101,97,100,85,82,76,0,101,100,103,101,116,97,114,103,101,116,0,108,97,98,101,108,116,97,114,103,101,116,0,116,97,105,108,116,97,114,103,101,116,0,104,101,97,100,116,97,114,103,101,116,0,101,100,103,101,116,111,111,108,116,105,112,0,108,97,98,101,108,116,111,111,108,116,105,112,0,116,97,105,108,116,111,111,108,116,105,112,0,104,101,97,100,116,111,111,108,116,105,112,0,103,114,97,100,105,101,110,116,32,112,101,110,32,99,111,108,111,114,115,32,110,111,116,32,121,101,116,32,115,117,112,112,111,114,116,101,100,46,10,0,73,109,97,103,101,115,32,117,110,115,117,112,112,111,114,116,101,100,32,105,110,32,34,98,97,99,107,103,114,111,117,110,100,34,32,97,116,116,114,105,98,117,116,101,10,0,108,97,121,101,114,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,105,110,32,37,115,32,111,117,116,112,117,116,10,0,84,111,116,97,108,32,115,105,122,101,32,62,32,49,32,105,110,32,34,37,115,34,32,99,111,108,111,114,32,115,112,101,99,32,0,73,108,108,101,103,97,108,32,108,101,110,103,116,104,32,118,97,108,117,101,32,105,110,32,34,37,115,34,32,99,111,108,111,114,32,97,116,116,114,105,98,117,116,101,32,0,112,97,103,101,37,100,44,37,100,95,0,0,0,0,37,108,102,0,102,111,110,116,112,97,116,104,0,68,79,84,70,79,78,84,80,65,84,72,0,71,68,70,79,78,84,80,65,84,72,0,105,109,97,103,101,112,97,116,104,0,113,117,97,110,116,117,109,0,114,97,110,107,100,105,114,0,76,82,0,66,84,0,82,76,0,110,111,100,101,115,101,112,0,114,97,110,107,115,101,112,0,101,113,117,97,108,108,121,0,115,104,111,119,98,111,120,101,115,0,102,111,110,116,110,97,109,101,115,0,115,105,122,101,0,112,97,103,101,0,99,101,110,116,101,114,0,114,111,116,97,116,101,0,111,114,105,101,110,116,97,116,105,111,110,0,108,97,110,100,115,99,97,112,101,0,99,108,117,115,116,101,114,114,97,110,107,0,99,111,110,99,101,110,116,114,97,116,101,0,100,112,105,0,114,101,115,111,108,117,116,105,111,110,0,111,114,100,101,114,105,110,103,0,102,105,108,108,99,111,108,111,114,0,102,111,110,116,115,105,122,101,0,102,111,110,116,110,97,109,101,0,102,111,110,116,99,111,108,111,114,0,120,108,97,98,101,108,0,112,101,110,119,105,100,116,104,0,112,101,114,105,112,104,101,114,105,101,115,0,115,107,101,119,0,100,105,115,116,111,114,116,105,111,110,0,110,111,106,117,115,116,105,102,121,0,108,97,121,101,114,0,103,114,111,117,112,0,99,111,109,109,101,110,116,0,118,101,114,116,105,99,101,115,0,122,0,119,101,105,103,104,116,0,108,97,98,101,108,102,108,111,97,116,0,100,105,114,0,97,114,114,111,119,104,101,97,100,0,97,114,114,111,119,116,97,105,108,0,104,101,97,100,108,97,98,101,108,0,116,97,105,108,108,97,98,101,108,0,108,97,98,101,108,102,111,110,116,115,105,122,101,0,108,97,98,101,108,102,111,110,116,110,97,109,101,0,108,97,98,101,108,102,111,110,116,99,111,108,111,114,0,108,97,98,101,108,100,105,115,116,97,110,99,101,0,108,97,98,101,108,97,110,103,108,101,0,109,105,110,108,101,110,0,100,101,99,111,114,97,116,101,0,97,114,114,111,119,115,105,122,101,0,99,111,110,115,116,114,97,105,110,116,0,116,97,105,108,99,108,105,112,0,104,101,97,100,99,108,105,112,0,108,97,98,101,108,106,117,115,116,0,85,84,70,45,56,0,73,83,79,45,56,56,53,57,45,49,0,66,73,71,45,53,0,85,110,115,117,112,112,111,114,116,101,100,32,99,104,97,114,115,101,116,32,118,97,108,117,101,32,37,100,10,0,108,111,99,97,108,0,103,108,111,98,97,108,0,37,108,102,44,37,108,102,37,99,0,37,108,102,37,99,0,114,97,116,105,111,0,97,117,116,111,0,99,111,109,112,114,101,115,115,0,101,120,112,97,110,100,0,102,105,108,108,0,103,100,0,112,115,0,115,118,103,0,99,104,97,114,115,101,116,0,117,116,102,45,56,0,108,97,116,105,110,45,49,0,108,97,116,105,110,49,0,108,49,0,73,83,79,95,56,56,53,57,45,49,0,73,83,79,56,56,53,57,45,49,0,73,83,79,45,73,82,45,49,48,48,0,98,105,103,45,53,0,98,105,103,53,0,117,116,102,56,0,85,110,115,117,112,112,111,114,116,101,100,32,99,104,97,114,115,101,116,32,34,37,115,34,32,45,32,97,115,115,117,109,105,110,103,32,117,116,102,45,56,10,0,105,110,32,108,97,98,101,108,32,111,102,32,103,114,97,112,104,32,37,115,10,0,105,110,32,108,97,98,101,108,32,111,102,32,110,111,100,101,32,37,115,10,0,105,110,32,108,97,98,101,108,32,111,102,32,101,100,103,101,32,37,115,32,37,115,32,37,115,10,0,107,105,110,100,32,61,61,32,76,84,95,78,79,78,69,0,108,97,98,101,108,115,46,99,0,109,97,107,101,95,108,97,98,101,108,0,38,97,109,112,59,0,38,108,116,59,0,38,103,116,59,0,38,35,52,53,59,0,38,35,49,54,48,59,0,38,113,117,111,116,59,0,38,35,51,57,59,0,92,71,0,92,69,0,92,72,0,92,84,0,92,76,0,110,101,116,119,111,114,107,32,115,105,109,112,108,101,120,58,32,0,37,115,32,37,100,32,110,111,100,101,115,32,37,100,32,101,100,103,101,115,32,109,97,120,105,116,101,114,61,37,100,32,98,97,108,97,110,99,101,61,37,100,10,0,37,100,32,0,37,115,37,100,32,110,111,100,101,115,32,37,100,32,101,100,103,101,115,32,37,100,32,105,116,101,114,32,37,46,50,102,32,115,101,99,10,0,115,101,97,114,99,104,115,105,122,101,0,117,112,100,97,116,101,58,32,109,105,115,109,97,116,99,104,101,100,32,108,99,97,32,105,110,32,116,114,101,101,117,112,100,97,116,101,115,10,0,97,100,100,95,116,114,101,101,95,101,100,103,101,58,32,109,105,115,115,105,110,103,32,116,114,101,101,32,101,100,103,101,10,0,97,100,100,95,116,114,101,101,95,101,100,103,101,58,32,101,109,112,116,121,32,111,117,116,101,100,103,101,32,108,105,115,116,10,0,97,100,100,95,116,114,101,101,95,101,100,103,101,58,32,101,109,112,116,121,32,105,110,101,100,103,101,32,108,105,115,116,10,0,116,114,111,117,98,108,101,32,105,110,32,105,110,105,116,95,114,97,110,107,10,0,9,37,115,32,37,100,10,0,103,114,97,112,104,32,0,32,0,110,111,100,101,32,0,115,116,111,112,10,0,112,111,115,0,114,101,99,116,115,0,120,108,112,0,108,112,0,104,101,97,100,95,108,112,0,116,97,105,108,95,108,112,0,108,119,105,100,116,104,0,108,104,101,105,103,104,116,0,98,98,0,37,46,53,103,44,37,46,53,103,44,37,46,53,103,0,44,37,46,53,103,0,37,46,53,103,44,37,46,53,103,0,37,46,53,103,0,115,97,109,112,108,101,112,111,105,110,116,115,0,37,46,53,103,32,37,46,53,103,0,115,44,37,46,53,103,44,37,46,53,103,32,0,101,44,37,46,53,103,44,37,46,53,103,32,0,37,46,53,103,44,37,46,53,103,44,37,46,53,103,44,37,46,53,103,0,37,46,50,102,0,37,46,53,103,44,37,46,53,103,44,37,46,53,103,44,37,46,53,103,32,0,0,0,0,47,112,97,116,104,98,111,120,32,123,10,32,32,32,32,47,88,32,101,120,99,104,32,110,101,103,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,47,89,32,101,120,99,104,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,47,120,32,101,120,99,104,32,110,101,103,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,47,121,32,101,120,99,104,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,110,101,119,112,97,116,104,32,120,32,121,32,109,111,118,101,116,111,10,32,32,32,32,88,32,121,32,108,105,110,101,116,111,10,32,32,32,32,88,32,89,32,108,105,110,101,116,111,10,32,32,32,32,120,32,89,32,108,105,110,101,116,111,10,32,32,32,32,99,108,111,115,101,112,97,116,104,32,115,116,114,111,107,101,10,125,32,100,101,102,10,0,47,112,97,116,104,98,111,120,32,123,10,32,32,32,32,47,89,32,101,120,99,104,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,47,88,32,101,120,99,104,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,47,121,32,101,120,99,104,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,47,120,32,101,120,99,104,32,37,46,53,103,32,115,117,98,32,100,101,102,10,32,32,32,32,110,101,119,112,97,116,104,32,120,32,121,32,109,111,118,101,116,111,10,32,32,32,32,88,32,121,32,108,105,110,101,116,111,10,32,32,32,32,88,32,89,32,108,105,110,101,116,111,10,32,32,32,32,120,32,89,32,108,105,110,101,116,111,10,32,32,32,32,99,108,111,115,101,112,97,116,104,32,115,116,114,111,107,101,10,32,125,32,100,101,102,10,47,100,98,103,115,116,97,114,116,32,123,32,103,115,97,118,101,32,37,46,53,103,32,37,46,53,103,32,116,114,97,110,115,108,97,116,101,32,125,32,100,101,102,10,47,97,114,114,111,119,108,101,110,103,116,104,32,49,48,32,100,101,102,10,47,97,114,114,111,119,119,105,100,116,104,32,97,114,114,111,119,108,101,110,103,116,104,32,50,32,100,105,118,32,100,101,102,10,47,97,114,114,111,119,104,101,97,100,32,123,10,32,32,32,32,103,115,97,118,101,10,32,32,32,32,114,111,116,97,116,101,10,32,32,32,32,99,117,114,114,101,110,116,112,111,105,110,116,10,32,32,32,32,110,101,119,112,97,116,104,10,32,32,32,32,109,111,118,101,116,111,10,32,32,32,32,97,114,114,111,119,108,101,110,103,116,104,32,97,114,114,111,119,119,105,100,116,104,32,50,32,100,105,118,32,114,108,105,110,101,116,111,10,32,32,32,32,48,32,97,114,114,111,119,119,105,100,116,104,32,110,101,103,32,114,108,105,110,101,116,111,10,32,32,32,32,99,108,111,115,101,112,97,116,104,32,102,105,108,108,10,32,32,32,32,103,114,101,115,116,111,114,101,10,125,32,98,105,110,100,32,100,101,102,10,47,109,97,107,101,97,114,114,111,119,32,123,10,32,32,32,32,99,117,114,114,101,110,116,112,111,105,110,116,32,101,120,99,104,32,112,111,112,32,115,117,98,32,101,120,99,104,32,99,117,114,114,101,110,116,112,111,105,110,116,32,112,111,112,32,115,117,98,32,97,116,97,110,10,32,32,32,32,97,114,114,111,119,104,101,97,100,10,125,32,98,105,110,100,32,100,101,102,10,47,112,111,105,110,116,32,123,32,32,32,32,110,101,119,112,97,116,104,32,32,32,32,50,32,48,32,51,54,48,32,97,114,99,32,102,105,108,108,125,32,100,101,102,47,109,97,107,101,118,101,99,32,123,10,32,32,32,32,47,89,32,101,120,99,104,32,100,101,102,10,32,32,32,32,47,88,32,101,120,99,104,32,100,101,102,10,32,32,32,32,47,121,32,101,120,99,104,32,100,101,102,10,32,32,32,32,47,120,32,101,120,99,104,32,100,101,102,10,32,32,32,32,110,101,119,112,97,116,104,32,120,32,121,32,109,111,118,101,116,111,10,32,32,32,32,88,32,89,32,108,105,110,101,116,111,32,115,116,114,111,107,101,10,32,32,32,32,88,32,89,32,109,111,118,101,116,111,10,32,32,32,32,120,32,121,32,109,97,107,101,97,114,114,111,119,10,125,32,100,101,102,10,0,108,111,115,116,32,37,115,32,37,115,32,101,100,103,101,10,0,110,111,32,112,111,115,105,116,105,111,110,32,102,111,114,32,101,100,103,101,32,119,105,116,104,32,108,97,98,101,108,32,37,115,0,110,111,32,112,111,115,105,116,105,111,110,32,102,111,114,32,101,100,103,101,32,119,105,116,104,32,116,97,105,108,32,108,97,98,101,108,32,37,115,0,110,111,32,112,111,115,105,116,105,111,110,32,102,111,114,32,101,100,103,101,32,119,105,116,104,32,104,101,97,100,32,108,97,98,101,108,32,37,115,0,110,111,32,112,111,115,105,116,105,111,110,32,102,111,114,32,101,100,103,101,32,119,105,116,104,32,120,108,97,98,101,108,32,37,115,0,102,111,114,99,101,108,97,98,101,108,115,0,37,100,32,111,117,116,32,111,102,32,37,100,32,108,97,98,101,108,115,32,112,111,115,105,116,105,111,110,101,100,46,10,0,37,100,32,111,117,116,32,111,102,32,37,100,32,101,120,116,101,114,105,111,114,32,108,97,98,101,108,115,32,112,111,115,105,116,105,111,110,101,100,46,10,0,37,100,32,111,98,106,115,32,37,100,32,120,108,97,98,101,108,115,32,102,111,114,99,101,61,37,100,32,98,98,61,40,37,46,48,50,102,44,37,46,48,50,102,41,32,40,37,46,48,50,102,44,37,46,48,50,102,41,10,0,111,98,106,101,99,116,115,10,0,32,91,37,100,93,32,40,37,46,48,50,102,44,37,46,48,50,102,41,32,40,37,46,48,50,102,44,37,46,48,50,102,41,32,37,112,32,34,37,115,34,10,0,120,108,97,98,101,108,115,10,0,32,91,37,100,93,32,37,112,32,115,101,116,32,37,100,32,40,37,46,48,50,102,44,37,46,48,50,102,41,32,40,37,46,48,50,102,44,37,46,48,50,102,41,32,37,115,10,0,115,104,97,112,101,102,105,108,101,32,110,111,116,32,115,101,116,32,111,114,32,110,111,116,32,102,111,117,110,100,32,102,111,114,32,101,112,115,102,32,110,111,100,101,32,37,115,10,0,99,97,110,39,116,32,102,105,110,100,32,108,105,98,114,97,114,121,32,102,105,108,101,32,37,115,10,0,99,97,110,39,116,32,111,112,101,110,32,108,105,98,114,97,114,121,32,102,105,108,101,32,37,115,10,0,69,79,70,0,66,69,71,73,78,0,69,78,68,0,84,82,65,73,76,69,82,0,47,117,115,101,114,95,115,104,97,112,101,95,37,100,32,123,10,0,37,37,66,101,103,105,110,68,111,99,117,109,101,110,116,58,10,0,37,37,69,110,100,68,111,99,117,109,101,110,116,10,0,125,32,98,105,110,100,32,100,101,102,10,0,85,84,70,45,56,32,105,110,112,117,116,32,117,115,101,115,32,110,111,110,45,76,97,116,105,110,49,32,99,104,97,114,97,99,116,101,114,115,32,119,104,105,99,104,32,99,97,110,110,111,116,32,98,101,32,104,97,110,100,108,101,100,32,98,121,32,116,104,105,115,32,80,111,115,116,83,99,114,105,112,116,32,100,114,105,118,101,114,10,0,99,111,117,108,100,110,39,116,32,111,112,101,110,32,101,112,115,102,32,102,105,108,101,32,37,115,10,0,37,37,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,0,114,101,97,100,0,66,111,117,110,100,105,110,103,66,111,120,32,110,111,116,32,102,111,117,110,100,32,105,110,32,101,112,115,102,32,102,105,108,101,32,37,115,10,0,114,111,117,116,101,115,112,108,105,110,101,115,105,110,105,116,58,32,99,97,110,110,111,116,32,97,108,108,111,99,97,116,101,32,112,115,10,0,114,111,117,116,101,115,112,108,105,110,101,115,58,32,37,100,32,101,100,103,101,115,44,32,37,100,32,98,111,120,101,115,32,37,46,50,102,32,115,101,99,10,0,105,110,32,114,111,117,116,101,115,112,108,105,110,101,115,44,32,99,97,110,110,111,116,32,102,105,110,100,32,78,79,82,77,65,76,32,101,100,103,101,10,0,105,110,32,114,111,117,116,101,115,112,108,105,110,101,115,44,32,105,108,108,101,103,97,108,32,118,97,108,117,101,115,32,111,102,32,112,114,101,118,32,37,100,32,97,110,100,32,110,101,120,116,32,37,100,44,32,108,105,110,101,32,37,100,10,0,105,110,32,114,111,117,116,101,115,112,108,105,110,101,115,44,32,101,100,103,101,32,105,115,32,97,32,108,111,111,112,32,97,116,32,37,115,10,0,105,110,32,114,111,117,116,101,115,112,108,105,110,101,115,44,32,80,115,104,111,114,116,101,115,116,112,97,116,104,32,102,97,105,108,101,100,10,0,105,110,32,114,111,117,116,101,115,112,108,105,110,101,115,44,32,80,114,111,117,116,101,115,112,108,105,110,101,32,102,97,105,108,101,100,10,0,85,110,97,98,108,101,32,116,111,32,114,101,99,108,97,105,109,32,98,111,120,32,115,112,97,99,101,32,105,110,32,115,112,108,105,110,101,32,114,111,117,116,105,110,103,32,102,111,114,32,101,100,103,101,32,34,37,115,34,32,45,62,32,34,37,115,34,46,32,83,111,109,101,116,104,105,110,103,32,105,115,32,112,114,111,98,97,98,108,121,32,115,101,114,105,111,117,115,108,121,32,119,114,111,110,103,46,10,0,105,110,32,99,104,101,99,107,112,97,116,104,44,32,98,111,120,32,48,32,104,97,115,32,76,76,32,99,111,111,114,100,32,62,32,85,82,32,99,111,111,114,100,10,0,105,110,32,99,104,101,99,107,112,97,116,104,44,32,98,111,120,32,37,100,32,104,97,115,32,76,76,32,99,111,111,114,100,32,62,32,85,82,32,99,111,111,114,100,10,0,105,110,32,99,104,101,99,107,112,97,116,104,44,32,98,111,120,101,115,32,37,100,32,97,110,100,32,37,100,32,100,111,110,39,116,32,116,111,117,99,104,10,0,105,110,32,99,104,101,99,107,112,97,116,104,44,32,115,116,97,114,116,32,112,111,114,116,32,110,111,116,32,105,110,32,102,105,114,115,116,32,98,111,120,10,0,105,110,32,99,104,101,99,107,112,97,116,104,44,32,101,110,100,32,112,111,114,116,32,110,111,116,32,105,110,32,108,97,115,116,32,98,111,120,10,0,37,100,32,98,111,120,101,115,58,10,0,37,100,32,40,37,46,53,103,44,32,37,46,53,103,41,44,32,40,37,46,53,103,44,32,37,46,53,103,41,10,0,99,111,110,115,116,114,97,105,110,101,100,0,110,111,116,32,99,111,110,115,116,114,97,105,110,101,100,0,115,116,97,114],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+132702);allocate([116,32,112,111,114,116,58,32,40,37,46,53,103,44,32,37,46,53,103,41,44,32,116,97,110,103,101,110,116,32,97,110,103,108,101,58,32,37,46,53,103,44,32,37,115,10,0,101,110,100,32,112,111,114,116,58,32,40,37,46,53,103,44,32,37,46,53,103,41,44,32,116,97,110,103,101,110,116,32,97,110,103,108,101,58,32,37,46,53,103,44,32,37,115,10,0,99,97,110,110,111,116,32,114,101,45,97,108,108,111,99,97,116,101,32,112,115,10,0,115,105,100,101,115,32,61,61,32,52,0,115,104,97,112,101,115,46,99,0,114,111,117,110,100,95,99,111,114,110,101,114,115,0,115,104,97,112,101,102,105,108,101,0,101,112,115,102,0,99,117,115,116,111,109,0,115,0,101,0,119,0,117,115,105,110,103,32,37,115,32,102,111,114,32,117,110,107,110,111,119,110,32,115,104,97,112,101,32,37,115,10,0,112,111,108,121,103,111,110,0,111,118,97,108,0,99,105,114,99,108,101,0,112,111,105,110,116,0,101,103,103,0,116,114,105,97,110,103,108,101,0,112,108,97,105,110,116,101,120,116,0,100,105,97,109,111,110,100,0,116,114,97,112,101,122,105,117,109,0,112,97,114,97,108,108,101,108,111,103,114,97,109,0,104,111,117,115,101,0,112,101,110,116,97,103,111,110,0,104,101,120,97,103,111,110,0,115,101,112,116,97,103,111,110,0,111,99,116,97,103,111,110,0,110,111,116,101,0,116,97,98,0,102,111,108,100,101,114,0,98,111,120,51,100,0,99,111,109,112,111,110,101,110,116,0,114,101,99,116,0,114,101,99,116,97,110,103,108,101,0,115,113,117,97,114,101,0,100,111,117,98,108,101,99,105,114,99,108,101,0,100,111,117,98,108,101,111,99,116,97,103,111,110,0,116,114,105,112,108,101,111,99,116,97,103,111,110,0,105,110,118,116,114,105,97,110,103,108,101,0,105,110,118,116,114,97,112,101,122,105,117,109,0,105,110,118,104,111,117,115,101,0,117,110,100,101,114,108,105,110,101,0,77,100,105,97,109,111,110,100,0,77,115,113,117,97,114,101,0,77,99,105,114,99,108,101,0,112,114,111,109,111,116,101,114,0,99,100,115,0,116,101,114,109,105,110,97,116,111,114,0,117,116,114,0,105,110,115,117,108,97,116,111,114,0,114,105,98,111,115,105,116,101,0,114,110,97,115,116,97,98,0,112,114,111,116,101,97,115,101,115,105,116,101,0,112,114,111,116,101,105,110,115,116,97,98,0,112,114,105,109,101,114,115,105,116,101,0,114,101,115,116,114,105,99,116,105,111,110,115,105,116,101,0,102,105,118,101,112,111,118,101,114,104,97,110,103,0,116,104,114,101,101,112,111,118,101,114,104,97,110,103,0,110,111,118,101,114,104,97,110,103,0,97,115,115,101,109,98,108,121,0,115,105,103,110,97,116,117,114,101,0,114,112,114,111,109,111,116,101,114,0,108,97,114,114,111,119,0,114,97,114,114,111,119,0,108,112,114,111,109,111,116,101,114,0,114,101,99,111,114,100,0,77,114,101,99,111,114,100,0,115,116,97,114,0,35,56,48,56,48,56,48,0,35,102,99,102,99,102,99,0,35,51,48,51,48,51,48,0,35,101,56,101,56,101,56,0,35,101,48,101,48,101,48,0,35,102,48,102,48,102,48,0,35,49,48,49,48,49,48,0,35,102,56,102,56,102,56,0,105,110,32,110,111,100,101,32,37,115,10,0,114,111,117,110,100,101,100,0,100,105,97,103,111,110,97,108,115,0,114,97,100,105,97,108,0,115,116,114,105,112,101,100,0,119,101,100,103,101,100,0,95,0,110,111,100,101,32,37,115,44,32,112,111,114,116,32,37,115,44,32,117,110,114,101,99,111,103,110,105,122,101,100,32,99,111,109,112,97,115,115,32,112,111,105,110,116,32,39,37,115,39,32,45,32,105,103,110,111,114,101,100,10,0,110,111,100,101,32,37,115,44,32,112,111,114,116,32,37,115,32,117,110,114,101,99,111,103,110,105,122,101,100,10,0,37,46,53,103,32,37,46,53,103,32,116,114,97,110,115,108,97,116,101,32,110,101,119,112,97,116,104,32,117,115,101,114,95,115,104,97,112,101,95,37,100,10,0,105,110,118,105,115,0,0,102,105,108,108,101,100,0,0,98,97,100,32,108,97,98,101,108,32,102,111,114,109,97,116,32,37,115,10,0,92,78,0,109,97,114,103,105,110,0,37,108,102,44,37,108,102,0,114,101,103,117,108,97,114,0,60,110,105,108,62,0,78,111,32,111,114,32,105,109,112,114,111,112,101,114,32,115,104,97,112,101,102,105,108,101,61,34,37,115,34,32,102,111,114,32,110,111,100,101,32,34,37,115,34,10,0,78,111,32,111,114,32,105,109,112,114,111,112,101,114,32,105,109,97,103,101,61,34,37,115,34,32,102,111,114,32,110,111,100,101,32,34,37,115,34,10,0,108,97,98,101,108,108,111,99,0,110,111,100,101,32,39,37,115,39,44,32,103,114,97,112,104,32,39,37,115,39,32,115,105,122,101,32,116,111,111,32,115,109,97,108,108,32,102,111,114,32,108,97,98,101,108,10,0,115,112,108,105,110,101,115,46,99,0,98,101,103,105,110,112,97,116,104,0,80,45,62,101,110,100,46,116,104,101,116,97,32,60,32,50,32,42,32,77,95,80,73,0,101,110,100,112,97,116,104,0,109,97,107,101,83,101,108,102,69,100,103,101,0,103,101,116,115,112,108,105,110,101,112,111,105,110,116,115,58,32,110,111,32,115,112,108,105,110,101,32,112,111,105,110,116,115,32,97,118,97,105,108,97,98,108,101,32,102,111,114,32,101,100,103,101,32,40,37,115,44,37,115,41,10,0,112,111,108,121,108,105,110,101,77,105,100,112,111,105,110,116,0,115,112,97,110,45,62,102,111,110,116,0,116,101,120,116,115,112,97,110,46,99,0,116,101,120,116,115,112,97,110,95,115,105,122,101,0,102,111,110,116,45,62,110,97,109,101,0,102,111,110,116,110,97,109,101,58,32,34,37,115,34,32,114,101,115,111,108,118,101,100,32,116,111,58,32,37,115,10,0,102,111,110,116,110,97,109,101,58,32,117,110,97,98,108,101,32,116,111,32,114,101,115,111,108,118,101,32,34,37,115,34,10,0,99,111,117,114,0,91,105,110,116,101,114,110,97,108,32,99,111,117,114,105,101,114,93,0,97,114,105,97,108,0,104,101,108,118,101,116,105,99,97,0,91,105,110,116,101,114,110,97,108,32,97,114,105,97,108,93,0,91,105,110,116,101,114,110,97,108,32,116,105,109,101,115,93,0,65,118,97,110,116,71,97,114,100,101,45,66,111,111,107,0,85,82,87,32,71,111,116,104,105,99,32,76,0,98,111,111,107,0,115,97,110,115,45,83,101,114,105,102,0,65,118,97,110,116,71,97,114,100,101,45,66,111,111,107,79,98,108,105,113,117,101,0,111,98,108,105,113,117,101,0,105,116,97,108,105,99,0,65,118,97,110,116,71,97,114,100,101,45,68,101,109,105,0,100,101,109,105,0,65,118,97,110,116,71,97,114,100,101,45,68,101,109,105,79,98,108,105,113,117,101,0,66,111,111,107,109,97,110,45,68,101,109,105,0,85,82,87,32,66,111,111,107,109,97,110,32,76,0,115,101,114,105,102,0,66,111,111,107,109,97,110,45,68,101,109,105,73,116,97,108,105,99,0,66,111,111,107,109,97,110,45,76,105,103,104,116,0,108,105,103,104,116,0,66,111,111,107,109,97,110,45,76,105,103,104,116,73,116,97,108,105,99,0,67,111,117,114,105,101,114,0,109,111,110,111,115,112,97,99,101,0,67,111,117,114,105,101,114,45,66,111,108,100,0,67,111,117,114,105,101,114,45,66,111,108,100,79,98,108,105,113,117,101,0,67,111,117,114,105,101,114,45,79,98,108,105,113,117,101,0,72,101,108,118,101,116,105,99,97,0,72,101,108,118,101,116,105,99,97,45,66,111,108,100,0,72,101,108,118,101,116,105,99,97,45,66,111,108,100,79,98,108,105,113,117,101,0,72,101,108,118,101,116,105,99,97,45,78,97,114,114,111,119,0,99,111,110,100,101,110,115,101,100,0,72,101,108,118,101,116,105,99,97,45,78,97,114,114,111,119,45,66,111,108,100,0,72,101,108,118,101,116,105,99,97,45,78,97,114,114,111,119,45,66,111,108,100,79,98,108,105,113,117,101,0,72,101,108,118,101,116,105,99,97,45,78,97,114,114,111,119,45,79,98,108,105,113,117,101,0,72,101,108,118,101,116,105,99,97,45,79,98,108,105,113,117,101,0,78,101,119,67,101,110,116,117,114,121,83,99,104,108,98,107,45,66,111,108,100,0,67,101,110,116,117,114,121,32,83,99,104,111,111,108,98,111,111,107,32,76,0,78,101,119,67,101,110,116,117,114,121,83,99,104,108,98,107,45,66,111,108,100,73,116,97,108,105,99,0,78,101,119,67,101,110,116,117,114,121,83,99,104,108,98,107,45,73,116,97,108,105,99,0,78,101,119,67,101,110,116,117,114,121,83,99,104,108,98,107,45,82,111,109,97,110,0,114,111,109,97,110,0,80,97,108,97,116,105,110,111,45,66,111,108,100,0,80,97,108,97,116,105,110,111,32,76,105,110,111,116,121,112,101,0,80,97,108,97,116,105,110,111,45,66,111,108,100,73,116,97,108,105,99,0,80,97,108,97,116,105,110,111,45,73,116,97,108,105,99,0,80,97,108,97,116,105,110,111,45,82,111,109,97,110,0,83,121,109,98,111,108,0,102,97,110,116,97,115,121,0,84,105,109,101,115,45,66,111,108,100,0,84,105,109,101,115,0,84,105,109,101,115,45,66,111,108,100,73,116,97,108,105,99,0,84,105,109,101,115,45,73,116,97,108,105,99,0,90,97,112,102,67,104,97,110,99,101,114,121,45,77,101,100,105,117,109,73,116,97,108,105,99,0,85,82,87,32,67,104,97,110,99,101,114,121,32,76,0,109,101,100,105,117,109,0,90,97,112,102,68,105,110,103,98,97,116,115,0,68,105,110,103,98,97,116,115,0,105,110,112,117,116,115,99,97,108,101,0,117,116,105,108,115,46,99,0,117,32,61,61,32,85,70,95,102,105,110,100,40,117,41,0,85,70,95,115,101,116,110,97,109,101,0,1,102,105,108,101,32,108,111,97,100,105,110,103,32,105,115,32,100,105,115,97,98,108,101,100,32,98,101,99,97,117,115,101,32,116,104,101,32,101,110,118,105,114,111,110,109,101,110,116,32,99,111,110,116,97,105,110,115,32,83,69,82,86,69,82,95,78,65,77,69,61,34,37,115,34,10,97,110,100,32,116,104,101,32,71,86,95,70,73,76,69,95,80,65,84,72,32,118,97,114,105,97,98,108,101,32,105,115,32,117,110,115,101,116,32,111,114,32,101,109,112,116,121,46,10,0,80,97,116,104,32,112,114,111,118,105,100,101,100,32,116,111,32,102,105,108,101,58,32,34,37,115,34,32,104,97,115,32,98,101,101,110,32,105,103,110,111,114,101,100,32,98,101,99,97,117,115,101,32,102,105,108,101,115,32,97,114,101,32,111,110,108,121,32,112,101,114,109,105,116,116,101,100,32,116,111,32,98,101,32,108,111,97,100,101,100,32,102,114,111,109,32,116,104,101,32,100,105,114,101,99,116,111,114,105,101,115,32,105,110,32,34,37,115,34,32,119,104,101,110,32,114,117,110,110,105,110,103,32,105,110,32,97,110,32,104,116,116,112,32,115,101,114,118,101,114,46,10,0,47,0,110,111,0,116,114,117,101,0,121,101,115,0,101,108,108,105,112,115,101,0,84,105,109,101,115,45,82,111,109,97,110,0,99,108,117,115,116,101,114,0,95,95,99,108,117,115,116,101,114,110,111,100,101,115,0,0,85,84,70,56,32,99,111,100,101,115,32,62,32,52,32,98,121,116,101,115,32,97,114,101,32,110,111,116,32,99,117,114,114,101,110,116,108,121,32,115,117,112,112,111,114,116,101,100,32,40,103,114,97,112,104,32,37,115,41,32,45,32,116,114,101,97,116,101,100,32,97,115,32,76,97,116,105,110,45,49,46,32,80,101,114,104,97,112,115,32,34,45,71,99,104,97,114,115,101,116,61,108,97,116,105,110,49,34,32,105,115,32,110,101,101,100,101,100,63,10,0,73,110,118,97,108,105,100,32,37,100,45,98,121,116,101,32,85,84,70,56,32,102,111,117,110,100,32,105,110,32,105,110,112,117,116,32,111,102,32,103,114,97,112,104,32,37,115,32,45,32,116,114,101,97,116,101,100,32,97,115,32,76,97,116,105,110,45,49,46,32,80,101,114,104,97,112,115,32,34,45,71,99,104,97,114,115,101,116,61,108,97,116,105,110,49,34,32,105,115,32,110,101,101,100,101,100,63,10,0,117,114,118,101,100,0,111,109,112,111,117,110,100,0,97,108,115,101,0,105,110,101,0,111,110,101,0,111,0,114,116,104,111,0,111,108,121,108,105,110,101,0,112,108,105,110,101,0,114,117,101,0,101,115,0,85,110,107,110,111,119,110,32,34,115,112,108,105,110,101,115,34,32,118,97,108,117,101,58,32,34,37,115,34,32,45,32,105,103,110,111,114,101,100,10,0,115,112,108,105,110,101,115,0,98,122,46,115,105,122,101,0,111,118,101,114,108,97,112,95,98,101,122,105,101,114,0,65,69,108,105,103,0,65,97,99,117,116,101,0,65,99,105,114,99,0,65,103,114,97,118,101,0,65,108,112,104,97,0,65,114,105,110,103,0,65,116,105,108,100,101,0,65,117,109,108,0,66,101,116,97,0,67,99,101,100,105,108,0,67,104,105,0,68,97,103,103,101,114,0,68,101,108,116,97,0,69,84,72,0,69,97,99,117,116,101,0,69,99,105,114,99,0,69,103,114,97,118,101,0,69,112,115,105,108,111,110,0,69,116,97,0,69,117,109,108,0,71,97,109,109,97,0,73,97,99,117,116,101,0,73,99,105,114,99,0,73,103,114,97,118,101,0,73,111,116,97,0,73,117,109,108,0,75,97,112,112,97,0,76,97,109,98,100,97,0,77,117,0,78,116,105,108,100,101,0,78,117,0,79,69,108,105,103,0,79,97,99,117,116,101,0,79,99,105,114,99,0,79,103,114,97,118,101,0,79,109,101,103,97,0,79,109,105,99,114,111,110,0,79,115,108,97,115,104,0,79,116,105,108,100,101,0,79,117,109,108,0,80,104,105,0,80,105,0,80,114,105,109,101,0,80,115,105,0,82,104,111,0,83,99,97,114,111,110,0,83,105,103,109,97,0,84,72,79,82,78,0,84,97,117,0,84,104,101,116,97,0,85,97,99,117,116,101,0,85,99,105,114,99,0,85,103,114,97,118,101,0,85,112,115,105,108,111,110,0,85,117,109,108,0,88,105,0,89,97,99,117,116,101,0,89,117,109,108,0,90,101,116,97,0,97,97,99,117,116,101,0,97,99,105,114,99,0,97,99,117,116,101,0,97,101,108,105,103,0,97,103,114,97,118,101,0,97,108,101,102,115,121,109,0,97,108,112,104,97,0,97,109,112,0,97,110,100,0,97,110,103,0,97,114,105,110,103,0,97,115,121,109,112,0,97,116,105,108,100,101,0,97,117,109,108,0,98,100,113,117,111,0,98,101,116,97,0,98,114,118,98,97,114,0,98,117,108,108,0,99,97,112,0,99,99,101,100,105,108,0,99,101,100,105,108,0,99,101,110,116,0,99,104,105,0,99,105,114,99,0,99,108,117,98,115,0,99,111,110,103,0,99,111,112,121,0,99,114,97,114,114,0,99,117,112,0,99,117,114,114,101,110,0,100,65,114,114,0,100,97,103,103,101,114,0,100,97,114,114,0,100,101,103,0,100,101,108,116,97,0,100,105,97,109,115,0,100,105,118,105,100,101,0,101,97,99,117,116,101,0,101,99,105,114,99,0,101,103,114,97,118,101,0,101,109,112,116,121,0,101,109,115,112,0,101,110,115,112,0,101,112,115,105,108,111,110,0,101,113,117,105,118,0,101,116,97,0,101,116,104,0,101,117,109,108,0,101,117,114,111,0,101,120,105,115,116,0,102,110,111,102,0,102,111,114,97,108,108,0,102,114,97,99,49,50,0,102,114,97,99,49,52,0,102,114,97,99,51,52,0,102,114,97,115,108,0,103,97,109,109,97,0,103,101,0,103,116,0,104,65,114,114,0,104,97,114,114,0,104,101,97,114,116,115,0,104,101,108,108,105,112,0,105,97,99,117,116,101,0,105,99,105,114,99,0,105,101,120,99,108,0,105,103,114,97,118,101,0,105,109,97,103,101,0,105,110,102,105,110,0,105,110,116,0,105,111,116,97,0,105,113,117,101,115,116,0,105,115,105,110,0,105,117,109,108,0,107,97,112,112,97,0,108,65,114,114,0,108,97,109,98,100,97,0,108,97,110,103,0,108,97,113,117,111,0,108,97,114,114,0,108,99,101,105,108,0,108,100,113,117,111,0,108,101,0,108,102,108,111,111,114,0,108,111,119,97,115,116,0,108,111,122,0,108,114,109,0,108,115,97,113,117,111,0,108,115,113,117,111,0,108,116,0,109,97,99,114,0,109,100,97,115,104,0,109,105,99,114,111,0,109,105,100,100,111,116,0,109,117,0,110,97,98,108,97,0,110,98,115,112,0,110,100,97,115,104,0,110,101,0,110,105,0,110,111,116,0,110,111,116,105,110,0,110,115,117,98,0,110,116,105,108,100,101,0,110,117,0,111,97,99,117,116,101,0,111,99,105,114,99,0,111,101,108,105,103,0,111,103,114,97,118,101,0,111,108,105,110,101,0,111,109,101,103,97,0,111,109,105,99,114,111,110,0,111,112,108,117,115,0,111,114,0,111,114,100,102,0,111,114,100,109,0,111,115,108,97,115,104,0,111,116,105,108,100,101,0,111,116,105,109,101,115,0,111,117,109,108,0,112,97,114,97,0,112,97,114,116,0,112,101,114,109,105,108,0,112,101,114,112,0,112,104,105,0,112,105,0,112,105,118,0,112,108,117,115,109,110,0,112,111,117,110,100,0,112,114,105,109,101,0,112,114,111,100,0,112,114,111,112,0,112,115,105,0,113,117,111,116,0,114,65,114,114,0,114,97,100,105,99,0,114,97,110,103,0,114,97,113,117,111,0,114,97,114,114,0,114,99,101,105,108,0,114,100,113,117,111,0,114,101,97,108,0,114,101,103,0,114,102,108,111,111,114,0,114,104,111,0,114,108,109,0,114,115,97,113,117,111,0,114,115,113,117,111,0,115,98,113,117,111,0,115,99,97,114,111,110,0,115,100,111,116,0,115,101,99,116,0,115,104,121,0,115,105,103,109,97,0,115,105,103,109,97,102,0,115,105,109,0,115,112,97,100,101,115,0,115,117,98,0,115,117,98,101,0,115,117,109,0,115,117,112,0,115,117,112,49,0,115,117,112,50,0,115,117,112,51,0,115,117,112,101,0,115,122,108,105,103,0,116,97,117,0,116,104,101,114,101,52,0,116,104,101,116,97,0,116,104,101,116,97,115,121,109,0,116,104,105,110,115,112,0,116,104,111,114,110,0,116,105,108,100,101,0,116,105,109,101,115,0,116,114,97,100,101,0,117,65,114,114,0,117,97,99,117,116,101,0,117,97,114,114,0,117,99,105,114,99,0,117,103,114,97,118,101,0,117,109,108,0,117,112,115,105,104,0,117,112,115,105,108,111,110,0,117,117,109,108,0,119,101,105,101,114,112,0,120,105,0,121,97,99,117,116,101,0,121,101,110,0,121,117,109,108,0,122,101,116,97,0,122,119,106,0,122,119,110,106,0,109,97,112,78,0,84,119,111,32,99,108,117,115,116,101,114,115,32,110,97,109,101,100,32,37,115,32,45,32,116,104,101,32,115,101,99,111,110,100,32,119,105,108,108,32,98,101,32,105,103,110,111,114,101,100,10,0,99,108,117,115,116,101,114,32,99,121,99,108,101,32,37,115,32,45,45,32,37,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,116,97,105,108,32,99,108,117,115,116,101,114,32,37,115,32,105,110,115,105,100,101,32,104,101,97,100,32,99,108,117,115,116,101,114,32,37,115,10,0,104,101,97,100,32,99,108,117,115,116,101,114,32,37,115,32,105,110,115,105,100,101,32,116,97,105,108,32,99,108,117,115,116,101,114,32,37,115,10,0,116,97,105,108,32,110,111,100,101,32,37,115,32,105,110,115,105,100,101,32,104,101,97,100,32,99,108,117,115,116,101,114,32,37,115,10,0,104,101,97,100,32,110,111,100,101,32,37,115,32,105,110,115,105,100,101,32,116,97,105,108,32,99,108,117,115,116,101,114,32,37,115,10,0,95,95,0,108,97,98,101,108,0,115,104,97,112,101,0,98,111,120,0,37,115,37,115,37,115,0,111,100,98,0,79,114,116,104,111,103,111,110,97,108,32,101,100,103,101,115,32,100,111,32,110,111,116,32,99,117,114,114,101,110,116,108,121,32,104,97,110,100,108,101,32,101,100,103,101,32,108,97,98,101,108,115,46,32,84,114,121,32,117,115,105,110,103,32,120,108,97,98,101,108,115,46,10,0,111,114,116,104,111,32,37,115,32,37,115,10,0,99,104,97,110,105,0,111,114,116,104,111,46,99,0,99,104,97,110,83,101,97,114,99,104,0,99,112,0,37,115,0,37,100,32,37,100,32,116,114,97,110,115,108,97,116,101,10,0,48,46,56,32,48,46,56,32,48,46,56,32,115,101,116,114,103,98,99,111,108,111,114,10,0,115,104,111,119,112,97,103,101,10,37,37,37,37,84,114,97,105,108,101,114,10,37,37,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,0,110,101,119,112,97,116,104,32,37,100,32,37,100,32,109,111,118,101,116,111,10,0,37,100,32,37,100,32,108,105,110,101,116,111,10,0,37,100,32,37,100,32,108,105,110,101,116,111,32,115,116,114,111,107,101,10,0,37,37,33,80,83,45,65,100,111,98,101,45,50,46,48,10,37,37,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,40,97,116,101,110,100,41,10,47,112,111,105,110,116,32,123,10,32,32,47,89,32,101,120,99,104,32,100,101,102,10,32,32,47,88,32,101,120,99,104,32,100,101,102,10,32,32,110,101,119,112,97,116,104,10,32,32,88,32,89,32,51,32,48,32,51,54,48,32,97,114,99,32,102,105,108,108,10,125,32,100,101,102,10,47,99,101,108,108,32,123,10,32,32,47,89,32,101,120,99,104,32,100,101,102,10,32,32,47,88,32,101,120,99,104,32,100,101,102,10,32,32,47,121,32,101,120,99,104,32,100,101,102,10,32,32,47,120,32,101,120,99,104,32,100,101,102,10,32,32,110,101,119,112,97,116,104,10,32,32,120,32,121,32,109,111,118,101,116,111,10,32,32,120,32,89,32,108,105,110,101,116,111,10,32,32,88,32,89,32,108,105,110,101,116,111,10,32,32,88,32,121,32,108,105,110,101,116,111,10,32,32,99,108,111,115,101,112,97,116,104,32,115,116,114,111,107,101,10,125,32,100,101,102,10,47,110,111,100,101,32,123,10,32,47,117,32,101,120,99,104,32,100,101,102,10,32,47,114,32,101,120,99,104,32,100,101,102,10,32,47,100,32,101,120,99,104,32,100,101,102,10,32,47,108,32,101,120,99,104,32,100,101,102,10,32,110,101,119,112,97,116,104,32,108,32,100,32,109,111,118,101,116,111,10,32,114,32,100,32,108,105,110,101,116,111,32,114,32,117,32,108,105,110,101,116,111,32,108,32,117,32,108,105,110,101,116,111,10,32,99,108,111,115,101,112,97,116,104,32,102,105,108,108,10,125,32,100,101,102,10,10,0,99,104,97,110,110,101,108,32,37,100,32,40,37,102,44,37,102,41,10,0,32,45,62,10,0,32,32,32,32,32,0,40,40,37,102,44,37,102,41,44,40,37,102,44,37,102,41,41,32,37,115,32,37,115,0,66,95,78,79,68,69,0,66,95,85,80,0,66,95,76,69,70,84,0,66,95,68,79,87,78,0,66,95,82,73,71,72,84,0,115,101,103,0,110,101,120,116,95,115,101,103,0,100,101,99,105,100,101,95,112,111,105,110,116,0,105,110,99,111,109,112,97,114,97,98,108,101,32,115,101,103,109,101,110,116,115,32,33,33,32,45,45,32,65,98,111,114,116,105,110,103,10,0,115,49,45,62,99,111,109,109,95,99,111,111,114,100,61,61,115,50,45,62,99,111,109,109,95,99,111,111,114,100,0,105,115,95,112,97,114,97,108,108,101,108,0,103,114,97,112,104,32,71,32,123,10,0,32,110,111,100,101,91,115,104,97,112,101,61,112,111,105,110,116,93,10,0,32,32,37,100,32,91,112,111,115,61,34,37,100,44,37,100,34,93,10,0,32,32,37,100,32,45,45,32,37,100,91,108,101,110,61,34,37,102,34,93,10,0,125,10,0,115,111,108,105,100,0,105,110,118,105,115,105,98,108,101,0,98,111,108,100,0,115,101,116,108,105,110,101,119,105,100,116,104,0,102,105,108,108,101,100,0,117,110,102,105,108,108,101,100,0,116,97,112,101,114,101,100,0,103,118,114,101,110,100,101,114,95,115,101,116,95,115,116,121,108,101,58,32,117,110,115,117,112,112,111,114,116,101,100,32,115,116,121,108,101,32,37,115,32,45,32,105,103,110,111,114,105,110,103,10,0,103,118,114,101,110,100,101,114,46,99,0,103,118,114,101,110,100,101,114,95,117,115,101,114,115,104,97,112,101,0,110,97,109,101,0,110,97,109,101,91,48,93,0,98,111,116,104,0,99,111,108,111,114,32,37,115,0,37,115,32,105,115,32,110,111,116,32,97,32,107,110,111,119,110,32,99,111,108,111,114,46,10,0,101,114,114,111,114,32,105,110,32,99,111,108,120,108,97,116,101,40,41,10,0,106,111,98,0,103,118,108,111,97,100,105,109,97,103,101,46,99,0,103,118,108,111,97,100,105,109,97,103,101,0,117,115,0,117,115,45,62,110,97,109,101,0,117,115,45,62,110,97,109,101,91,48,93,0,58,0,78,111,32,108,111,97,100,105,109,97,103,101,32,112,108,117,103,105,110,32,102,111,114,32,34,37,115,34,10,0,103,114,97,112,104,118,105,122,0,50,46,51,56,46,48,0,50,48,49,52,48,52,49,51,46,50,48,52,49,0,81,0,76,101,102,116,0,75,80,95,76,101,102,116,0,82,105,103,104,116,0,75,80,95,82,105,103,104,116,0,85,112,0,75,80,95,85,112,0,68,111,119,110,0,75,80,95,68,111,119,110,0,112,108,117,115,0,75,80,95,65,100,100,0,109,105,110,117,115,0,75,80,95,83,117,98,116,114,97,99,116,0,70,0,71,0,110,101,119,46,103,118,0,85,82,76,0,107,101,121,0,104,101,97,100,112,111,114,116,0,116,97,105,108,112,111,114,116,0,101,100,103,101,0,110,111,100,101,0,115,117,98,103,114,97,112,104,0,103,114,97,112,104,0,100,105,103,114,97,112,104,0,95,76,84,88,95,108,105,98,114,97,114,121,0,116,101,120,116,108,97,121,111,117,116,0,111,98,106,112,45,62,108,98,108,0,120,108,97,98,101,108,115,46,99,0,120,108,97,100,106,117,115,116,0,120,108,105,110,116,101,114,115,101,99,116,105,111,110,115,0,108,112,32,33,61,32,99,108,112,0,103,101,116,105,110,116,114,115,120,105,0,111,98,106,112,49,45,62,115,122,46,120,32,61,61,32,48,32,38,38,32,111,98,106,112,49,45,62,115,122,46,121,32,61,61,32,48,0,108,98,108,101,110,99,108,111,115,105,110,103,0,118,112,0,120,108,104,100,120,117,110,108,111,97,100,0,115,105,122,101,61,61,102,114,101,101,100,0,114,101,99,116,46,98,111,117,110,100,97,114,121,91,50,93,32,60,32,73,78,84,95,77,65,88,0,111,98,106,112,108,112,109,107,115,0,114,101,99,116,46,98,111,117,110,100,97,114,121,91,51,93,32,60,32,73,78,84,95,77,65,88,0,111,117,116,32,111,102,32,109,101,109,111,114,121,10,0,35,37,50,120,37,50,120,37,50,120,37,50,120,0,37,108,102,37,108,102,37,108,102,0,47,97,99,99,101,110,116,51,47,49,0,47,97,99,99,101,110,116,51,47,50,0,47,97,99,99,101,110,116,51,47,51,0,47,97,99,99,101,110,116,52,47,49,0,47,97,99,99,101,110,116,52,47,50,0,47,97,99,99,101,110,116,52,47,51,0,47,97,99,99,101,110,116,52,47,52,0,47,97,99,99,101,110,116,53,47,49,0,47,97,99,99,101,110,116,53,47,50,0,47,97,99,99,101,110,116,53,47,51,0,47,97,99,99,101,110,116,53,47,52,0,47,97,99,99,101,110,116,53,47,53,0,47,97,99,99,101,110,116,54,47,49,0,47,97,99,99,101,110,116,54,47,50,0,47,97,99,99,101,110,116,54,47,51,0,47,97,99,99,101,110,116,54,47,52,0,47,97,99,99,101,110,116,54,47,53,0,47,97,99,99,101,110,116,54,47,54,0,47,97,99,99,101,110,116,55,47,49,0,47,97,99,99,101,110,116,55,47,50,0,47,97,99,99,101,110,116,55,47,51,0,47,97,99,99,101,110,116,55,47,52,0,47,97,99,99,101,110,116,55,47,53,0,47,97,99,99,101,110,116,55,47,54,0,47,97,99,99,101,110,116,55,47,55,0,47,97,99,99,101,110,116,56,47,49,0,47,97,99,99,101,110,116,56,47,50,0,47,97,99,99,101,110,116,56,47,51,0,47,97,99,99,101,110,116,56,47,52,0,47,97,99,99,101,110,116,56,47,53,0,47,97,99,99,101,110,116,56,47,54,0,47,97,99,99,101,110,116,56,47,55,0,47,97,99,99,101,110,116,56,47,56,0,47,98,108,117,101,115,51,47,49,0,47,98,108,117,101,115,51,47,50,0,47,98,108,117,101,115,51,47,51,0,47,98,108,117,101,115,52,47,49,0,47,98,108,117,101,115,52,47,50,0,47,98,108,117,101,115,52,47,51,0,47,98,108,117,101,115,52,47,52,0,47,98,108,117,101,115,53,47,49,0,47,98,108,117,101,115,53,47,50,0,47,98,108,117,101,115,53,47,51,0,47,98,108,117,101,115,53,47,52,0,47,98,108,117,101,115,53,47,53,0,47,98,108,117,101,115,54,47,49,0,47,98,108,117,101,115,54,47,50,0,47,98,108,117,101,115,54,47,51,0,47,98,108,117,101,115,54,47,52,0,47,98,108,117,101,115,54,47,53,0,47,98,108,117,101,115,54,47,54,0,47,98,108,117,101,115,55,47,49,0,47,98,108,117,101,115,55,47,50,0,47,98,108,117,101,115,55,47,51,0,47,98,108,117,101,115,55,47,52,0,47,98,108,117,101,115,55,47,53,0,47,98,108,117,101,115,55,47,54,0,47,98,108,117,101,115,55,47,55,0,47,98,108,117,101,115,56,47,49,0,47,98,108,117,101,115,56,47,50,0,47,98,108,117,101,115,56,47,51,0,47,98,108,117,101,115,56,47,52,0,47,98,108,117,101,115,56,47,53,0,47,98,108,117,101,115,56,47,54,0,47,98,108,117,101,115,56,47,55,0,47,98,108,117,101,115,56,47,56,0,47,98,108,117,101,115,57,47,49,0,47,98,108,117,101,115,57,47,50,0,47,98,108,117,101,115,57,47,51,0,47,98,108,117,101,115,57,47,52,0,47,98,108,117,101,115,57,47,53,0,47,98,108,117,101,115,57,47,54,0,47,98,108,117,101,115,57,47,55,0,47,98,108,117,101,115,57,47,56,0,47,98,108,117,101,115,57,47,57,0,47,98,114,98,103,49,48,47,49,0,47,98,114,98,103,49,48,47,49,48,0,47,98,114,98,103,49,48,47,50,0,47,98,114,98,103,49,48,47,51,0,47,98,114,98,103,49,48,47,52,0,47,98,114,98,103,49,48,47,53,0,47,98,114,98,103,49,48,47,54,0,47,98,114,98,103,49,48,47,55,0,47,98,114,98,103,49,48,47,56,0,47,98,114,98,103,49,48,47,57,0,47,98,114,98,103,49,49,47,49,0,47,98,114,98,103,49,49,47,49,48,0,47,98,114,98,103,49,49,47,49,49,0,47,98,114,98,103,49,49,47,50,0,47,98,114,98,103,49,49,47,51,0,47,98,114,98,103,49,49,47,52,0,47,98,114,98,103,49,49,47,53,0,47,98,114,98,103,49,49,47,54,0,47,98,114,98,103,49,49,47,55,0,47,98,114,98,103,49,49,47,56,0,47,98,114,98,103,49,49,47,57,0,47,98,114,98,103,51,47,49,0,47,98,114,98,103,51,47,50,0,47,98,114,98,103,51,47,51,0,47,98,114,98,103,52,47,49,0,47,98,114,98,103,52,47,50,0,47,98,114,98,103,52,47,51,0,47,98,114,98,103,52,47,52,0,47,98,114,98,103,53,47,49,0,47,98,114,98,103,53,47,50,0,47,98,114,98,103,53,47,51,0,47,98,114,98,103,53,47,52,0,47,98,114,98,103,53,47,53,0,47,98,114,98,103,54,47,49,0,47,98,114,98,103,54,47,50,0,47,98,114,98,103,54,47,51,0,47,98,114,98,103,54,47,52,0,47,98,114,98,103,54,47,53,0,47,98,114,98,103,54,47,54,0,47,98,114,98,103,55,47,49,0,47,98,114,98,103,55,47,50,0,47,98,114,98,103,55,47,51,0,47,98,114,98,103,55,47,52,0,47,98,114,98,103,55,47,53,0,47,98,114,98,103,55,47,54,0,47,98,114,98,103,55,47,55,0,47,98,114,98,103,56,47,49,0,47,98,114,98,103,56,47,50,0,47,98,114,98,103,56,47,51,0,47,98,114,98,103,56,47,52,0,47,98,114,98,103,56,47,53,0,47,98,114,98,103,56,47,54,0,47,98,114,98,103,56,47,55,0,47,98,114,98,103,56,47,56,0,47,98,114,98,103,57,47,49,0,47,98,114,98,103,57,47,50,0,47,98,114,98,103,57,47,51,0,47,98,114,98,103,57,47,52,0,47,98,114,98,103,57,47,53,0,47,98,114,98,103,57,47,54,0,47,98,114,98,103,57,47,55,0,47,98,114,98,103,57,47,56,0,47,98,114,98,103,57,47,57,0,47,98,117,103,110,51,47,49,0,47,98,117,103,110,51,47,50,0,47,98,117,103,110,51,47,51,0,47,98,117,103,110,52,47,49,0,47,98,117,103,110,52,47,50,0,47,98,117,103,110,52,47,51,0,47,98,117,103,110,52,47,52,0,47,98,117,103,110,53,47,49,0,47,98,117,103,110,53,47,50,0,47,98,117,103,110,53,47,51,0,47,98,117,103,110,53,47,52,0,47,98,117,103,110,53,47,53,0,47,98,117,103,110,54,47,49,0,47,98,117,103,110,54,47,50,0,47,98,117,103,110,54,47,51,0,47,98,117,103,110,54,47,52,0,47,98,117,103,110,54,47,53,0,47,98,117,103,110,54,47,54,0,47,98,117,103,110,55,47,49,0,47,98,117,103,110,55,47,50,0,47,98,117,103,110,55,47,51,0,47,98,117,103,110,55,47,52,0,47,98,117,103,110,55,47,53,0,47,98,117,103,110,55,47,54,0,47,98,117,103,110,55,47,55,0,47,98,117,103,110,56,47,49,0,47,98,117,103,110,56,47,50,0,47,98,117,103,110,56,47,51,0,47,98,117,103,110,56,47,52,0,47,98,117,103,110,56,47,53,0,47,98,117,103,110,56,47,54,0,47,98,117,103,110,56,47,55,0,47,98,117,103,110,56,47,56,0,47,98,117,103,110,57,47,49,0,47,98,117,103,110,57,47,50,0,47,98,117,103,110,57,47,51,0,47,98,117,103,110,57,47,52,0,47,98,117,103,110,57,47,53,0,47,98,117,103,110,57,47,54,0,47,98,117,103,110,57,47,55,0,47,98,117,103,110,57,47,56,0,47,98,117,103,110,57,47,57,0,47,98,117,112,117,51,47,49,0,47,98,117,112,117,51,47,50,0,47,98,117,112,117,51,47,51,0,47,98,117,112,117,52,47,49,0,47,98,117,112,117,52,47,50,0,47,98,117,112,117,52,47,51,0,47,98,117,112,117,52,47,52,0,47,98,117,112,117,53,47,49,0,47,98,117,112,117,53,47,50,0,47,98,117,112,117,53,47,51,0,47,98,117,112,117,53,47,52,0,47,98,117,112,117,53,47,53,0,47,98,117,112,117,54,47,49,0,47,98,117,112,117,54,47,50,0,47,98,117,112,117,54,47,51,0,47,98,117,112,117,54,47,52,0,47,98,117,112,117,54,47,53,0,47,98,117,112,117,54,47,54,0,47,98,117,112,117,55,47,49,0,47,98,117,112,117,55,47,50,0,47,98,117,112,117,55,47,51,0,47,98,117,112,117,55,47,52,0,47,98,117,112,117,55,47,53,0,47,98,117,112,117,55,47,54,0,47,98,117,112,117,55,47,55,0,47,98,117,112,117,56,47,49,0,47,98,117,112,117,56,47,50,0,47,98,117,112,117,56,47,51,0,47,98,117,112,117,56,47,52,0,47,98,117,112,117,56,47,53,0,47,98,117,112,117,56,47,54,0,47,98,117,112,117,56,47,55,0,47,98,117,112,117,56,47,56,0,47,98,117,112,117,57,47,49,0,47,98,117,112,117,57,47,50,0,47,98,117,112,117,57,47,51,0,47,98,117,112,117,57,47,52,0,47,98,117,112,117,57,47,53,0,47,98,117,112,117,57,47,54,0,47,98,117,112,117,57,47,55,0,47,98,117,112,117,57,47,56,0,47,98,117,112,117,57,47,57,0,47,100,97,114,107,50,51,47,49,0,47,100,97,114,107,50,51,47,50,0,47,100,97,114,107,50,51,47,51,0,47,100,97,114,107,50,52,47,49,0,47,100,97,114,107,50,52,47,50,0,47,100,97,114,107,50,52,47,51,0,47,100,97,114,107,50,52,47,52,0,47,100,97,114,107,50,53,47,49,0,47,100,97,114,107,50,53,47,50,0,47,100,97,114,107,50,53,47,51,0,47,100,97,114,107,50,53,47,52,0,47,100,97,114,107,50,53,47,53,0,47,100,97,114,107,50,54,47,49,0,47,100,97,114,107,50,54,47,50,0,47,100,97,114,107,50,54,47,51,0,47,100,97,114,107,50,54,47,52,0,47,100,97,114,107,50,54,47,53,0,47,100,97,114,107,50,54,47,54,0,47,100,97,114,107,50,55,47,49,0,47,100,97,114,107,50,55,47,50,0,47,100,97,114,107,50,55,47,51,0,47,100,97,114,107,50,55,47,52,0,47,100,97,114,107,50,55,47,53,0,47,100,97,114,107,50,55,47,54,0,47,100,97,114,107,50,55,47,55,0,47,100,97,114,107,50,56,47,49,0,47,100,97,114,107,50,56,47,50,0,47,100,97,114,107,50,56,47,51,0,47,100,97,114,107,50,56,47,52,0,47,100,97,114,107,50,56,47,53,0,47,100,97,114,107,50,56,47,54,0,47,100,97,114,107,50,56,47,55,0,47,100,97,114,107,50,56,47,56,0,47,103,110,98,117,51,47,49,0,47,103,110,98,117,51,47,50,0,47,103,110,98,117,51,47,51,0,47,103,110,98,117,52,47,49,0,47,103,110,98,117,52,47,50,0,47,103,110,98,117,52,47,51,0,47,103,110,98,117,52,47,52,0,47,103,110,98,117,53,47,49,0,47,103,110,98,117,53,47,50,0,47,103,110,98,117,53,47,51,0,47,103,110,98,117,53,47,52,0,47,103,110,98,117,53,47,53,0,47,103,110,98,117,54,47,49,0,47,103,110,98,117,54,47,50,0,47,103,110,98,117,54,47,51,0,47,103,110,98,117,54,47,52,0,47,103,110,98,117,54,47,53,0,47,103,110,98,117,54,47,54,0,47,103,110,98,117,55,47,49,0,47,103,110,98,117,55,47,50,0,47,103,110,98,117,55,47,51,0,47,103,110,98,117,55,47,52,0,47,103,110,98,117,55,47,53,0,47,103,110,98,117,55,47,54,0,47,103,110,98,117,55,47,55,0,47,103,110,98,117,56,47,49,0,47,103,110,98,117,56,47,50,0,47,103,110,98,117,56,47,51,0,47,103,110,98,117,56,47,52,0,47,103,110,98,117,56,47,53,0,47,103,110,98,117,56,47,54,0,47,103,110,98,117,56,47,55,0,47,103,110,98,117,56,47,56,0,47,103,110,98,117,57,47,49,0,47,103,110,98,117,57,47,50,0,47,103,110,98,117,57,47,51,0,47,103,110,98,117,57,47,52,0,47,103,110,98,117,57,47,53,0,47,103,110,98,117,57,47,54,0,47,103,110,98,117,57,47,55,0,47,103,110,98,117,57,47,56,0,47,103,110,98,117,57,47,57,0,47,103,114,101,101,110,115,51,47,49,0,47,103,114,101,101,110,115,51,47,50,0,47,103,114,101,101,110,115,51,47,51,0,47,103,114,101,101,110,115,52,47,49,0,47,103,114,101,101,110,115,52,47,50,0,47,103,114,101,101,110,115,52,47,51,0,47,103,114,101,101,110,115,52,47,52,0,47,103,114,101,101,110,115,53,47,49,0,47,103,114,101,101,110,115,53,47,50,0,47,103,114,101,101,110,115,53,47,51,0,47,103,114,101,101,110,115,53,47,52,0,47,103,114,101,101,110,115,53,47,53,0,47,103,114,101,101,110,115,54,47,49,0,47,103,114,101,101,110,115,54,47,50,0,47,103,114,101,101,110,115,54,47,51,0,47,103,114,101,101,110,115,54,47,52,0,47,103,114,101,101,110,115,54,47,53,0,47,103,114,101,101,110,115,54,47,54,0,47,103,114,101,101,110,115,55,47,49,0,47,103,114,101,101,110,115,55,47,50,0,47,103,114,101,101,110,115,55,47,51,0,47,103,114,101,101,110,115,55,47,52,0,47,103,114,101,101,110,115,55,47,53,0,47,103,114,101,101,110,115,55,47,54,0,47,103,114,101,101,110,115,55,47,55,0,47,103,114,101,101,110,115,56,47,49,0,47,103,114,101,101,110,115,56,47,50,0,47,103,114,101,101,110,115,56,47,51,0,47,103,114,101,101,110,115,56,47,52,0,47,103,114,101,101,110,115,56,47,53,0,47,103,114,101,101,110,115,56,47,54,0,47,103,114,101,101,110,115,56,47,55,0,47,103,114,101,101,110,115,56,47,56,0,47,103,114,101,101,110,115,57,47,49,0,47,103,114,101,101,110,115,57,47,50,0,47,103,114,101,101,110,115,57,47,51,0,47,103,114,101,101,110,115,57,47,52,0,47,103,114,101,101,110,115,57,47,53,0,47,103,114,101,101,110,115,57,47,54,0,47,103,114,101,101,110,115,57,47,55,0,47,103,114,101,101,110,115,57,47,56,0,47,103,114,101,101,110,115,57,47,57,0,47,103,114,101,121,115,51,47,49,0,47,103,114,101,121,115,51,47,50,0,47,103,114,101,121,115,51,47,51,0,47,103,114,101,121,115,52,47,49,0,47,103,114,101,121,115,52,47,50,0,47,103,114,101,121,115,52,47,51,0,47,103,114,101,121,115,52,47,52,0,47,103,114,101,121,115,53,47,49,0,47,103,114,101,121,115,53,47,50,0,47,103,114,101,121,115,53,47,51,0,47,103,114,101,121,115,53,47,52,0,47,103,114,101,121,115,53,47,53,0,47,103,114,101,121,115,54,47,49,0,47,103,114,101,121,115,54,47,50,0,47,103,114,101,121,115,54,47,51,0,47,103,114,101,121,115,54,47,52,0,47,103,114,101,121,115,54,47,53,0,47,103,114,101,121,115,54,47,54,0,47,103,114,101,121,115,55,47,49,0,47,103,114,101,121,115,55,47,50,0,47,103,114,101,121,115,55,47,51,0,47,103,114,101,121,115,55,47,52,0,47,103,114,101,121,115,55,47,53,0,47,103,114,101,121,115,55,47,54,0,47,103,114,101,121,115,55,47,55,0,47,103,114,101,121,115,56,47,49,0,47,103,114,101,121,115,56,47,50,0,47,103,114,101,121,115,56,47,51,0,47,103,114,101,121,115,56,47,52,0,47,103,114,101,121,115,56,47,53,0,47,103,114,101,121,115,56,47,54,0,47,103,114,101,121,115,56,47,55,0,47,103,114,101,121,115,56,47,56,0,47,103,114,101,121,115,57,47,49,0,47,103,114,101,121,115,57,47,50,0,47,103,114,101,121,115,57,47,51,0,47,103,114,101,121,115,57,47,52,0,47,103,114,101,121,115,57,47,53,0,47,103,114,101,121,115,57,47,54,0,47,103,114,101,121,115,57,47,55,0,47,103,114,101,121,115,57,47,56,0,47,103,114,101,121,115,57,47,57,0,47,111,114,97,110,103,101,115,51,47,49,0,47,111,114,97,110,103,101,115,51,47,50,0,47,111,114,97,110,103,101,115,51,47,51,0,47,111,114,97,110,103,101,115,52,47,49,0,47,111,114,97,110,103,101,115,52,47,50,0,47,111,114,97,110,103,101,115,52,47,51,0,47,111,114,97,110,103,101,115,52,47,52,0,47,111,114,97],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+142942);allocate([110,103,101,115,53,47,49,0,47,111,114,97,110,103,101,115,53,47,50,0,47,111,114,97,110,103,101,115,53,47,51,0,47,111,114,97,110,103,101,115,53,47,52,0,47,111,114,97,110,103,101,115,53,47,53,0,47,111,114,97,110,103,101,115,54,47,49,0,47,111,114,97,110,103,101,115,54,47,50,0,47,111,114,97,110,103,101,115,54,47,51,0,47,111,114,97,110,103,101,115,54,47,52,0,47,111,114,97,110,103,101,115,54,47,53,0,47,111,114,97,110,103,101,115,54,47,54,0,47,111,114,97,110,103,101,115,55,47,49,0,47,111,114,97,110,103,101,115,55,47,50,0,47,111,114,97,110,103,101,115,55,47,51,0,47,111,114,97,110,103,101,115,55,47,52,0,47,111,114,97,110,103,101,115,55,47,53,0,47,111,114,97,110,103,101,115,55,47,54,0,47,111,114,97,110,103,101,115,55,47,55,0,47,111,114,97,110,103,101,115,56,47,49,0,47,111,114,97,110,103,101,115,56,47,50,0,47,111,114,97,110,103,101,115,56,47,51,0,47,111,114,97,110,103,101,115,56,47,52,0,47,111,114,97,110,103,101,115,56,47,53,0,47,111,114,97,110,103,101,115,56,47,54,0,47,111,114,97,110,103,101,115,56,47,55,0,47,111,114,97,110,103,101,115,56,47,56,0,47,111,114,97,110,103,101,115,57,47,49,0,47,111,114,97,110,103,101,115,57,47,50,0,47,111,114,97,110,103,101,115,57,47,51,0,47,111,114,97,110,103,101,115,57,47,52,0,47,111,114,97,110,103,101,115,57,47,53,0,47,111,114,97,110,103,101,115,57,47,54,0,47,111,114,97,110,103,101,115,57,47,55,0,47,111,114,97,110,103,101,115,57,47,56,0,47,111,114,97,110,103,101,115,57,47,57,0,47,111,114,114,100,51,47,49,0,47,111,114,114,100,51,47,50,0,47,111,114,114,100,51,47,51,0,47,111,114,114,100,52,47,49,0,47,111,114,114,100,52,47,50,0,47,111,114,114,100,52,47,51,0,47,111,114,114,100,52,47,52,0,47,111,114,114,100,53,47,49,0,47,111,114,114,100,53,47,50,0,47,111,114,114,100,53,47,51,0,47,111,114,114,100,53,47,52,0,47,111,114,114,100,53,47,53,0,47,111,114,114,100,54,47,49,0,47,111,114,114,100,54,47,50,0,47,111,114,114,100,54,47,51,0,47,111,114,114,100,54,47,52,0,47,111,114,114,100,54,47,53,0,47,111,114,114,100,54,47,54,0,47,111,114,114,100,55,47,49,0,47,111,114,114,100,55,47,50,0,47,111,114,114,100,55,47,51,0,47,111,114,114,100,55,47,52,0,47,111,114,114,100,55,47,53,0,47,111,114,114,100,55,47,54,0,47,111,114,114,100,55,47,55,0,47,111,114,114,100,56,47,49,0,47,111,114,114,100,56,47,50,0,47,111,114,114,100,56,47,51,0,47,111,114,114,100,56,47,52,0,47,111,114,114,100,56,47,53,0,47,111,114,114,100,56,47,54,0,47,111,114,114,100,56,47,55,0,47,111,114,114,100,56,47,56,0,47,111,114,114,100,57,47,49,0,47,111,114,114,100,57,47,50,0,47,111,114,114,100,57,47,51,0,47,111,114,114,100,57,47,52,0,47,111,114,114,100,57,47,53,0,47,111,114,114,100,57,47,54,0,47,111,114,114,100,57,47,55,0,47,111,114,114,100,57,47,56,0,47,111,114,114,100,57,47,57,0,47,112,97,105,114,101,100,49,48,47,49,0,47,112,97,105,114,101,100,49,48,47,49,48,0,47,112,97,105,114,101,100,49,48,47,50,0,47,112,97,105,114,101,100,49,48,47,51,0,47,112,97,105,114,101,100,49,48,47,52,0,47,112,97,105,114,101,100,49,48,47,53,0,47,112,97,105,114,101,100,49,48,47,54,0,47,112,97,105,114,101,100,49,48,47,55,0,47,112,97,105,114,101,100,49,48,47,56,0,47,112,97,105,114,101,100,49,48,47,57,0,47,112,97,105,114,101,100,49,49,47,49,0,47,112,97,105,114,101,100,49,49,47,49,48,0,47,112,97,105,114,101,100,49,49,47,49,49,0,47,112,97,105,114,101,100,49,49,47,50,0,47,112,97,105,114,101,100,49,49,47,51,0,47,112,97,105,114,101,100,49,49,47,52,0,47,112,97,105,114,101,100,49,49,47,53,0,47,112,97,105,114,101,100,49,49,47,54,0,47,112,97,105,114,101,100,49,49,47,55,0,47,112,97,105,114,101,100,49,49,47,56,0,47,112,97,105,114,101,100,49,49,47,57,0,47,112,97,105,114,101,100,49,50,47,49,0,47,112,97,105,114,101,100,49,50,47,49,48,0,47,112,97,105,114,101,100,49,50,47,49,49,0,47,112,97,105,114,101,100,49,50,47,49,50,0,47,112,97,105,114,101,100,49,50,47,50,0,47,112,97,105,114,101,100,49,50,47,51,0,47,112,97,105,114,101,100,49,50,47,52,0,47,112,97,105,114,101,100,49,50,47,53,0,47,112,97,105,114,101,100,49,50,47,54,0,47,112,97,105,114,101,100,49,50,47,55,0,47,112,97,105,114,101,100,49,50,47,56,0,47,112,97,105,114,101,100,49,50,47,57,0,47,112,97,105,114,101,100,51,47,49,0,47,112,97,105,114,101,100,51,47,50,0,47,112,97,105,114,101,100,51,47,51,0,47,112,97,105,114,101,100,52,47,49,0,47,112,97,105,114,101,100,52,47,50,0,47,112,97,105,114,101,100,52,47,51,0,47,112,97,105,114,101,100,52,47,52,0,47,112,97,105,114,101,100,53,47,49,0,47,112,97,105,114,101,100,53,47,50,0,47,112,97,105,114,101,100,53,47,51,0,47,112,97,105,114,101,100,53,47,52,0,47,112,97,105,114,101,100,53,47,53,0,47,112,97,105,114,101,100,54,47,49,0,47,112,97,105,114,101,100,54,47,50,0,47,112,97,105,114,101,100,54,47,51,0,47,112,97,105,114,101,100,54,47,52,0,47,112,97,105,114,101,100,54,47,53,0,47,112,97,105,114,101,100,54,47,54,0,47,112,97,105,114,101,100,55,47,49,0,47,112,97,105,114,101,100,55,47,50,0,47,112,97,105,114,101,100,55,47,51,0,47,112,97,105,114,101,100,55,47,52,0,47,112,97,105,114,101,100,55,47,53,0,47,112,97,105,114,101,100,55,47,54,0,47,112,97,105,114,101,100,55,47,55,0,47,112,97,105,114,101,100,56,47,49,0,47,112,97,105,114,101,100,56,47,50,0,47,112,97,105,114,101,100,56,47,51,0,47,112,97,105,114,101,100,56,47,52,0,47,112,97,105,114,101,100,56,47,53,0,47,112,97,105,114,101,100,56,47,54,0,47,112,97,105,114,101,100,56,47,55,0,47,112,97,105,114,101,100,56,47,56,0,47,112,97,105,114,101,100,57,47,49,0,47,112,97,105,114,101,100,57,47,50,0,47,112,97,105,114,101,100,57,47,51,0,47,112,97,105,114,101,100,57,47,52,0,47,112,97,105,114,101,100,57,47,53,0,47,112,97,105,114,101,100,57,47,54,0,47,112,97,105,114,101,100,57,47,55,0,47,112,97,105,114,101,100,57,47,56,0,47,112,97,105,114,101,100,57,47,57,0,47,112,97,115,116,101,108,49,51,47,49,0,47,112,97,115,116,101,108,49,51,47,50,0,47,112,97,115,116,101,108,49,51,47,51,0,47,112,97,115,116,101,108,49,52,47,49,0,47,112,97,115,116,101,108,49,52,47,50,0,47,112,97,115,116,101,108,49,52,47,51,0,47,112,97,115,116,101,108,49,52,47,52,0,47,112,97,115,116,101,108,49,53,47,49,0,47,112,97,115,116,101,108,49,53,47,50,0,47,112,97,115,116,101,108,49,53,47,51,0,47,112,97,115,116,101,108,49,53,47,52,0,47,112,97,115,116,101,108,49,53,47,53,0,47,112,97,115,116,101,108,49,54,47,49,0,47,112,97,115,116,101,108,49,54,47,50,0,47,112,97,115,116,101,108,49,54,47,51,0,47,112,97,115,116,101,108,49,54,47,52,0,47,112,97,115,116,101,108,49,54,47,53,0,47,112,97,115,116,101,108,49,54,47,54,0,47,112,97,115,116,101,108,49,55,47,49,0,47,112,97,115,116,101,108,49,55,47,50,0,47,112,97,115,116,101,108,49,55,47,51,0,47,112,97,115,116,101,108,49,55,47,52,0,47,112,97,115,116,101,108,49,55,47,53,0,47,112,97,115,116,101,108,49,55,47,54,0,47,112,97,115,116,101,108,49,55,47,55,0,47,112,97,115,116,101,108,49,56,47,49,0,47,112,97,115,116,101,108,49,56,47,50,0,47,112,97,115,116,101,108,49,56,47,51,0,47,112,97,115,116,101,108,49,56,47,52,0,47,112,97,115,116,101,108,49,56,47,53,0,47,112,97,115,116,101,108,49,56,47,54,0,47,112,97,115,116,101,108,49,56,47,55,0,47,112,97,115,116,101,108,49,56,47,56,0,47,112,97,115,116,101,108,49,57,47,49,0,47,112,97,115,116,101,108,49,57,47,50,0,47,112,97,115,116,101,108,49,57,47,51,0,47,112,97,115,116,101,108,49,57,47,52,0,47,112,97,115,116,101,108,49,57,47,53,0,47,112,97,115,116,101,108,49,57,47,54,0,47,112,97,115,116,101,108,49,57,47,55,0,47,112,97,115,116,101,108,49,57,47,56,0,47,112,97,115,116,101,108,49,57,47,57,0,47,112,97,115,116,101,108,50,51,47,49,0,47,112,97,115,116,101,108,50,51,47,50,0,47,112,97,115,116,101,108,50,51,47,51,0,47,112,97,115,116,101,108,50,52,47,49,0,47,112,97,115,116,101,108,50,52,47,50,0,47,112,97,115,116,101,108,50,52,47,51,0,47,112,97,115,116,101,108,50,52,47,52,0,47,112,97,115,116,101,108,50,53,47,49,0,47,112,97,115,116,101,108,50,53,47,50,0,47,112,97,115,116,101,108,50,53,47,51,0,47,112,97,115,116,101,108,50,53,47,52,0,47,112,97,115,116,101,108,50,53,47,53,0,47,112,97,115,116,101,108,50,54,47,49,0,47,112,97,115,116,101,108,50,54,47,50,0,47,112,97,115,116,101,108,50,54,47,51,0,47,112,97,115,116,101,108,50,54,47,52,0,47,112,97,115,116,101,108,50,54,47,53,0,47,112,97,115,116,101,108,50,54,47,54,0,47,112,97,115,116,101,108,50,55,47,49,0,47,112,97,115,116,101,108,50,55,47,50,0,47,112,97,115,116,101,108,50,55,47,51,0,47,112,97,115,116,101,108,50,55,47,52,0,47,112,97,115,116,101,108,50,55,47,53,0,47,112,97,115,116,101,108,50,55,47,54,0,47,112,97,115,116,101,108,50,55,47,55,0,47,112,97,115,116,101,108,50,56,47,49,0,47,112,97,115,116,101,108,50,56,47,50,0,47,112,97,115,116,101,108,50,56,47,51,0,47,112,97,115,116,101,108,50,56,47,52,0,47,112,97,115,116,101,108,50,56,47,53,0,47,112,97,115,116,101,108,50,56,47,54,0,47,112,97,115,116,101,108,50,56,47,55,0,47,112,97,115,116,101,108,50,56,47,56,0,47,112,105,121,103,49,48,47,49,0,47,112,105,121,103,49,48,47,49,48,0,47,112,105,121,103,49,48,47,50,0,47,112,105,121,103,49,48,47,51,0,47,112,105,121,103,49,48,47,52,0,47,112,105,121,103,49,48,47,53,0,47,112,105,121,103,49,48,47,54,0,47,112,105,121,103,49,48,47,55,0,47,112,105,121,103,49,48,47,56,0,47,112,105,121,103,49,48,47,57,0,47,112,105,121,103,49,49,47,49,0,47,112,105,121,103,49,49,47,49,48,0,47,112,105,121,103,49,49,47,49,49,0,47,112,105,121,103,49,49,47,50,0,47,112,105,121,103,49,49,47,51,0,47,112,105,121,103,49,49,47,52,0,47,112,105,121,103,49,49,47,53,0,47,112,105,121,103,49,49,47,54,0,47,112,105,121,103,49,49,47,55,0,47,112,105,121,103,49,49,47,56,0,47,112,105,121,103,49,49,47,57,0,47,112,105,121,103,51,47,49,0,47,112,105,121,103,51,47,50,0,47,112,105,121,103,51,47,51,0,47,112,105,121,103,52,47,49,0,47,112,105,121,103,52,47,50,0,47,112,105,121,103,52,47,51,0,47,112,105,121,103,52,47,52,0,47,112,105,121,103,53,47,49,0,47,112,105,121,103,53,47,50,0,47,112,105,121,103,53,47,51,0,47,112,105,121,103,53,47,52,0,47,112,105,121,103,53,47,53,0,47,112,105,121,103,54,47,49,0,47,112,105,121,103,54,47,50,0,47,112,105,121,103,54,47,51,0,47,112,105,121,103,54,47,52,0,47,112,105,121,103,54,47,53,0,47,112,105,121,103,54,47,54,0,47,112,105,121,103,55,47,49,0,47,112,105,121,103,55,47,50,0,47,112,105,121,103,55,47,51,0,47,112,105,121,103,55,47,52,0,47,112,105,121,103,55,47,53,0,47,112,105,121,103,55,47,54,0,47,112,105,121,103,55,47,55,0,47,112,105,121,103,56,47,49,0,47,112,105,121,103,56,47,50,0,47,112,105,121,103,56,47,51,0,47,112,105,121,103,56,47,52,0,47,112,105,121,103,56,47,53,0,47,112,105,121,103,56,47,54,0,47,112,105,121,103,56,47,55,0,47,112,105,121,103,56,47,56,0,47,112,105,121,103,57,47,49,0,47,112,105,121,103,57,47,50,0,47,112,105,121,103,57,47,51,0,47,112,105,121,103,57,47,52,0,47,112,105,121,103,57,47,53,0,47,112,105,121,103,57,47,54,0,47,112,105,121,103,57,47,55,0,47,112,105,121,103,57,47,56,0,47,112,105,121,103,57,47,57,0,47,112,114,103,110,49,48,47,49,0,47,112,114,103,110,49,48,47,49,48,0,47,112,114,103,110,49,48,47,50,0,47,112,114,103,110,49,48,47,51,0,47,112,114,103,110,49,48,47,52,0,47,112,114,103,110,49,48,47,53,0,47,112,114,103,110,49,48,47,54,0,47,112,114,103,110,49,48,47,55,0,47,112,114,103,110,49,48,47,56,0,47,112,114,103,110,49,48,47,57,0,47,112,114,103,110,49,49,47,49,0,47,112,114,103,110,49,49,47,49,48,0,47,112,114,103,110,49,49,47,49,49,0,47,112,114,103,110,49,49,47,50,0,47,112,114,103,110,49,49,47,51,0,47,112,114,103,110,49,49,47,52,0,47,112,114,103,110,49,49,47,53,0,47,112,114,103,110,49,49,47,54,0,47,112,114,103,110,49,49,47,55,0,47,112,114,103,110,49,49,47,56,0,47,112,114,103,110,49,49,47,57,0,47,112,114,103,110,51,47,49,0,47,112,114,103,110,51,47,50,0,47,112,114,103,110,51,47,51,0,47,112,114,103,110,52,47,49,0,47,112,114,103,110,52,47,50,0,47,112,114,103,110,52,47,51,0,47,112,114,103,110,52,47,52,0,47,112,114,103,110,53,47,49,0,47,112,114,103,110,53,47,50,0,47,112,114,103,110,53,47,51,0,47,112,114,103,110,53,47,52,0,47,112,114,103,110,53,47,53,0,47,112,114,103,110,54,47,49,0,47,112,114,103,110,54,47,50,0,47,112,114,103,110,54,47,51,0,47,112,114,103,110,54,47,52,0,47,112,114,103,110,54,47,53,0,47,112,114,103,110,54,47,54,0,47,112,114,103,110,55,47,49,0,47,112,114,103,110,55,47,50,0,47,112,114,103,110,55,47,51,0,47,112,114,103,110,55,47,52,0,47,112,114,103,110,55,47,53,0,47,112,114,103,110,55,47,54,0,47,112,114,103,110,55,47,55,0,47,112,114,103,110,56,47,49,0,47,112,114,103,110,56,47,50,0,47,112,114,103,110,56,47,51,0,47,112,114,103,110,56,47,52,0,47,112,114,103,110,56,47,53,0,47,112,114,103,110,56,47,54,0,47,112,114,103,110,56,47,55,0,47,112,114,103,110,56,47,56,0,47,112,114,103,110,57,47,49,0,47,112,114,103,110,57,47,50,0,47,112,114,103,110,57,47,51,0,47,112,114,103,110,57,47,52,0,47,112,114,103,110,57,47,53,0,47,112,114,103,110,57,47,54,0,47,112,114,103,110,57,47,55,0,47,112,114,103,110,57,47,56,0,47,112,114,103,110,57,47,57,0,47,112,117,98,117,51,47,49,0,47,112,117,98,117,51,47,50,0,47,112,117,98,117,51,47,51,0,47,112,117,98,117,52,47,49,0,47,112,117,98,117,52,47,50,0,47,112,117,98,117,52,47,51,0,47,112,117,98,117,52,47,52,0,47,112,117,98,117,53,47,49,0,47,112,117,98,117,53,47,50,0,47,112,117,98,117,53,47,51,0,47,112,117,98,117,53,47,52,0,47,112,117,98,117,53,47,53,0,47,112,117,98,117,54,47,49,0,47,112,117,98,117,54,47,50,0,47,112,117,98,117,54,47,51,0,47,112,117,98,117,54,47,52,0,47,112,117,98,117,54,47,53,0,47,112,117,98,117,54,47,54,0,47,112,117,98,117,55,47,49,0,47,112,117,98,117,55,47,50,0,47,112,117,98,117,55,47,51,0,47,112,117,98,117,55,47,52,0,47,112,117,98,117,55,47,53,0,47,112,117,98,117,55,47,54,0,47,112,117,98,117,55,47,55,0,47,112,117,98,117,56,47,49,0,47,112,117,98,117,56,47,50,0,47,112,117,98,117,56,47,51,0,47,112,117,98,117,56,47,52,0,47,112,117,98,117,56,47,53,0,47,112,117,98,117,56,47,54,0,47,112,117,98,117,56,47,55,0,47,112,117,98,117,56,47,56,0,47,112,117,98,117,57,47,49,0,47,112,117,98,117,57,47,50,0,47,112,117,98,117,57,47,51,0,47,112,117,98,117,57,47,52,0,47,112,117,98,117,57,47,53,0,47,112,117,98,117,57,47,54,0,47,112,117,98,117,57,47,55,0,47,112,117,98,117,57,47,56,0,47,112,117,98,117,57,47,57,0,47,112,117,98,117,103,110,51,47,49,0,47,112,117,98,117,103,110,51,47,50,0,47,112,117,98,117,103,110,51,47,51,0,47,112,117,98,117,103,110,52,47,49,0,47,112,117,98,117,103,110,52,47,50,0,47,112,117,98,117,103,110,52,47,51,0,47,112,117,98,117,103,110,52,47,52,0,47,112,117,98,117,103,110,53,47,49,0,47,112,117,98,117,103,110,53,47,50,0,47,112,117,98,117,103,110,53,47,51,0,47,112,117,98,117,103,110,53,47,52,0,47,112,117,98,117,103,110,53,47,53,0,47,112,117,98,117,103,110,54,47,49,0,47,112,117,98,117,103,110,54,47,50,0,47,112,117,98,117,103,110,54,47,51,0,47,112,117,98,117,103,110,54,47,52,0,47,112,117,98,117,103,110,54,47,53,0,47,112,117,98,117,103,110,54,47,54,0,47,112,117,98,117,103,110,55,47,49,0,47,112,117,98,117,103,110,55,47,50,0,47,112,117,98,117,103,110,55,47,51,0,47,112,117,98,117,103,110,55,47,52,0,47,112,117,98,117,103,110,55,47,53,0,47,112,117,98,117,103,110,55,47,54,0,47,112,117,98,117,103,110,55,47,55,0,47,112,117,98,117,103,110,56,47,49,0,47,112,117,98,117,103,110,56,47,50,0,47,112,117,98,117,103,110,56,47,51,0,47,112,117,98,117,103,110,56,47,52,0,47,112,117,98,117,103,110,56,47,53,0,47,112,117,98,117,103,110,56,47,54,0,47,112,117,98,117,103,110,56,47,55,0,47,112,117,98,117,103,110,56,47,56,0,47,112,117,98,117,103,110,57,47,49,0,47,112,117,98,117,103,110,57,47,50,0,47,112,117,98,117,103,110,57,47,51,0,47,112,117,98,117,103,110,57,47,52,0,47,112,117,98,117,103,110,57,47,53,0,47,112,117,98,117,103,110,57,47,54,0,47,112,117,98,117,103,110,57,47,55,0,47,112,117,98,117,103,110,57,47,56,0,47,112,117,98,117,103,110,57,47,57,0,47,112,117,111,114,49,48,47,49,0,47,112,117,111,114,49,48,47,49,48,0,47,112,117,111,114,49,48,47,50,0,47,112,117,111,114,49,48,47,51,0,47,112,117,111,114,49,48,47,52,0,47,112,117,111,114,49,48,47,53,0,47,112,117,111,114,49,48,47,54,0,47,112,117,111,114,49,48,47,55,0,47,112,117,111,114,49,48,47,56,0,47,112,117,111,114,49,48,47,57,0,47,112,117,111,114,49,49,47,49,0,47,112,117,111,114,49,49,47,49,48,0,47,112,117,111,114,49,49,47,49,49,0,47,112,117,111,114,49,49,47,50,0,47,112,117,111,114,49,49,47,51,0,47,112,117,111,114,49,49,47,52,0,47,112,117,111,114,49,49,47,53,0,47,112,117,111,114,49,49,47,54,0,47,112,117,111,114,49,49,47,55,0,47,112,117,111,114,49,49,47,56,0,47,112,117,111,114,49,49,47,57,0,47,112,117,111,114,51,47,49,0,47,112,117,111,114,51,47,50,0,47,112,117,111,114,51,47,51,0,47,112,117,111,114,52,47,49,0,47,112,117,111,114,52,47,50,0,47,112,117,111,114,52,47,51,0,47,112,117,111,114,52,47,52,0,47,112,117,111,114,53,47,49,0,47,112,117,111,114,53,47,50,0,47,112,117,111,114,53,47,51,0,47,112,117,111,114,53,47,52,0,47,112,117,111,114,53,47,53,0,47,112,117,111,114,54,47,49,0,47,112,117,111,114,54,47,50,0,47,112,117,111,114,54,47,51,0,47,112,117,111,114,54,47,52,0,47,112,117,111,114,54,47,53,0,47,112,117,111,114,54,47,54,0,47,112,117,111,114,55,47,49,0,47,112,117,111,114,55,47,50,0,47,112,117,111,114,55,47,51,0,47,112,117,111,114,55,47,52,0,47,112,117,111,114,55,47,53,0,47,112,117,111,114,55,47,54,0,47,112,117,111,114,55,47,55,0,47,112,117,111,114,56,47,49,0,47,112,117,111,114,56,47,50,0,47,112,117,111,114,56,47,51,0,47,112,117,111,114,56,47,52,0,47,112,117,111,114,56,47,53,0,47,112,117,111,114,56,47,54,0,47,112,117,111,114,56,47,55,0,47,112,117,111,114,56,47,56,0,47,112,117,111,114,57,47,49,0,47,112,117,111,114,57,47,50,0,47,112,117,111,114,57,47,51,0,47,112,117,111,114,57,47,52,0,47,112,117,111,114,57,47,53,0,47,112,117,111,114,57,47,54,0,47,112,117,111,114,57,47,55,0,47,112,117,111,114,57,47,56,0,47,112,117,111,114,57,47,57,0,47,112,117,114,100,51,47,49,0,47,112,117,114,100,51,47,50,0,47,112,117,114,100,51,47,51,0,47,112,117,114,100,52,47,49,0,47,112,117,114,100,52,47,50,0,47,112,117,114,100,52,47,51,0,47,112,117,114,100,52,47,52,0,47,112,117,114,100,53,47,49,0,47,112,117,114,100,53,47,50,0,47,112,117,114,100,53,47,51,0,47,112,117,114,100,53,47,52,0,47,112,117,114,100,53,47,53,0,47,112,117,114,100,54,47,49,0,47,112,117,114,100,54,47,50,0,47,112,117,114,100,54,47,51,0,47,112,117,114,100,54,47,52,0,47,112,117,114,100,54,47,53,0,47,112,117,114,100,54,47,54,0,47,112,117,114,100,55,47,49,0,47,112,117,114,100,55,47,50,0,47,112,117,114,100,55,47,51,0,47,112,117,114,100,55,47,52,0,47,112,117,114,100,55,47,53,0,47,112,117,114,100,55,47,54,0,47,112,117,114,100,55,47,55,0,47,112,117,114,100,56,47,49,0,47,112,117,114,100,56,47,50,0,47,112,117,114,100,56,47,51,0,47,112,117,114,100,56,47,52,0,47,112,117,114,100,56,47,53,0,47,112,117,114,100,56,47,54,0,47,112,117,114,100,56,47,55,0,47,112,117,114,100,56,47,56,0,47,112,117,114,100,57,47,49,0,47,112,117,114,100,57,47,50,0,47,112,117,114,100,57,47,51,0,47,112,117,114,100,57,47,52,0,47,112,117,114,100,57,47,53,0,47,112,117,114,100,57,47,54,0,47,112,117,114,100,57,47,55,0,47,112,117,114,100,57,47,56,0,47,112,117,114,100,57,47,57,0,47,112,117,114,112,108,101,115,51,47,49,0,47,112,117,114,112,108,101,115,51,47,50,0,47,112,117,114,112,108,101,115,51,47,51,0,47,112,117,114,112,108,101,115,52,47,49,0,47,112,117,114,112,108,101,115,52,47,50,0,47,112,117,114,112,108,101,115,52,47,51,0,47,112,117,114,112,108,101,115,52,47,52,0,47,112,117,114,112,108,101,115,53,47,49,0,47,112,117,114,112,108,101,115,53,47,50,0,47,112,117,114,112,108,101,115,53,47,51,0,47,112,117,114,112,108,101,115,53,47,52,0,47,112,117,114,112,108,101,115,53,47,53,0,47,112,117,114,112,108,101,115,54,47,49,0,47,112,117,114,112,108,101,115,54,47,50,0,47,112,117,114,112,108,101,115,54,47,51,0,47,112,117,114,112,108,101,115,54,47,52,0,47,112,117,114,112,108,101,115,54,47,53,0,47,112,117,114,112,108,101,115,54,47,54,0,47,112,117,114,112,108,101,115,55,47,49,0,47,112,117,114,112,108,101,115,55,47,50,0,47,112,117,114,112,108,101,115,55,47,51,0,47,112,117,114,112,108,101,115,55,47,52,0,47,112,117,114,112,108,101,115,55,47,53,0,47,112,117,114,112,108,101,115,55,47,54,0,47,112,117,114,112,108,101,115,55,47,55,0,47,112,117,114,112,108,101,115,56,47,49,0,47,112,117,114,112,108,101,115,56,47,50,0,47,112,117,114,112,108,101,115,56,47,51,0,47,112,117,114,112,108,101,115,56,47,52,0,47,112,117,114,112,108,101,115,56,47,53,0,47,112,117,114,112,108,101,115,56,47,54,0,47,112,117,114,112,108,101,115,56,47,55,0,47,112,117,114,112,108,101,115,56,47,56,0,47,112,117,114,112,108,101,115,57,47,49,0,47,112,117,114,112,108,101,115,57,47,50,0,47,112,117,114,112,108,101,115,57,47,51,0,47,112,117,114,112,108,101,115,57,47,52,0,47,112,117,114,112,108,101,115,57,47,53,0,47,112,117,114,112,108,101,115,57,47,54,0,47,112,117,114,112,108,101,115,57,47,55,0,47,112,117,114,112,108,101,115,57,47,56,0,47,112,117,114,112,108,101,115,57,47,57,0,47,114,100,98,117,49,48,47,49,0,47,114,100,98,117,49,48,47,49,48,0,47,114,100,98,117,49,48,47,50,0,47,114,100,98,117,49,48,47,51,0,47,114,100,98,117,49,48,47,52,0,47,114,100,98,117,49,48,47,53,0,47,114,100,98,117,49,48,47,54,0,47,114,100,98,117,49,48,47,55,0,47,114,100,98,117,49,48,47,56,0,47,114,100,98,117,49,48,47,57,0,47,114,100,98,117,49,49,47,49,0,47,114,100,98,117,49,49,47,49,48,0,47,114,100,98,117,49,49,47,49,49,0,47,114,100,98,117,49,49,47,50,0,47,114,100,98,117,49,49,47,51,0,47,114,100,98,117,49,49,47,52,0,47,114,100,98,117,49,49,47,53,0,47,114,100,98,117,49,49,47,54,0,47,114,100,98,117,49,49,47,55,0,47,114,100,98,117,49,49,47,56,0,47,114,100,98,117,49,49,47,57,0,47,114,100,98,117,51,47,49,0,47,114,100,98,117,51,47,50,0,47,114,100,98,117,51,47,51,0,47,114,100,98,117,52,47,49,0,47,114,100,98,117,52,47,50,0,47,114,100,98,117,52,47,51,0,47,114,100,98,117,52,47,52,0,47,114,100,98,117,53,47,49,0,47,114,100,98,117,53,47,50,0,47,114,100,98,117,53,47,51,0,47,114,100,98,117,53,47,52,0,47,114,100,98,117,53,47,53,0,47,114,100,98,117,54,47,49,0,47,114,100,98,117,54,47,50,0,47,114,100,98,117,54,47,51,0,47,114,100,98,117,54,47,52,0,47,114,100,98,117,54,47,53,0,47,114,100,98,117,54,47,54,0,47,114,100,98,117,55,47,49,0,47,114,100,98,117,55,47,50,0,47,114,100,98,117,55,47,51,0,47,114,100,98,117,55,47,52,0,47,114,100,98,117,55,47,53,0,47,114,100,98,117,55,47,54,0,47,114,100,98,117,55,47,55,0,47,114,100,98,117,56,47,49,0,47,114,100,98,117,56,47,50,0,47,114,100,98,117,56,47,51,0,47,114,100,98,117,56,47,52,0,47,114,100,98,117,56,47,53,0,47,114,100,98,117,56,47,54,0,47,114,100,98,117,56,47,55,0,47,114,100,98,117,56,47,56,0,47,114,100,98,117,57,47,49,0,47,114,100,98,117,57,47,50,0,47,114,100,98,117,57,47,51,0,47,114,100,98,117,57,47,52,0,47,114,100,98,117,57,47,53,0,47,114,100,98,117,57,47,54,0,47,114,100,98,117,57,47,55,0,47,114,100,98,117,57,47,56,0,47,114,100,98,117,57,47,57,0,47,114,100,103,121,49,48,47,49,0,47,114,100,103,121,49,48,47,49,48,0,47,114,100,103,121,49,48,47,50,0,47,114,100,103,121,49,48,47,51,0,47,114,100,103,121,49,48,47,52,0,47,114,100,103,121,49,48,47,53,0,47,114,100,103,121,49,48,47,54,0,47,114,100,103,121,49,48,47,55,0,47,114,100,103,121,49,48,47,56,0,47,114,100,103,121,49,48,47,57,0,47,114,100,103,121,49,49,47,49,0,47,114,100,103,121,49,49,47,49,48,0,47,114,100,103,121,49,49,47,49,49,0,47,114,100,103,121,49,49,47,50,0,47,114,100,103,121,49,49,47,51,0,47,114,100,103,121,49,49,47,52,0,47,114,100,103,121,49,49,47,53,0,47,114,100,103,121,49,49,47,54,0,47,114,100,103,121,49,49,47,55,0,47,114,100,103,121,49,49,47,56,0,47,114,100,103,121,49,49,47,57,0,47,114,100,103,121,51,47,49,0,47,114,100,103,121,51,47,50,0,47,114,100,103,121,51,47,51,0,47,114,100,103,121,52,47,49,0,47,114,100,103,121,52,47,50,0,47,114,100,103,121,52,47,51,0,47,114,100,103,121,52,47,52,0,47,114,100,103,121,53,47,49,0,47,114,100,103,121,53,47,50,0,47,114,100,103,121,53,47,51,0,47,114,100,103,121,53,47,52,0,47,114,100,103,121,53,47,53,0,47,114,100,103,121,54,47,49,0,47,114,100,103,121,54,47,50,0,47,114,100,103,121,54,47,51,0,47,114,100,103,121,54,47,52,0,47,114,100,103,121,54,47,53,0,47,114,100,103,121,54,47,54,0,47,114,100,103,121,55,47,49,0,47,114,100,103,121,55,47,50,0,47,114,100,103,121,55,47,51,0,47,114,100,103,121,55,47,52,0,47,114,100,103,121,55,47,53,0,47,114,100,103,121,55,47,54,0,47,114,100,103,121,55,47,55,0,47,114,100,103,121,56,47,49,0,47,114,100,103,121,56,47,50,0,47,114,100,103,121,56,47,51,0,47,114,100,103,121,56,47,52,0,47,114,100,103,121,56,47,53,0,47,114,100,103,121,56,47,54,0,47,114,100,103,121,56,47,55,0,47,114,100,103,121,56,47,56,0,47,114,100,103,121,57,47,49,0,47,114,100,103,121,57,47,50,0,47,114,100,103,121,57,47,51,0,47,114,100,103,121,57,47,52,0,47,114,100,103,121,57,47,53,0,47,114,100,103,121,57,47,54,0,47,114,100,103,121,57,47,55,0,47,114,100,103,121,57,47,56,0,47,114,100,103,121,57,47,57,0,47,114,100,112,117,51,47,49,0,47,114,100,112,117,51,47,50,0,47,114,100,112,117,51,47,51,0,47,114,100,112,117,52,47,49,0,47,114,100,112,117,52,47,50,0,47,114,100,112,117,52,47,51,0,47,114,100,112,117,52,47,52,0,47,114,100,112,117,53,47,49,0,47,114,100,112,117,53,47,50,0,47,114,100,112,117,53,47,51,0,47,114,100,112,117,53,47,52,0,47,114,100,112,117,53,47,53,0,47,114,100,112,117,54,47,49,0,47,114,100,112,117,54,47,50,0,47,114,100,112,117,54,47,51,0,47,114,100,112,117,54,47,52,0,47,114,100,112,117,54,47,53,0,47,114,100,112,117,54,47,54,0,47,114,100,112,117,55,47,49,0,47,114,100,112,117,55,47,50,0,47,114,100,112,117,55,47,51,0,47,114,100,112,117,55,47,52,0,47,114,100,112,117,55,47,53,0,47,114,100,112,117,55,47,54,0,47,114,100,112,117,55,47,55,0,47,114,100,112,117,56,47,49,0,47,114,100,112,117,56,47,50,0,47,114,100,112,117,56,47,51,0,47,114,100,112,117,56,47,52,0,47,114,100,112,117,56,47,53,0,47,114,100,112,117,56,47,54,0,47,114,100,112,117,56,47,55,0,47,114,100,112,117,56,47,56,0,47,114,100,112,117,57,47,49,0,47,114,100,112,117,57,47,50,0,47,114,100,112,117,57,47,51,0,47,114,100,112,117,57,47,52,0,47,114,100,112,117,57,47,53,0,47,114,100,112,117,57,47,54,0,47,114,100,112,117,57,47,55,0,47,114,100,112,117,57,47,56,0,47,114,100,112,117,57,47,57,0,47,114,100,121,108,98,117,49,48,47,49,0,47,114,100,121,108,98,117,49,48,47,49,48,0,47,114,100,121,108,98,117,49,48,47,50,0,47,114,100,121,108,98,117,49,48,47,51,0,47,114,100,121,108,98,117,49,48,47,52,0,47,114,100,121,108,98,117,49,48,47,53,0,47,114,100,121,108,98,117,49,48,47,54,0,47,114,100,121,108,98,117,49,48,47,55,0,47,114,100,121,108,98,117,49,48,47,56,0,47,114,100,121,108,98,117,49,48,47,57,0,47,114,100,121,108,98,117,49,49,47,49,0,47,114,100,121,108,98,117,49,49,47,49,48,0,47,114,100,121,108,98,117,49,49,47,49,49,0,47,114,100,121,108,98,117,49,49,47,50,0,47,114,100,121,108,98,117,49,49,47,51,0,47,114,100,121,108,98,117,49,49,47,52,0,47,114,100,121,108,98,117,49,49,47,53,0,47,114,100,121,108,98,117,49,49,47,54,0,47,114,100,121,108,98,117,49,49,47,55,0,47,114,100,121,108,98,117,49,49,47,56,0,47,114,100,121,108,98,117,49,49,47,57,0,47,114,100,121,108,98,117,51,47,49,0,47,114,100,121,108,98,117,51,47,50,0,47,114,100,121,108,98,117,51,47,51,0,47,114,100,121,108,98,117,52,47,49,0,47,114,100,121,108,98,117,52,47,50,0,47,114,100,121,108,98,117,52,47,51,0,47,114,100,121,108,98,117,52,47,52,0,47,114,100,121,108,98,117,53,47,49,0,47,114,100,121,108,98,117,53,47,50,0,47,114,100,121,108,98,117,53,47,51,0,47,114,100,121,108,98,117,53,47,52,0,47,114,100,121,108,98,117,53,47,53,0,47,114,100,121,108,98,117,54,47,49,0,47,114,100,121,108,98,117,54,47,50,0,47,114,100,121,108,98,117,54,47,51,0,47,114,100,121,108,98,117,54,47,52,0,47,114,100,121,108,98,117,54,47,53,0,47,114,100,121,108,98,117,54,47,54,0,47,114,100,121,108,98,117,55,47,49,0,47,114,100,121,108,98,117,55,47,50,0,47,114,100,121,108,98,117,55,47,51,0,47,114,100,121,108,98,117,55,47,52,0,47,114,100,121,108,98,117,55,47,53,0,47,114,100,121,108,98,117,55,47,54,0,47,114,100,121,108,98,117,55,47,55,0,47,114,100,121,108,98,117,56,47,49,0,47,114,100,121,108,98,117,56,47,50,0,47,114,100,121,108,98,117,56,47,51,0,47,114,100,121,108,98,117,56,47,52,0,47,114,100,121,108,98,117,56,47,53,0,47,114,100,121,108,98,117,56,47,54,0,47,114,100,121,108,98,117,56,47,55,0,47,114,100,121,108,98,117,56,47,56,0,47,114,100,121,108,98,117,57,47,49,0,47,114,100,121,108,98,117,57,47,50,0,47,114,100,121,108,98,117,57,47,51,0,47,114,100,121,108,98,117,57,47,52,0,47,114,100,121,108,98,117,57,47,53,0,47,114,100,121,108,98,117,57,47,54,0,47,114,100,121,108,98,117,57,47,55,0,47,114,100,121,108,98,117,57,47,56,0,47,114,100,121,108,98,117,57,47,57,0,47,114,100,121,108,103,110,49,48,47,49,0,47,114,100,121,108,103,110,49,48,47,49,48,0,47,114,100,121,108,103,110,49,48,47,50,0,47,114,100,121,108,103,110,49,48,47,51,0,47,114,100,121,108,103,110,49,48,47,52,0,47,114,100,121,108,103,110,49,48,47,53,0,47,114,100,121,108,103,110,49,48,47,54,0,47,114,100,121,108,103,110,49,48,47,55,0,47,114,100,121,108,103,110,49,48,47,56,0,47,114,100,121,108,103,110,49,48,47,57,0,47,114,100,121,108,103,110,49,49,47,49,0,47,114,100,121,108,103,110,49,49,47,49,48,0,47,114,100,121,108,103,110,49,49,47,49,49,0,47,114,100,121,108,103,110,49,49,47,50,0,47,114,100,121,108,103,110,49,49,47,51,0,47,114,100,121,108,103,110,49,49,47,52,0,47,114,100,121,108,103,110,49,49,47,53,0,47,114,100,121,108,103,110,49,49,47,54,0,47,114,100,121,108,103,110,49,49,47,55,0,47,114,100,121,108,103,110,49,49,47,56,0,47,114,100,121,108,103,110,49,49,47,57,0,47,114,100,121,108,103,110,51,47,49,0,47,114,100,121,108,103,110,51,47,50,0,47,114,100,121,108,103,110,51,47,51,0,47,114,100,121,108,103,110,52,47,49,0,47,114,100,121,108,103,110,52,47,50,0,47,114,100,121,108,103,110,52,47,51,0,47,114,100,121,108,103,110,52,47,52,0,47,114,100,121,108,103,110,53,47,49,0,47,114,100,121,108,103,110,53,47,50,0,47,114,100,121,108,103,110,53,47,51,0,47,114,100,121,108,103,110,53,47,52,0,47,114,100,121,108,103,110,53,47,53,0,47,114,100,121,108,103,110,54,47,49,0,47,114,100,121,108,103,110,54,47,50,0,47,114,100,121,108,103,110,54,47,51,0,47,114,100,121,108,103,110,54,47,52,0,47,114,100,121,108,103,110,54,47,53,0,47,114,100,121,108,103,110,54,47,54,0,47,114,100,121,108,103,110,55,47,49,0,47,114,100,121,108,103,110,55,47,50,0,47,114,100,121,108,103,110,55,47,51,0,47,114,100,121,108,103,110,55,47,52,0,47,114,100,121,108,103,110,55,47,53,0,47,114,100,121,108,103,110,55,47,54,0,47,114,100,121,108,103,110,55,47,55,0,47,114,100,121,108,103,110,56,47,49,0,47,114,100,121,108,103,110,56,47,50,0,47,114,100,121,108,103,110,56,47,51,0,47,114,100,121,108,103,110,56,47,52,0,47,114,100,121,108,103,110,56,47,53,0,47,114,100,121,108,103,110,56,47,54,0,47,114,100,121,108,103,110,56,47,55,0,47,114,100,121,108,103,110,56,47,56,0,47,114,100,121,108,103,110,57,47,49,0,47,114,100,121,108,103,110,57,47,50,0,47,114,100,121,108,103,110,57,47,51,0,47,114,100,121,108,103,110,57,47,52,0,47,114,100,121,108,103,110,57,47,53,0,47,114,100,121,108,103,110,57,47,54,0,47,114,100,121,108,103,110,57,47,55,0,47,114,100,121,108,103,110,57,47,56,0,47,114,100,121,108,103,110,57,47,57,0,47,114,101,100,115,51,47,49,0,47,114,101,100,115,51,47,50,0,47,114,101,100,115,51,47,51,0,47,114,101,100,115,52,47,49,0,47,114,101,100,115,52,47,50,0,47,114,101,100,115,52,47,51,0,47,114,101,100,115,52,47,52,0,47,114,101,100,115,53,47,49,0,47,114,101,100,115,53,47,50,0,47,114,101,100,115,53,47,51,0,47,114,101,100,115,53,47,52,0,47,114,101,100,115,53,47,53,0,47,114,101,100,115,54,47,49,0,47,114,101,100,115,54,47,50,0,47,114,101,100,115,54,47,51,0,47,114,101,100,115,54,47,52,0,47,114,101,100,115,54,47,53,0,47,114,101,100,115,54,47,54,0,47,114,101,100,115,55,47,49,0,47,114,101,100,115,55,47,50,0,47,114,101,100,115,55,47,51,0,47,114,101,100,115,55,47,52,0,47,114,101,100,115,55,47,53,0,47,114,101,100,115,55,47,54,0,47,114,101,100,115,55,47,55,0,47,114,101,100,115,56,47,49,0,47,114,101,100,115,56,47,50,0,47,114,101,100,115,56,47,51,0,47,114,101,100,115,56,47,52,0,47,114,101,100,115,56,47,53,0,47,114,101,100,115,56,47,54,0,47,114,101,100,115,56,47,55,0,47,114,101,100,115,56,47,56,0,47,114,101,100,115,57,47,49,0,47,114,101,100,115,57,47,50,0,47,114,101,100,115,57,47,51,0,47,114,101,100,115,57,47,52,0,47,114,101,100,115,57,47,53,0,47,114,101,100,115,57,47,54,0,47,114,101,100,115,57,47,55,0,47,114,101,100,115,57,47,56,0,47,114,101,100,115,57,47,57,0,47,115,101,116,49,51,47,49,0,47,115,101,116,49,51,47,50,0,47,115,101,116,49,51,47,51,0,47,115,101,116,49,52,47,49,0,47,115,101,116,49,52,47,50,0,47,115,101,116,49,52,47,51,0,47,115,101,116,49,52,47,52,0,47,115,101,116,49,53,47,49,0,47,115,101,116,49,53,47,50,0,47,115,101,116,49,53,47,51,0,47,115,101,116,49,53,47,52,0,47,115,101,116,49,53,47,53,0,47,115,101,116,49,54,47,49,0,47,115,101,116,49,54,47,50,0,47,115,101,116,49,54,47,51,0,47,115,101,116,49,54,47,52,0,47,115,101,116,49,54,47,53,0,47,115,101,116,49,54,47,54,0,47,115,101,116,49,55,47,49,0,47,115,101,116,49,55,47,50,0,47,115,101,116,49,55,47,51,0,47,115,101,116,49,55,47,52,0,47,115,101,116,49,55,47,53,0,47,115,101,116,49,55,47,54,0,47,115,101,116,49,55,47,55,0,47,115,101,116,49,56,47,49,0,47,115,101,116,49,56,47,50,0,47,115,101,116,49,56,47,51,0,47,115,101,116,49,56,47,52,0,47,115,101,116,49,56,47,53,0,47,115,101,116,49,56,47,54,0,47,115,101,116,49,56,47,55,0,47,115,101,116,49,56,47,56,0,47,115,101,116,49,57,47,49,0,47,115,101,116,49,57,47,50,0,47,115,101,116,49,57,47,51,0,47,115,101,116,49,57,47,52,0,47,115,101,116,49,57,47,53,0,47,115,101,116,49,57,47,54,0,47,115,101,116,49,57,47,55,0,47,115,101,116,49,57,47,56,0,47,115,101,116,49,57,47,57,0,47,115,101,116,50,51,47,49,0,47,115,101,116,50,51,47,50,0,47,115,101,116,50,51,47,51,0,47,115,101,116,50,52,47,49,0,47,115,101,116,50,52,47,50,0,47,115,101,116,50,52,47,51,0,47,115,101,116,50,52,47,52,0,47,115,101,116,50,53,47,49,0,47,115,101,116,50,53,47,50,0,47,115,101,116,50,53,47,51,0,47,115,101,116,50,53,47,52,0,47,115,101,116,50,53,47,53,0,47,115,101,116,50,54,47,49,0,47,115,101,116,50,54,47,50,0,47,115,101,116,50,54,47,51,0,47,115,101,116,50,54,47,52,0,47,115,101,116,50,54,47,53,0,47,115,101,116,50,54,47,54,0,47,115,101,116,50,55,47,49,0,47,115,101,116,50,55,47,50,0,47,115,101,116,50,55,47,51,0,47,115,101,116,50,55,47,52,0,47,115,101,116,50,55,47,53,0,47,115,101,116,50,55,47,54,0,47,115,101,116,50,55,47,55,0,47,115,101,116,50,56,47,49,0,47,115,101,116,50,56,47,50,0,47,115,101,116,50,56,47,51,0,47,115,101,116,50,56,47,52,0,47,115,101,116,50,56,47,53,0,47,115,101,116,50,56,47,54,0,47,115,101,116,50,56,47,55,0,47,115,101,116,50,56,47,56,0,47,115,101,116,51,49,48,47,49,0,47,115,101,116,51,49,48,47,49,48,0,47,115,101,116,51,49,48,47,50,0,47,115,101,116,51,49,48,47,51,0,47,115,101,116,51,49,48,47,52,0,47,115,101,116,51,49,48,47,53,0,47,115,101,116,51,49,48,47,54,0,47,115,101,116,51,49,48,47,55,0,47,115,101,116,51,49,48,47,56,0,47,115,101,116,51,49,48,47,57,0,47,115,101,116,51,49,49,47,49,0,47,115,101,116,51,49,49,47,49,48,0,47,115,101,116,51,49,49,47,49,49,0,47,115,101,116,51,49,49],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+153182);allocate([47,50,0,47,115,101,116,51,49,49,47,51,0,47,115,101,116,51,49,49,47,52,0,47,115,101,116,51,49,49,47,53,0,47,115,101,116,51,49,49,47,54,0,47,115,101,116,51,49,49,47,55,0,47,115,101,116,51,49,49,47,56,0,47,115,101,116,51,49,49,47,57,0,47,115,101,116,51,49,50,47,49,0,47,115,101,116,51,49,50,47,49,48,0,47,115,101,116,51,49,50,47,49,49,0,47,115,101,116,51,49,50,47,49,50,0,47,115,101,116,51,49,50,47,50,0,47,115,101,116,51,49,50,47,51,0,47,115,101,116,51,49,50,47,52,0,47,115,101,116,51,49,50,47,53,0,47,115,101,116,51,49,50,47,54,0,47,115,101,116,51,49,50,47,55,0,47,115,101,116,51,49,50,47,56,0,47,115,101,116,51,49,50,47,57,0,47,115,101,116,51,51,47,49,0,47,115,101,116,51,51,47,50,0,47,115,101,116,51,51,47,51,0,47,115,101,116,51,52,47,49,0,47,115,101,116,51,52,47,50,0,47,115,101,116,51,52,47,51,0,47,115,101,116,51,52,47,52,0,47,115,101,116,51,53,47,49,0,47,115,101,116,51,53,47,50,0,47,115,101,116,51,53,47,51,0,47,115,101,116,51,53,47,52,0,47,115,101,116,51,53,47,53,0,47,115,101,116,51,54,47,49,0,47,115,101,116,51,54,47,50,0,47,115,101,116,51,54,47,51,0,47,115,101,116,51,54,47,52,0,47,115,101,116,51,54,47,53,0,47,115,101,116,51,54,47,54,0,47,115,101,116,51,55,47,49,0,47,115,101,116,51,55,47,50,0,47,115,101,116,51,55,47,51,0,47,115,101,116,51,55,47,52,0,47,115,101,116,51,55,47,53,0,47,115,101,116,51,55,47,54,0,47,115,101,116,51,55,47,55,0,47,115,101,116,51,56,47,49,0,47,115,101,116,51,56,47,50,0,47,115,101,116,51,56,47,51,0,47,115,101,116,51,56,47,52,0,47,115,101,116,51,56,47,53,0,47,115,101,116,51,56,47,54,0,47,115,101,116,51,56,47,55,0,47,115,101,116,51,56,47,56,0,47,115,101,116,51,57,47,49,0,47,115,101,116,51,57,47,50,0,47,115,101,116,51,57,47,51,0,47,115,101,116,51,57,47,52,0,47,115,101,116,51,57,47,53,0,47,115,101,116,51,57,47,54,0,47,115,101,116,51,57,47,55,0,47,115,101,116,51,57,47,56,0,47,115,101,116,51,57,47,57,0,47,115,112,101,99,116,114,97,108,49,48,47,49,0,47,115,112,101,99,116,114,97,108,49,48,47,49,48,0,47,115,112,101,99,116,114,97,108,49,48,47,50,0,47,115,112,101,99,116,114,97,108,49,48,47,51,0,47,115,112,101,99,116,114,97,108,49,48,47,52,0,47,115,112,101,99,116,114,97,108,49,48,47,53,0,47,115,112,101,99,116,114,97,108,49,48,47,54,0,47,115,112,101,99,116,114,97,108,49,48,47,55,0,47,115,112,101,99,116,114,97,108,49,48,47,56,0,47,115,112,101,99,116,114,97,108,49,48,47,57,0,47,115,112,101,99,116,114,97,108,49,49,47,49,0,47,115,112,101,99,116,114,97,108,49,49,47,49,48,0,47,115,112,101,99,116,114,97,108,49,49,47,49,49,0,47,115,112,101,99,116,114,97,108,49,49,47,50,0,47,115,112,101,99,116,114,97,108,49,49,47,51,0,47,115,112,101,99,116,114,97,108,49,49,47,52,0,47,115,112,101,99,116,114,97,108,49,49,47,53,0,47,115,112,101,99,116,114,97,108,49,49,47,54,0,47,115,112,101,99,116,114,97,108,49,49,47,55,0,47,115,112,101,99,116,114,97,108,49,49,47,56,0,47,115,112,101,99,116,114,97,108,49,49,47,57,0,47,115,112,101,99,116,114,97,108,51,47,49,0,47,115,112,101,99,116,114,97,108,51,47,50,0,47,115,112,101,99,116,114,97,108,51,47,51,0,47,115,112,101,99,116,114,97,108,52,47,49,0,47,115,112,101,99,116,114,97,108,52,47,50,0,47,115,112,101,99,116,114,97,108,52,47,51,0,47,115,112,101,99,116,114,97,108,52,47,52,0,47,115,112,101,99,116,114,97,108,53,47,49,0,47,115,112,101,99,116,114,97,108,53,47,50,0,47,115,112,101,99,116,114,97,108,53,47,51,0,47,115,112,101,99,116,114,97,108,53,47,52,0,47,115,112,101,99,116,114,97,108,53,47,53,0,47,115,112,101,99,116,114,97,108,54,47,49,0,47,115,112,101,99,116,114,97,108,54,47,50,0,47,115,112,101,99,116,114,97,108,54,47,51,0,47,115,112,101,99,116,114,97,108,54,47,52,0,47,115,112,101,99,116,114,97,108,54,47,53,0,47,115,112,101,99,116,114,97,108,54,47,54,0,47,115,112,101,99,116,114,97,108,55,47,49,0,47,115,112,101,99,116,114,97,108,55,47,50,0,47,115,112,101,99,116,114,97,108,55,47,51,0,47,115,112,101,99,116,114,97,108,55,47,52,0,47,115,112,101,99,116,114,97,108,55,47,53,0,47,115,112,101,99,116,114,97,108,55,47,54,0,47,115,112,101,99,116,114,97,108,55,47,55,0,47,115,112,101,99,116,114,97,108,56,47,49,0,47,115,112,101,99,116,114,97,108,56,47,50,0,47,115,112,101,99,116,114,97,108,56,47,51,0,47,115,112,101,99,116,114,97,108,56,47,52,0,47,115,112,101,99,116,114,97,108,56,47,53,0,47,115,112,101,99,116,114,97,108,56,47,54,0,47,115,112,101,99,116,114,97,108,56,47,55,0,47,115,112,101,99,116,114,97,108,56,47,56,0,47,115,112,101,99,116,114,97,108,57,47,49,0,47,115,112,101,99,116,114,97,108,57,47,50,0,47,115,112,101,99,116,114,97,108,57,47,51,0,47,115,112,101,99,116,114,97,108,57,47,52,0,47,115,112,101,99,116,114,97,108,57,47,53,0,47,115,112,101,99,116,114,97,108,57,47,54,0,47,115,112,101,99,116,114,97,108,57,47,55,0,47,115,112,101,99,116,114,97,108,57,47,56,0,47,115,112,101,99,116,114,97,108,57,47,57,0,47,115,118,103,47,97,108,105,99,101,98,108,117,101,0,47,115,118,103,47,97,110,116,105,113,117,101,119,104,105,116,101,0,47,115,118,103,47,97,113,117,97,0,47,115,118,103,47,97,113,117,97,109,97,114,105,110,101,0,47,115,118,103,47,97,122,117,114,101,0,47,115,118,103,47,98,101,105,103,101,0,47,115,118,103,47,98,105,115,113,117,101,0,47,115,118,103,47,98,108,97,99,107,0,47,115,118,103,47,98,108,97,110,99,104,101,100,97,108,109,111,110,100,0,47,115,118,103,47,98,108,117,101,0,47,115,118,103,47,98,108,117,101,118,105,111,108,101,116,0,47,115,118,103,47,98,114,111,119,110,0,47,115,118,103,47,98,117,114,108,121,119,111,111,100,0,47,115,118,103,47,99,97,100,101,116,98,108,117,101,0,47,115,118,103,47,99,104,97,114,116,114,101,117,115,101,0,47,115,118,103,47,99,104,111,99,111,108,97,116,101,0,47,115,118,103,47,99,111,114,97,108,0,47,115,118,103,47,99,111,114,110,102,108,111,119,101,114,98,108,117,101,0,47,115,118,103,47,99,111,114,110,115,105,108,107,0,47,115,118,103,47,99,114,105,109,115,111,110,0,47,115,118,103,47,99,121,97,110,0,47,115,118,103,47,100,97,114,107,98,108,117,101,0,47,115,118,103,47,100,97,114,107,99,121,97,110,0,47,115,118,103,47,100,97,114,107,103,111,108,100,101,110,114,111,100,0,47,115,118,103,47,100,97,114,107,103,114,97,121,0,47,115,118,103,47,100,97,114,107,103,114,101,101,110,0,47,115,118,103,47,100,97,114,107,103,114,101,121,0,47,115,118,103,47,100,97,114,107,107,104,97,107,105,0,47,115,118,103,47,100,97,114,107,109,97,103,101,110,116,97,0,47,115,118,103,47,100,97,114,107,111,108,105,118,101,103,114,101,101,110,0,47,115,118,103,47,100,97,114,107,111,114,97,110,103,101,0,47,115,118,103,47,100,97,114,107,111,114,99,104,105,100,0,47,115,118,103,47,100,97,114,107,114,101,100,0,47,115,118,103,47,100,97,114,107,115,97,108,109,111,110,0,47,115,118,103,47,100,97,114,107,115,101,97,103,114,101,101,110,0,47,115,118,103,47,100,97,114,107,115,108,97,116,101,98,108,117,101,0,47,115,118,103,47,100,97,114,107,115,108,97,116,101,103,114,97,121,0,47,115,118,103,47,100,97,114,107,115,108,97,116,101,103,114,101,121,0,47,115,118,103,47,100,97,114,107,116,117,114,113,117,111,105,115,101,0,47,115,118,103,47,100,97,114,107,118,105,111,108,101,116,0,47,115,118,103,47,100,101,101,112,112,105,110,107,0,47,115,118,103,47,100,101,101,112,115,107,121,98,108,117,101,0,47,115,118,103,47,100,105,109,103,114,97,121,0,47,115,118,103,47,100,105,109,103,114,101,121,0,47,115,118,103,47,100,111,100,103,101,114,98,108,117,101,0,47,115,118,103,47,102,105,114,101,98,114,105,99,107,0,47,115,118,103,47,102,108,111,114,97,108,119,104,105,116,101,0,47,115,118,103,47,102,111,114,101,115,116,103,114,101,101,110,0,47,115,118,103,47,102,117,99,104,115,105,97,0,47,115,118,103,47,103,97,105,110,115,98,111,114,111,0,47,115,118,103,47,103,104,111,115,116,119,104,105,116,101,0,47,115,118,103,47,103,111,108,100,0,47,115,118,103,47,103,111,108,100,101,110,114,111,100,0,47,115,118,103,47,103,114,97,121,0,47,115,118,103,47,103,114,101,101,110,0,47,115,118,103,47,103,114,101,101,110,121,101,108,108,111,119,0,47,115,118,103,47,103,114,101,121,0,47,115,118,103,47,104,111,110,101,121,100,101,119,0,47,115,118,103,47,104,111,116,112,105,110,107,0,47,115,118,103,47,105,110,100,105,97,110,114,101,100,0,47,115,118,103,47,105,110,100,105,103,111,0,47,115,118,103,47,105,118,111,114,121,0,47,115,118,103,47,107,104,97,107,105,0,47,115,118,103,47,108,97,118,101,110,100,101,114,0,47,115,118,103,47,108,97,118,101,110,100,101,114,98,108,117,115,104,0,47,115,118,103,47,108,97,119,110,103,114,101,101,110,0,47,115,118,103,47,108,101,109,111,110,99,104,105,102,102,111,110,0,47,115,118,103,47,108,105,103,104,116,98,108,117,101,0,47,115,118,103,47,108,105,103,104,116,99,111,114,97,108,0,47,115,118,103,47,108,105,103,104,116,99,121,97,110,0,47,115,118,103,47,108,105,103,104,116,103,111,108,100,101,110,114,111,100,121,101,108,108,111,119,0,47,115,118,103,47,108,105,103,104,116,103,114,97,121,0,47,115,118,103,47,108,105,103,104,116,103,114,101,101,110,0,47,115,118,103,47,108,105,103,104,116,103,114,101,121,0,47,115,118,103,47,108,105,103,104,116,112,105,110,107,0,47,115,118,103,47,108,105,103,104,116,115,97,108,109,111,110,0,47,115,118,103,47,108,105,103,104,116,115,101,97,103,114,101,101,110,0,47,115,118,103,47,108,105,103,104,116,115,107,121,98,108,117,101,0,47,115,118,103,47,108,105,103,104,116,115,108,97,116,101,103,114,97,121,0,47,115,118,103,47,108,105,103,104,116,115,108,97,116,101,103,114,101,121,0,47,115,118,103,47,108,105,103,104,116,115,116,101,101,108,98,108,117,101,0,47,115,118,103,47,108,105,103,104,116,121,101,108,108,111,119,0,47,115,118,103,47,108,105,109,101,0,47,115,118,103,47,108,105,109,101,103,114,101,101,110,0,47,115,118,103,47,108,105,110,101,110,0,47,115,118,103,47,109,97,103,101,110,116,97,0,47,115,118,103,47,109,97,114,111,111,110,0,47,115,118,103,47,109,101,100,105,117,109,97,113,117,97,109,97,114,105,110,101,0,47,115,118,103,47,109,101,100,105,117,109,98,108,117,101,0,47,115,118,103,47,109,101,100,105,117,109,111,114,99,104,105,100,0,47,115,118,103,47,109,101,100,105,117,109,112,117,114,112,108,101,0,47,115,118,103,47,109,101,100,105,117,109,115,101,97,103,114,101,101,110,0,47,115,118,103,47,109,101,100,105,117,109,115,108,97,116,101,98,108,117,101,0,47,115,118,103,47,109,101,100,105,117,109,115,112,114,105,110,103,103,114,101,101,110,0,47,115,118,103,47,109,101,100,105,117,109,116,117,114,113,117,111,105,115,101,0,47,115,118,103,47,109,101,100,105,117,109,118,105,111,108,101,116,114,101,100,0,47,115,118,103,47,109,105,100,110,105,103,104,116,98,108,117,101,0,47,115,118,103,47,109,105,110,116,99,114,101,97,109,0,47,115,118,103,47,109,105,115,116,121,114,111,115,101,0,47,115,118,103,47,109,111,99,99,97,115,105,110,0,47,115,118,103,47,110,97,118,97,106,111,119,104,105,116,101,0,47,115,118,103,47,110,97,118,121,0,47,115,118,103,47,111,108,100,108,97,99,101,0,47,115,118,103,47,111,108,105,118,101,0,47,115,118,103,47,111,108,105,118,101,100,114,97,98,0,47,115,118,103,47,111,114,97,110,103,101,0,47,115,118,103,47,111,114,97,110,103,101,114,101,100,0,47,115,118,103,47,111,114,99,104,105,100,0,47,115,118,103,47,112,97,108,101,103,111,108,100,101,110,114,111,100,0,47,115,118,103,47,112,97,108,101,103,114,101,101,110,0,47,115,118,103,47,112,97,108,101,116,117,114,113,117,111,105,115,101,0,47,115,118,103,47,112,97,108,101,118,105,111,108,101,116,114,101,100,0,47,115,118,103,47,112,97,112,97,121,97,119,104,105,112,0,47,115,118,103,47,112,101,97,99,104,112,117,102,102,0,47,115,118,103,47,112,101,114,117,0,47,115,118,103,47,112,105,110,107,0,47,115,118,103,47,112,108,117,109,0,47,115,118,103,47,112,111,119,100,101,114,98,108,117,101,0,47,115,118,103,47,112,117,114,112,108,101,0,47,115,118,103,47,114,101,100,0,47,115,118,103,47,114,111,115,121,98,114,111,119,110,0,47,115,118,103,47,114,111,121,97,108,98,108,117,101,0,47,115,118,103,47,115,97,100,100,108,101,98,114,111,119,110,0,47,115,118,103,47,115,97,108,109,111,110,0,47,115,118,103,47,115,97,110,100,121,98,114,111,119,110,0,47,115,118,103,47,115,101,97,103,114,101,101,110,0,47,115,118,103,47,115,101,97,115,104,101,108,108,0,47,115,118,103,47,115,105,101,110,110,97,0,47,115,118,103,47,115,105,108,118,101,114,0,47,115,118,103,47,115,107,121,98,108,117,101,0,47,115,118,103,47,115,108,97,116,101,98,108,117,101,0,47,115,118,103,47,115,108,97,116,101,103,114,97,121,0,47,115,118,103,47,115,108,97,116,101,103,114,101,121,0,47,115,118,103,47,115,110,111,119,0,47,115,118,103,47,115,112,114,105,110,103,103,114,101,101,110,0,47,115,118,103,47,115,116,101,101,108,98,108,117,101,0,47,115,118,103,47,116,97,110,0,47,115,118,103,47,116,101,97,108,0,47,115,118,103,47,116,104,105,115,116,108,101,0,47,115,118,103,47,116,111,109,97,116,111,0,47,115,118,103,47,116,117,114,113,117,111,105,115,101,0,47,115,118,103,47,118,105,111,108,101,116,0,47,115,118,103,47,119,104,101,97,116,0,47,115,118,103,47,119,104,105,116,101,0,47,115,118,103,47,119,104,105,116,101,115,109,111,107,101,0,47,115,118,103,47,121,101,108,108,111,119,0,47,115,118,103,47,121,101,108,108,111,119,103,114,101,101,110,0,47,121,108,103,110,51,47,49,0,47,121,108,103,110,51,47,50,0,47,121,108,103,110,51,47,51,0,47,121,108,103,110,52,47,49,0,47,121,108,103,110,52,47,50,0,47,121,108,103,110,52,47,51,0,47,121,108,103,110,52,47,52,0,47,121,108,103,110,53,47,49,0,47,121,108,103,110,53,47,50,0,47,121,108,103,110,53,47,51,0,47,121,108,103,110,53,47,52,0,47,121,108,103,110,53,47,53,0,47,121,108,103,110,54,47,49,0,47,121,108,103,110,54,47,50,0,47,121,108,103,110,54,47,51,0,47,121,108,103,110,54,47,52,0,47,121,108,103,110,54,47,53,0,47,121,108,103,110,54,47,54,0,47,121,108,103,110,55,47,49,0,47,121,108,103,110,55,47,50,0,47,121,108,103,110,55,47,51,0,47,121,108,103,110,55,47,52,0,47,121,108,103,110,55,47,53,0,47,121,108,103,110,55,47,54,0,47,121,108,103,110,55,47,55,0,47,121,108,103,110,56,47,49,0,47,121,108,103,110,56,47,50,0,47,121,108,103,110,56,47,51,0,47,121,108,103,110,56,47,52,0,47,121,108,103,110,56,47,53,0,47,121,108,103,110,56,47,54,0,47,121,108,103,110,56,47,55,0,47,121,108,103,110,56,47,56,0,47,121,108,103,110,57,47,49,0,47,121,108,103,110,57,47,50,0,47,121,108,103,110,57,47,51,0,47,121,108,103,110,57,47,52,0,47,121,108,103,110,57,47,53,0,47,121,108,103,110,57,47,54,0,47,121,108,103,110,57,47,55,0,47,121,108,103,110,57,47,56,0,47,121,108,103,110,57,47,57,0,47,121,108,103,110,98,117,51,47,49,0,47,121,108,103,110,98,117,51,47,50,0,47,121,108,103,110,98,117,51,47,51,0,47,121,108,103,110,98,117,52,47,49,0,47,121,108,103,110,98,117,52,47,50,0,47,121,108,103,110,98,117,52,47,51,0,47,121,108,103,110,98,117,52,47,52,0,47,121,108,103,110,98,117,53,47,49,0,47,121,108,103,110,98,117,53,47,50,0,47,121,108,103,110,98,117,53,47,51,0,47,121,108,103,110,98,117,53,47,52,0,47,121,108,103,110,98,117,53,47,53,0,47,121,108,103,110,98,117,54,47,49,0,47,121,108,103,110,98,117,54,47,50,0,47,121,108,103,110,98,117,54,47,51,0,47,121,108,103,110,98,117,54,47,52,0,47,121,108,103,110,98,117,54,47,53,0,47,121,108,103,110,98,117,54,47,54,0,47,121,108,103,110,98,117,55,47,49,0,47,121,108,103,110,98,117,55,47,50,0,47,121,108,103,110,98,117,55,47,51,0,47,121,108,103,110,98,117,55,47,52,0,47,121,108,103,110,98,117,55,47,53,0,47,121,108,103,110,98,117,55,47,54,0,47,121,108,103,110,98,117,55,47,55,0,47,121,108,103,110,98,117,56,47,49,0,47,121,108,103,110,98,117,56,47,50,0,47,121,108,103,110,98,117,56,47,51,0,47,121,108,103,110,98,117,56,47,52,0,47,121,108,103,110,98,117,56,47,53,0,47,121,108,103,110,98,117,56,47,54,0,47,121,108,103,110,98,117,56,47,55,0,47,121,108,103,110,98,117,56,47,56,0,47,121,108,103,110,98,117,57,47,49,0,47,121,108,103,110,98,117,57,47,50,0,47,121,108,103,110,98,117,57,47,51,0,47,121,108,103,110,98,117,57,47,52,0,47,121,108,103,110,98,117,57,47,53,0,47,121,108,103,110,98,117,57,47,54,0,47,121,108,103,110,98,117,57,47,55,0,47,121,108,103,110,98,117,57,47,56,0,47,121,108,103,110,98,117,57,47,57,0,47,121,108,111,114,98,114,51,47,49,0,47,121,108,111,114,98,114,51,47,50,0,47,121,108,111,114,98,114,51,47,51,0,47,121,108,111,114,98,114,52,47,49,0,47,121,108,111,114,98,114,52,47,50,0,47,121,108,111,114,98,114,52,47,51,0,47,121,108,111,114,98,114,52,47,52,0,47,121,108,111,114,98,114,53,47,49,0,47,121,108,111,114,98,114,53,47,50,0,47,121,108,111,114,98,114,53,47,51,0,47,121,108,111,114,98,114,53,47,52,0,47,121,108,111,114,98,114,53,47,53,0,47,121,108,111,114,98,114,54,47,49,0,47,121,108,111,114,98,114,54,47,50,0,47,121,108,111,114,98,114,54,47,51,0,47,121,108,111,114,98,114,54,47,52,0,47,121,108,111,114,98,114,54,47,53,0,47,121,108,111,114,98,114,54,47,54,0,47,121,108,111,114,98,114,55,47,49,0,47,121,108,111,114,98,114,55,47,50,0,47,121,108,111,114,98,114,55,47,51,0,47,121,108,111,114,98,114,55,47,52,0,47,121,108,111,114,98,114,55,47,53,0,47,121,108,111,114,98,114,55,47,54,0,47,121,108,111,114,98,114,55,47,55,0,47,121,108,111,114,98,114,56,47,49,0,47,121,108,111,114,98,114,56,47,50,0,47,121,108,111,114,98,114,56,47,51,0,47,121,108,111,114,98,114,56,47,52,0,47,121,108,111,114,98,114,56,47,53,0,47,121,108,111,114,98,114,56,47,54,0,47,121,108,111,114,98,114,56,47,55,0,47,121,108,111,114,98,114,56,47,56,0,47,121,108,111,114,98,114,57,47,49,0,47,121,108,111,114,98,114,57,47,50,0,47,121,108,111,114,98,114,57,47,51,0,47,121,108,111,114,98,114,57,47,52,0,47,121,108,111,114,98,114,57,47,53,0,47,121,108,111,114,98,114,57,47,54,0,47,121,108,111,114,98,114,57,47,55,0,47,121,108,111,114,98,114,57,47,56,0,47,121,108,111,114,98,114,57,47,57,0,47,121,108,111,114,114,100,51,47,49,0,47,121,108,111,114,114,100,51,47,50,0,47,121,108,111,114,114,100,51,47,51,0,47,121,108,111,114,114,100,52,47,49,0,47,121,108,111,114,114,100,52,47,50,0,47,121,108,111,114,114,100,52,47,51,0,47,121,108,111,114,114,100,52,47,52,0,47,121,108,111,114,114,100,53,47,49,0,47,121,108,111,114,114,100,53,47,50,0,47,121,108,111,114,114,100,53,47,51,0,47,121,108,111,114,114,100,53,47,52,0,47,121,108,111,114,114,100,53,47,53,0,47,121,108,111,114,114,100,54,47,49,0,47,121,108,111,114,114,100,54,47,50,0,47,121,108,111,114,114,100,54,47,51,0,47,121,108,111,114,114,100,54,47,52,0,47,121,108,111,114,114,100,54,47,53,0,47,121,108,111,114,114,100,54,47,54,0,47,121,108,111,114,114,100,55,47,49,0,47,121,108,111,114,114,100,55,47,50,0,47,121,108,111,114,114,100,55,47,51,0,47,121,108,111,114,114,100,55,47,52,0,47,121,108,111,114,114,100,55,47,53,0,47,121,108,111,114,114,100,55,47,54,0,47,121,108,111,114,114,100,55,47,55,0,47,121,108,111,114,114,100,56,47,49,0,47,121,108,111,114,114,100,56,47,50,0,47,121,108,111,114,114,100,56,47,51,0,47,121,108,111,114,114,100,56,47,52,0,47,121,108,111,114,114,100,56,47,53,0,47,121,108,111,114,114,100,56,47,54,0,47,121,108,111,114,114,100,56,47,55,0,47,121,108,111,114,114,100,56,47,56,0,47,121,108,111,114,114,100,57,47,49,0,47,121,108,111,114,114,100,57,47,50,0,47,121,108,111,114,114,100,57,47,51,0,47,121,108,111,114,114,100,57,47,52,0,47,121,108,111,114,114,100,57,47,53,0,47,121,108,111,114,114,100,57,47,54,0,47,121,108,111,114,114,100,57,47,55,0,47,121,108,111,114,114,100,57,47,56,0,47,121,108,111,114,114,100,57,47,57,0,97,108,105,99,101,98,108,117,101,0,97,110,116,105,113,117,101,119,104,105,116,101,0,97,110,116,105,113,117,101,119,104,105,116,101,49,0,97,110,116,105,113,117,101,119,104,105,116,101,50,0,97,110,116,105,113,117,101,119,104,105,116,101,51,0,97,110,116,105,113,117,101,119,104,105,116,101,52,0,97,113,117,97,109,97,114,105,110,101,0,97,113,117,97,109,97,114,105,110,101,49,0,97,113,117,97,109,97,114,105,110,101,50,0,97,113,117,97,109,97,114,105,110,101,51,0,97,113,117,97,109,97,114,105,110,101,52,0,97,122,117,114,101,0,97,122,117,114,101,49,0,97,122,117,114,101,50,0,97,122,117,114,101,51,0,97,122,117,114,101,52,0,98,101,105,103,101,0,98,105,115,113,117,101,0,98,105,115,113,117,101,49,0,98,105,115,113,117,101,50,0,98,105,115,113,117,101,51,0,98,105,115,113,117,101,52,0,98,108,97,110,99,104,101,100,97,108,109,111,110,100,0,98,108,117,101,0,98,108,117,101,49,0,98,108,117,101,50,0,98,108,117,101,51,0,98,108,117,101,52,0,98,108,117,101,118,105,111,108,101,116,0,98,114,111,119,110,0,98,114,111,119,110,49,0,98,114,111,119,110,50,0,98,114,111,119,110,51,0,98,114,111,119,110,52,0,98,117,114,108,121,119,111,111,100,0,98,117,114,108,121,119,111,111,100,49,0,98,117,114,108,121,119,111,111,100,50,0,98,117,114,108,121,119,111,111,100,51,0,98,117,114,108,121,119,111,111,100,52,0,99,97,100,101,116,98,108,117,101,0,99,97,100,101,116,98,108,117,101,49,0,99,97,100,101,116,98,108,117,101,50,0,99,97,100,101,116,98,108,117,101,51,0,99,97,100,101,116,98,108,117,101,52,0,99,104,97,114,116,114,101,117,115,101,0,99,104,97,114,116,114,101,117,115,101,49,0,99,104,97,114,116,114,101,117,115,101,50,0,99,104,97,114,116,114,101,117,115,101,51,0,99,104,97,114,116,114,101,117,115,101,52,0,99,104,111,99,111,108,97,116,101,0,99,104,111,99,111,108,97,116,101,49,0,99,104,111,99,111,108,97,116,101,50,0,99,104,111,99,111,108,97,116,101,51,0,99,104,111,99,111,108,97,116,101,52,0,99,111,114,97,108,0,99,111,114,97,108,49,0,99,111,114,97,108,50,0,99,111,114,97,108,51,0,99,111,114,97,108,52,0,99,111,114,110,102,108,111,119,101,114,98,108,117,101,0,99,111,114,110,115,105,108,107,0,99,111,114,110,115,105,108,107,49,0,99,111,114,110,115,105,108,107,50,0,99,111,114,110,115,105,108,107,51,0,99,111,114,110,115,105,108,107,52,0,99,114,105,109,115,111,110,0,99,121,97,110,0,99,121,97,110,49,0,99,121,97,110,50,0,99,121,97,110,51,0,99,121,97,110,52,0,100,97,114,107,103,111,108,100,101,110,114,111,100,0,100,97,114,107,103,111,108,100,101,110,114,111,100,49,0,100,97,114,107,103,111,108,100,101,110,114,111,100,50,0,100,97,114,107,103,111,108,100,101,110,114,111,100,51,0,100,97,114,107,103,111,108,100,101,110,114,111,100,52,0,100,97,114,107,103,114,101,101,110,0,100,97,114,107,107,104,97,107,105,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,49,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,50,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,51,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,52,0,100,97,114,107,111,114,97,110,103,101,0,100,97,114,107,111,114,97,110,103,101,49,0,100,97,114,107,111,114,97,110,103,101,50,0,100,97,114,107,111,114,97,110,103,101,51,0,100,97,114,107,111,114,97,110,103,101,52,0,100,97,114,107,111,114,99,104,105,100,0,100,97,114,107,111,114,99,104,105,100,49,0,100,97,114,107,111,114,99,104,105,100,50,0,100,97,114,107,111,114,99,104,105,100,51,0,100,97,114,107,111,114,99,104,105,100,52,0,100,97,114,107,115,97,108,109,111,110,0,100,97,114,107,115,101,97,103,114,101,101,110,0,100,97,114,107,115,101,97,103,114,101,101,110,49,0,100,97,114,107,115,101,97,103,114,101,101,110,50,0,100,97,114,107,115,101,97,103,114,101,101,110,51,0,100,97,114,107,115,101,97,103,114,101,101,110,52,0,100,97,114,107,115,108,97,116,101,98,108,117,101,0,100,97,114,107,115,108,97,116,101,103,114,97,121,0,100,97,114,107,115,108,97,116,101,103,114,97,121,49,0,100,97,114,107,115,108,97,116,101,103,114,97,121,50,0,100,97,114,107,115,108,97,116,101,103,114,97,121,51,0,100,97,114,107,115,108,97,116,101,103,114,97,121,52,0,100,97,114,107,115,108,97,116,101,103,114,101,121,0,100,97,114,107,116,117,114,113,117,111,105,115,101,0,100,97,114,107,118,105,111,108,101,116,0,100,101,101,112,112,105,110,107,0,100,101,101,112,112,105,110,107,49,0,100,101,101,112,112,105,110,107,50,0,100,101,101,112,112,105,110,107,51,0,100,101,101,112,112,105,110,107,52,0,100,101,101,112,115,107,121,98,108,117,101,0,100,101,101,112,115,107,121,98,108,117,101,49,0,100,101,101,112,115,107,121,98,108,117,101,50,0,100,101,101,112,115,107,121,98,108,117,101,51,0,100,101,101,112,115,107,121,98,108,117,101,52,0,100,105,109,103,114,97,121,0,100,105,109,103,114,101,121,0,100,111,100,103,101,114,98,108,117,101,0,100,111,100,103,101,114,98,108,117,101,49,0,100,111,100,103,101,114,98,108,117,101,50,0,100,111,100,103,101,114,98,108,117,101,51,0,100,111,100,103,101,114,98,108,117,101,52,0,102,105,114,101,98,114,105,99,107,0,102,105,114,101,98,114,105,99,107,49,0,102,105,114,101,98,114,105,99,107,50,0,102,105,114,101,98,114,105,99,107,51,0,102,105,114,101,98,114,105,99,107,52,0,102,108,111,114,97,108,119,104,105,116,101,0,102,111,114,101,115,116,103,114,101,101,110,0,103,97,105,110,115,98,111,114,111,0,103,104,111,115,116,119,104,105,116,101,0,103,111,108,100,0,103,111,108,100,49,0,103,111,108,100,50,0,103,111,108,100,51,0,103,111,108,100,52,0,103,111,108,100,101,110,114,111,100,0,103,111,108,100,101,110,114,111,100,49,0,103,111,108,100,101,110,114,111,100,50,0,103,111,108,100,101,110,114,111,100,51,0,103,111,108,100,101,110,114,111,100,52,0,103,114,97,121,0,103,114,97,121,48,0,103,114,97,121,49,0,103,114,97,121,49,48,0,103,114,97,121,49,48,48,0,103,114,97,121,49,49,0,103,114,97,121,49,50,0,103,114,97,121,49,51,0,103,114,97,121,49,52,0,103,114,97,121,49,53,0,103,114,97,121,49,54,0,103,114,97,121,49,55,0,103,114,97,121,49,56,0,103,114,97,121,49,57,0,103,114,97,121,50,0,103,114,97,121,50,48,0,103,114,97,121,50,49,0,103,114,97,121,50,50,0,103,114,97,121,50,51,0,103,114,97,121,50,52,0,103,114,97,121,50,53,0,103,114,97,121,50,54,0,103,114,97,121,50,55,0,103,114,97,121,50,56,0,103,114,97,121,50,57,0,103,114,97,121,51,0,103,114,97,121,51,48,0,103,114,97,121,51,49,0,103,114,97,121,51,50,0,103,114,97,121,51,51,0,103,114,97,121,51,52,0,103,114,97,121,51,53,0,103,114,97,121,51,54,0,103,114,97,121,51,55,0,103,114,97,121,51,56,0,103,114,97,121,51,57,0,103,114,97,121,52,0,103,114,97,121,52,48,0,103,114,97,121,52,49,0,103,114,97,121,52,50,0,103,114,97,121,52,51,0,103,114,97,121,52,52,0,103,114,97,121,52,53,0,103,114,97,121,52,54,0,103,114,97,121,52,55,0,103,114,97,121,52,56,0,103,114,97,121,52,57,0,103,114,97,121,53,0,103,114,97,121,53,48,0,103,114,97,121,53,49,0,103,114,97,121,53,50,0,103,114,97,121,53,51,0,103,114,97,121,53,52,0,103,114,97,121,53,53,0,103,114,97,121,53,54,0,103,114,97,121,53,55,0,103,114,97,121,53,56,0,103,114,97,121,53,57,0,103,114,97,121,54,0,103,114,97,121,54,48,0,103,114,97,121,54,49,0,103,114,97,121,54,50,0,103,114,97,121,54,51,0,103,114,97,121,54,52,0,103,114,97,121,54,53,0,103,114,97,121,54,54,0,103,114,97,121,54,55,0,103,114,97,121,54,56,0,103,114,97,121,54,57,0,103,114,97,121,55,0,103,114,97,121,55,48,0,103,114,97,121,55,49,0,103,114,97,121,55,50,0,103,114,97,121,55,51,0,103,114,97,121,55,52,0,103,114,97,121,55,53,0,103,114,97,121,55,54,0,103,114,97,121,55,55,0,103,114,97,121,55,56,0,103,114,97,121,55,57,0,103,114,97,121,56,0,103,114,97,121,56,48,0,103,114,97,121,56,49,0,103,114,97,121,56,50,0,103,114,97,121,56,51,0,103,114,97,121,56,52,0,103,114,97,121,56,53,0,103,114,97,121,56,54,0,103,114,97,121,56,55,0,103,114,97,121,56,56,0,103,114,97,121,56,57,0,103,114,97,121,57,0,103,114,97,121,57,48,0,103,114,97,121,57,49,0,103,114,97,121,57,50,0,103,114,97,121,57,51,0,103,114,97,121,57,52,0,103,114,97,121,57,53,0,103,114,97,121,57,54,0,103,114,97,121,57,55,0,103,114,97,121,57,56,0,103,114,97,121,57,57,0,103,114,101,101,110,0,103,114,101,101,110,49,0,103,114,101,101,110,50,0,103,114,101,101,110,51,0,103,114,101,101,110,52,0,103,114,101,101,110,121,101,108,108,111,119,0,103,114,101,121,0,103,114,101,121,48,0,103,114,101,121,49,0,103,114,101,121,49,48,0,103,114,101,121,49,48,48,0,103,114,101,121,49,49,0,103,114,101,121,49,50,0,103,114,101,121,49,51,0,103,114,101,121,49,52,0,103,114,101,121,49,53,0,103,114,101,121,49,54,0,103,114,101,121,49,55,0,103,114,101,121,49,56,0,103,114,101,121,49,57,0,103,114,101,121,50,0,103,114,101,121,50,48,0,103,114,101,121,50,49,0,103,114,101,121,50,50,0,103,114,101,121,50,51,0,103,114,101,121,50,52,0,103,114,101,121,50,53,0,103,114,101,121,50,54,0,103,114,101,121,50,55,0,103,114,101,121,50,56,0,103,114,101,121,50,57,0,103,114,101,121,51,0,103,114,101,121,51,48,0,103,114,101,121,51,49,0,103,114,101,121,51,50,0,103,114,101,121,51,51,0,103,114,101,121,51,52,0,103,114,101,121,51,53,0,103,114,101,121,51,54,0,103,114,101,121,51,55,0,103,114,101,121,51,56,0,103,114,101,121,51,57,0,103,114,101,121,52,0,103,114,101,121,52,48,0,103,114,101,121,52,49,0,103,114,101,121,52,50,0,103,114,101,121,52,51,0,103,114,101,121,52,52,0,103,114,101,121,52,53,0,103,114,101,121,52,54,0,103,114,101,121,52,55,0,103,114,101,121,52,56,0,103,114,101,121,52,57,0,103,114,101,121,53,0,103,114,101,121,53,48,0,103,114,101,121,53,49,0,103,114,101,121,53,50,0,103,114,101,121,53,51,0,103,114,101,121,53,52,0,103,114,101,121,53,53,0,103,114,101,121,53,54,0,103,114,101,121,53,55,0,103,114,101,121,53,56,0,103,114,101,121,53,57,0,103,114,101,121,54,0,103,114,101,121,54,48,0,103,114,101,121,54,49,0,103,114,101,121,54,50,0,103,114,101,121,54,51,0,103,114,101,121,54,52,0,103,114,101,121,54,53,0,103,114,101,121,54,54,0,103,114,101,121,54,55,0,103,114,101,121,54,56,0,103,114,101,121,54,57,0,103,114,101,121,55,0,103,114,101,121,55,48,0,103,114,101,121,55,49,0,103,114,101,121,55,50,0,103,114,101,121,55,51,0,103,114,101,121,55,52,0,103,114,101,121,55,53,0,103,114,101,121,55,54,0,103,114,101,121,55,55,0,103,114,101,121,55,56,0,103,114,101,121,55,57,0,103,114,101,121,56,0,103,114,101,121,56,48,0,103,114,101,121,56,49,0,103,114,101,121,56,50,0,103,114,101,121,56,51,0,103,114,101,121,56,52,0,103,114,101,121,56,53,0,103,114,101,121,56,54,0,103,114,101,121,56,55,0,103,114,101,121,56,56,0,103,114,101,121,56,57,0,103,114,101,121,57,0,103,114,101,121,57,48,0,103,114,101,121,57,49,0,103,114,101,121,57,50,0,103,114,101,121,57,51,0,103,114,101,121,57,52,0,103,114,101,121,57,53,0,103,114,101,121,57,54,0,103,114,101,121,57,55,0,103,114,101,121,57,56,0,103,114,101,121,57,57,0,104,111,110,101,121,100,101,119,0,104,111,110,101,121,100,101,119,49,0,104,111,110,101,121,100,101,119,50,0,104,111,110,101,121,100,101,119,51,0,104,111,110,101,121,100,101,119,52,0,104,111,116,112,105,110,107,0,104,111,116,112,105,110,107,49,0,104,111,116,112,105,110,107,50,0,104,111,116,112,105,110,107,51,0,104,111,116,112,105,110,107,52,0,105,110,100,105,97,110,114,101,100,0,105,110,100,105,97,110,114,101,100,49,0,105,110,100,105,97,110,114,101,100,50,0,105,110,100,105,97,110,114,101,100,51,0,105,110,100,105,97,110,114,101,100,52,0,105,110,100,105,103,111,0,105,110,118,105,115,0,105,118,111,114,121,0,105,118,111,114,121,49,0,105,118,111,114,121,50,0,105,118,111,114,121,51,0,105,118,111,114,121,52,0,107,104,97,107,105,0,107,104,97,107,105,49,0,107,104,97,107,105,50,0,107,104,97,107,105,51,0,107,104,97,107,105,52,0,108,97,118,101,110,100,101,114,0,108,97,118,101,110,100,101,114,98,108,117,115,104,0,108,97,118,101,110,100,101,114,98,108,117,115,104,49,0,108,97,118,101,110,100,101,114,98,108,117,115,104,50,0,108,97,118,101,110,100,101,114,98,108,117,115,104,51,0,108,97,118,101,110,100,101,114,98,108,117,115,104,52,0,108,97,119,110,103,114,101,101,110,0,108,101,109,111,110,99,104,105,102,102,111,110,0,108,101,109,111,110,99,104,105,102,102,111,110,49,0,108,101,109,111,110,99,104,105,102,102,111,110,50,0,108,101,109,111,110,99,104,105,102,102,111,110,51,0,108,101,109,111,110,99,104,105,102,102,111,110,52,0,108,105,103,104,116,98,108,117,101,0,108,105,103,104,116,98,108,117,101,49,0,108,105,103,104,116,98,108,117,101,50,0,108,105,103,104,116,98,108,117,101,51,0,108,105,103,104,116,98,108,117,101,52,0,108,105,103,104,116,99,111,114,97,108,0,108,105,103,104,116,99,121,97,110,0,108,105,103,104,116,99,121,97,110,49,0,108,105,103,104,116,99,121,97,110,50,0,108,105,103,104,116,99,121,97,110,51,0,108,105,103,104,116,99,121,97,110,52,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,49,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,50,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,51,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,52,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,121,101,108,108,111,119,0,108,105,103,104,116,103,114,97,121,0,108,105,103,104,116,103,114,101,121,0,108,105,103,104,116,112,105,110,107,0,108,105,103,104,116,112,105,110,107,49,0,108,105,103,104,116,112,105,110,107,50,0,108,105,103,104,116,112,105,110,107,51,0,108,105,103,104,116,112,105,110,107,52,0,108,105,103,104,116,115,97,108,109,111,110,0,108,105,103,104,116,115,97,108,109,111,110,49,0,108,105,103,104,116,115,97,108,109,111,110,50,0,108,105,103,104,116,115,97,108,109,111,110,51,0,108,105,103,104,116,115,97,108,109,111,110,52,0,108,105,103,104,116,115,101,97,103,114,101,101,110,0,108,105,103,104,116,115,107,121,98,108,117,101,0,108,105,103,104,116,115,107,121,98,108,117,101,49,0,108,105,103,104,116,115,107,121,98,108,117,101,50,0,108,105,103,104,116,115,107,121,98,108,117,101,51,0,108,105,103,104,116,115,107,121,98,108,117,101,52,0,108,105,103,104,116,115,108,97,116,101,98,108,117,101,0,108,105,103,104,116,115,108,97,116,101,103,114,97,121,0,108,105,103,104,116,115,108,97,116,101,103,114,101,121,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,49,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,50,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,51,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,52,0,108,105,103,104,116,121,101,108,108,111,119,0,108,105,103,104,116,121,101,108,108,111,119,49,0,108,105,103,104,116,121,101,108,108,111,119,50,0,108,105,103,104,116,121,101,108,108,111,119,51,0,108,105,103,104,116,121,101,108,108,111,119,52,0,108,105,109,101,103,114,101,101,110,0,108,105,110,101,110,0,109,97,103,101,110,116,97,0,109,97,103,101,110,116,97,49,0,109,97,103,101,110,116,97,50,0,109,97,103,101,110,116,97,51,0,109,97,103,101,110,116,97,52,0,109,97,114,111,111,110,0,109,97,114,111,111,110,49,0,109,97,114,111,111,110,50,0,109,97,114,111,111,110,51,0,109,97,114,111,111,110,52,0,109,101,100,105,117,109,97,113,117,97,109,97,114,105,110,101,0,109,101,100,105,117,109,98,108,117,101,0,109,101,100,105,117,109,111,114,99,104,105,100,0,109,101,100,105,117,109,111,114,99,104,105,100,49,0,109,101,100,105,117,109,111,114,99,104,105,100,50,0,109,101,100,105,117,109,111,114,99,104,105,100,51,0,109,101,100,105,117,109,111,114,99,104,105,100,52,0,109,101,100,105,117,109,112,117,114,112,108,101,0,109,101,100,105,117,109,112,117,114,112,108,101,49,0,109,101,100,105,117,109,112,117,114,112,108,101,50,0,109,101,100,105,117,109,112,117,114,112,108,101,51,0,109,101,100,105,117,109,112,117,114,112,108,101,52,0,109,101,100,105,117,109,115,101,97,103,114,101,101,110,0,109,101,100,105,117,109,115,108,97,116,101,98,108,117,101,0,109,101,100,105,117,109,115,112,114,105,110,103,103,114,101,101,110,0,109,101,100,105,117,109,116,117,114,113,117,111,105,115,101,0,109,101,100,105,117,109,118,105,111,108,101,116,114,101,100,0,109,105,100,110,105,103,104,116,98,108,117,101,0,109,105,110,116,99,114,101,97,109,0,109,105,115,116,121,114,111,115,101,0,109,105,115,116,121,114,111,115,101,49,0,109,105,115,116,121,114,111,115,101,50,0,109,105,115,116,121,114,111,115,101,51,0,109,105,115,116,121,114,111,115,101,52,0,109,111,99,99,97,115,105,110,0,110,97,118,97,106,111,119,104,105,116,101,0,110,97,118,97,106,111,119,104,105,116,101,49,0,110,97,118,97,106,111,119,104,105,116,101,50,0,110,97,118,97,106,111,119,104,105,116,101,51,0,110,97,118,97,106,111,119,104,105,116,101,52,0,110,97,118,121,0,110,97,118,121,98,108,117,101,0,110,111,110,101,0,111,108,100,108,97,99,101,0,111,108,105,118,101,100,114,97,98,0,111,108,105,118,101,100,114,97,98,49,0,111,108,105,118,101,100,114,97,98,50,0,111,108,105,118,101,100,114,97,98,51,0,111,108,105,118,101,100,114,97,98,52,0,111,114,97,110,103,101,0,111,114,97,110,103,101,49,0,111,114,97,110,103,101,50,0,111,114,97,110,103,101,51,0,111,114,97,110,103,101,52,0,111,114,97,110,103,101,114,101,100,0,111,114,97,110,103,101,114,101,100,49,0,111,114,97,110,103,101,114,101,100,50,0,111,114,97,110,103,101,114,101,100,51,0,111,114,97,110,103,101,114,101,100,52,0,111,114,99,104,105,100,0,111,114,99,104,105,100,49,0,111,114,99,104,105,100,50,0,111,114,99,104,105,100,51,0,111,114,99,104,105,100,52,0,112,97,108,101,103,111,108,100,101,110,114,111,100,0,112,97,108,101,103,114,101,101,110,0,112,97,108,101,103,114,101,101,110,49,0,112,97,108,101,103,114,101,101,110,50,0,112,97,108,101,103,114,101,101,110,51,0,112,97,108,101,103,114,101,101,110,52,0,112,97,108,101,116,117,114,113,117,111,105,115,101,0,112,97,108,101,116,117,114,113,117,111,105,115,101,49,0,112,97,108,101,116,117,114,113,117,111,105,115,101,50,0,112,97,108,101,116,117,114,113,117,111,105,115,101,51,0,112,97,108,101,116,117,114,113,117,111,105,115,101,52,0,112,97,108,101,118,105,111,108,101,116,114,101,100,0,112,97,108],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+163422);allocate([101,118,105,111,108,101,116,114,101,100,49,0,112,97,108,101,118,105,111,108,101,116,114,101,100,50,0,112,97,108,101,118,105,111,108,101,116,114,101,100,51,0,112,97,108,101,118,105,111,108,101,116,114,101,100,52,0,112,97,112,97,121,97,119,104,105,112,0,112,101,97,99,104,112,117,102,102,0,112,101,97,99,104,112,117,102,102,49,0,112,101,97,99,104,112,117,102,102,50,0,112,101,97,99,104,112,117,102,102,51,0,112,101,97,99,104,112,117,102,102,52,0,112,101,114,117,0,112,105,110,107,0,112,105,110,107,49,0,112,105,110,107,50,0,112,105,110,107,51,0,112,105,110,107,52,0,112,108,117,109,0,112,108,117,109,49,0,112,108,117,109,50,0,112,108,117,109,51,0,112,108,117,109,52,0,112,111,119,100,101,114,98,108,117,101,0,112,117,114,112,108,101,0,112,117,114,112,108,101,49,0,112,117,114,112,108,101,50,0,112,117,114,112,108,101,51,0,112,117,114,112,108,101,52,0,114,101,100,0,114,101,100,49,0,114,101,100,50,0,114,101,100,51,0,114,101,100,52,0,114,111,115,121,98,114,111,119,110,0,114,111,115,121,98,114,111,119,110,49,0,114,111,115,121,98,114,111,119,110,50,0,114,111,115,121,98,114,111,119,110,51,0,114,111,115,121,98,114,111,119,110,52,0,114,111,121,97,108,98,108,117,101,0,114,111,121,97,108,98,108,117,101,49,0,114,111,121,97,108,98,108,117,101,50,0,114,111,121,97,108,98,108,117,101,51,0,114,111,121,97,108,98,108,117,101,52,0,115,97,100,100,108,101,98,114,111,119,110,0,115,97,108,109,111,110,0,115,97,108,109,111,110,49,0,115,97,108,109,111,110,50,0,115,97,108,109,111,110,51,0,115,97,108,109,111,110,52,0,115,97,110,100,121,98,114,111,119,110,0,115,101,97,103,114,101,101,110,0,115,101,97,103,114,101,101,110,49,0,115,101,97,103,114,101,101,110,50,0,115,101,97,103,114,101,101,110,51,0,115,101,97,103,114,101,101,110,52,0,115,101,97,115,104,101,108,108,0,115,101,97,115,104,101,108,108,49,0,115,101,97,115,104,101,108,108,50,0,115,101,97,115,104,101,108,108,51,0,115,101,97,115,104,101,108,108,52,0,115,105,101,110,110,97,0,115,105,101,110,110,97,49,0,115,105,101,110,110,97,50,0,115,105,101,110,110,97,51,0,115,105,101,110,110,97,52,0,115,107,121,98,108,117,101,0,115,107,121,98,108,117,101,49,0,115,107,121,98,108,117,101,50,0,115,107,121,98,108,117,101,51,0,115,107,121,98,108,117,101,52,0,115,108,97,116,101,98,108,117,101,0,115,108,97,116,101,98,108,117,101,49,0,115,108,97,116,101,98,108,117,101,50,0,115,108,97,116,101,98,108,117,101,51,0,115,108,97,116,101,98,108,117,101,52,0,115,108,97,116,101,103,114,97,121,0,115,108,97,116,101,103,114,97,121,49,0,115,108,97,116,101,103,114,97,121,50,0,115,108,97,116,101,103,114,97,121,51,0,115,108,97,116,101,103,114,97,121,52,0,115,108,97,116,101,103,114,101,121,0,115,110,111,119,0,115,110,111,119,49,0,115,110,111,119,50,0,115,110,111,119,51,0,115,110,111,119,52,0,115,112,114,105,110,103,103,114,101,101,110,0,115,112,114,105,110,103,103,114,101,101,110,49,0,115,112,114,105,110,103,103,114,101,101,110,50,0,115,112,114,105,110,103,103,114,101,101,110,51,0,115,112,114,105,110,103,103,114,101,101,110,52,0,115,116,101,101,108,98,108,117,101,0,115,116,101,101,108,98,108,117,101,49,0,115,116,101,101,108,98,108,117,101,50,0,115,116,101,101,108,98,108,117,101,51,0,115,116,101,101,108,98,108,117,101,52,0,116,97,110,0,116,97,110,49,0,116,97,110,50,0,116,97,110,51,0,116,97,110,52,0,116,104,105,115,116,108,101,0,116,104,105,115,116,108,101,49,0,116,104,105,115,116,108,101,50,0,116,104,105,115,116,108,101,51,0,116,104,105,115,116,108,101,52,0,116,111,109,97,116,111,0,116,111,109,97,116,111,49,0,116,111,109,97,116,111,50,0,116,111,109,97,116,111,51,0,116,111,109,97,116,111,52,0,116,117,114,113,117,111,105,115,101,0,116,117,114,113,117,111,105,115,101,49,0,116,117,114,113,117,111,105,115,101,50,0,116,117,114,113,117,111,105,115,101,51,0,116,117,114,113,117,111,105,115,101,52,0,118,105,111,108,101,116,0,118,105,111,108,101,116,114,101,100,0,118,105,111,108,101,116,114,101,100,49,0,118,105,111,108,101,116,114,101,100,50,0,118,105,111,108,101,116,114,101,100,51,0,118,105,111,108,101,116,114,101,100,52,0,119,104,101,97,116,0,119,104,101,97,116,49,0,119,104,101,97,116,50,0,119,104,101,97,116,51,0,119,104,101,97,116,52,0,119,104,105,116,101,0,119,104,105,116,101,115,109,111,107,101,0,121,101,108,108,111,119,0,121,101,108,108,111,119,49,0,121,101,108,108,111,119,50,0,121,101,108,108,111,119,51,0,121,101,108,108,111,119,52,0,121,101,108,108,111,119,103,114,101,101,110,0,108,97,99,107,0,104,105,116,101,0,105,103,104,116,103,114,101,121,0,88,49,49,47,0,47,37,115,47,37,115,0,105,109,97,103,101,115,99,97,108,101,0,102,97,108,115,101,0,98,108,97,99,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,0,65,103,110,111,100,101,105,110,102,111,95,116,0,114,111,119,103,0,99,111,108,103,0,65,103,114,97,112,104,105,110,102,111,95,116,0,100,101,108,120,32,62,61,32,48,0,104,116,109,108,116,97,98,108,101,46,99,0,112,111,115,95,104,116,109,108,95,116,98,108,0,100,101,108,121,32,62,61,32,48,0,116,97,98,108,101,32,115,105,122,101,32,116,111,111,32,115,109,97,108,108,32,102,111,114,32,99,111,110,116,101,110,116,10,0,102,105,120,101,100,32,116,97,98,108,101,32,115,105,122,101,32,119,105,116,104,32,117,110,115,112,101,99,105,102,105,101,100,32,119,105,100,116,104,32,111,114,32,104,101,105,103,104,116,10,0,99,101,108,108,32,115,105,122,101,32,116,111,111,32,115,109,97,108,108,32,102,111,114,32,99,111,110,116,101,110,116,10,0,102,105,120,101,100,32,99,101,108,108,32,115,105,122,101,32,119,105,116,104,32,117,110,115,112,101,99,105,102,105,101,100,32,119,105,100,116,104,32,111,114,32,104,101,105,103,104,116,10,0,78,111,32,111,114,32,105,109,112,114,111,112,101,114,32,105,109,97,103,101,32,102,105,108,101,61,34,37,115,34,10,0,112,101,110,99,111,108,111,114,0,45,62,0,65,103,101,100,103,101,105,110,102,111,95,116,0,49,0,50,0,51,0,52,0,53,0,54,0,55,0,56,0,57,0,49,48,0,49,49,0,49,50,0,49,51,0,49,52,0,49,53,0,49,54,0,49,55,0,49,56,0,49,57,0,50,48,0,100,97,115,104,101,100,0,100,111,116,116,101,100,0,99,112,45,62,115,114,99,0,101,109,105,116,95,104,116,109,108,95,105,109,103,0,99,112,45,62,115,114,99,91,48,93,0,116,114,97,110,115,112,97,114,101,110,116,0,95,37,100,0,102,80,81,46,99,0,80,81,99,104,101,99,107,0,72,101,97,112,32,111,118,101,114,102,108,111,119,10,0,37,33,80,83,45,65,100,111,98,101,45,50,46,48,10,47,110,111,100,101,32,123,10,32,32,47,89,32,101,120,99,104,32,100,101,102,10,32,32,47,88,32,101,120,99,104,32,100,101,102,10,32,32,47,121,32,101,120,99,104,32,100,101,102,10,32,32,47,120,32,101,120,99,104,32,100,101,102,10,32,32,110,101,119,112,97,116,104,10,32,32,120,32,121,32,109,111,118,101,116,111,10,32,32,120,32,89,32,108,105,110,101,116,111,10,32,32,88,32,89,32,108,105,110,101,116,111,10,32,32,88,32,121,32,108,105,110,101,116,111,10,32,32,99,108,111,115,101,112,97,116,104,32,102,105,108,108,10,125,32,100,101,102,10,47,99,101,108,108,32,123,10,32,32,47,89,32,101,120,99,104,32,100,101,102,10,32,32,47,88,32,101,120,99,104,32,100,101,102,10,32,32,47,121,32,101,120,99,104,32,100,101,102,10,32,32,47,120,32,101,120,99,104,32,100,101,102,10,32,32,110,101,119,112,97,116,104,10,32,32,120,32,121,32,109,111,118,101,116,111,10,32,32,120,32,89,32,108,105,110,101,116,111,10,32,32,88,32,89,32,108,105,110,101,116,111,10,32,32,88,32,121,32,108,105,110,101,116,111,10,32,32,99,108,111,115,101,112,97,116,104,32,115,116,114,111,107,101,10,125,32,100,101,102,10,0,115,104,111,119,112,97,103,101,10,0,102,97,105,108,101,100,32,97,116,32,110,111,100,101,32,37,100,91,48,93,10,0,110,112,45,62,99,101,108,108,115,91,48,93,0,109,97,122,101,46,99,0,99,104,107,83,103,114,97,112,104,0,102,97,105,108,101,100,32,97,116,32,110,111,100,101,32,37,100,91,49,93,10,0,110,112,45,62,99,101,108,108,115,91,49,93,0,100,105,116,101,109,115,0,102,105,110,100,83,86,101,114,116,0,37,37,37,37,80,97,103,101,58,32,49,32,49,10,37,37,37,37,80,97,103,101,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,0,37,102,32,37,102,32,116,114,97,110,115,108,97,116,101,10,0,48,32,48,32,49,32,115,101,116,114,103,98,99,111,108,111,114,10,0,37,102,32,37,102,32,37,102,32,37,102,32,110,111,100,101,10,0,48,32,48,32,48,32,115,101,116,114,103,98,99,111,108,111,114,10,0,37,102,32,37,102,32,37,102,32,37,102,32,99,101,108,108,10,0,49,32,48,32,48,32,115,101,116,114,103,98,99,111,108,111,114,10,0,117,110,101,120,112,101,99,116,101,100,32,99,97,115,101,32,105,110,32,108,111,99,97,116,101,95,101,110,100,112,111,105,110,116,10,0,48,0,116,114,97,112,101,122,111,105,100,46,99,0,108,111,99,97,116,101,95,101,110,100,112,111,105,110,116,0,97,100,100,95,115,101,103,109,101,110,116,58,32,101,114,114,111,114,10,0,110,101,119,110,111,100,101,58,32,81,117,101,114,121,45,116,97,98,108,101,32,111,118,101,114,102,108,111,119,10,0,110,101,119,110,111,100,101,0,110,101,119,116,114,97,112,58,32,84,114,97,112,101,122,111,105,100,45,116,97,98,108,101,32,111,118,101,114,102,108,111,119,32,37,100,10,0,110,101,119,116,114,97,112,0,105,110,100,101,120,46,99,0,82,84,114,101,101,83,101,97,114,99,104,0,110,45,62,108,101,118,101,108,32,62,61,32,48,0,82,84,114,101,101,73,110,115,101,114,116,0,108,101,118,101,108,32,62,61,32,48,32,38,38,32,108,101,118,101,108,32,60,61,32,40,42,110,41,45,62,108,101,118,101,108,0,114,45,62,98,111,117,110,100,97,114,121,91,105,93,32,60,61,32,114,45,62,98,111,117,110,100,97,114,121,91,78,85,77,68,73,77,83,32,43,32,105,93,0,114,32,38,38,32,110,32,38,38,32,110,101,119,0,82,84,114,101,101,73,110,115,101,114,116,50,0,108,101,118,101,108,32,62,61,32,48,32,38,38,32,108,101,118,101,108,32,60,61,32,110,45,62,108,101,118,101,108,0,70,65,76,83,69,0,110,111,100,101,46,99,0,78,111,100,101,67,111,118,101,114,0,114,32,38,38,32,110,0,80,105,99,107,66,114,97,110,99,104,0,65,100,100,66,114,97,110,99,104,0,105,32,60,32,78,79,68,69,67,65,82,68,0,110,101,119,0,110,32,38,38,32,105,32,62,61,32,48,32,38,38,32,105,32,60,32,78,79,68,69,67,65,82,68,0,68,105,115,99,111,110,66,114,97,110,99,104,0,114,0,114,101,99,116,97,110,103,108,101,46,99,0,82,101,99,116,65,114,101,97,0,108,97,98,101,108,58,32,97,114,101,97,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,114,116,114,101,101,10,0,114,32,38,38,32,114,114,0,67,111,109,98,105,110,101,82,101,99,116,0,114,32,38,38,32,115,0,79,118,101,114,108,97,112,0,110,0,115,112,108,105,116,46,113,46,99,0,83,112,108,105,116,78,111,100,101,0,98,0,110,45,62,99,111,117,110,116,32,43,32,40,42,110,110,41,45,62,99,111,117,110,116,32,61,61,32,78,79,68,69,67,65,82,68,32,43,32,49,0,76,111,97,100,78,111,100,101,115,0,113,0,112,0,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,112,97,114,116,105,116,105,111,110,91,105,93,32,61,61,32,48,32,124,124,32,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,112,97,114,116,105,116,105,111,110,91,105,93,32,61,61,32,49,0,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,99,111,117,110,116,91,48,93,32,43,32,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,99,111,117,110,116,91,49,93,32,61,61,32,78,79,68,69,67,65,82,68,32,43,32,49,0,77,101,116,104,111,100,90,101,114,111,0,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,99,111,117,110,116,91,48,93,32,62,61,32,114,116,112,45,62,77,105,110,70,105,108,108,32,38,38,32,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,99,111,117,110,116,91,49,93,32,62,61,32,114,116,112,45,62,77,105,110,70,105,108,108,0,33,114,116,112,45,62,115,112,108,105,116,46,80,97,114,116,105,116,105,111,110,115,91,48,93,46,116,97,107,101,110,91,105,93,0,67,108,97,115,115,105,102,121,0,71,101,116,66,114,97,110,99,104,101,115,0,110,45,62,98,114,97,110,99,104,91,105,93,46,99,104,105,108,100,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,2,2,2,2,2,2,16,12,89,1,0,31,80,8,3,7,18,19,20,87,22,23,8,11,105,12,31,10,5,12,14,41,17,43,15,45,16,47,48,32,50,6,52,53,27,28,29,30,11,12,33,34,35,36,37,38,39,40,12,24,25,23,4,10,27,28,26,32,42,10,33,34,35,36,37,38,39,40,12,10,14,83,10,44,88,49,88,88,88,88,88,88,12,27,28,15,46,88,51,33,34,35,36,37,38,39,40,27,28,255,83,255,255,33,34,35,36,37,38,39,40,12,255,255,5,255,255,255,9,20,255,255,255,255,255,12,27,28,255,16,21,22,33,34,35,36,37,38,39,40,27,28,255,255,255,255,33,34,35,36,37,38,39,40,12,255,18,19,20,17,22,23,255,255,255,255,255,255,12,27,28,255,255,255,18,33,34,35,36,37,38,39,40,27,28,255,255,255,255,33,34,35,36,37,38,39,40,12,255,255,255,255,255,255,19,255,255,255,255,255,255,12,27,28,255,255,255,255,33,34,35,36,37,38,39,40,27,28,255,255,255,255,33,34,35,36,37,38,39,40,18,19,20,21,22,23,24,25,255,255,255,255,255,255,255,255,255,35,36,37,38,39,27,18,19,20,22,23,34,54,104,1,31,56,86,33,32,2,27,27,27,94,27,27,55,57,112,54,210,194,79,4,60,34,71,34,63,34,68,34,34,88,34,101,34,34,5,6,95,96,57,4,7,8,9,10,11,12,13,14,4,102,103,93,106,109,5,6,111,88,59,113,7,8,9,10,11,12,13,14,4,114,60,91,115,62,97,70,27,18,19,20,22,23,4,5,6,63,65,98,73,7,8,9,10,11,12,13,14,5,6,0,92,0,0,7,8,9,10,11,12,13,14,4,0,0,79,0,0,0,83,66,0,0,0,0,0,4,5,6,0,68,84,85,7,8,9,10,11,12,13,14,5,6,0,0,0,0,7,8,9,10,11,12,13,14,4,0,42,44,46,71,49,51,0,0,0,0,0,0,4,5,6,0,0,0,74,7,8,9,10,11,12,13,14,5,6,0,0,0,0,7,8,9,10,11,12,13,14,4,0,0,0,0,0,0,76,0,0,0,0,0,0,4,5,6,0,0,0,0,7,8,9,10,11,12,13,14,5,6,0,0,0,0,7,8,9,10,11,12,13,14,41,43,45,47,48,50,52,53,0,0,0,0,0,0,0,0,0,41,43,45,48,50,0,4,47,0,36,35,0,18,20,22,26,28,30,32,24,0,5,7,47,47,47,0,47,47,0,0,9,8,40,0,0,1,34,2,6,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,37,3,38,19,10,41,21,11,42,23,14,45,25,17,27,12,43,29,13,44,31,15,33,16,0,51,0,48,0,47,67,0,49,0,47,0,53,46,39,66,50,65,0,58,56,0,60,52,69,0,54,0,64,0,0,63,0,68,55,59,57,61,0,2,3,3,1,1,2,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,0,6,1,3,3,3,3,3,1,0,1,2,3,0,4,1,2,3,0,4,0,4,0,4,0,3,2,1,2,1,2,1,83,121,110,116,97,120,32,101,114,114,111,114,58,32,110,111,110,45,115,112,97,99,101,32,115,116,114,105,110,103,32,117,115,101,100,32,98,101,102,111,114,101,32,60,84,65,66,76,69,62,0,83,121,110,116,97,120,32,101,114,114,111,114,58,32,110,111,110,45,115,112,97,99,101,32,115,116,114,105,110,103,32,117,115,101,100,32,97,102,116,101,114,32,60,47,84,65,66,76,69,62,0,0,41,42,42,42,43,44,44,45,45,45,45,45,45,45,45,45,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,62,63,63,65,64,66,66,66,66,66,66,67,67,68,68,68,70,69,71,71,71,73,72,74,72,75,72,76,72,77,77,78,78,79,79,255,3,15,16,17,35,58,36,61,37,64,21,67,38,69,39,72,24,75,25,77,26,40,28,78,29,30,80,81,82,89,90,108,107,110,99,100,87,105,69,114,114,111,114,58,32,100,105,115,99,97,114,100,105,110,103,0,0,1,7,42,12,27,28,33,34,35,36,37,38,39,40,43,44,45,46,48,50,52,54,56,58,60,62,63,64,66,67,0,3,8,45,46,48,50,54,56,63,44,64,44,64,44,64,44,44,64,44,64,44,44,12,8,31,11,47,47,14,49,49,15,51,51,20,53,16,55,55,17,57,57,18,59,19,61,65,5,68,69,70,9,21,22,69,78,32,71,72,63,67,23,69,29,30,43,66,76,77,6,24,25,72,79,4,74,73,10,75,26,72,10,10,10,69,114,114,111,114,58,32,112,111,112,112,105,110,103,0,109,101,109,111,114,121,32,101,120,104,97,117,115,116,101,100,0,67,108,101,97,110,117,112,58,32,100,105,115,99,97,114,100,105,110,103,32,108,111,111,107,97,104,101,97,100,0,67,108,101,97,110,117,112,58,32,112,111,112,112,105,110,103,0,68,101,108,101,116,105,110,103,0,0,37,115,32,105,110,32,108,105,110,101,32,37,100,32,10,0,45,45,0,76,97,98,101,108,32,99,108,111,115,101,100,32,98,101,102,111,114,101,32,101,110,100,32,111,102,32,72,84,77,76,32,101,108,101,109,101,110,116,10,0,85,110,99,108,111,115,101,100,32,99,111,109,109,101,110,116,10,0,60,47,72,84,77,76,62,0,60,72,84,77,76,62,0,84,65,66,76,69,0,84,82,0,84,72,0,84,68,0,72,84,77,76,0,70,79,78,84,0,66,0,85,0,79,0,73,0,83,85,80,0,83,85,66,0,83,0,66,82,0,72,82,0,86,82,0,73,77,71,0,85,110,107,110,111,119,110,32,72,84,77,76,32,101,108,101,109,101,110,116,32,60,37,115,62,32,111,110,32,108,105,110,101,32,37,100,32,10,0,60,73,77,71,62,0,73,108,108,101,103,97,108,32,97,116,116,114,105,98,117,116,101,32,37,115,32,105,110,32,37,115,32,45,32,105,103,110,111,114,101,100,10,0,115,99,97,108,101,0,115,114,99,0,60,66,82,62,0,97,108,105,103,110,0,73,71,72,84,0,69,70,84,0,69,78,84,69,82,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,65,76,73,71,78,32,45,32,105,103,110,111,114,101,100,10,0,60,70,79,78,84,62,0,99,111,108,111,114,0,102,97,99,101,0,112,111,105,110,116,45,115,105,122,101,0,80,79,73,78,84,45,83,73,90,69,0,73,109,112,114,111,112,101,114,32,37,115,32,118,97,108,117,101,32,37,115,32,45,32,105,103,110,111,114,101,100,0,37,115,32,118,97,108,117,101,32,37,115,32,62,32,37,100,32,45,32,116,111,111,32,108,97,114,103,101,32,45,32,105,103,110,111,114,101,100,0,37,115,32,118,97,108,117,101,32,37,115,32,60,32,37,100,32,45,32,116,111,111,32,115,109,97,108,108,32,45,32,105,103,110,111,114,101,100,0,60,84,68,62,0,98,97,108,105,103,110,0,98,103,99,111,108,111,114,0,98,111,114,100,101,114,0,99,101,108,108,112,97,100,100,105,110,103,0,99,101,108,108,115,112,97,99,105,110,103,0,99,111,108,115,112,97,110,0,102,105,120,101,100,115,105,122,101,0,103,114,97,100,105,101,110,116,97,110,103,108,101,0,104,101,105,103,104,116,0,104,114,101,102,0,105,100,0,112,111,114,116,0,114,111,119,115,112,97,110,0,115,105,100,101,115,0,115,116,121,108,101,0,116,97,114,103,101,116,0,116,105,116,108,101,0,116,111,111,108,116,105,112,0,118,97,108,105,103,110,0,119,105,100,116,104,0,87,73,68,84,72,0,79,84,84,79,77,0,79,80,0,73,68,68,76,69,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,86,65,76,73,71,78,32,45,32,105,103,110,111,114,101,100,10,0,32,44,0,79,85,78,68,69,68,0,65,68,73,65,76,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,83,84,89,76,69,32,45,32,105,103,110,111,114,101,100,10,0,83,79,76,73,68,0,73,78,86,73,83,73,66,76,69,0,73,78,86,73,83,0,68,79,84,84,69,68,0,68,65,83,72,69,68,0,85,110,114,101,99,111,103,110,105,122,101,100,32,99,104,97,114,97,99,116,101,114,32,39,37,99,39,32,40,37,100,41,32,105,110,32,115,105,100,101,115,32,97,116,116,114,105,98,117,116,101,10,0,82,79,87,83,80,65,78,0,82,79,87,83,80,65,78,32,118,97,108,117,101,32,99,97,110,110,111,116,32,98,101,32,48,32,45,32,105,103,110,111,114,101,100,10,0,72,69,73,71,72,84,0,71,82,65,68,73,69,78,84,65,78,71,76,69,0,82,85,69,0,65,76,83,69,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,70,73,88,69,68,83,73,90,69,32,45,32,105,103,110,111,114,101,100,10,0,67,79,76,83,80,65,78,0,67,79,76,83,80,65,78,32,118,97,108,117,101,32,99,97,110,110,111,116,32,98,101,32,48,32,45,32,105,103,110,111,114,101,100,10,0,67,69,76,76,83,80,65,67,73,78,71,0,67,69,76,76,80,65,68,68,73,78,71,0,66,79,82,68,69,82,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,66,65,76,73,71,78,32,105,110,32,84,68,32,45,32,105,103,110,111,114,101,100,10,0,69,88,84,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,37,115,32,102,111,114,32,65,76,73,71,78,32,105,110,32,84,68,32,45,32,105,103,110,111,114,101,100,10,0,60,84,65,66,76,69,62,0,99,101,108,108,98,111,114,100,101,114,0,99,111,108,117,109,110,115,0,114,111,119,115,0,85,110,107,110,111,119,110,32,118,97,108,117,101,32,37,115,32,102,111,114,32,82,79,87,83,32,45,32,105,103,110,111,114,101,100,10,0,85,110,107,110,111,119,110,32,118,97,108,117,101,32,37,115,32,102,111,114,32,67,79,76,85,77,78,83,32,45,32,105,103,110,111,114,101,100,10,0,67,69,76,76,83,66,79,82,68,69,82,0,46,46,46,32,37,115,32,46,46,46,10,0,106,32,61,61,32,48,0,99,118,116,46,99,0,80,111,98,115,112,97,116,104,0,114,111,117,116,101,46,99,0,108,105,98,112,97,116,104,47,37,115,58,37,100,58,32,37,115,10,0,115,104,111,114,116,101,115,116,46,99,0,115,111,117,114,99,101,32,112,111,105,110,116,32,110,111,116,32,105,110,32,97,110,121,32,116,114,105,97,110,103,108,101,0,100,101,115,116,105,110,97,116,105,111,110,32,112,111,105,110,116,32,110,111,116,32,105,110,32,97,110,121,32,116,114,105,97,110,103,108,101,0,99,97,110,110,111,116,32,102,105,110,100,32,116,114,105,97,110,103,108,101,32,112,97,116,104,0,99,97,110,110,111,116,32,109,97,108,108,111,99,32,111,112,115,0,99,97,110,110,111,116,32,114,101,97,108,108,111,99,32,111,112,115,0,116,114,105,97,110,103,117,108,97,116,105,111,110,32,102,97,105,108,101,100,0,99,97,110,110,111,116,32,109,97,108,108,111,99,32,116,114,105,115,0,99,97,110,110,111,116,32,114,101,97,108,108,111,99,32,116,114,105,115,0,99,97,110,110,111,116,32,109,97,108,108,111,99,32,100,113,46,112,110,108,115,0,99,97,110,110,111,116,32,114,101,97,108,108,111,99,32,100,113,46,112,110,108,115,0,99,97,110,110,111,116,32,109,97,108,108,111,99,32,112,110,108,115,0,99,97,110,110,111,116,32,109,97,108,108,111,99,32,112,110,108,112,115,0,99,97,110,110,111,116,32,114,101,97,108,108,111,99,32,112,110,108,115,0,99,97,110,110,111,116,32,114,101,97,108,108,111,99,32,112,110,108,112,115,0,111,117,116,32,111,102,32,109,101,109,111,114,121,0,115,121,110,116,97,120,32,101,114,114,111,114,0,110,111,32,101,108,101,109,101,110,116,32,102,111,117,110,100,0,110,111,116,32,119,101,108,108,45,102,111,114,109,101,100,32,40,105,110,118,97,108,105,100,32,116,111,107,101,110,41,0,117,110,99,108,111,115,101,100,32,116,111,107,101,110,0,112,97,114,116,105,97,108,32,99,104,97,114,97,99,116,101,114,0,109,105,115,109,97,116,99,104,101,100,32,116,97,103,0,100,117,112,108,105,99,97,116,101,32,97,116,116,114,105,98,117,116,101,0,106,117,110,107,32,97,102,116,101,114,32,100,111,99,117,109,101,110,116,32,101,108,101,109,101,110,116,0,105,108,108,101,103,97,108,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,0,117,110,100,101,102,105,110,101,100,32,101,110,116,105,116,121,0,114,101,99,117,114,115,105,118,101,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,0,97,115,121,110,99,104,114,111,110,111,117,115,32,101,110,116,105,116,121,0,114,101,102,101,114,101,110,99,101,32,116,111,32,105,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,110,117,109,98,101,114,0,114,101,102,101,114,101,110,99,101,32,116,111,32,98,105,110,97,114,121,32,101,110,116,105,116,121,0,114,101,102,101,114,101,110,99,101,32,116,111,32,101,120,116,101,114,110,97,108,32,101,110,116,105,116,121,32,105,110,32,97,116,116,114,105,98,117,116,101,0,88,77,76,32,111,114,32,116,101,120,116,32,100,101,99,108,97,114,97,116,105,111,110,32,110,111,116,32,97,116,32,115,116,97,114,116,32,111,102,32,101,110,116,105,116,121,0,117,110,107,110,111,119,110,32,101,110,99,111,100,105,110,103,0,101,110,99,111,100,105,110,103,32,115,112,101,99,105,102,105,101,100,32,105,110,32,88,77,76,32,100,101,99,108,97,114,97,116,105,111,110,32,105,115,32,105,110,99,111,114,114,101,99,116,0,117,110,99,108,111,115,101,100,32,67,68,65,84,65,32,115,101,99,116,105,111,110,0,101,114,114,111,114,32,105,110,32,112,114,111,99,101,115,115,105,110,103,32,101,120,116,101,114,110,97,108,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,0,100,111,99,117,109,101,110,116,32,105,115,32,110,111,116,32,115,116,97,110,100,97,108,111,110,101,0,117,110,101,120,112,101,99,116,101,100,32,112,97,114,115,101,114,32,115,116,97,116,101,32,45,32,112,108,101,97,115,101,32,115,101,110,100,32,97,32,98,117,103,32,114,101,112,111,114,116,0,101,110,116,105,116,121,32,100,101,99,108,97,114,101,100,32,105,110,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,0,114,101,113,117,101,115,116,101,100,32,102,101,97,116,117,114,101,32,114,101,113,117,105,114,101,115,32,88,77,76,95,68,84,68,32,115,117,112,112,111,114,116,32,105,110,32,69,120,112,97,116,0,99,97,110,110,111,116,32,99,104,97,110,103,101,32,115,101,116,116,105,110,103,32,111,110,99,101,32,112,97,114,115,105,110,103,32,104,97,115,32,98,101,103,117,110,0,117,110,98,111,117,110,100,32,112,114,101,102,105,120,0,109,117,115,116,32,110,111,116,32,117,110,100,101,99,108,97,114,101,32,112,114,101,102,105,120,0,105,110,99,111,109,112,108,101,116,101,32,109,97,114,107,117,112,32,105,110,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,0,88,77,76,32,100,101,99,108,97,114,97,116,105,111,110,32,110,111,116,32,119,101,108,108,45,102,111,114,109,101,100,0,116,101,120,116,32,100,101,99,108,97,114,97,116,105,111,110,32,110,111,116,32,119,101,108,108,45,102,111,114,109,101,100,0,105,108,108,101,103,97,108,32,99,104,97,114,97,99,116,101,114,40,115,41,32,105,110,32,112,117,98,108,105,99,32,105,100,0,112,97,114,115,101,114,32,115,117,115,112,101,110,100,101,100,0,112,97,114,115,101,114,32,110,111,116,32,115,117,115,112,101,110,100,101,100,0,112,97,114,115,105,110,103,32,97,98,111,114,116,101,100,0,112,97,114,115,105,110,103,32,102,105,110,105,115,104,101,100,0,99,97,110,110,111,116,32,115,117,115,112,101,110,100,32,105,110,32,101,120,116,101,114,110,97,108,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,0,114,101,115,101,114,118,101,100,32,112,114,101,102,105,120,32,40,120,109,108,41,32,109,117,115,116,32,110,111,116,32,98,101,32,117,110,100,101,99,108,97,114,101,100,32,111,114,32,98,111,117,110,100,32,116,111,32,97,110,111,116,104,101,114,32,110,97,109,101,115,112,97,99,101,32,110,97,109,101,0,114,101,115,101,114,118,101,100,32,112,114,101,102,105,120,32,40,120,109,108,110,115,41,32,109,117,115,116,32,110,111,116,32,98,101,32,100,101,99,108,97,114,101,100,32,111,114,32,117,110,100,101,99,108,97,114,101,100,0,112,114,101,102,105,120,32,109,117,115,116,32,110,111,116,32,98,101,32,98,111,117,110,100,32,116,111,32,111,110,101,32,111,102,32,116,104,101,32,114,101,115,101,114,118,101,100,32,110,97,109,101,115,112,97,99,101,32,110,97,109,101,115,0,120,109,108,61,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,88,77,76,47,49,57,57,56,47,110,97,109,101,115,112,97,99,101,0,67,68,65,84,65,0,73,68,0,73,68,82,69,70,0,73,68,82,69,70,83,0,69,78,84,73,84,89,0,69,78,84,73,84,73,69,83,0,78,77,84,79,75,69,78,0,78,77,84,79,75,69,78,83,0,124,0,78,79,84,65,84,73,79,78,40,0,40,0,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,88,77,76,47,49,57,57,56,47,110,97,109,101,115,112,97,99,101,0,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,50,48,48,48,47,120,109,108,110,115,47,0,2,3,4,5,6,7,8,0,0,9,10,11,12,13,14,15,16,17,0,0,0,0,0,0,0,0,0,0,0,0,18,19,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,23,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,3,26,27,28,29,30,0,0,31,32,33,34,35,36,37,16,17,0,0,0,0,0,0,0,0,0,0,0,0,18,19,38,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,23,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,84,70,45,49,54,0,67,68,65,84,65,91,67,68,65,84,65,91,67,68,65,84,65,91,118,101,114,115,105,111,110,0,101,110,99,111,100,105,110,103,0,115,116,97,110,100,97,108,111,110,101,0,85,83,45,65,83,67,73,73,0,85,84,70,45,49,54,66,69,0,85,84,70,45,49,54,76,69,0,69,78,84,73,84,89,0,65,84,84,76,73,83,84,0,69,76,69,77,69,78,84,0,78,79,84,65,84,73,79,78,0,83,89,83,84,69,77,0,80,85,66,76,73,67,0,69,77,80,84,89,0,65,78,89,0,80,67,68,65,84,65,0,73,77,80,76,73,69,68,0,82,69,81,85,73,82,69,68,0,70,73,88,69,68,0,67,68,65,84,65,0,73,68,0,73,68,82,69,70,0,73,68,82,69,70,83,0,69,78,84,73,84,73,69,83,0,78,77,84,79,75,69,78,0,78,77,84,79,75,69,78,83,0,78,68,65,84,65,0,73,78,67,76,85,68,69,0,73,71,78,79,82,69,0,68,79,67,84,89,80,69,0,18,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,17,34,35,36,17,37,38,39,40,41,42,43,44,17,45,46,47,16,16,48,16,16,16,16,16,16,16,49,50,51,16,52,53,16,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,54,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,55,17,17,17,17,56,17,57,58,59,60,61,62,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,63,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17,64,65,17,66,67,68,69,70,71,72,73,16,16,16,74,75,76,77,78,16,16,16,79,80,16,16,16,16,81,16,16,16,16,16,16,16,16,16,17,17,17,82,83,16,16,16,16,16,16,16,16,16,16,16,17,17,17,17,84,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17,17,85,16,16,16,16,86,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,87,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,88,89,90,91,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,92,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,7,254,255,255,7,0,0,0,0,0,4,32,4,255,255,127,255,255,255,127,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,195,255,3,0,31,80,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,223,60,64,215,255,255,251,255,255,255,255,255,255,255,255,255,191,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,3,252,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,254,255,255,255,127,2,254,255,255,255,255,0,0,0,0,0,255,191,182,0,255,255,255,7,7,0,0,0,255,7,255,255,255,255,255,255,255,254,255,195,255,255,255,255,255,255,255,255,255,255,255,255,239,31,254,225,255,159,0,0,255,255,255,255,255,255,0,224,255,255,255,255,255,255,255,255,255,255,255,255,3,0,255,255,255,255,255,7,48,4,255,255,255,252,255,31,0,0,255,255,255,1,0,0,0,0,0,0,0,0,253,31,0,0,0,0,0,0,240,3,255,127,255,255,255,255,255,255,255,239,255,223,225,255,207,255,254,254,238,159,249,255,255,253,197,227,159,89,128,176,207,255,3,0,238,135,249,255,255,253,109,195,135,25,2,94,192,255,63,0,238,191,251,255,255,253,237,227,191,27,1,0,207,255,0,0,238,159,249,255,255,253,237,227,159,25,192,176,207,255,2,0,236,199,61,214,24,199,255,195,199,29,129,0,192,255,0,0,238,223,253,255,255,253,239,227,223,29,96,3,207,255,0,0,236,223,253,255,255,253,239,227,223,29,96,64,207,255,6,0,236,223,253,255,255,255,255,231,223,93,128,0,207,255,0,252,236,255,127,252,255,255,251,47,127,128,95,255,0,0,12,0,254,255,255,255,255,127,255,7,63,32,255,3,0,0,0,0,150,37,240,254,174,236,255,59,95,32,255,243,0,0,0,0,1,0,0,0,255,3,0,0,255,254,255,255,255,31,254,255,3,255,255,254,255,255,255,31,0,0,0,0,0,0,0,0,255,255,255,255,255,255,127,249,255,3,255,255,231,193,255,255,127,64,255,51,255,255,255,255,191,32,255,255,255,255,255,247,255,255,255,255,255,255,255,255,255,61,127,61,255,255,255,255,255,61,255,255,255,255,61,127,61,255,127,255,255,255,255,255,255,255,61,255,255,255,255,255,255,255,255,135,0,0,0,0,255,255,0,0,255,255,255,255,255,255,255,255,255,255,31,0,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,159,255,255,254,255,255,7,255,255,255,255,255,255,255,255,255,199,1,0,255,223,15,0,255,255,15,0,255,255,15,0,255,223,13,0,255,255,255,255,255,255,207,255,255,1,128,16,255,3,0,0,0,0,255,3,255,255,255,255,255,255,255,255,255,255,255,0,255,255,255,255,255,7,255,255,255,255,255,255,255,255,63,0,255,255,255,31,255,15,255,1,192,255,255,255,255,63,31,0,255,255,255,255,255,15,255,255,255,3,255,3,0,0,0,0,255,255,255,15,255,255,255,255,255,255,255,127,254,255,31,0,255,3,255,3,128,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,239,255,239,15,255,3,0,0,0,0,255,255,255,255,255,243,255,255,255,255,255,255,191,255,3,0,255,255,255,255,255,255,63,0,255,227,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,0,0,0,0,222,111,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,63,63,255,255,255,255,63,63,255,170,255,255,255,63,255,255,255,255,255,255,223,95,220,31,207,15,255,31,220,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,128,0,0,255,31,0,0,0,0,0,0,0,0,0,0,0,0,132,252,47,62,80,189,255,243,224,67,0,0,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,255,255,255,255,255,255,3,0,0,255,255,255,255,255,127,255,255,255],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+173662);allocate([255,255,127,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,120,12,0,255,255,255,255,191,32,255,255,255,255,255,255,255,128,0,0,255,255,127,0,127,127,127,127,127,127,127,127,255,255,255,255,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,0,0,0,254,3,62,31,254,255,255,255,255,255,255,255,255,255,127,224,254,255,255,255,255,255,255,255,255,255,255,247,224,255,255,255,255,63,254,255,255,255,255,255,255,255,255,255,255,127,0,0,255,255,255,7,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,0,0,0,0,0,0,0,0,255,255,255,255,255,63,255,31,255,255,255,15,0,0,255,255,255,255,255,127,240,143,255,255,255,128,255,255,255,255,255,255,255,255,255,255,0,0,0,0,128,255,252,255,255,255,255,255,255,255,255,255,255,255,255,121,15,0,255,7,0,0,0,0,0,0,0,0,0,255,187,247,255,255,255,0,0,0,255,255,255,255,255,255,15,0,255,255,255,255,255,255,255,255,15,0,255,3,0,0,252,8,255,255,255,255,255,7,255,255,255,255,7,0,255,255,255,31,255,255,255,255,255,255,247,255,0,128,255,3,0,0,0,0,255,255,255,255,255,255,127,0,255,63,255,3,255,255,127,4,255,255,255,255,255,255,255,127,5,0,0,56,255,255,60,0,126,126,126,0,127,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,7,255,3,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,255,255,127,248,255,255,255,255,255,15,255,255,255,255,255,255,255,255,255,255,255,255,255,63,255,255,255,255,255,255,255,255,255,255,255,255,255,3,0,0,0,0,127,0,248,224,255,253,127,95,219,255,255,255,255,255,255,255,255,255,255,255,255,255,3,0,0,0,248,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,255,255,255,255,255,255,255,255,252,255,255,255,255,255,255,0,0,0,0,0,255,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,223,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,0,0,255,3,254,255,255,7,254,255,255,7,192,255,255,255,255,255,255,255,255,255,255,127,252,252,252,28,0,0,0,0,255,239,255,255,127,255,255,183,255,63,255,63,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,7,0,0,0,0,0,0,0,0,255,255,255,255,255,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,31,255,255,255,255,255,255,1,0,0,0,0,0,255,255,255,127,0,0,255,255,255,7,0,0,0,0,0,0,255,255,255,63,255,255,255,255,15,255,62,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,255,3,0,0,0,0,0,0,0,0,0,0,63,253,255,255,255,255,191,145,255,255,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,63,0,255,255,255,3,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,192,0,0,0,0,0,0,0,0,111,240,239,254,255,255,15,0,0,0,0,0,255,255,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,63,0,255,255,63,0,255,255,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,192,255,0,0,252,255,255,255,255,255,255,1,0,0,255,255,255,1,255,3,255,255,255,255,255,255,199,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,30,0,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,63,0,255,3,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,31,0,255,255,255,255,255,127,0,0,248,255,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,223,255,255,255,255,255,255,255,255,223,100,222,255,235,239,255,255,255,255,255,255,255,191,231,223,223,255,255,255,123,95,252,253,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,255,255,255,253,255,255,247,255,255,255,247,255,255,223,255,255,255,223,255,255,127,255,255,255,127,255,255,255,253,255,255,255,253,255,255,247,207,255,255,255,255,255,255,239,255,255,255,150,254,247,10,132,234,150,170,150,247,247,94,255,251,255,15,238,251,255,15,0,0,0,0,0,0,0,0,97,108,110,117,109,0,97,108,112,104,97,0,98,108,97,110,107,0,99,110,116,114,108,0,100,105,103,105,116,0,103,114,97,112,104,0,108,111,119,101,114,0,112,114,105,110,116,0,112,117,110,99,116,0,115,112,97,99,101,0,117,112,112,101,114,0,120,100,105,103,105,116,0,18,16,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,16,16,34,35,16,36,37,38,39,40,41,42,43,16,44,45,46,17,47,48,17,17,49,17,17,17,50,51,52,53,54,55,56,57,17,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,58,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,59,16,60,61,62,63,64,65,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,66,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,67,16,16,68,16,69,70,71,16,72,16,73,16,16,16,16,74,75,76,77,16,16,78,16,79,80,16,16,16,16,81,16,16,16,16,16,16,16,16,16,16,16,16,16,82,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,83,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,84,85,86,87,16,16,88,89,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,90,16,91,92,93,94,95,96,97,98,16,16,16,16,16,16,16,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,254,255,0,252,1,0,0,248,1,0,0,120,0,0,0,0,255,251,223,251,0,0,128,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,252,255,224,175,255,255,255,255,255,255,255,255,255,255,223,255,255,255,255,255,32,64,176,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,0,0,0,0,0,134,254,255,255,255,0,64,73,0,0,0,0,0,24,0,223,255,0,200,0,0,0,0,0,0,0,1,0,60,0,0,0,0,0,0,0,0,0,0,0,0,16,224,1,30,0,96,255,191,0,0,0,0,0,0,255,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,207,3,0,0,0,3,0,32,255,127,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,0,0,0,0,0,0,0,0,0,16,0,32,30,0,48,0,1,0,0,0,0,0,0,0,0,16,0,32,0,0,0,0,252,15,0,0,0,0,0,0,0,16,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,32,0,0,0,0,3,0,0,0,0,0,0,0,0,16,0,32,0,0,0,0,253,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,255,7,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,255,0,0,0,0,0,0,0,16,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,63,2,0,0,0,0,0,0,0,0,0,4,0,0,0,0,16,0,0,0,0,0,0,128,0,128,192,223,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,254,255,255,255,0,252,255,255,0,0,0,0,0,0,0,0,252,0,0,0,0,0,0,192,255,223,255,7,0,0,0,0,0,0,0,0,0,0,128,6,0,252,0,0,24,62,0,0,128,191,0,204,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,96,255,255,255,31,0,0,255,3,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,1,0,0,24,0,0,0,0,0,0,0,0,0,56,0,0,0,0,16,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,254,127,47,0,0,255,3,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,196,255,255,255,255,0,0,0,192,0,0,0,0,0,0,0,0,1,0,224,159,0,0,0,0,127,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,16,0,0,252,255,255,255,31,0,0,0,0,0,12,0,0,0,0,0,0,64,0,12,240,0,0,0,0,0,0,192,248,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,255,0,255,255,255,33,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,127,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,3,224,0,224,0,224,0,96,128,248,255,255,255,252,255,255,255,255,255,127,31,252,241,127,255,127,0,0,255,255,255,3,0,0,255,255,255,255,1,0,123,3,208,193,175,66,0,12,31,188,255,255,0,0,0,0,0,2,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,255,255,255,255,127,0,0,0,255,7,0,0,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,252,255,255,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,135,3,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,127,255,15,0,0,0,0,0,0,0,0,255,255,255,251,255,255,255,255,255,255,255,255,255,255,15,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,255,15,30,255,255,255,1,252,193,224,0,0,0,0,0,0,0,0,0,0,0,30,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,0,0,0,0,255,255,255,255,15,0,0,0,255,255,255,127,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,127,0,0,0,0,0,0,192,0,224,0,0,0,0,0,0,0,0,0,0,0,128,15,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,255,255,127,0,3,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,8,0,0,0,15,255,3,0,0,0,0,0,0,240,0,0,0,0,0,0,0,0,0,16,192,0,0,255,255,3,7,0,0,0,0,0,248,0,0,0,0,8,128,0,0,0,0,0,0,0,0,0,0,8,0,255,63,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,0,0,128,11,0,0,0,0,0,0,0,128,2,0,0,192,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,255,255,255,3,127,0,255,255,255,255,247,255,127,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,254,255,0,252,1,0,0,248,1,0,0,248,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,127,0,48,135,255,255,255,255,255,143,255,0,0,0,0,0,0,224,255,255,7,255,15,0,0,0,0,0,0,255,255,255,255,255,63,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,143,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,135,255,0,255,1,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,255,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,63,252,255,63,0,0,0,3,0,0,0,0,0,0,254,3,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,225,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,7,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,255,255,255,255,127,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,127,0,255,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,8,0,0,0,8,0,0,32,0,0,0,32,0,0,128,0,0,0,128,0,0,0,2,0,0,0,2,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,255,255,255,255,255,15,255,255,255,255,255,255,255,255,255,255,255,255,15,0,255,127,254,127,254,255,254,255,0,0,0,0,255,7,255,255,255,127,255,255,255,255,255,255,255,15,255,255,255,255,255,7,0,0,0,0,0,0,0,0,192,255,255,255,7,0,255,255,255,255,255,7,255,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,191,255,255,255,255,255,255,255,255,31,255,255,15,0,255,255,255,255,223,7,0,0,255,255,1,0,255,255,255,255,255,255,255,127,253,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,30,255,255,255,255,255,255,255,63,15,0,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,255,255,255,255,255,255,255,255,225,255,0,0,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110,0,0,105,110,102,105,110,105,116,121,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,3,4,5,6,7,8,9,255,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,4,7,3,6,5,0,47,112,114,111,99,47,115,101,108,102,47,102,100,47,0,67,46,85,84,70,45,56,0,114,119,97,0,119,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,116,109,112,0,47,116,109,112,47,116,37,120,45,37,120],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+183902);allocate([17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0,9,0,10,0,13,0,12,0,7,0,27,0,91,91,58,97,108,110,117,109,58,93,95,93,0,91,94,91,58,97,108,110,117,109,58,93,95,93,0,91,91,58,115,112,97,99,101,58,93,93,0,91,94,91,58,115,112,97,99,101,58,93,93,0,91,91,58,100,105,103,105,116,58,93,93,0,91,94,91,58,100,105,103,105,116,58,93,93,0],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+192848);var tempDoublePtr=Runtime.alignMemory(allocate(12,"i8",ALLOC_STATIC),8);assert(tempDoublePtr%8==0);function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}Module["_i64Subtract"]=_i64Subtract;Module["_i64Add"]=_i64Add;var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var PATH={splitPath:(function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)}),normalizeArray:(function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up--;up){parts.unshift("..")}}return parts}),normalize:(function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path}),dirname:(function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.substr(0,dir.length-1)}return root+dir}),basename:(function(path){if(path==="/")return"/";var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)}),extname:(function(path){return PATH.splitPath(path)[3]}),join:(function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))}),join2:(function(l,r){return PATH.normalize(l+"/"+r)}),resolve:(function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/"}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter((function(p){return!!p})),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."}),relative:(function(from,to){from=PATH.resolve(from).substr(1);to=PATH.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")})};var TTY={ttys:[],init:(function(){}),shutdown:(function(){}),register:(function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops)}),stream_ops:{open:(function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}stream.tty=tty;stream.seekable=false}),close:(function(stream){stream.tty.ops.flush(stream.tty)}),flush:(function(stream){stream.tty.ops.flush(stream.tty)}),read:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}for(var i=0;i<length;i++){try{stream.tty.ops.put_char(stream.tty,buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})},default_tty_ops:{get_char:(function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=new Buffer(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;var usingDevice=false;try{fd=fs.openSync("/dev/stdin","r");usingDevice=true}catch(e){}bytesRead=fs.readSync(fd,buf,0,BUFSIZE,null);if(usingDevice){fs.closeSync(fd)}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8")}else{result=null}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n"}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n"}}if(!result){return null}tty.input=intArrayFromString(result,true)}return tty.input.shift()}),put_char:(function(tty,val){if(val===null||val===10){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[]}})},default_tty1_ops:{put_char:(function(tty,val){if(val===null||val===10){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[]}})}};var MEMFS={ops_table:null,mount:(function(mount){return MEMFS.createNode(null,"/",16384|511,0)}),createNode:(function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}}}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.timestamp=Date.now();if(parent){parent.contents[name]=node}return node}),getFileDataAsRegularArray:(function(node){if(node.contents&&node.contents.subarray){var arr=[];for(var i=0;i<node.usedBytes;++i)arr.push(node.contents[i]);return arr}return node.contents}),getFileDataAsTypedArray:(function(node){if(!node.contents)return new Uint8Array;if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)}),expandFileStorage:(function(node,newCapacity){if(node.contents&&node.contents.subarray&&newCapacity>node.contents.length){node.contents=MEMFS.getFileDataAsRegularArray(node);node.usedBytes=node.contents.length}if(!node.contents||node.contents.subarray){var prevCapacity=node.contents?node.contents.buffer.byteLength:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)|0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);return}if(!node.contents&&newCapacity>0)node.contents=[];while(node.contents.length<newCapacity)node.contents.push(0)}),resizeFileStorage:(function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;return}if(!node.contents||node.contents.subarray){var oldContents=node.contents;node.contents=new Uint8Array(new ArrayBuffer(newSize));if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize;return}if(!node.contents)node.contents=[];if(node.contents.length>newSize)node.contents.length=newSize;else while(node.contents.length<newSize)node.contents.push(0);node.usedBytes=newSize}),node_ops:{getattr:(function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}}),lookup:(function(parent,name){throw FS.genericErrors[ERRNO_CODES.ENOENT]}),mknod:(function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)}),rename:(function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}}}delete old_node.parent.contents[old_node.name];old_node.name=new_name;new_dir.contents[new_name]=old_node;old_node.parent=new_dir}),unlink:(function(parent,name){delete parent.contents[name]}),rmdir:(function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}delete parent.contents[name]}),readdir:(function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key)}return entries}),symlink:(function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node}),readlink:(function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return node.link})},stream_ops:{read:(function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);assert(size>=0);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size}),write:(function(stream,buffer,offset,length,position,canOwn){if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=new Uint8Array(buffer.subarray(offset,offset+length));node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray)node.contents.set(buffer.subarray(offset,offset+length),position);else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}}node.usedBytes=Math.max(node.usedBytes,position+length);return length}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position}),allocate:(function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&(contents.buffer===buffer||contents.buffer===buffer.buffer)){allocated=false;ptr=contents.byteOffset}else{if(position>0||position+length<stream.node.usedBytes){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}allocated=true;ptr=_malloc(length);if(!ptr){throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)}buffer.set(contents,ptr)}return{ptr:ptr,allocated:allocated}}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(mmapFlags&2){return 0}var bytesWritten=MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0})}};var IDBFS={dbs:{},indexedDB:(function(){if(typeof indexedDB!=="undefined")return indexedDB;var ret=null;if(typeof window==="object")ret=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;assert(ret,"IDBFS used, but indexedDB not supported");return ret}),DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:(function(mount){return MEMFS.mount.apply(null,arguments)}),syncfs:(function(mount,populate,callback){IDBFS.getLocalSet(mount,(function(err,local){if(err)return callback(err);IDBFS.getRemoteSet(mount,(function(err,remote){if(err)return callback(err);var src=populate?remote:local;var dst=populate?local:remote;IDBFS.reconcile(src,dst,callback)}))}))}),getDB:(function(name,callback){var db=IDBFS.dbs[name];if(db){return callback(null,db)}var req;try{req=IDBFS.indexedDB().open(name,IDBFS.DB_VERSION)}catch(e){return callback(e)}req.onupgradeneeded=(function(e){var db=e.target.result;var transaction=e.target.transaction;var fileStore;if(db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)){fileStore=transaction.objectStore(IDBFS.DB_STORE_NAME)}else{fileStore=db.createObjectStore(IDBFS.DB_STORE_NAME)}if(!fileStore.indexNames.contains("timestamp")){fileStore.createIndex("timestamp","timestamp",{unique:false})}});req.onsuccess=(function(){db=req.result;IDBFS.dbs[name]=db;callback(null,db)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),getLocalSet:(function(mount,callback){var entries={};function isRealDir(p){return p!=="."&&p!==".."}function toAbsolute(root){return(function(p){return PATH.join2(root,p)})}var check=FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));while(check.length){var path=check.pop();var stat;try{stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){check.push.apply(check,FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))}entries[path]={timestamp:stat.mtime}}return callback(null,{type:"local",entries:entries})}),getRemoteSet:(function(mount,callback){var entries={};IDBFS.getDB(mount.mountpoint,(function(err,db){if(err)return callback(err);var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readonly");transaction.onerror=(function(e){callback(this.error);e.preventDefault()});var store=transaction.objectStore(IDBFS.DB_STORE_NAME);var index=store.index("timestamp");index.openKeyCursor().onsuccess=(function(event){var cursor=event.target.result;if(!cursor){return callback(null,{type:"remote",db:db,entries:entries})}entries[cursor.primaryKey]={timestamp:cursor.key};cursor.continue()})}))}),loadLocalEntry:(function(path,callback){var stat,node;try{var lookup=FS.lookupPath(path);node=lookup.node;stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){return callback(null,{timestamp:stat.mtime,mode:stat.mode})}else if(FS.isFile(stat.mode)){node.contents=MEMFS.getFileDataAsTypedArray(node);return callback(null,{timestamp:stat.mtime,mode:stat.mode,contents:node.contents})}else{return callback(new Error("node type not supported"))}}),storeLocalEntry:(function(path,entry,callback){try{if(FS.isDir(entry.mode)){FS.mkdir(path,entry.mode)}else if(FS.isFile(entry.mode)){FS.writeFile(path,entry.contents,{encoding:"binary",canOwn:true})}else{return callback(new Error("node type not supported"))}FS.chmod(path,entry.mode);FS.utime(path,entry.timestamp,entry.timestamp)}catch(e){return callback(e)}callback(null)}),removeLocalEntry:(function(path,callback){try{var lookup=FS.lookupPath(path);var stat=FS.stat(path);if(FS.isDir(stat.mode)){FS.rmdir(path)}else if(FS.isFile(stat.mode)){FS.unlink(path)}}catch(e){return callback(e)}callback(null)}),loadRemoteEntry:(function(store,path,callback){var req=store.get(path);req.onsuccess=(function(event){callback(null,event.target.result)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),storeRemoteEntry:(function(store,path,entry,callback){var req=store.put(entry,path);req.onsuccess=(function(){callback(null)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),removeRemoteEntry:(function(store,path,callback){var req=store.delete(path);req.onsuccess=(function(){callback(null)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),reconcile:(function(src,dst,callback){var total=0;var create=[];Object.keys(src.entries).forEach((function(key){var e=src.entries[key];var e2=dst.entries[key];if(!e2||e.timestamp>e2.timestamp){create.push(key);total++}}));var remove=[];Object.keys(dst.entries).forEach((function(key){var e=dst.entries[key];var e2=src.entries[key];if(!e2){remove.push(key);total++}}));if(!total){return callback(null)}var errored=false;var completed=0;var db=src.type==="remote"?src.db:dst.db;var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readwrite");var store=transaction.objectStore(IDBFS.DB_STORE_NAME);function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=total){return callback(null)}}transaction.onerror=(function(e){done(this.error);e.preventDefault()});create.sort().forEach((function(path){if(dst.type==="local"){IDBFS.loadRemoteEntry(store,path,(function(err,entry){if(err)return done(err);IDBFS.storeLocalEntry(path,entry,done)}))}else{IDBFS.loadLocalEntry(path,(function(err,entry){if(err)return done(err);IDBFS.storeRemoteEntry(store,path,entry,done)}))}}));remove.sort().reverse().forEach((function(path){if(dst.type==="local"){IDBFS.removeLocalEntry(path,done)}else{IDBFS.removeRemoteEntry(store,path,done)}}))})};var NODEFS={isWindows:false,staticInit:(function(){NODEFS.isWindows=!!process.platform.match(/^win/)}),mount:(function(mount){assert(ENVIRONMENT_IS_NODE);return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)}),createNode:(function(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node}),getMode:(function(path){var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){stat.mode=stat.mode|(stat.mode&146)>>1}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return stat.mode}),realPath:(function(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts)}),flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:(function(flags){flags&=~32768;flags&=~524288;if(flags in NODEFS.flagsToPermissionStringMap){return NODEFS.flagsToPermissionStringMap[flags]}else{throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}}),node_ops:{getattr:(function(node){var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0}return{dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks}}),setattr:(function(node,attr){var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);node.mode=attr.mode}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date)}if(attr.size!==undefined){fs.truncateSync(path,attr.size)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),lookup:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)}),mknod:(function(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode)}else{fs.writeFileSync(path,"",{mode:node.mode})}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return node}),rename:(function(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),unlink:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),rmdir:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readdir:(function(node){var path=NODEFS.realPath(node);try{return fs.readdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),symlink:(function(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readlink:(function(node){var path=NODEFS.realPath(node);try{path=fs.readlinkSync(path);path=NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root),path);return path}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}})},stream_ops:{open:(function(stream){var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsToPermissionString(stream.flags))}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),close:(function(stream){try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),read:(function(stream,buffer,offset,length,position){if(length===0)return 0;var nbuffer=new Buffer(length);var res;try{res=fs.readSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(res>0){for(var i=0;i<res;i++){buffer[offset+i]=nbuffer[i]}}return res}),write:(function(stream,buffer,offset,length,position){var nbuffer=new Buffer(buffer.subarray(offset,offset+length));var res;try{res=fs.writeSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}return res}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:(function(mount){assert(ENVIRONMENT_IS_WORKER);if(!WORKERFS.reader)WORKERFS.reader=new FileReaderSync;var root=WORKERFS.createNode(null,"/",WORKERFS.DIR_MODE,0);var createdParents={};function ensureParent(path){var parts=path.split("/");var parent=root;for(var i=0;i<parts.length-1;i++){var curr=parts.slice(0,i+1).join("/");if(!createdParents[curr]){createdParents[curr]=WORKERFS.createNode(parent,curr,WORKERFS.DIR_MODE,0)}parent=createdParents[curr]}return parent}function base(path){var parts=path.split("/");return parts[parts.length-1]}Array.prototype.forEach.call(mount.opts["files"]||[],(function(file){WORKERFS.createNode(ensureParent(file.name),base(file.name),WORKERFS.FILE_MODE,0,file,file.lastModifiedDate)}));(mount.opts["blobs"]||[]).forEach((function(obj){WORKERFS.createNode(ensureParent(obj["name"]),base(obj["name"]),WORKERFS.FILE_MODE,0,obj["data"])}));(mount.opts["packages"]||[]).forEach((function(pack){pack["metadata"].files.forEach((function(file){var name=file.filename.substr(1);WORKERFS.createNode(ensureParent(name),base(name),WORKERFS.FILE_MODE,0,pack["blob"].slice(file.start,file.end))}))}));return root}),createNode:(function(parent,name,mode,dev,contents,mtime){var node=FS.createNode(parent,name,mode);node.mode=mode;node.node_ops=WORKERFS.node_ops;node.stream_ops=WORKERFS.stream_ops;node.timestamp=(mtime||new Date).getTime();assert(WORKERFS.FILE_MODE!==WORKERFS.DIR_MODE);if(mode===WORKERFS.FILE_MODE){node.size=contents.size;node.contents=contents}else{node.size=4096;node.contents={}}if(parent){parent.contents[name]=node}return node}),node_ops:{getattr:(function(node){return{dev:1,ino:undefined,mode:node.mode,nlink:1,uid:0,gid:0,rdev:undefined,size:node.size,atime:new Date(node.timestamp),mtime:new Date(node.timestamp),ctime:new Date(node.timestamp),blksize:4096,blocks:Math.ceil(node.size/4096)}}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}}),lookup:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}),mknod:(function(parent,name,mode,dev){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),rename:(function(oldNode,newDir,newName){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),unlink:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),rmdir:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),readdir:(function(node){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),symlink:(function(parent,newName,oldPath){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),readlink:(function(node){throw new FS.ErrnoError(ERRNO_CODES.EPERM)})},stream_ops:{read:(function(stream,buffer,offset,length,position){if(position>=stream.node.size)return 0;var chunk=stream.node.contents.slice(position,position+length);var ab=WORKERFS.reader.readAsArrayBuffer(chunk);buffer.set(new Uint8Array(ab),offset);return chunk.size}),write:(function(stream,buffer,offset,length,position){throw new FS.ErrnoError(ERRNO_CODES.EIO)}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.size}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var _stdin=allocate(1,"i32*",ALLOC_STATIC);var _stdout=allocate(1,"i32*",ALLOC_STATIC);var _stderr=allocate(1,"i32*",ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,handleFSError:(function(e){if(!(e instanceof FS.ErrnoError))throw e+" : "+stackTrace();return ___setErrNo(e.errno)}),lookupPath:(function(path,opts){path=PATH.resolve(FS.cwd(),path);opts=opts||{};if(!path)return{path:"",node:null};var defaults={follow_mount:true,recurse_count:0};for(var key in defaults){if(opts[key]===undefined){opts[key]=defaults[key]}}if(opts.recurse_count>8){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}var parts=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),false);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count});current=lookup.node;if(count++>40){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}}}}return{path:current_path,node:current}}),getPath:(function(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent}}),hashName:(function(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length}),hashAddNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node}),hashRemoveNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}}),lookupNode:(function(parent,name){var err=FS.mayLookup(parent);if(err){throw new FS.ErrnoError(err,parent)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)}),createNode:(function(parent,name,mode,rdev){if(!FS.FSNode){FS.FSNode=(function(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev});FS.FSNode.prototype={};var readMode=292|73;var writeMode=146;Object.defineProperties(FS.FSNode.prototype,{read:{get:(function(){return(this.mode&readMode)===readMode}),set:(function(val){val?this.mode|=readMode:this.mode&=~readMode})},write:{get:(function(){return(this.mode&writeMode)===writeMode}),set:(function(val){val?this.mode|=writeMode:this.mode&=~writeMode})},isFolder:{get:(function(){return FS.isDir(this.mode)})},isDevice:{get:(function(){return FS.isChrdev(this.mode)})}})}var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node}),destroyNode:(function(node){FS.hashRemoveNode(node)}),isRoot:(function(node){return node===node.parent}),isMountpoint:(function(node){return!!node.mounted}),isFile:(function(mode){return(mode&61440)===32768}),isDir:(function(mode){return(mode&61440)===16384}),isLink:(function(mode){return(mode&61440)===40960}),isChrdev:(function(mode){return(mode&61440)===8192}),isBlkdev:(function(mode){return(mode&61440)===24576}),isFIFO:(function(mode){return(mode&61440)===4096}),isSocket:(function(mode){return(mode&49152)===49152}),flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:(function(str){var flags=FS.flagModes[str];if(typeof flags==="undefined"){throw new Error("Unknown file open mode: "+str)}return flags}),flagsToPermissionString:(function(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms}),nodePermissions:(function(node,perms){if(FS.ignorePermissions){return 0}if(perms.indexOf("r")!==-1&&!(node.mode&292)){return ERRNO_CODES.EACCES}else if(perms.indexOf("w")!==-1&&!(node.mode&146)){return ERRNO_CODES.EACCES}else if(perms.indexOf("x")!==-1&&!(node.mode&73)){return ERRNO_CODES.EACCES}return 0}),mayLookup:(function(dir){var err=FS.nodePermissions(dir,"x");if(err)return err;if(!dir.node_ops.lookup)return ERRNO_CODES.EACCES;return 0}),mayCreate:(function(dir,name){try{var node=FS.lookupNode(dir,name);return ERRNO_CODES.EEXIST}catch(e){}return FS.nodePermissions(dir,"wx")}),mayDelete:(function(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var err=FS.nodePermissions(dir,"wx");if(err){return err}if(isdir){if(!FS.isDir(node.mode)){return ERRNO_CODES.ENOTDIR}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return ERRNO_CODES.EBUSY}}else{if(FS.isDir(node.mode)){return ERRNO_CODES.EISDIR}}return 0}),mayOpen:(function(node,flags){if(!node){return ERRNO_CODES.ENOENT}if(FS.isLink(node.mode)){return ERRNO_CODES.ELOOP}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=="r"||flags&512){return ERRNO_CODES.EISDIR}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))}),MAX_OPEN_FDS:4096,nextfd:(function(fd_start,fd_end){fd_start=fd_start||0;fd_end=fd_end||FS.MAX_OPEN_FDS;for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(ERRNO_CODES.EMFILE)}),getStream:(function(fd){return FS.streams[fd]}),createStream:(function(stream,fd_start,fd_end){if(!FS.FSStream){FS.FSStream=(function(){});FS.FSStream.prototype={};Object.defineProperties(FS.FSStream.prototype,{object:{get:(function(){return this.node}),set:(function(val){this.node=val})},isRead:{get:(function(){return(this.flags&2097155)!==1})},isWrite:{get:(function(){return(this.flags&2097155)!==0})},isAppend:{get:(function(){return this.flags&1024})}})}var newStream=new FS.FSStream;for(var p in stream){newStream[p]=stream[p]}stream=newStream;var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream}),closeStream:(function(fd){FS.streams[fd]=null}),chrdev_stream_ops:{open:(function(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream)}}),llseek:(function(){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)})},major:(function(dev){return dev>>8}),minor:(function(dev){return dev&255}),makedev:(function(ma,mi){return ma<<8|mi}),registerDevice:(function(dev,ops){FS.devices[dev]={stream_ops:ops}}),getDevice:(function(dev){return FS.devices[dev]}),getMounts:(function(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts)}return mounts}),syncfs:(function(populate,callback){if(typeof populate==="function"){callback=populate;populate=false}var mounts=FS.getMounts(FS.root.mount);var completed=0;function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=mounts.length){callback(null)}}mounts.forEach((function(mount){if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done)}))}),mount:(function(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot}),unmount:(function(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach((function(hash){var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.indexOf(current.mount)!==-1){FS.destroyNode(current)}current=next}}));node.mounted=null;var idx=node.mount.mounts.indexOf(mount);assert(idx!==-1);node.mount.mounts.splice(idx,1)}),lookup:(function(parent,name){return parent.node_ops.lookup(parent,name)}),mknod:(function(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.mayCreate(parent,name);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.mknod(parent,name,mode,dev)}),create:(function(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)}),mkdir:(function(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)}),mkdev:(function(path,mode,dev){if(typeof dev==="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)}),symlink:(function(oldpath,newpath){if(!PATH.resolve(oldpath)){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var newname=PATH.basename(newpath);var err=FS.mayCreate(parent,newname);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.symlink(parent,newname,oldpath)}),rename:(function(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;try{lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!old_dir||!new_dir)throw new FS.ErrnoError(ERRNO_CODES.ENOENT);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(ERRNO_CODES.EXDEV)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}relative=PATH.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var err=FS.mayDelete(old_dir,old_name,isdir);if(err){throw new FS.ErrnoError(err)}err=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(err){throw new FS.ErrnoError(err)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(new_dir!==old_dir){err=FS.nodePermissions(old_dir,"w");if(err){throw new FS.ErrnoError(err)}}try{if(FS.trackingDelegate["willMovePath"]){FS.trackingDelegate["willMovePath"](old_path,new_path)}}catch(e){console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name)}catch(e){throw e}finally{FS.hashAddNode(old_node)}try{if(FS.trackingDelegate["onMovePath"])FS.trackingDelegate["onMovePath"](old_path,new_path)}catch(e){console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}}),rmdir:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,true);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}return node.node_ops.readdir(node)}),unlink:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,false);if(err){if(err===ERRNO_CODES.EISDIR)err=ERRNO_CODES.EPERM;throw new FS.ErrnoError(err)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.unlink(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readlink:(function(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!link.node_ops.readlink){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return PATH.resolve(FS.getPath(link.parent),link.node_ops.readlink(link))}),stat:(function(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!node.node_ops.getattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return node.node_ops.getattr(node)}),lstat:(function(path){return FS.stat(path,true)}),chmod:(function(path,mode,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()})}),lchmod:(function(path,mode){FS.chmod(path,mode,true)}),fchmod:(function(fd,mode){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chmod(stream.node,mode)}),chown:(function(path,uid,gid,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{timestamp:Date.now()})}),lchown:(function(path,uid,gid){FS.chown(path,uid,gid,true)}),fchown:(function(fd,uid,gid){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chown(stream.node,uid,gid)}),truncate:(function(path,len){if(len<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.nodePermissions(node,"w");if(err){throw new FS.ErrnoError(err)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()})}),ftruncate:(function(fd,len){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}FS.truncate(stream.node,len)}),utime:(function(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)})}),open:(function(path,flags,mode,fd_start,fd_end){if(path===""){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}flags=typeof flags==="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode==="undefined"?438:mode;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;if(typeof path==="object"){node=path}else{path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(ERRNO_CODES.EEXIST)}}else{node=FS.mknod(path,mode,0);created=true}}if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}if(!created){var err=FS.mayOpen(node,flags);if(err){throw new FS.ErrnoError(err)}}if(flags&512){FS.truncate(node,0)}flags&=~(128|512);var stream=FS.createStream({node:node,path:FS.getPath(node),flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false},fd_start,fd_end);if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;Module["printErr"]("read file: "+path)}}try{if(FS.trackingDelegate["onOpenFile"]){var trackingFlags=0;if((flags&2097155)!==1){trackingFlags|=FS.tracking.openFlags.READ}if((flags&2097155)!==0){trackingFlags|=FS.tracking.openFlags.WRITE}FS.trackingDelegate["onOpenFile"](path,trackingFlags)}}catch(e){console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: "+e.message)}return stream}),close:(function(stream){if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}}),llseek:(function(stream,offset,whence){if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position}),read:(function(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.read){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead}),write:(function(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.write){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if(stream.flags&1024){FS.llseek(stream,0,2)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;try{if(stream.path&&FS.trackingDelegate["onWriteToFile"])FS.trackingDelegate["onWriteToFile"](stream.path)}catch(e){console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: "+e.message)}return bytesWritten}),allocate:(function(stream,offset,length){if(offset<0||length<=0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)}stream.stream_ops.allocate(stream,offset,length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EACCES)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}return stream.stream_ops.mmap(stream,buffer,offset,length,position,prot,flags)}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!stream||!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)}),munmap:(function(stream){return 0}),ioctl:(function(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)}return stream.stream_ops.ioctl(stream,cmd,arg)}),readFile:(function(path,opts){opts=opts||{};opts.flags=opts.flags||"r";opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf,0)}else if(opts.encoding==="binary"){ret=buf}FS.close(stream);return ret}),writeFile:(function(path,data,opts){opts=opts||{};opts.flags=opts.flags||"w";opts.encoding=opts.encoding||"utf8";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var stream=FS.open(path,opts.flags,opts.mode);if(opts.encoding==="utf8"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,0,opts.canOwn)}else if(opts.encoding==="binary"){FS.write(stream,data,0,data.length,0,opts.canOwn)}FS.close(stream)}),cwd:(function(){return FS.currentPath}),chdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}var err=FS.nodePermissions(lookup.node,"x");if(err){throw new FS.ErrnoError(err)}FS.currentPath=lookup.path}),createDefaultDirectories:(function(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")}),createDefaultDevices:(function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:(function(){return 0}),write:(function(stream,buffer,offset,length,pos){return length})});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device;if(typeof crypto!=="undefined"){var randomBuffer=new Uint8Array(1);random_device=(function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0]})}else if(ENVIRONMENT_IS_NODE){random_device=(function(){return __webpack_require__(2).randomBytes(1)[0]})}else{random_device=(function(){return Math.random()*256|0})}FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")}),createSpecialDirectories:(function(){FS.mkdir("/proc");FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount:(function(){var node=FS.createNode("/proc/self","fd",16384|511,73);node.node_ops={lookup:(function(parent,name){var fd=+name;var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:(function(){return stream.path})}};ret.parent=ret;return ret})};return node})},{},"/proc/self/fd")}),createStandardStreams:(function(){if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"])}else{FS.symlink("/dev/tty","/dev/stdin")}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"])}else{FS.symlink("/dev/tty","/dev/stdout")}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"])}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin","r");assert(stdin.fd===0,"invalid handle for stdin ("+stdin.fd+")");var stdout=FS.open("/dev/stdout","w");assert(stdout.fd===1,"invalid handle for stdout ("+stdout.fd+")");var stderr=FS.open("/dev/stderr","w");assert(stderr.fd===2,"invalid handle for stderr ("+stderr.fd+")")}),ensureErrnoError:(function(){if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno,node){this.node=node;this.setErrno=(function(errno){this.errno=errno;for(var key in ERRNO_CODES){if(ERRNO_CODES[key]===errno){this.code=key;break}}});this.setErrno(errno);this.message=ERRNO_MESSAGES[errno]};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[ERRNO_CODES.ENOENT].forEach((function(code){FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>"}))}),staticInit:(function(){FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={"MEMFS":MEMFS,"IDBFS":IDBFS,"NODEFS":NODEFS,"WORKERFS":WORKERFS}}),init:(function(input,output,error){assert(!FS.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams()}),quit:(function(){FS.init.initialized=false;var fflush=Module["_fflush"];if(fflush)fflush(0);for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream)}}),getMode:(function(canRead,canWrite){var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode}),joinPath:(function(parts,forceRelative){var path=PATH.join.apply(null,parts);if(forceRelative&&path[0]=="/")path=path.substr(1);return path}),absolutePath:(function(relative,base){return PATH.resolve(base,relative)}),standardizePath:(function(path){return PATH.normalize(path)}),findObject:(function(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object}else{___setErrNo(ret.error);return null}}),analyzePath:(function(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret}),createFolder:(function(parent,name,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.mkdir(path,mode)}),createPath:(function(parent,path,canRead,canWrite){parent=typeof parent==="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){}parent=current}return current}),createFile:(function(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)}),createDataFile:(function(parent,name,data,canRead,canWrite,canOwn){var path=name?PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name):parent;var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data==="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,"w");FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}return node}),createDevice:(function(parent,name,input,output){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:(function(stream){stream.seekable=false}),close:(function(stream){if(output&&output.buffer&&output.buffer.length){output(10)}}),read:(function(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})});return FS.mkdev(path,mode,dev)}),createLink:(function(parent,name,target,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);return FS.symlink(target,path)}),forceLoadFile:(function(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;var success=true;if(typeof XMLHttpRequest!=="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(Module["read"]){try{obj.contents=intArrayFromString(Module["read"](obj.url),true);obj.usedBytes=obj.contents.length}catch(e){success=false}}else{throw new Error("Cannot load without read() or XMLHttpRequest.")}if(!success)___setErrNo(ERRNO_CODES.EIO);return success}),createLazyFile:(function(parent,name,url,canRead,canWrite){function LazyUint8Array(){this.lengthKnown=false;this.chunks=[]}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(function(from,to){if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);if(typeof Uint8Array!="undefined")xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}else{return intArrayFromString(xhr.responseText||"",true)}});var lazyArray=this;lazyArray.setDataGetter((function(chunkNum){var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]==="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]==="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]}));if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;console.log("LazyFiles on gzip forces download of the whole file when length is accessed")}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true};if(typeof XMLHttpRequest!=="undefined"){if(!ENVIRONMENT_IS_WORKER)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperties(lazyArray,{length:{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._length})},chunkSize:{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize})}});var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url:url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperties(node,{usedBytes:{get:(function(){return this.contents.length})}});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach((function(key){var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}return fn.apply(null,arguments)}}));stream_ops.read=function stream_ops_read(stream,buffer,offset,length,position){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);assert(size>=0);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size};node.stream_ops=stream_ops;return node}),createPreloadedFile:(function(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish){Browser.init();var fullname=name?PATH.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency("cp "+fullname);function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}if(onload)onload();removeRunDependency(dep)}var handled=false;Module["preloadPlugins"].forEach((function(plugin){if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,(function(){if(onerror)onerror();removeRunDependency(dep)}));handled=true}}));if(!handled)finish(byteArray)}addRunDependency(dep);if(typeof url=="string"){Browser.asyncLoad(url,(function(byteArray){processData(byteArray)}),onerror)}else{processData(url)}}),indexedDB:(function(){return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB}),DB_NAME:(function(){return"EM_FS_"+window.location.pathname}),DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=function openRequest_onupgradeneeded(){console.log("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME)};openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=function putRequest_onsuccess(){ok++;if(ok+fail==total)finish()};putRequest.onerror=function putRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror}),loadFilesFromDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly")}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var getRequest=files.get(path);getRequest.onsuccess=function getRequest_onsuccess(){if(FS.analyzePath(path).exists){FS.unlink(path)}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish()};getRequest.onerror=function getRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror})};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:(function(dirfd,path){if(path[0]!=="/"){var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=FS.getStream(dirfd);if(!dirstream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);dir=dirstream.path}path=PATH.join2(dir,path)}return path}),doStat:(function(func,path,buf){try{var stat=func(path)}catch(e){if(e&&e.node&&PATH.normalize(path)!==PATH.normalize(FS.getPath(e.node))){return-ERRNO_CODES.ENOTDIR}throw e}HEAP32[buf>>2]=stat.dev;HEAP32[buf+4>>2]=0;HEAP32[buf+8>>2]=stat.ino;HEAP32[buf+12>>2]=stat.mode;HEAP32[buf+16>>2]=stat.nlink;HEAP32[buf+20>>2]=stat.uid;HEAP32[buf+24>>2]=stat.gid;HEAP32[buf+28>>2]=stat.rdev;HEAP32[buf+32>>2]=0;HEAP32[buf+36>>2]=stat.size;HEAP32[buf+40>>2]=4096;HEAP32[buf+44>>2]=stat.blocks;HEAP32[buf+48>>2]=stat.atime.getTime()/1e3|0;HEAP32[buf+52>>2]=0;HEAP32[buf+56>>2]=stat.mtime.getTime()/1e3|0;HEAP32[buf+60>>2]=0;HEAP32[buf+64>>2]=stat.ctime.getTime()/1e3|0;HEAP32[buf+68>>2]=0;HEAP32[buf+72>>2]=stat.ino;return 0}),doMsync:(function(addr,stream,len,flags){var buffer=new Uint8Array(HEAPU8.subarray(addr,addr+len));FS.msync(stream,buffer,0,len,flags)}),doMkdir:(function(path,mode){path=PATH.normalize(path);if(path[path.length-1]==="/")path=path.substr(0,path.length-1);FS.mkdir(path,mode,0);return 0}),doMknod:(function(path,mode,dev){switch(mode&61440){case 32768:case 8192:case 24576:case 4096:case 49152:break;default:return-ERRNO_CODES.EINVAL}FS.mknod(path,mode,dev);return 0}),doReadlink:(function(path,buf,bufsize){if(bufsize<=0)return-ERRNO_CODES.EINVAL;var ret=FS.readlink(path);ret=ret.slice(0,Math.max(0,bufsize));writeStringToMemory(ret,buf,true);return ret.length}),doAccess:(function(path,amode){if(amode&~7){return-ERRNO_CODES.EINVAL}var node;var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;var perms="";if(amode&4)perms+="r";if(amode&2)perms+="w";if(amode&1)perms+="x";if(perms&&FS.nodePermissions(node,perms)){return-ERRNO_CODES.EACCES}return 0}),doDup:(function(path,flags,suggestFD){var suggest=FS.getStream(suggestFD);if(suggest)FS.close(suggest);return FS.open(path,flags,0,suggestFD,suggestFD).fd}),doReadv:(function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break}return ret}),doWritev:(function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr}return ret}),varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),getStreamFromFD:(function(){var stream=FS.getStream(SYSCALLS.get());if(!stream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);return stream}),getSocketFromFD:(function(){var socket=SOCKFS.getSocket(SYSCALLS.get());if(!socket)throw new FS.ErrnoError(ERRNO_CODES.EBADF);return socket}),getSocketAddress:(function(allowNull){var addrp=SYSCALLS.get(),addrlen=SYSCALLS.get();if(allowNull&&addrp===0)return null;var info=__read_sockaddr(addrp,addrlen);if(info.errno)throw new FS.ErrnoError(info.errno);info.addr=DNS.lookup_addr(info.addr)||info.addr;return info}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall192(which,varargs){SYSCALLS.varargs=varargs;try{var addr=SYSCALLS.get(),len=SYSCALLS.get(),prot=SYSCALLS.get(),flags=SYSCALLS.get(),fd=SYSCALLS.get(),off=SYSCALLS.get();off<<=12;var ptr;var allocated=false;if(fd===-1){ptr=_malloc(len);if(!ptr)return-ERRNO_CODES.ENOMEM;_memset(ptr,0,len);allocated=true}else{var info=FS.getStream(fd);if(!info)return-ERRNO_CODES.EBADF;var res=FS.mmap(info,HEAPU8,addr,len,off,prot,flags);ptr=res.ptr;allocated=res.allocated}SYSCALLS.mappings[ptr]={malloc:ptr,len:len,allocated:allocated,fd:fd,flags:flags};return ptr}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall195(which,varargs){SYSCALLS.varargs=varargs;try{var path=SYSCALLS.getStr(),buf=SYSCALLS.get();return SYSCALLS.doStat(FS.stat,path,buf)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall197(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),buf=SYSCALLS.get();return SYSCALLS.doStat(FS.stat,stream.path,buf)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _emscripten_check_longjmp=true;var _emscripten_cleanup_setjmp=true;var _emscripten_postinvoke=true;function _realloc(){throw"bad"}Module["_realloc"]=_realloc;Module["_saveSetjmp"]=_saveSetjmp;var _environ=allocate(1,"i32*",ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env){var MAX_ENV_VALUES=64;var TOTAL_ENV_SIZE=1024;var poolPtr;var envPtr;if(!___buildEnvironment.called){___buildEnvironment.called=true;ENV["USER"]=ENV["LOGNAME"]="web_user";ENV["PATH"]="/";ENV["PWD"]="/";ENV["HOME"]="/home/web_user";ENV["LANG"]="C";ENV["_"]=Module["thisProgram"];poolPtr=allocate(TOTAL_ENV_SIZE,"i8",ALLOC_STATIC);envPtr=allocate(MAX_ENV_VALUES*4,"i8*",ALLOC_STATIC);HEAP32[envPtr>>2]=poolPtr;HEAP32[_environ>>2]=envPtr}else{envPtr=HEAP32[_environ>>2];poolPtr=HEAP32[envPtr>>2]}var strings=[];var totalSize=0;for(var key in env){if(typeof env[key]==="string"){var line=key+"="+env[key];strings.push(line);totalSize+=line.length}}if(totalSize>TOTAL_ENV_SIZE){throw new Error("Environment size exceeded TOTAL_ENV_SIZE!")}var ptrSize=4;for(var i=0;i<strings.length;i++){var line=strings[i];writeAsciiToMemory(line,poolPtr);HEAP32[envPtr+i*ptrSize>>2]=poolPtr;poolPtr+=line.length+1}HEAP32[envPtr+strings.length*ptrSize>>2]=0}var ENV={};function _setenv(envname,envval,overwrite){if(envname===0){___setErrNo(ERRNO_CODES.EINVAL);return-1}var name=Pointer_stringify(envname);var val=Pointer_stringify(envval);if(name===""||name.indexOf("=")!==-1){___setErrNo(ERRNO_CODES.EINVAL);return-1}if(ENV.hasOwnProperty(name)&&!overwrite)return 0;ENV[name]=val;___buildEnvironment(ENV);return 0}function ___syscall91(which,varargs){SYSCALLS.varargs=varargs;try{var addr=SYSCALLS.get(),len=SYSCALLS.get();var info=SYSCALLS.mappings[addr];if(!info)return 0;if(len===info.len){var stream=FS.getStream(info.fd);SYSCALLS.doMsync(addr,stream,len,info.flags);FS.munmap(stream);SYSCALLS.mappings[addr]=null;if(info.allocated){_free(info.malloc)}}return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function __exit(status){Module["exit"](status)}function _exit(status){__exit(status)}function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),op=SYSCALLS.get();switch(op){case 21505:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return 0};case 21506:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return 0};case 21519:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;var argp=SYSCALLS.get();HEAP32[argp>>2]=0;return 0};case 21520:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return-ERRNO_CODES.EINVAL};case 21531:{var argp=SYSCALLS.get();return FS.ioctl(stream,op,argp)};default:abort("bad ioctl syscall "+op)}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _sysconf(name){switch(name){case 30:return PAGE_SIZE;case 85:return totalMemory/PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1e3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:{if(typeof navigator==="object")return navigator["hardwareConcurrency"]||1;return 1}}___setErrNo(ERRNO_CODES.EINVAL);return-1}Module["_bitshift64Lshr"]=_bitshift64Lshr;var _emscripten_prep_setjmp=true;function ___syscall33(which,varargs){SYSCALLS.varargs=varargs;try{var path=SYSCALLS.getStr(),amode=SYSCALLS.get();return SYSCALLS.doAccess(path,amode)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _BDtoIHigh=true;function _pthread_cleanup_push(routine,arg){__ATEXIT__.push((function(){Runtime.dynCall("vi",routine,[arg])}));_pthread_cleanup_push.level=__ATEXIT__.length}Module["_testSetjmp"]=_testSetjmp;function _longjmp(env,value){asm["setThrew"](env,value||1);throw"longjmp"}function _emscripten_longjmp(env,value){_longjmp(env,value)}var _ceil=Math_ceil;function _pthread_cleanup_pop(){assert(_pthread_cleanup_push.level==__ATEXIT__.length,"cannot pop if something else added meanwhile!");__ATEXIT__.pop();_pthread_cleanup_push.level=__ATEXIT__.length}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;var _llvm_pow_f64=Math_pow;function _sbrk(bytes){var self=_sbrk;if(!self.called){DYNAMICTOP=alignMemoryPage(DYNAMICTOP);self.called=true;assert(Runtime.dynamicAlloc);self.alloc=Runtime.dynamicAlloc;Runtime.dynamicAlloc=(function(){abort("cannot dynamically allocate, sbrk now has control")})}var ret=DYNAMICTOP;if(bytes!=0){var success=self.alloc(bytes);if(!success)return-1>>>0}return ret}Module["_memmove"]=_memmove;var _emscripten_preinvoke=true;var _BItoD=true;function ___assert_fail(condition,filename,line,func){ABORT=true;throw"Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"]+" at "+stackTrace()}var PROCINFO={ppid:1,pid:42,sid:42,pgid:42};function ___syscall20(which,varargs){SYSCALLS.varargs=varargs;try{return PROCINFO.pid}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}Module["_memset"]=_memset;var _BDtoILow=true;Module["_bitshift64Shl"]=_bitshift64Shl;function _abort(){Module["abort"]()}var _tan=Math_tan;function ___lock(){}function ___unlock(){}var _asin=Math_asin;var _llvm_fabs_f64=Math_abs;var _atanf=Math_atan;var _fabs=Math_abs;var _floor=Math_floor;var _sqrt=Math_sqrt;var _emscripten_asm_const_int=true;var _abs=Math_abs;function _emscripten_set_main_loop_timing(mode,value){Browser.mainLoop.timingMode=mode;Browser.mainLoop.timingValue=value;if(!Browser.mainLoop.func){return 1}if(mode==0){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setTimeout(){setTimeout(Browser.mainLoop.runner,value)};Browser.mainLoop.method="timeout"}else if(mode==1){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_rAF(){Browser.requestAnimationFrame(Browser.mainLoop.runner)};Browser.mainLoop.method="rAF"}else if(mode==2){if(!window["setImmediate"]){var setImmediates=[];var emscriptenMainLoopMessageId="__emcc";function Browser_setImmediate_messageHandler(event){if(event.source===window&&event.data===emscriptenMainLoopMessageId){event.stopPropagation();setImmediates.shift()()}}window.addEventListener("message",Browser_setImmediate_messageHandler,true);window["setImmediate"]=function Browser_emulated_setImmediate(func){setImmediates.push(func);window.postMessage(emscriptenMainLoopMessageId,"*")}}Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setImmediate(){window["setImmediate"](Browser.mainLoop.runner)};Browser.mainLoop.method="immediate"}return 0}function _emscripten_set_main_loop(func,fps,simulateInfiniteLoop,arg,noSetTiming){Module["noExitRuntime"]=true;assert(!Browser.mainLoop.func,"emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");Browser.mainLoop.func=func;Browser.mainLoop.arg=arg;var thisMainLoopId=Browser.mainLoop.currentlyRunningMainloop;Browser.mainLoop.runner=function Browser_mainLoop_runner(){if(ABORT)return;if(Browser.mainLoop.queue.length>0){var start=Date.now();var blocker=Browser.mainLoop.queue.shift();blocker.func(blocker.arg);if(Browser.mainLoop.remainingBlockers){var remaining=Browser.mainLoop.remainingBlockers;var next=remaining%1==0?remaining-1:Math.floor(remaining);if(blocker.counted){Browser.mainLoop.remainingBlockers=next}else{next=next+.5;Browser.mainLoop.remainingBlockers=(8*remaining+next)/9}}console.log('main loop blocker "'+blocker.name+'" took '+(Date.now()-start)+" ms");Browser.mainLoop.updateStatus();setTimeout(Browser.mainLoop.runner,0);return}if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;Browser.mainLoop.currentFrameNumber=Browser.mainLoop.currentFrameNumber+1|0;if(Browser.mainLoop.timingMode==1&&Browser.mainLoop.timingValue>1&&Browser.mainLoop.currentFrameNumber%Browser.mainLoop.timingValue!=0){Browser.mainLoop.scheduler();return}if(Browser.mainLoop.method==="timeout"&&Module.ctx){Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");Browser.mainLoop.method=""}Browser.mainLoop.runIter((function(){if(typeof arg!=="undefined"){Runtime.dynCall("vi",func,[arg])}else{Runtime.dynCall("v",func)}}));if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;if(typeof SDL==="object"&&SDL.audio&&SDL.audio.queueNewAudioData)SDL.audio.queueNewAudioData();Browser.mainLoop.scheduler()};if(!noSetTiming){if(fps&&fps>0)_emscripten_set_main_loop_timing(0,1e3/fps);else _emscripten_set_main_loop_timing(1,1);Browser.mainLoop.scheduler()}if(simulateInfiniteLoop){throw"SimulateInfiniteLoop"}}var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:(function(){Browser.mainLoop.scheduler=null;Browser.mainLoop.currentlyRunningMainloop++}),resume:(function(){Browser.mainLoop.currentlyRunningMainloop++;var timingMode=Browser.mainLoop.timingMode;var timingValue=Browser.mainLoop.timingValue;var func=Browser.mainLoop.func;Browser.mainLoop.func=null;_emscripten_set_main_loop(func,0,false,Browser.mainLoop.arg,true);_emscripten_set_main_loop_timing(timingMode,timingValue);Browser.mainLoop.scheduler()}),updateStatus:(function(){if(Module["setStatus"]){var message=Module["statusMessage"]||"Please wait...";var remaining=Browser.mainLoop.remainingBlockers;var expected=Browser.mainLoop.expectedBlockers;if(remaining){if(remaining<expected){Module["setStatus"](message+" ("+(expected-remaining)+"/"+expected+")")}else{Module["setStatus"](message)}}else{Module["setStatus"]("")}}}),runIter:(function(func){if(ABORT)return;if(Module["preMainLoop"]){var preRet=Module["preMainLoop"]();if(preRet===false){return}}try{func()}catch(e){if(e instanceof ExitStatus){return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}if(Module["postMainLoop"])Module["postMainLoop"]()})},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:(function(){if(!Module["preloadPlugins"])Module["preloadPlugins"]=[];if(Browser.initted)return;Browser.initted=true;try{new Blob;Browser.hasBlobConstructor=true}catch(e){Browser.hasBlobConstructor=false;console.log("warning: no blob constructor, cannot create blobs with mimetypes")}Browser.BlobBuilder=typeof MozBlobBuilder!="undefined"?MozBlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:!Browser.hasBlobConstructor?console.log("warning: no BlobBuilder"):null;Browser.URLObject=typeof window!="undefined"?window.URL?window.URL:window.webkitURL:undefined;if(!Module.noImageDecoding&&typeof Browser.URLObject==="undefined"){console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding=true}var imagePlugin={};imagePlugin["canHandle"]=function imagePlugin_canHandle(name){return!Module.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(name)};imagePlugin["handle"]=function imagePlugin_handle(byteArray,name,onload,onerror){var b=null;if(Browser.hasBlobConstructor){try{b=new Blob([byteArray],{type:Browser.getMimetype(name)});if(b.size!==byteArray.length){b=new Blob([(new Uint8Array(byteArray)).buffer],{type:Browser.getMimetype(name)})}}catch(e){Runtime.warnOnce("Blob constructor present but fails: "+e+"; falling back to blob builder")}}if(!b){var bb=new Browser.BlobBuilder;bb.append((new Uint8Array(byteArray)).buffer);b=bb.getBlob()}var url=Browser.URLObject.createObjectURL(b);var img=new Image;img.onload=function img_onload(){assert(img.complete,"Image "+name+" could not be decoded");var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);Module["preloadedImages"][name]=canvas;Browser.URLObject.revokeObjectURL(url);if(onload)onload(byteArray)};img.onerror=function img_onerror(event){console.log("Image "+url+" could not be decoded");if(onerror)onerror()};img.src=url};Module["preloadPlugins"].push(imagePlugin);var audioPlugin={};audioPlugin["canHandle"]=function audioPlugin_canHandle(name){return!Module.noAudioDecoding&&name.substr(-4)in{".ogg":1,".wav":1,".mp3":1}};audioPlugin["handle"]=function audioPlugin_handle(byteArray,name,onload,onerror){var done=false;function finish(audio){if(done)return;done=true;Module["preloadedAudios"][name]=audio;if(onload)onload(byteArray)}function fail(){if(done)return;done=true;Module["preloadedAudios"][name]=new Audio;if(onerror)onerror()}if(Browser.hasBlobConstructor){try{var b=new Blob([byteArray],{type:Browser.getMimetype(name)})}catch(e){return fail()}var url=Browser.URLObject.createObjectURL(b);var audio=new Audio;audio.addEventListener("canplaythrough",(function(){finish(audio)}),false);audio.onerror=function audio_onerror(event){if(done)return;console.log("warning: browser could not fully decode audio "+name+", trying slower base64 approach");function encode64(data){var BASE="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD="=";var ret="";var leftchar=0;var leftbits=0;for(var i=0;i<data.length;i++){leftchar=leftchar<<8|data[i];leftbits+=8;while(leftbits>=6){var curr=leftchar>>leftbits-6&63;leftbits-=6;ret+=BASE[curr]}}if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD}else if(leftbits==4){ret+=BASE[(leftchar&15)<<2];ret+=PAD}return ret}audio.src="data:audio/x-"+name.substr(-3)+";base64,"+encode64(byteArray);finish(audio)};audio.src=url;Browser.safeSetTimeout((function(){finish(audio)}),1e4)}else{return fail()}};Module["preloadPlugins"].push(audioPlugin);var canvas=Module["canvas"];function pointerLockChange(){Browser.pointerLock=document["pointerLockElement"]===canvas||document["mozPointerLockElement"]===canvas||document["webkitPointerLockElement"]===canvas||document["msPointerLockElement"]===canvas}if(canvas){canvas.requestPointerLock=canvas["requestPointerLock"]||canvas["mozRequestPointerLock"]||canvas["webkitRequestPointerLock"]||canvas["msRequestPointerLock"]||(function(){});canvas.exitPointerLock=document["exitPointerLock"]||document["mozExitPointerLock"]||document["webkitExitPointerLock"]||document["msExitPointerLock"]||(function(){});canvas.exitPointerLock=canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange",pointerLockChange,false);document.addEventListener("mozpointerlockchange",pointerLockChange,false);document.addEventListener("webkitpointerlockchange",pointerLockChange,false);document.addEventListener("mspointerlockchange",pointerLockChange,false);if(Module["elementPointerLock"]){canvas.addEventListener("click",(function(ev){if(!Browser.pointerLock&&canvas.requestPointerLock){canvas.requestPointerLock();ev.preventDefault()}}),false)}}}),createContext:(function(canvas,useWebGL,setInModule,webGLContextAttributes){if(useWebGL&&Module.ctx&&canvas==Module.canvas)return Module.ctx;var ctx;var contextHandle;if(useWebGL){var contextAttributes={antialias:false,alpha:false};if(webGLContextAttributes){for(var attribute in webGLContextAttributes){contextAttributes[attribute]=webGLContextAttributes[attribute]}}contextHandle=GL.createContext(canvas,contextAttributes);if(contextHandle){ctx=GL.getContext(contextHandle).GLctx}canvas.style.backgroundColor="black"}else{ctx=canvas.getContext("2d")}if(!ctx)return null;if(setInModule){if(!useWebGL)assert(typeof GLctx==="undefined","cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx=ctx;if(useWebGL)GL.makeContextCurrent(contextHandle);Module.useWebGL=useWebGL;Browser.moduleContextCreatedCallbacks.forEach((function(callback){callback()}));Browser.init()}return ctx}),destroyContext:(function(canvas,useWebGL,setInModule){}),fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:(function(lockPointer,resizeCanvas,vrDevice){Browser.lockPointer=lockPointer;Browser.resizeCanvas=resizeCanvas;Browser.vrDevice=vrDevice;if(typeof Browser.lockPointer==="undefined")Browser.lockPointer=true;if(typeof Browser.resizeCanvas==="undefined")Browser.resizeCanvas=false;if(typeof Browser.vrDevice==="undefined")Browser.vrDevice=null;var canvas=Module["canvas"];function fullScreenChange(){Browser.isFullScreen=false;var canvasContainer=canvas.parentNode;if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvasContainer){canvas.cancelFullScreen=document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["webkitCancelFullScreen"]||document["msExitFullscreen"]||document["exitFullscreen"]||(function(){});canvas.cancelFullScreen=canvas.cancelFullScreen.bind(document);if(Browser.lockPointer)canvas.requestPointerLock();Browser.isFullScreen=true;if(Browser.resizeCanvas)Browser.setFullScreenCanvasSize()}else{canvasContainer.parentNode.insertBefore(canvas,canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if(Browser.resizeCanvas)Browser.setWindowedCanvasSize()}if(Module["onFullScreen"])Module["onFullScreen"](Browser.isFullScreen);Browser.updateCanvasDimensions(canvas)}if(!Browser.fullScreenHandlersInstalled){Browser.fullScreenHandlersInstalled=true;document.addEventListener("fullscreenchange",fullScreenChange,false);document.addEventListener("mozfullscreenchange",fullScreenChange,false);document.addEventListener("webkitfullscreenchange",fullScreenChange,false);document.addEventListener("MSFullscreenChange",fullScreenChange,false)}var canvasContainer=document.createElement("div");canvas.parentNode.insertBefore(canvasContainer,canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullScreen=canvasContainer["requestFullScreen"]||canvasContainer["mozRequestFullScreen"]||canvasContainer["msRequestFullscreen"]||(canvasContainer["webkitRequestFullScreen"]?(function(){canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null);if(vrDevice){canvasContainer.requestFullScreen({vrDisplay:vrDevice})}else{canvasContainer.requestFullScreen()}}),nextRAF:0,fakeRequestAnimationFrame:(function(func){var now=Date.now();if(Browser.nextRAF===0){Browser.nextRAF=now+1e3/60}else{while(now+2>=Browser.nextRAF){Browser.nextRAF+=1e3/60}}var delay=Math.max(Browser.nextRAF-now,0);setTimeout(func,delay)}),requestAnimationFrame:function requestAnimationFrame(func){if(typeof window==="undefined"){Browser.fakeRequestAnimationFrame(func)}else{if(!window.requestAnimationFrame){window.requestAnimationFrame=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"]||Browser.fakeRequestAnimationFrame}window.requestAnimationFrame(func)}},safeCallback:(function(func){return(function(){if(!ABORT)return func.apply(null,arguments)})}),allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=false}),resumeAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=true;if(Browser.queuedAsyncCallbacks.length>0){var callbacks=Browser.queuedAsyncCallbacks;Browser.queuedAsyncCallbacks=[];callbacks.forEach((function(func){func()}))}}),safeRequestAnimationFrame:(function(func){return Browser.requestAnimationFrame((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}))}),safeSetTimeout:(function(func,timeout){Module["noExitRuntime"]=true;return setTimeout((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}),timeout)}),safeSetInterval:(function(func,timeout){Module["noExitRuntime"]=true;return setInterval((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}}),timeout)}),getMimetype:(function(name){return{"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","bmp":"image/bmp","ogg":"audio/ogg","wav":"audio/wav","mp3":"audio/mpeg"}[name.substr(name.lastIndexOf(".")+1)]}),getUserMedia:(function(func){if(!window.getUserMedia){window.getUserMedia=navigator["getUserMedia"]||navigator["mozGetUserMedia"]}window.getUserMedia(func)}),getMovementX:(function(event){return event["movementX"]||event["mozMovementX"]||event["webkitMovementX"]||0}),getMovementY:(function(event){return event["movementY"]||event["mozMovementY"]||event["webkitMovementY"]||0}),getMouseWheelDelta:(function(event){var delta=0;switch(event.type){case"DOMMouseScroll":delta=event.detail;break;case"mousewheel":delta=event.wheelDelta;break;case"wheel":delta=event["deltaY"];break;default:throw"unrecognized mouse wheel event: "+event.type}return delta}),mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:(function(event){if(Browser.pointerLock){if(event.type!="mousemove"&&"mozMovementX"in event){Browser.mouseMovementX=Browser.mouseMovementY=0}else{Browser.mouseMovementX=Browser.getMovementX(event);Browser.mouseMovementY=Browser.getMovementY(event)}if(typeof SDL!="undefined"){Browser.mouseX=SDL.mouseX+Browser.mouseMovementX;Browser.mouseY=SDL.mouseY+Browser.mouseMovementY}else{Browser.mouseX+=Browser.mouseMovementX;Browser.mouseY+=Browser.mouseMovementY}}else{var rect=Module["canvas"].getBoundingClientRect();var cw=Module["canvas"].width;var ch=Module["canvas"].height;var scrollX=typeof window.scrollX!=="undefined"?window.scrollX:window.pageXOffset;var scrollY=typeof window.scrollY!=="undefined"?window.scrollY:window.pageYOffset;if(event.type==="touchstart"||event.type==="touchend"||event.type==="touchmove"){var touch=event.touch;if(touch===undefined){return}var adjustedX=touch.pageX-(scrollX+rect.left);var adjustedY=touch.pageY-(scrollY+rect.top);adjustedX=adjustedX*(cw/rect.width);adjustedY=adjustedY*(ch/rect.height);var coords={x:adjustedX,y:adjustedY};if(event.type==="touchstart"){Browser.lastTouches[touch.identifier]=coords;Browser.touches[touch.identifier]=coords}else if(event.type==="touchend"||event.type==="touchmove"){var last=Browser.touches[touch.identifier];if(!last)last=coords;Browser.lastTouches[touch.identifier]=last;Browser.touches[touch.identifier]=coords}return}var x=event.pageX-(scrollX+rect.left);var y=event.pageY-(scrollY+rect.top);x=x*(cw/rect.width);y=y*(ch/rect.height);Browser.mouseMovementX=x-Browser.mouseX;Browser.mouseMovementY=y-Browser.mouseY;Browser.mouseX=x;Browser.mouseY=y}}),xhrLoad:(function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response)}else{onerror()}};xhr.onerror=onerror;xhr.send(null)}),asyncLoad:(function(url,onload,onerror,noRunDep){Browser.xhrLoad(url,(function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(!noRunDep)removeRunDependency("al "+url)}),(function(event){if(onerror){onerror()}else{throw'Loading data file "'+url+'" failed.'}}));if(!noRunDep)addRunDependency("al "+url)}),resizeListeners:[],updateResizeListeners:(function(){var canvas=Module["canvas"];Browser.resizeListeners.forEach((function(listener){listener(canvas.width,canvas.height)}))}),setCanvasSize:(function(width,height,noUpdates){var canvas=Module["canvas"];Browser.updateCanvasDimensions(canvas,width,height);if(!noUpdates)Browser.updateResizeListeners()}),windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags|8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags}Browser.updateResizeListeners()}),setWindowedCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags&~8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags}Browser.updateResizeListeners()}),updateCanvasDimensions:(function(canvas,wNative,hNative){if(wNative&&hNative){canvas.widthNative=wNative;canvas.heightNative=hNative}else{wNative=canvas.widthNative;hNative=canvas.heightNative}var w=wNative;var h=hNative;if(Module["forcedAspectRatio"]&&Module["forcedAspectRatio"]>0){if(w/h<Module["forcedAspectRatio"]){w=Math.round(h*Module["forcedAspectRatio"])}else{h=Math.round(w/Module["forcedAspectRatio"])}}if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvas.parentNode&&typeof screen!="undefined"){var factor=Math.min(screen.width/w,screen.height/h);w=Math.round(w*factor);h=Math.round(h*factor)}if(Browser.resizeCanvas){if(canvas.width!=w)canvas.width=w;if(canvas.height!=h)canvas.height=h;if(typeof canvas.style!="undefined"){canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}else{if(canvas.width!=wNative)canvas.width=wNative;if(canvas.height!=hNative)canvas.height=hNative;if(typeof canvas.style!="undefined"){if(w!=wNative||h!=hNative){canvas.style.setProperty("width",w+"px","important");canvas.style.setProperty("height",h+"px","important")}else{canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}}}),wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:(function(){var handle=Browser.nextWgetRequestHandle;Browser.nextWgetRequestHandle++;return handle})};var _emscripten_get_longjmp_result=true;var _sin=Math_sin;var _exp=Math_exp;var _atan=Math_atan;function ___syscall10(which,varargs){SYSCALLS.varargs=varargs;try{var path=SYSCALLS.getStr();FS.unlink(path);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _getenv(name){if(name===0)return 0;name=Pointer_stringify(name);if(!ENV.hasOwnProperty(name))return 0;if(_getenv.ret)_free(_getenv.ret);_getenv.ret=allocate(intArrayFromString(ENV[name]),"i8",ALLOC_NORMAL);return _getenv.ret}function ___syscall5(which,varargs){SYSCALLS.varargs=varargs;try{var pathname=SYSCALLS.getStr(),flags=SYSCALLS.get(),mode=SYSCALLS.get();var stream=FS.open(pathname,flags,mode);return stream.fd}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _acos=Math_acos;function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _emscripten_setjmp=true;var _cos=Math_cos;function _times(buffer){if(buffer!==0){_memset(buffer,0,16)}return 0}var _atan2=Math_atan2;function ___syscall265(which,varargs){SYSCALLS.varargs=varargs;try{return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _time(ptr){var ret=Date.now()/1e3|0;if(ptr){HEAP32[ptr>>2]=ret}return ret}function _pthread_self(){return 0}function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;assert(offset_high===0);FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();return SYSCALLS.doWritev(stream,iov,iovcnt)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall221(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),cmd=SYSCALLS.get();switch(cmd){case 0:{var arg=SYSCALLS.get();if(arg<0){return-ERRNO_CODES.EINVAL}var newStream;newStream=FS.open(stream.path,stream.flags,0,arg);return newStream.fd};case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=SYSCALLS.get();stream.flags|=arg;return 0};case 12:case 12:{var arg=SYSCALLS.get();var offset=0;HEAP16[arg+offset>>1]=2;return 0};case 13:case 14:case 13:case 14:return 0;case 16:case 8:return-ERRNO_CODES.EINVAL;case 9:___setErrNo(ERRNO_CODES.EINVAL);return-1;default:{return-ERRNO_CODES.EINVAL}}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall145(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();return SYSCALLS.doReadv(stream,iov,iovcnt)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}FS.staticInit();__ATINIT__.unshift((function(){if(!Module["noFSInit"]&&!FS.init.initialized)FS.init()}));__ATMAIN__.push((function(){FS.ignorePermissions=false}));__ATEXIT__.push((function(){FS.quit()}));Module["FS_createFolder"]=FS.createFolder;Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createLink"]=FS.createLink;Module["FS_createDevice"]=FS.createDevice;Module["FS_unlink"]=FS.unlink;__ATINIT__.unshift((function(){TTY.init()}));__ATEXIT__.push((function(){TTY.shutdown()}));if(ENVIRONMENT_IS_NODE){var fs=__webpack_require__(31);var NODEJS_PATH=__webpack_require__(32);NODEFS.staticInit()}___buildEnvironment(ENV);Module["requestFullScreen"]=function Module_requestFullScreen(lockPointer,resizeCanvas,vrDevice){Browser.requestFullScreen(lockPointer,resizeCanvas,vrDevice)};Module["requestAnimationFrame"]=function Module_requestAnimationFrame(func){Browser.requestAnimationFrame(func)};Module["setCanvasSize"]=function Module_setCanvasSize(width,height,noUpdates){Browser.setCanvasSize(width,height,noUpdates)};Module["pauseMainLoop"]=function Module_pauseMainLoop(){Browser.mainLoop.pause()};Module["resumeMainLoop"]=function Module_resumeMainLoop(){Browser.mainLoop.resume()};Module["getUserMedia"]=function Module_getUserMedia(){Browser.getUserMedia()};Module["createContext"]=function Module_createContext(canvas,useWebGL,setInModule,webGLContextAttributes){return Browser.createContext(canvas,useWebGL,setInModule,webGLContextAttributes)};STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);assert(DYNAMIC_BASE<TOTAL_MEMORY,"TOTAL_MEMORY not big enough for stack");var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function invoke_viiiii(index,a1,a2,a3,a4,a5){try{Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiidd(index,a1,a2,a3,a4){try{return Module["dynCall_iiidd"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vii(index,a1,a2){try{Module["dynCall_vii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){try{return Module["dynCall_iiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiiiii(index,a1,a2,a3,a4,a5){try{return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6){try{Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_di(index,a1){try{return Module["dynCall_di"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6){try{return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_dddd(index,a1,a2,a3){try{return Module["dynCall_dddd"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7){try{Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9){try{Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_d(index){try{return Module["dynCall_d"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_i(index){try{return Module["dynCall_i"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiddi(index,a1,a2,a3,a4,a5,a6){try{Module["dynCall_viiiddi"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiiii(index,a1,a2,a3,a4){try{return Module["dynCall_iiiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viii(index,a1,a2,a3){try{Module["dynCall_viii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_v(index){try{Module["dynCall_v"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiii(index,a1,a2,a3,a4){try{Module["dynCall_viiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"invoke_viiiii":invoke_viiiii,"invoke_vi":invoke_vi,"invoke_iiidd":invoke_iiidd,"invoke_vii":invoke_vii,"invoke_iiiiiiiiiii":invoke_iiiiiiiiiii,"invoke_ii":invoke_ii,"invoke_iiiiii":invoke_iiiiii,"invoke_iiii":invoke_iiii,"invoke_viiiiii":invoke_viiiiii,"invoke_di":invoke_di,"invoke_iiiiiii":invoke_iiiiiii,"invoke_dddd":invoke_dddd,"invoke_viiiiiii":invoke_viiiiiii,"invoke_viiiiiiiii":invoke_viiiiiiiii,"invoke_iii":invoke_iii,"invoke_d":invoke_d,"invoke_i":invoke_i,"invoke_viiiddi":invoke_viiiddi,"invoke_iiiii":invoke_iiiii,"invoke_viii":invoke_viii,"invoke_v":invoke_v,"invoke_viiii":invoke_viiii,"_pthread_cleanup_pop":_pthread_cleanup_pop,"_fabs":_fabs,"_sin":_sin,"_exp":_exp,"_llvm_pow_f64":_llvm_pow_f64,"___syscall265":___syscall265,"___syscall146":___syscall146,"_abort":_abort,"_llvm_fabs_f64":_llvm_fabs_f64,"_atan2":_atan2,"_emscripten_set_main_loop_timing":_emscripten_set_main_loop_timing,"___syscall20":___syscall20,"___assert_fail":___assert_fail,"_floor":_floor,"_asin":_asin,"___buildEnvironment":___buildEnvironment,"_longjmp":_longjmp,"_cos":_cos,"_times":_times,"___setErrNo":___setErrNo,"_sbrk":_sbrk,"___syscall192":___syscall192,"___syscall197":___syscall197,"___syscall195":___syscall195,"_sysconf":_sysconf,"_ceil":_ceil,"___syscall221":___syscall221,"_emscripten_memcpy_big":_emscripten_memcpy_big,"___syscall91":___syscall91,"_atanf":_atanf,"_atan":_atan,"_pthread_self":_pthread_self,"_acos":_acos,"_getenv":_getenv,"_sqrt":_sqrt,"___syscall33":___syscall33,"___syscall54":___syscall54,"___unlock":___unlock,"_emscripten_set_main_loop":_emscripten_set_main_loop,"___syscall10":___syscall10,"___syscall5":___syscall5,"_tan":_tan,"__exit":__exit,"___lock":___lock,"___syscall6":___syscall6,"_pthread_cleanup_push":_pthread_cleanup_push,"_setenv":_setenv,"_time":_time,"_emscripten_longjmp":_emscripten_longjmp,"_abs":_abs,"___syscall140":___syscall140,"_exit":_exit,"___syscall145":___syscall145,"_emscripten_asm_const_1":_emscripten_asm_const_1,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"cttz_i8":cttz_i8};// EMSCRIPTEN_START_ASM
	var asm=(function(global,env,buffer) {
	"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=0;var o=0;var p=0;var q=0;var r=global.NaN,s=global.Infinity;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=global.Math.min;var aa=global.Math.clz32;var ba=env.abort;var ca=env.assert;var da=env.invoke_viiiii;var ea=env.invoke_vi;var fa=env.invoke_iiidd;var ga=env.invoke_vii;var ha=env.invoke_iiiiiiiiiii;var ia=env.invoke_ii;var ja=env.invoke_iiiiii;var ka=env.invoke_iiii;var la=env.invoke_viiiiii;var ma=env.invoke_di;var na=env.invoke_iiiiiii;var oa=env.invoke_dddd;var pa=env.invoke_viiiiiii;var qa=env.invoke_viiiiiiiii;var ra=env.invoke_iii;var sa=env.invoke_d;var ta=env.invoke_i;var ua=env.invoke_viiiddi;var va=env.invoke_iiiii;var wa=env.invoke_viii;var xa=env.invoke_v;var ya=env.invoke_viiii;var za=env._pthread_cleanup_pop;var Aa=env._fabs;var Ba=env._sin;var Ca=env._exp;var Da=env._llvm_pow_f64;var Ea=env.___syscall265;var Fa=env.___syscall146;var Ga=env._abort;var Ha=env._llvm_fabs_f64;var Ia=env._atan2;var Ja=env._emscripten_set_main_loop_timing;var Ka=env.___syscall20;var La=env.___assert_fail;var Ma=env._floor;var Na=env._asin;var Oa=env.___buildEnvironment;var Pa=env._longjmp;var Qa=env._cos;var Ra=env._times;var Sa=env.___setErrNo;var Ta=env._sbrk;var Ua=env.___syscall192;var Va=env.___syscall197;var Wa=env.___syscall195;var Xa=env._sysconf;var Ya=env._ceil;var Za=env.___syscall221;var _a=env._emscripten_memcpy_big;var $a=env.___syscall91;var ab=env._atanf;var bb=env._atan;var cb=env._pthread_self;var db=env._acos;var eb=env._getenv;var fb=env._sqrt;var gb=env.___syscall33;var hb=env.___syscall54;var ib=env.___unlock;var jb=env._emscripten_set_main_loop;var kb=env.___syscall10;var lb=env.___syscall5;var mb=env._tan;var nb=env.__exit;var ob=env.___lock;var pb=env.___syscall6;var qb=env._pthread_cleanup_push;var rb=env._setenv;var sb=env._time;var tb=env._emscripten_longjmp;var ub=env._abs;var vb=env.___syscall140;var wb=env._exit;var xb=env.___syscall145;var yb=env._emscripten_asm_const_1;var zb=0.0;
	// EMSCRIPTEN_START_FUNCS
	function N4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0;do if(a>>>0<245){b=a>>>0<11?16:a+11&-8;d=b>>>3;e=c[24988]|0;f=e>>>d;if(f&3){g=(f&1^1)+d|0;h=99992+(g<<1<<2)|0;i=h+8|0;j=c[i>>2]|0;k=j+8|0;l=c[k>>2]|0;do if((h|0)!=(l|0)){if(l>>>0<(c[24992]|0)>>>0)Ga();m=l+12|0;if((c[m>>2]|0)==(j|0)){c[m>>2]=h;c[i>>2]=l;break}else Ga()}else c[24988]=e&~(1<<g);while(0);l=g<<3;c[j+4>>2]=l|3;i=j+l+4|0;c[i>>2]=c[i>>2]|1;n=k;return n|0}i=c[24990]|0;if(b>>>0>i>>>0){if(f){l=2<<d;h=f<<d&(l|0-l);l=(h&0-h)+-1|0;h=l>>>12&16;m=l>>>h;l=m>>>5&8;o=m>>>l;m=o>>>2&4;p=o>>>m;o=p>>>1&2;q=p>>>o;p=q>>>1&1;r=(l|h|m|o|p)+(q>>>p)|0;p=99992+(r<<1<<2)|0;q=p+8|0;o=c[q>>2]|0;m=o+8|0;h=c[m>>2]|0;do if((p|0)!=(h|0)){if(h>>>0<(c[24992]|0)>>>0)Ga();l=h+12|0;if((c[l>>2]|0)==(o|0)){c[l>>2]=p;c[q>>2]=h;s=c[24990]|0;break}else Ga()}else{c[24988]=e&~(1<<r);s=i}while(0);i=(r<<3)-b|0;c[o+4>>2]=b|3;e=o+b|0;c[e+4>>2]=i|1;c[e+i>>2]=i;if(s){h=c[24993]|0;q=s>>>3;p=99992+(q<<1<<2)|0;d=c[24988]|0;f=1<<q;if(d&f){q=p+8|0;k=c[q>>2]|0;if(k>>>0<(c[24992]|0)>>>0)Ga();else{t=q;u=k}}else{c[24988]=d|f;t=p+8|0;u=p}c[t>>2]=h;c[u+12>>2]=h;c[h+8>>2]=u;c[h+12>>2]=p}c[24990]=i;c[24993]=e;n=m;return n|0}e=c[24989]|0;if(e){i=(e&0-e)+-1|0;e=i>>>12&16;p=i>>>e;i=p>>>5&8;h=p>>>i;p=h>>>2&4;f=h>>>p;h=f>>>1&2;d=f>>>h;f=d>>>1&1;k=c[100256+((i|e|p|h|f)+(d>>>f)<<2)>>2]|0;f=(c[k+4>>2]&-8)-b|0;d=k;h=k;while(1){k=c[d+16>>2]|0;if(!k){p=c[d+20>>2]|0;if(!p){v=f;w=h;break}else x=p}else x=k;k=(c[x+4>>2]&-8)-b|0;p=k>>>0<f>>>0;f=p?k:f;d=x;h=p?x:h}h=c[24992]|0;if(w>>>0<h>>>0)Ga();d=w+b|0;if(w>>>0>=d>>>0)Ga();f=c[w+24>>2]|0;m=c[w+12>>2]|0;do if((m|0)==(w|0)){o=w+20|0;r=c[o>>2]|0;if(!r){p=w+16|0;k=c[p>>2]|0;if(!k){y=0;break}else{z=k;A=p}}else{z=r;A=o}while(1){o=z+20|0;r=c[o>>2]|0;if(r){z=r;A=o;continue}o=z+16|0;r=c[o>>2]|0;if(!r){B=z;C=A;break}else{z=r;A=o}}if(C>>>0<h>>>0)Ga();else{c[C>>2]=0;y=B;break}}else{o=c[w+8>>2]|0;if(o>>>0<h>>>0)Ga();r=o+12|0;if((c[r>>2]|0)!=(w|0))Ga();p=m+8|0;if((c[p>>2]|0)==(w|0)){c[r>>2]=m;c[p>>2]=o;y=m;break}else Ga()}while(0);do if(f){m=c[w+28>>2]|0;h=100256+(m<<2)|0;if((w|0)==(c[h>>2]|0)){c[h>>2]=y;if(!y){c[24989]=c[24989]&~(1<<m);break}}else{if(f>>>0<(c[24992]|0)>>>0)Ga();m=f+16|0;if((c[m>>2]|0)==(w|0))c[m>>2]=y;else c[f+20>>2]=y;if(!y)break}m=c[24992]|0;if(y>>>0<m>>>0)Ga();c[y+24>>2]=f;h=c[w+16>>2]|0;do if(h)if(h>>>0<m>>>0)Ga();else{c[y+16>>2]=h;c[h+24>>2]=y;break}while(0);h=c[w+20>>2]|0;if(h)if(h>>>0<(c[24992]|0)>>>0)Ga();else{c[y+20>>2]=h;c[h+24>>2]=y;break}}while(0);if(v>>>0<16){f=v+b|0;c[w+4>>2]=f|3;h=w+f+4|0;c[h>>2]=c[h>>2]|1}else{c[w+4>>2]=b|3;c[d+4>>2]=v|1;c[d+v>>2]=v;h=c[24990]|0;if(h){f=c[24993]|0;m=h>>>3;h=99992+(m<<1<<2)|0;o=c[24988]|0;p=1<<m;if(o&p){m=h+8|0;r=c[m>>2]|0;if(r>>>0<(c[24992]|0)>>>0)Ga();else{D=m;E=r}}else{c[24988]=o|p;D=h+8|0;E=h}c[D>>2]=f;c[E+12>>2]=f;c[f+8>>2]=E;c[f+12>>2]=h}c[24990]=v;c[24993]=d}n=w+8|0;return n|0}else F=b}else F=b}else if(a>>>0<=4294967231){h=a+11|0;f=h&-8;p=c[24989]|0;if(p){o=0-f|0;r=h>>>8;if(r)if(f>>>0>16777215)G=31;else{h=(r+1048320|0)>>>16&8;m=r<<h;r=(m+520192|0)>>>16&4;k=m<<r;m=(k+245760|0)>>>16&2;e=14-(r|h|m)+(k<<m>>>15)|0;G=f>>>(e+7|0)&1|e<<1}else G=0;e=c[100256+(G<<2)>>2]|0;a:do if(!e){H=o;I=0;J=0;K=86}else{m=o;k=0;h=f<<((G|0)==31?0:25-(G>>>1)|0);r=e;i=0;while(1){q=c[r+4>>2]&-8;j=q-f|0;if(j>>>0<m>>>0)if((q|0)==(f|0)){L=j;M=r;N=r;K=90;break a}else{O=j;P=r}else{O=m;P=i}j=c[r+20>>2]|0;r=c[r+16+(h>>>31<<2)>>2]|0;q=(j|0)==0|(j|0)==(r|0)?k:j;j=(r|0)==0;if(j){H=O;I=q;J=P;K=86;break}else{m=O;k=q;h=h<<(j&1^1);i=P}}}while(0);if((K|0)==86){if((I|0)==0&(J|0)==0){e=2<<G;o=p&(e|0-e);if(!o){F=f;break}e=(o&0-o)+-1|0;o=e>>>12&16;b=e>>>o;e=b>>>5&8;d=b>>>e;b=d>>>2&4;i=d>>>b;d=i>>>1&2;h=i>>>d;i=h>>>1&1;Q=c[100256+((e|o|b|d|i)+(h>>>i)<<2)>>2]|0}else Q=I;if(!Q){R=H;S=J}else{L=H;M=Q;N=J;K=90}}if((K|0)==90)while(1){K=0;i=(c[M+4>>2]&-8)-f|0;h=i>>>0<L>>>0;d=h?i:L;i=h?M:N;h=c[M+16>>2]|0;if(h){L=d;M=h;N=i;K=90;continue}M=c[M+20>>2]|0;if(!M){R=d;S=i;break}else{L=d;N=i;K=90}}if((S|0)!=0?R>>>0<((c[24990]|0)-f|0)>>>0:0){p=c[24992]|0;if(S>>>0<p>>>0)Ga();i=S+f|0;if(S>>>0>=i>>>0)Ga();d=c[S+24>>2]|0;h=c[S+12>>2]|0;do if((h|0)==(S|0)){b=S+20|0;o=c[b>>2]|0;if(!o){e=S+16|0;k=c[e>>2]|0;if(!k){T=0;break}else{U=k;V=e}}else{U=o;V=b}while(1){b=U+20|0;o=c[b>>2]|0;if(o){U=o;V=b;continue}b=U+16|0;o=c[b>>2]|0;if(!o){W=U;X=V;break}else{U=o;V=b}}if(X>>>0<p>>>0)Ga();else{c[X>>2]=0;T=W;break}}else{b=c[S+8>>2]|0;if(b>>>0<p>>>0)Ga();o=b+12|0;if((c[o>>2]|0)!=(S|0))Ga();e=h+8|0;if((c[e>>2]|0)==(S|0)){c[o>>2]=h;c[e>>2]=b;T=h;break}else Ga()}while(0);do if(d){h=c[S+28>>2]|0;p=100256+(h<<2)|0;if((S|0)==(c[p>>2]|0)){c[p>>2]=T;if(!T){c[24989]=c[24989]&~(1<<h);break}}else{if(d>>>0<(c[24992]|0)>>>0)Ga();h=d+16|0;if((c[h>>2]|0)==(S|0))c[h>>2]=T;else c[d+20>>2]=T;if(!T)break}h=c[24992]|0;if(T>>>0<h>>>0)Ga();c[T+24>>2]=d;p=c[S+16>>2]|0;do if(p)if(p>>>0<h>>>0)Ga();else{c[T+16>>2]=p;c[p+24>>2]=T;break}while(0);p=c[S+20>>2]|0;if(p)if(p>>>0<(c[24992]|0)>>>0)Ga();else{c[T+20>>2]=p;c[p+24>>2]=T;break}}while(0);do if(R>>>0>=16){c[S+4>>2]=f|3;c[i+4>>2]=R|1;c[i+R>>2]=R;d=R>>>3;if(R>>>0<256){p=99992+(d<<1<<2)|0;h=c[24988]|0;b=1<<d;if(h&b){d=p+8|0;e=c[d>>2]|0;if(e>>>0<(c[24992]|0)>>>0)Ga();else{Y=d;Z=e}}else{c[24988]=h|b;Y=p+8|0;Z=p}c[Y>>2]=i;c[Z+12>>2]=i;c[i+8>>2]=Z;c[i+12>>2]=p;break}p=R>>>8;if(p)if(R>>>0>16777215)_=31;else{b=(p+1048320|0)>>>16&8;h=p<<b;p=(h+520192|0)>>>16&4;e=h<<p;h=(e+245760|0)>>>16&2;d=14-(p|b|h)+(e<<h>>>15)|0;_=R>>>(d+7|0)&1|d<<1}else _=0;d=100256+(_<<2)|0;c[i+28>>2]=_;h=i+16|0;c[h+4>>2]=0;c[h>>2]=0;h=c[24989]|0;e=1<<_;if(!(h&e)){c[24989]=h|e;c[d>>2]=i;c[i+24>>2]=d;c[i+12>>2]=i;c[i+8>>2]=i;break}e=R<<((_|0)==31?0:25-(_>>>1)|0);h=c[d>>2]|0;while(1){if((c[h+4>>2]&-8|0)==(R|0)){$=h;K=148;break}d=h+16+(e>>>31<<2)|0;b=c[d>>2]|0;if(!b){aa=d;ba=h;K=145;break}else{e=e<<1;h=b}}if((K|0)==145)if(aa>>>0<(c[24992]|0)>>>0)Ga();else{c[aa>>2]=i;c[i+24>>2]=ba;c[i+12>>2]=i;c[i+8>>2]=i;break}else if((K|0)==148){h=$+8|0;e=c[h>>2]|0;b=c[24992]|0;if(e>>>0>=b>>>0&$>>>0>=b>>>0){c[e+12>>2]=i;c[h>>2]=i;c[i+8>>2]=e;c[i+12>>2]=$;c[i+24>>2]=0;break}else Ga()}}else{e=R+f|0;c[S+4>>2]=e|3;h=S+e+4|0;c[h>>2]=c[h>>2]|1}while(0);n=S+8|0;return n|0}else F=f}else F=f}else F=-1;while(0);S=c[24990]|0;if(S>>>0>=F>>>0){R=S-F|0;$=c[24993]|0;if(R>>>0>15){ba=$+F|0;c[24993]=ba;c[24990]=R;c[ba+4>>2]=R|1;c[ba+R>>2]=R;c[$+4>>2]=F|3}else{c[24990]=0;c[24993]=0;c[$+4>>2]=S|3;R=$+S+4|0;c[R>>2]=c[R>>2]|1}n=$+8|0;return n|0}$=c[24991]|0;if($>>>0>F>>>0){R=$-F|0;c[24991]=R;$=c[24994]|0;S=$+F|0;c[24994]=S;c[S+4>>2]=R|1;c[$+4>>2]=F|3;n=$+8|0;return n|0}do if(!(c[25106]|0)){$=Xa(30)|0;if(!($+-1&$)){c[25108]=$;c[25107]=$;c[25109]=-1;c[25110]=-1;c[25111]=0;c[25099]=0;c[25106]=(sb(0)|0)&-16^1431655768;break}else Ga()}while(0);$=F+48|0;R=c[25108]|0;S=F+47|0;ba=R+S|0;aa=0-R|0;R=ba&aa;if(R>>>0<=F>>>0){n=0;return n|0}_=c[25098]|0;if((_|0)!=0?(Z=c[25096]|0,Y=Z+R|0,Y>>>0<=Z>>>0|Y>>>0>_>>>0):0){n=0;return n|0}b:do if(!(c[25099]&4)){_=c[24994]|0;c:do if(_){Y=100400;while(1){Z=c[Y>>2]|0;if(Z>>>0<=_>>>0?(T=Y+4|0,(Z+(c[T>>2]|0)|0)>>>0>_>>>0):0){ca=Y;da=T;break}Y=c[Y+8>>2]|0;if(!Y){K=173;break c}}Y=ba-(c[24991]|0)&aa;if(Y>>>0<2147483647){T=Ta(Y|0)|0;if((T|0)==((c[ca>>2]|0)+(c[da>>2]|0)|0)){if((T|0)!=(-1|0)){ea=T;fa=Y;K=193;break b}}else{ga=T;ha=Y;K=183}}}else K=173;while(0);do if((K|0)==173?(_=Ta(0)|0,(_|0)!=(-1|0)):0){f=_;Y=c[25107]|0;T=Y+-1|0;if(!(T&f))ia=R;else ia=R-f+(T+f&0-Y)|0;Y=c[25096]|0;f=Y+ia|0;if(ia>>>0>F>>>0&ia>>>0<2147483647){T=c[25098]|0;if((T|0)!=0?f>>>0<=Y>>>0|f>>>0>T>>>0:0)break;T=Ta(ia|0)|0;if((T|0)==(_|0)){ea=_;fa=ia;K=193;break b}else{ga=T;ha=ia;K=183}}}while(0);d:do if((K|0)==183){T=0-ha|0;do if($>>>0>ha>>>0&(ha>>>0<2147483647&(ga|0)!=(-1|0))?(_=c[25108]|0,f=S-ha+_&0-_,f>>>0<2147483647):0)if((Ta(f|0)|0)==(-1|0)){Ta(T|0)|0;break d}else{ja=f+ha|0;break}else ja=ha;while(0);if((ga|0)!=(-1|0)){ea=ga;fa=ja;K=193;break b}}while(0);c[25099]=c[25099]|4;K=190}else K=190;while(0);if((((K|0)==190?R>>>0<2147483647:0)?(ja=Ta(R|0)|0,R=Ta(0)|0,ja>>>0<R>>>0&((ja|0)!=(-1|0)&(R|0)!=(-1|0))):0)?(ga=R-ja|0,ga>>>0>(F+40|0)>>>0):0){ea=ja;fa=ga;K=193}if((K|0)==193){ga=(c[25096]|0)+fa|0;c[25096]=ga;if(ga>>>0>(c[25097]|0)>>>0)c[25097]=ga;ga=c[24994]|0;do if(ga){ja=100400;do{R=c[ja>>2]|0;ha=ja+4|0;S=c[ha>>2]|0;if((ea|0)==(R+S|0)){ka=R;la=ha;ma=S;na=ja;K=203;break}ja=c[ja+8>>2]|0}while((ja|0)!=0);if(((K|0)==203?(c[na+12>>2]&8|0)==0:0)?ga>>>0<ea>>>0&ga>>>0>=ka>>>0:0){c[la>>2]=ma+fa;ja=ga+8|0;S=(ja&7|0)==0?0:0-ja&7;ja=ga+S|0;ha=fa-S+(c[24991]|0)|0;c[24994]=ja;c[24991]=ha;c[ja+4>>2]=ha|1;c[ja+ha+4>>2]=40;c[24995]=c[25110];break}ha=c[24992]|0;if(ea>>>0<ha>>>0){c[24992]=ea;oa=ea}else oa=ha;ha=ea+fa|0;ja=100400;while(1){if((c[ja>>2]|0)==(ha|0)){pa=ja;qa=ja;K=211;break}ja=c[ja+8>>2]|0;if(!ja){ra=100400;break}}if((K|0)==211)if(!(c[qa+12>>2]&8)){c[pa>>2]=ea;ja=qa+4|0;c[ja>>2]=(c[ja>>2]|0)+fa;ja=ea+8|0;S=ea+((ja&7|0)==0?0:0-ja&7)|0;ja=ha+8|0;R=ha+((ja&7|0)==0?0:0-ja&7)|0;ja=S+F|0;$=R-S-F|0;c[S+4>>2]=F|3;do if((R|0)!=(ga|0)){if((R|0)==(c[24993]|0)){ia=(c[24990]|0)+$|0;c[24990]=ia;c[24993]=ja;c[ja+4>>2]=ia|1;c[ja+ia>>2]=ia;break}ia=c[R+4>>2]|0;if((ia&3|0)==1){da=ia&-8;ca=ia>>>3;e:do if(ia>>>0>=256){aa=c[R+24>>2]|0;ba=c[R+12>>2]|0;do if((ba|0)==(R|0)){T=R+16|0;f=T+4|0;_=c[f>>2]|0;if(!_){Y=c[T>>2]|0;if(!Y){sa=0;break}else{ta=Y;ua=T}}else{ta=_;ua=f}while(1){f=ta+20|0;_=c[f>>2]|0;if(_){ta=_;ua=f;continue}f=ta+16|0;_=c[f>>2]|0;if(!_){va=ta;wa=ua;break}else{ta=_;ua=f}}if(wa>>>0<oa>>>0)Ga();else{c[wa>>2]=0;sa=va;break}}else{f=c[R+8>>2]|0;if(f>>>0<oa>>>0)Ga();_=f+12|0;if((c[_>>2]|0)!=(R|0))Ga();T=ba+8|0;if((c[T>>2]|0)==(R|0)){c[_>>2]=ba;c[T>>2]=f;sa=ba;break}else Ga()}while(0);if(!aa)break;ba=c[R+28>>2]|0;f=100256+(ba<<2)|0;do if((R|0)!=(c[f>>2]|0)){if(aa>>>0<(c[24992]|0)>>>0)Ga();T=aa+16|0;if((c[T>>2]|0)==(R|0))c[T>>2]=sa;else c[aa+20>>2]=sa;if(!sa)break e}else{c[f>>2]=sa;if(sa)break;c[24989]=c[24989]&~(1<<ba);break e}while(0);ba=c[24992]|0;if(sa>>>0<ba>>>0)Ga();c[sa+24>>2]=aa;f=R+16|0;T=c[f>>2]|0;do if(T)if(T>>>0<ba>>>0)Ga();else{c[sa+16>>2]=T;c[T+24>>2]=sa;break}while(0);T=c[f+4>>2]|0;if(!T)break;if(T>>>0<(c[24992]|0)>>>0)Ga();else{c[sa+20>>2]=T;c[T+24>>2]=sa;break}}else{T=c[R+8>>2]|0;ba=c[R+12>>2]|0;aa=99992+(ca<<1<<2)|0;do if((T|0)!=(aa|0)){if(T>>>0<oa>>>0)Ga();if((c[T+12>>2]|0)==(R|0))break;Ga()}while(0);if((ba|0)==(T|0)){c[24988]=c[24988]&~(1<<ca);break}do if((ba|0)==(aa|0))xa=ba+8|0;else{if(ba>>>0<oa>>>0)Ga();f=ba+8|0;if((c[f>>2]|0)==(R|0)){xa=f;break}Ga()}while(0);c[T+12>>2]=ba;c[xa>>2]=T}while(0);ya=R+da|0;za=da+$|0}else{ya=R;za=$}ca=ya+4|0;c[ca>>2]=c[ca>>2]&-2;c[ja+4>>2]=za|1;c[ja+za>>2]=za;ca=za>>>3;if(za>>>0<256){ia=99992+(ca<<1<<2)|0;aa=c[24988]|0;f=1<<ca;do if(!(aa&f)){c[24988]=aa|f;Aa=ia+8|0;Ba=ia}else{ca=ia+8|0;_=c[ca>>2]|0;if(_>>>0>=(c[24992]|0)>>>0){Aa=ca;Ba=_;break}Ga()}while(0);c[Aa>>2]=ja;c[Ba+12>>2]=ja;c[ja+8>>2]=Ba;c[ja+12>>2]=ia;break}f=za>>>8;do if(!f)Ca=0;else{if(za>>>0>16777215){Ca=31;break}aa=(f+1048320|0)>>>16&8;da=f<<aa;_=(da+520192|0)>>>16&4;ca=da<<_;da=(ca+245760|0)>>>16&2;Y=14-(_|aa|da)+(ca<<da>>>15)|0;Ca=za>>>(Y+7|0)&1|Y<<1}while(0);f=100256+(Ca<<2)|0;c[ja+28>>2]=Ca;ia=ja+16|0;c[ia+4>>2]=0;c[ia>>2]=0;ia=c[24989]|0;Y=1<<Ca;if(!(ia&Y)){c[24989]=ia|Y;c[f>>2]=ja;c[ja+24>>2]=f;c[ja+12>>2]=ja;c[ja+8>>2]=ja;break}Y=za<<((Ca|0)==31?0:25-(Ca>>>1)|0);ia=c[f>>2]|0;while(1){if((c[ia+4>>2]&-8|0)==(za|0)){Da=ia;K=281;break}f=ia+16+(Y>>>31<<2)|0;da=c[f>>2]|0;if(!da){Ea=f;Fa=ia;K=278;break}else{Y=Y<<1;ia=da}}if((K|0)==278)if(Ea>>>0<(c[24992]|0)>>>0)Ga();else{c[Ea>>2]=ja;c[ja+24>>2]=Fa;c[ja+12>>2]=ja;c[ja+8>>2]=ja;break}else if((K|0)==281){ia=Da+8|0;Y=c[ia>>2]|0;da=c[24992]|0;if(Y>>>0>=da>>>0&Da>>>0>=da>>>0){c[Y+12>>2]=ja;c[ia>>2]=ja;c[ja+8>>2]=Y;c[ja+12>>2]=Da;c[ja+24>>2]=0;break}else Ga()}}else{Y=(c[24991]|0)+$|0;c[24991]=Y;c[24994]=ja;c[ja+4>>2]=Y|1}while(0);n=S+8|0;return n|0}else ra=100400;while(1){ja=c[ra>>2]|0;if(ja>>>0<=ga>>>0?($=ja+(c[ra+4>>2]|0)|0,$>>>0>ga>>>0):0){Ha=$;break}ra=c[ra+8>>2]|0}S=Ha+-47|0;$=S+8|0;ja=S+(($&7|0)==0?0:0-$&7)|0;$=ga+16|0;S=ja>>>0<$>>>0?ga:ja;ja=S+8|0;R=ea+8|0;ha=(R&7|0)==0?0:0-R&7;R=ea+ha|0;Y=fa+-40-ha|0;c[24994]=R;c[24991]=Y;c[R+4>>2]=Y|1;c[R+Y+4>>2]=40;c[24995]=c[25110];Y=S+4|0;c[Y>>2]=27;c[ja>>2]=c[25100];c[ja+4>>2]=c[25101];c[ja+8>>2]=c[25102];c[ja+12>>2]=c[25103];c[25100]=ea;c[25101]=fa;c[25103]=0;c[25102]=ja;ja=S+24|0;do{ja=ja+4|0;c[ja>>2]=7}while((ja+4|0)>>>0<Ha>>>0);if((S|0)!=(ga|0)){ja=S-ga|0;c[Y>>2]=c[Y>>2]&-2;c[ga+4>>2]=ja|1;c[S>>2]=ja;R=ja>>>3;if(ja>>>0<256){ha=99992+(R<<1<<2)|0;ia=c[24988]|0;da=1<<R;if(ia&da){R=ha+8|0;f=c[R>>2]|0;if(f>>>0<(c[24992]|0)>>>0)Ga();else{Ia=R;Ja=f}}else{c[24988]=ia|da;Ia=ha+8|0;Ja=ha}c[Ia>>2]=ga;c[Ja+12>>2]=ga;c[ga+8>>2]=Ja;c[ga+12>>2]=ha;break}ha=ja>>>8;if(ha)if(ja>>>0>16777215)Ka=31;else{da=(ha+1048320|0)>>>16&8;ia=ha<<da;ha=(ia+520192|0)>>>16&4;f=ia<<ha;ia=(f+245760|0)>>>16&2;R=14-(ha|da|ia)+(f<<ia>>>15)|0;Ka=ja>>>(R+7|0)&1|R<<1}else Ka=0;R=100256+(Ka<<2)|0;c[ga+28>>2]=Ka;c[ga+20>>2]=0;c[$>>2]=0;ia=c[24989]|0;f=1<<Ka;if(!(ia&f)){c[24989]=ia|f;c[R>>2]=ga;c[ga+24>>2]=R;c[ga+12>>2]=ga;c[ga+8>>2]=ga;break}f=ja<<((Ka|0)==31?0:25-(Ka>>>1)|0);ia=c[R>>2]|0;while(1){if((c[ia+4>>2]&-8|0)==(ja|0)){La=ia;K=307;break}R=ia+16+(f>>>31<<2)|0;da=c[R>>2]|0;if(!da){Ma=R;Na=ia;K=304;break}else{f=f<<1;ia=da}}if((K|0)==304)if(Ma>>>0<(c[24992]|0)>>>0)Ga();else{c[Ma>>2]=ga;c[ga+24>>2]=Na;c[ga+12>>2]=ga;c[ga+8>>2]=ga;break}else if((K|0)==307){ia=La+8|0;f=c[ia>>2]|0;ja=c[24992]|0;if(f>>>0>=ja>>>0&La>>>0>=ja>>>0){c[f+12>>2]=ga;c[ia>>2]=ga;c[ga+8>>2]=f;c[ga+12>>2]=La;c[ga+24>>2]=0;break}else Ga()}}}else{f=c[24992]|0;if((f|0)==0|ea>>>0<f>>>0)c[24992]=ea;c[25100]=ea;c[25101]=fa;c[25103]=0;c[24997]=c[25106];c[24996]=-1;f=0;do{ia=99992+(f<<1<<2)|0;c[ia+12>>2]=ia;c[ia+8>>2]=ia;f=f+1|0}while((f|0)!=32);f=ea+8|0;ia=(f&7|0)==0?0:0-f&7;f=ea+ia|0;ja=fa+-40-ia|0;c[24994]=f;c[24991]=ja;c[f+4>>2]=ja|1;c[f+ja+4>>2]=40;c[24995]=c[25110]}while(0);fa=c[24991]|0;if(fa>>>0>F>>>0){ea=fa-F|0;c[24991]=ea;fa=c[24994]|0;ga=fa+F|0;c[24994]=ga;c[ga+4>>2]=ea|1;c[fa+4>>2]=F|3;n=fa+8|0;return n|0}}c[(L1()|0)>>2]=12;n=0;return n|0}function O4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;if(!a)return;b=a+-8|0;d=c[24992]|0;if(b>>>0<d>>>0)Ga();e=c[a+-4>>2]|0;a=e&3;if((a|0)==1)Ga();f=e&-8;g=b+f|0;do if(!(e&1)){h=c[b>>2]|0;if(!a)return;i=b+(0-h)|0;j=h+f|0;if(i>>>0<d>>>0)Ga();if((i|0)==(c[24993]|0)){k=g+4|0;l=c[k>>2]|0;if((l&3|0)!=3){m=i;n=j;break}c[24990]=j;c[k>>2]=l&-2;c[i+4>>2]=j|1;c[i+j>>2]=j;return}l=h>>>3;if(h>>>0<256){h=c[i+8>>2]|0;k=c[i+12>>2]|0;o=99992+(l<<1<<2)|0;if((h|0)!=(o|0)){if(h>>>0<d>>>0)Ga();if((c[h+12>>2]|0)!=(i|0))Ga()}if((k|0)==(h|0)){c[24988]=c[24988]&~(1<<l);m=i;n=j;break}if((k|0)!=(o|0)){if(k>>>0<d>>>0)Ga();o=k+8|0;if((c[o>>2]|0)==(i|0))p=o;else Ga()}else p=k+8|0;c[h+12>>2]=k;c[p>>2]=h;m=i;n=j;break}h=c[i+24>>2]|0;k=c[i+12>>2]|0;do if((k|0)==(i|0)){o=i+16|0;l=o+4|0;q=c[l>>2]|0;if(!q){r=c[o>>2]|0;if(!r){s=0;break}else{t=r;u=o}}else{t=q;u=l}while(1){l=t+20|0;q=c[l>>2]|0;if(q){t=q;u=l;continue}l=t+16|0;q=c[l>>2]|0;if(!q){v=t;w=u;break}else{t=q;u=l}}if(w>>>0<d>>>0)Ga();else{c[w>>2]=0;s=v;break}}else{l=c[i+8>>2]|0;if(l>>>0<d>>>0)Ga();q=l+12|0;if((c[q>>2]|0)!=(i|0))Ga();o=k+8|0;if((c[o>>2]|0)==(i|0)){c[q>>2]=k;c[o>>2]=l;s=k;break}else Ga()}while(0);if(h){k=c[i+28>>2]|0;l=100256+(k<<2)|0;if((i|0)==(c[l>>2]|0)){c[l>>2]=s;if(!s){c[24989]=c[24989]&~(1<<k);m=i;n=j;break}}else{if(h>>>0<(c[24992]|0)>>>0)Ga();k=h+16|0;if((c[k>>2]|0)==(i|0))c[k>>2]=s;else c[h+20>>2]=s;if(!s){m=i;n=j;break}}k=c[24992]|0;if(s>>>0<k>>>0)Ga();c[s+24>>2]=h;l=i+16|0;o=c[l>>2]|0;do if(o)if(o>>>0<k>>>0)Ga();else{c[s+16>>2]=o;c[o+24>>2]=s;break}while(0);o=c[l+4>>2]|0;if(o)if(o>>>0<(c[24992]|0)>>>0)Ga();else{c[s+20>>2]=o;c[o+24>>2]=s;m=i;n=j;break}else{m=i;n=j}}else{m=i;n=j}}else{m=b;n=f}while(0);if(m>>>0>=g>>>0)Ga();f=g+4|0;b=c[f>>2]|0;if(!(b&1))Ga();if(!(b&2)){if((g|0)==(c[24994]|0)){s=(c[24991]|0)+n|0;c[24991]=s;c[24994]=m;c[m+4>>2]=s|1;if((m|0)!=(c[24993]|0))return;c[24993]=0;c[24990]=0;return}if((g|0)==(c[24993]|0)){s=(c[24990]|0)+n|0;c[24990]=s;c[24993]=m;c[m+4>>2]=s|1;c[m+s>>2]=s;return}s=(b&-8)+n|0;d=b>>>3;do if(b>>>0>=256){v=c[g+24>>2]|0;w=c[g+12>>2]|0;do if((w|0)==(g|0)){u=g+16|0;t=u+4|0;p=c[t>>2]|0;if(!p){a=c[u>>2]|0;if(!a){x=0;break}else{y=a;z=u}}else{y=p;z=t}while(1){t=y+20|0;p=c[t>>2]|0;if(p){y=p;z=t;continue}t=y+16|0;p=c[t>>2]|0;if(!p){A=y;B=z;break}else{y=p;z=t}}if(B>>>0<(c[24992]|0)>>>0)Ga();else{c[B>>2]=0;x=A;break}}else{t=c[g+8>>2]|0;if(t>>>0<(c[24992]|0)>>>0)Ga();p=t+12|0;if((c[p>>2]|0)!=(g|0))Ga();u=w+8|0;if((c[u>>2]|0)==(g|0)){c[p>>2]=w;c[u>>2]=t;x=w;break}else Ga()}while(0);if(v){w=c[g+28>>2]|0;j=100256+(w<<2)|0;if((g|0)==(c[j>>2]|0)){c[j>>2]=x;if(!x){c[24989]=c[24989]&~(1<<w);break}}else{if(v>>>0<(c[24992]|0)>>>0)Ga();w=v+16|0;if((c[w>>2]|0)==(g|0))c[w>>2]=x;else c[v+20>>2]=x;if(!x)break}w=c[24992]|0;if(x>>>0<w>>>0)Ga();c[x+24>>2]=v;j=g+16|0;i=c[j>>2]|0;do if(i)if(i>>>0<w>>>0)Ga();else{c[x+16>>2]=i;c[i+24>>2]=x;break}while(0);i=c[j+4>>2]|0;if(i)if(i>>>0<(c[24992]|0)>>>0)Ga();else{c[x+20>>2]=i;c[i+24>>2]=x;break}}}else{i=c[g+8>>2]|0;w=c[g+12>>2]|0;v=99992+(d<<1<<2)|0;if((i|0)!=(v|0)){if(i>>>0<(c[24992]|0)>>>0)Ga();if((c[i+12>>2]|0)!=(g|0))Ga()}if((w|0)==(i|0)){c[24988]=c[24988]&~(1<<d);break}if((w|0)!=(v|0)){if(w>>>0<(c[24992]|0)>>>0)Ga();v=w+8|0;if((c[v>>2]|0)==(g|0))C=v;else Ga()}else C=w+8|0;c[i+12>>2]=w;c[C>>2]=i}while(0);c[m+4>>2]=s|1;c[m+s>>2]=s;if((m|0)==(c[24993]|0)){c[24990]=s;return}else D=s}else{c[f>>2]=b&-2;c[m+4>>2]=n|1;c[m+n>>2]=n;D=n}n=D>>>3;if(D>>>0<256){b=99992+(n<<1<<2)|0;f=c[24988]|0;s=1<<n;if(f&s){n=b+8|0;C=c[n>>2]|0;if(C>>>0<(c[24992]|0)>>>0)Ga();else{E=n;F=C}}else{c[24988]=f|s;E=b+8|0;F=b}c[E>>2]=m;c[F+12>>2]=m;c[m+8>>2]=F;c[m+12>>2]=b;return}b=D>>>8;if(b)if(D>>>0>16777215)G=31;else{F=(b+1048320|0)>>>16&8;E=b<<F;b=(E+520192|0)>>>16&4;s=E<<b;E=(s+245760|0)>>>16&2;f=14-(b|F|E)+(s<<E>>>15)|0;G=D>>>(f+7|0)&1|f<<1}else G=0;f=100256+(G<<2)|0;c[m+28>>2]=G;c[m+20>>2]=0;c[m+16>>2]=0;E=c[24989]|0;s=1<<G;do if(E&s){F=D<<((G|0)==31?0:25-(G>>>1)|0);b=c[f>>2]|0;while(1){if((c[b+4>>2]&-8|0)==(D|0)){H=b;I=130;break}C=b+16+(F>>>31<<2)|0;n=c[C>>2]|0;if(!n){J=C;K=b;I=127;break}else{F=F<<1;b=n}}if((I|0)==127)if(J>>>0<(c[24992]|0)>>>0)Ga();else{c[J>>2]=m;c[m+24>>2]=K;c[m+12>>2]=m;c[m+8>>2]=m;break}else if((I|0)==130){b=H+8|0;F=c[b>>2]|0;j=c[24992]|0;if(F>>>0>=j>>>0&H>>>0>=j>>>0){c[F+12>>2]=m;c[b>>2]=m;c[m+8>>2]=F;c[m+12>>2]=H;c[m+24>>2]=0;break}else Ga()}}else{c[24989]=E|s;c[f>>2]=m;c[m+24>>2]=f;c[m+12>>2]=m;c[m+8>>2]=m}while(0);m=(c[24996]|0)+-1|0;c[24996]=m;if(!m)L=100408;else return;while(1){m=c[L>>2]|0;if(!m)break;else L=m+8|0}c[24996]=-1;return}function P4(a,b){a=a|0;b=b|0;var d=0,e=0;if(a){d=_(b,a)|0;if((b|a)>>>0>65535)e=((d>>>0)/(a>>>0)|0|0)==(b|0)?d:-1;else e=d}else e=0;d=N4(e)|0;if(!d)return d|0;if(!(c[d+-4>>2]&3))return d|0;$4(d|0,0,e|0)|0;return d|0}function Q4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if(!a){d=N4(b)|0;return d|0}if(b>>>0>4294967231){c[(L1()|0)>>2]=12;d=0;return d|0}e=R4(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(e){d=e+8|0;return d|0}e=N4(b)|0;if(!e){d=0;return d|0}f=c[a+-4>>2]|0;g=(f&-8)-((f&3|0)==0?8:4)|0;Z4(e|0,a|0,(g>>>0<b>>>0?g:b)|0)|0;O4(a);d=e;return d|0}function R4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a+f|0;h=c[24992]|0;i=e&3;if(!((i|0)!=1&a>>>0>=h>>>0&a>>>0<g>>>0))Ga();j=c[g+4>>2]|0;if(!(j&1))Ga();if(!i){if(b>>>0<256){k=0;return k|0}if(f>>>0>=(b+4|0)>>>0?(f-b|0)>>>0<=c[25108]<<1>>>0:0){k=a;return k|0}k=0;return k|0}if(f>>>0>=b>>>0){i=f-b|0;if(i>>>0<=15){k=a;return k|0}l=a+b|0;c[d>>2]=e&1|b|2;c[l+4>>2]=i|3;m=l+i+4|0;c[m>>2]=c[m>>2]|1;S4(l,i);k=a;return k|0}if((g|0)==(c[24994]|0)){i=(c[24991]|0)+f|0;if(i>>>0<=b>>>0){k=0;return k|0}l=i-b|0;i=a+b|0;c[d>>2]=e&1|b|2;c[i+4>>2]=l|1;c[24994]=i;c[24991]=l;k=a;return k|0}if((g|0)==(c[24993]|0)){l=(c[24990]|0)+f|0;if(l>>>0<b>>>0){k=0;return k|0}i=l-b|0;if(i>>>0>15){m=a+b|0;n=m+i|0;c[d>>2]=e&1|b|2;c[m+4>>2]=i|1;c[n>>2]=i;o=n+4|0;c[o>>2]=c[o>>2]&-2;p=m;q=i}else{c[d>>2]=e&1|l|2;i=a+l+4|0;c[i>>2]=c[i>>2]|1;p=0;q=0}c[24990]=q;c[24993]=p;k=a;return k|0}if(j&2){k=0;return k|0}p=(j&-8)+f|0;if(p>>>0<b>>>0){k=0;return k|0}f=p-b|0;q=j>>>3;do if(j>>>0>=256){i=c[g+24>>2]|0;l=c[g+12>>2]|0;do if((l|0)==(g|0)){m=g+16|0;o=m+4|0;n=c[o>>2]|0;if(!n){r=c[m>>2]|0;if(!r){s=0;break}else{t=r;u=m}}else{t=n;u=o}while(1){o=t+20|0;n=c[o>>2]|0;if(n){t=n;u=o;continue}o=t+16|0;n=c[o>>2]|0;if(!n){v=t;w=u;break}else{t=n;u=o}}if(w>>>0<h>>>0)Ga();else{c[w>>2]=0;s=v;break}}else{o=c[g+8>>2]|0;if(o>>>0<h>>>0)Ga();n=o+12|0;if((c[n>>2]|0)!=(g|0))Ga();m=l+8|0;if((c[m>>2]|0)==(g|0)){c[n>>2]=l;c[m>>2]=o;s=l;break}else Ga()}while(0);if(i){l=c[g+28>>2]|0;o=100256+(l<<2)|0;if((g|0)==(c[o>>2]|0)){c[o>>2]=s;if(!s){c[24989]=c[24989]&~(1<<l);break}}else{if(i>>>0<(c[24992]|0)>>>0)Ga();l=i+16|0;if((c[l>>2]|0)==(g|0))c[l>>2]=s;else c[i+20>>2]=s;if(!s)break}l=c[24992]|0;if(s>>>0<l>>>0)Ga();c[s+24>>2]=i;o=g+16|0;m=c[o>>2]|0;do if(m)if(m>>>0<l>>>0)Ga();else{c[s+16>>2]=m;c[m+24>>2]=s;break}while(0);m=c[o+4>>2]|0;if(m)if(m>>>0<(c[24992]|0)>>>0)Ga();else{c[s+20>>2]=m;c[m+24>>2]=s;break}}}else{m=c[g+8>>2]|0;l=c[g+12>>2]|0;i=99992+(q<<1<<2)|0;if((m|0)!=(i|0)){if(m>>>0<h>>>0)Ga();if((c[m+12>>2]|0)!=(g|0))Ga()}if((l|0)==(m|0)){c[24988]=c[24988]&~(1<<q);break}if((l|0)!=(i|0)){if(l>>>0<h>>>0)Ga();i=l+8|0;if((c[i>>2]|0)==(g|0))x=i;else Ga()}else x=l+8|0;c[m+12>>2]=l;c[x>>2]=m}while(0);if(f>>>0<16){c[d>>2]=p|e&1|2;x=a+p+4|0;c[x>>2]=c[x>>2]|1;k=a;return k|0}else{x=a+b|0;c[d>>2]=e&1|b|2;c[x+4>>2]=f|3;b=x+f+4|0;c[b>>2]=c[b>>2]|1;S4(x,f);k=a;return k|0}return 0}function S4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=a+b|0;e=c[a+4>>2]|0;do if(!(e&1)){f=c[a>>2]|0;if(!(e&3))return;g=a+(0-f)|0;h=f+b|0;i=c[24992]|0;if(g>>>0<i>>>0)Ga();if((g|0)==(c[24993]|0)){j=d+4|0;k=c[j>>2]|0;if((k&3|0)!=3){l=g;m=h;break}c[24990]=h;c[j>>2]=k&-2;c[g+4>>2]=h|1;c[g+h>>2]=h;return}k=f>>>3;if(f>>>0<256){f=c[g+8>>2]|0;j=c[g+12>>2]|0;n=99992+(k<<1<<2)|0;if((f|0)!=(n|0)){if(f>>>0<i>>>0)Ga();if((c[f+12>>2]|0)!=(g|0))Ga()}if((j|0)==(f|0)){c[24988]=c[24988]&~(1<<k);l=g;m=h;break}if((j|0)!=(n|0)){if(j>>>0<i>>>0)Ga();n=j+8|0;if((c[n>>2]|0)==(g|0))o=n;else Ga()}else o=j+8|0;c[f+12>>2]=j;c[o>>2]=f;l=g;m=h;break}f=c[g+24>>2]|0;j=c[g+12>>2]|0;do if((j|0)==(g|0)){n=g+16|0;k=n+4|0;p=c[k>>2]|0;if(!p){q=c[n>>2]|0;if(!q){r=0;break}else{s=q;t=n}}else{s=p;t=k}while(1){k=s+20|0;p=c[k>>2]|0;if(p){s=p;t=k;continue}k=s+16|0;p=c[k>>2]|0;if(!p){u=s;v=t;break}else{s=p;t=k}}if(v>>>0<i>>>0)Ga();else{c[v>>2]=0;r=u;break}}else{k=c[g+8>>2]|0;if(k>>>0<i>>>0)Ga();p=k+12|0;if((c[p>>2]|0)!=(g|0))Ga();n=j+8|0;if((c[n>>2]|0)==(g|0)){c[p>>2]=j;c[n>>2]=k;r=j;break}else Ga()}while(0);if(f){j=c[g+28>>2]|0;i=100256+(j<<2)|0;if((g|0)==(c[i>>2]|0)){c[i>>2]=r;if(!r){c[24989]=c[24989]&~(1<<j);l=g;m=h;break}}else{if(f>>>0<(c[24992]|0)>>>0)Ga();j=f+16|0;if((c[j>>2]|0)==(g|0))c[j>>2]=r;else c[f+20>>2]=r;if(!r){l=g;m=h;break}}j=c[24992]|0;if(r>>>0<j>>>0)Ga();c[r+24>>2]=f;i=g+16|0;k=c[i>>2]|0;do if(k)if(k>>>0<j>>>0)Ga();else{c[r+16>>2]=k;c[k+24>>2]=r;break}while(0);k=c[i+4>>2]|0;if(k)if(k>>>0<(c[24992]|0)>>>0)Ga();else{c[r+20>>2]=k;c[k+24>>2]=r;l=g;m=h;break}else{l=g;m=h}}else{l=g;m=h}}else{l=a;m=b}while(0);b=c[24992]|0;if(d>>>0<b>>>0)Ga();a=d+4|0;r=c[a>>2]|0;if(!(r&2)){if((d|0)==(c[24994]|0)){u=(c[24991]|0)+m|0;c[24991]=u;c[24994]=l;c[l+4>>2]=u|1;if((l|0)!=(c[24993]|0))return;c[24993]=0;c[24990]=0;return}if((d|0)==(c[24993]|0)){u=(c[24990]|0)+m|0;c[24990]=u;c[24993]=l;c[l+4>>2]=u|1;c[l+u>>2]=u;return}u=(r&-8)+m|0;v=r>>>3;do if(r>>>0>=256){t=c[d+24>>2]|0;s=c[d+12>>2]|0;do if((s|0)==(d|0)){o=d+16|0;e=o+4|0;k=c[e>>2]|0;if(!k){j=c[o>>2]|0;if(!j){w=0;break}else{x=j;y=o}}else{x=k;y=e}while(1){e=x+20|0;k=c[e>>2]|0;if(k){x=k;y=e;continue}e=x+16|0;k=c[e>>2]|0;if(!k){z=x;A=y;break}else{x=k;y=e}}if(A>>>0<b>>>0)Ga();else{c[A>>2]=0;w=z;break}}else{e=c[d+8>>2]|0;if(e>>>0<b>>>0)Ga();k=e+12|0;if((c[k>>2]|0)!=(d|0))Ga();o=s+8|0;if((c[o>>2]|0)==(d|0)){c[k>>2]=s;c[o>>2]=e;w=s;break}else Ga()}while(0);if(t){s=c[d+28>>2]|0;h=100256+(s<<2)|0;if((d|0)==(c[h>>2]|0)){c[h>>2]=w;if(!w){c[24989]=c[24989]&~(1<<s);break}}else{if(t>>>0<(c[24992]|0)>>>0)Ga();s=t+16|0;if((c[s>>2]|0)==(d|0))c[s>>2]=w;else c[t+20>>2]=w;if(!w)break}s=c[24992]|0;if(w>>>0<s>>>0)Ga();c[w+24>>2]=t;h=d+16|0;g=c[h>>2]|0;do if(g)if(g>>>0<s>>>0)Ga();else{c[w+16>>2]=g;c[g+24>>2]=w;break}while(0);g=c[h+4>>2]|0;if(g)if(g>>>0<(c[24992]|0)>>>0)Ga();else{c[w+20>>2]=g;c[g+24>>2]=w;break}}}else{g=c[d+8>>2]|0;s=c[d+12>>2]|0;t=99992+(v<<1<<2)|0;if((g|0)!=(t|0)){if(g>>>0<b>>>0)Ga();if((c[g+12>>2]|0)!=(d|0))Ga()}if((s|0)==(g|0)){c[24988]=c[24988]&~(1<<v);break}if((s|0)!=(t|0)){if(s>>>0<b>>>0)Ga();t=s+8|0;if((c[t>>2]|0)==(d|0))B=t;else Ga()}else B=s+8|0;c[g+12>>2]=s;c[B>>2]=g}while(0);c[l+4>>2]=u|1;c[l+u>>2]=u;if((l|0)==(c[24993]|0)){c[24990]=u;return}else C=u}else{c[a>>2]=r&-2;c[l+4>>2]=m|1;c[l+m>>2]=m;C=m}m=C>>>3;if(C>>>0<256){r=99992+(m<<1<<2)|0;a=c[24988]|0;u=1<<m;if(a&u){m=r+8|0;B=c[m>>2]|0;if(B>>>0<(c[24992]|0)>>>0)Ga();else{D=m;E=B}}else{c[24988]=a|u;D=r+8|0;E=r}c[D>>2]=l;c[E+12>>2]=l;c[l+8>>2]=E;c[l+12>>2]=r;return}r=C>>>8;if(r)if(C>>>0>16777215)F=31;else{E=(r+1048320|0)>>>16&8;D=r<<E;r=(D+520192|0)>>>16&4;u=D<<r;D=(u+245760|0)>>>16&2;a=14-(r|E|D)+(u<<D>>>15)|0;F=C>>>(a+7|0)&1|a<<1}else F=0;a=100256+(F<<2)|0;c[l+28>>2]=F;c[l+20>>2]=0;c[l+16>>2]=0;D=c[24989]|0;u=1<<F;if(!(D&u)){c[24989]=D|u;c[a>>2]=l;c[l+24>>2]=a;c[l+12>>2]=l;c[l+8>>2]=l;return}u=C<<((F|0)==31?0:25-(F>>>1)|0);F=c[a>>2]|0;while(1){if((c[F+4>>2]&-8|0)==(C|0)){G=F;H=127;break}a=F+16+(u>>>31<<2)|0;D=c[a>>2]|0;if(!D){I=a;J=F;H=124;break}else{u=u<<1;F=D}}if((H|0)==124){if(I>>>0<(c[24992]|0)>>>0)Ga();c[I>>2]=l;c[l+24>>2]=J;c[l+12>>2]=l;c[l+8>>2]=l;return}else if((H|0)==127){H=G+8|0;J=c[H>>2]|0;I=c[24992]|0;if(!(J>>>0>=I>>>0&G>>>0>=I>>>0))Ga();c[J+12>>2]=l;c[H>>2]=l;c[l+8>>2]=J;c[l+12>>2]=G;c[l+24>>2]=0;return}}function T4(){}function U4(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return (C=e,a-c>>>0|0)|0}function V4(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return (C=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function W4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;p=p+1|0;c[a>>2]=p;while((f|0)<(e|0)){if(!(c[d+(f<<3)>>2]|0)){c[d+(f<<3)>>2]=p;c[d+((f<<3)+4)>>2]=b;c[d+((f<<3)+8)>>2]=0;C=e;return d|0}f=f+1|0}e=e*2|0;d=Q4(d|0,8*(e+1|0)|0)|0;d=W4(a|0,b|0,d|0,e|0)|0;C=e;return d|0}function X4(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}C=0;return b>>>c-32|0}function Y4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){f=c[b+(e<<3)>>2]|0;if(!f)break;if((f|0)==(a|0))return c[b+((e<<3)+4)>>2]|0;e=e+1|0}return 0}function Z4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return _a(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function _4(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b>>0]=a[c>>0]|0}b=e}else Z4(b,c,d)|0;return b|0}function $4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function a5(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}C=a<<c-32;return 0}function b5(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}C=(b|0)<0?-1:0;return b>>c-32|0}function c5(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function d5(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=_(d,c)|0;f=a>>>16;a=(e>>>16)+(_(d,f)|0)|0;d=b>>>16;b=_(d,c)|0;return (C=(a>>>16)+(_(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function e5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=U4(e^a,f^b,e,f)|0;b=C;a=g^e;e=h^f;return U4((j5(i,b,U4(g^c,h^d,g,h)|0,C,0)|0)^a,C^e,a,e)|0}function f5(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=U4(h^a,j^b,h,j)|0;b=C;j5(m,b,U4(k^d,l^e,k,l)|0,C,g)|0;l=U4(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=C;i=f;return (C=j,l)|0}function g5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=d5(e,a)|0;f=C;return (C=(_(b,a)|0)+(_(d,e)|0)+f|f&0,c|0|0)|0}function h5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return j5(a,b,c,d,0)|0}function i5(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f|0;j5(a,b,d,e,g)|0;i=f;return (C=c[g+4>>2]|0,c[g>>2]|0)|0}function j5(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0;g=a;h=b;i=h;j=d;k=e;l=k;if(!i){m=(f|0)!=0;if(!l){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return (C=n,o)|0}else{if(!m){n=0;o=0;return (C=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return (C=n,o)|0}}m=(l|0)==0;do if(j){if(!m){p=(aa(l|0)|0)-(aa(i|0)|0)|0;if(p>>>0<=31){q=p+1|0;r=31-p|0;s=p-31>>31;t=q;u=g>>>(q>>>0)&s|i<<r;v=i>>>(q>>>0)&s;w=0;x=g<<r;break}if(!f){n=0;o=0;return (C=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return (C=n,o)|0}r=j-1|0;if(r&j){s=(aa(j|0)|0)+33-(aa(i|0)|0)|0;q=64-s|0;p=32-s|0;y=p>>31;z=s-32|0;A=z>>31;t=s;u=p-1>>31&i>>>(z>>>0)|(i<<p|g>>>(s>>>0))&A;v=A&i>>>(s>>>0);w=g<<q&y;x=(i<<q|g>>>(z>>>0))&y|g<<p&s-33>>31;break}if(f){c[f>>2]=r&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return (C=n,o)|0}else{r=c5(j|0)|0;n=i>>>(r>>>0)|0;o=i<<32-r|g>>>(r>>>0)|0;return (C=n,o)|0}}else{if(m){if(f){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return (C=n,o)|0}if(!g){if(f){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return (C=n,o)|0}r=l-1|0;if(!(r&l)){if(f){c[f>>2]=a|0;c[f+4>>2]=r&i|b&0}n=0;o=i>>>((c5(l|0)|0)>>>0);return (C=n,o)|0}r=(aa(l|0)|0)-(aa(i|0)|0)|0;if(r>>>0<=30){s=r+1|0;p=31-r|0;t=s;u=i<<p|g>>>(s>>>0);v=i>>>(s>>>0);w=0;x=g<<p;break}if(!f){n=0;o=0;return (C=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return (C=n,o)|0}while(0);if(!t){B=x;D=w;E=v;F=u;G=0;H=0}else{b=d|0|0;d=k|e&0;e=V4(b|0,d|0,-1,-1)|0;k=C;h=x;x=w;w=v;v=u;u=t;t=0;do{a=h;h=x>>>31|h<<1;x=t|x<<1;g=v<<1|a>>>31|0;a=v>>>31|w<<1|0;U4(e,k,g,a)|0;i=C;l=i>>31|((i|0)<0?-1:0)<<1;t=l&1;v=U4(g,a,l&b,(((i|0)<0?-1:0)>>31|((i|0)<0?-1:0)<<1)&d)|0;w=C;u=u-1|0}while((u|0)!=0);B=h;D=x;E=w;F=v;G=0;H=t}t=D;D=0;if(f){c[f>>2]=F;c[f+4>>2]=E}n=(t|0)>>>31|(B|D)<<1|(D<<1|t>>>31)&0|G;o=(t<<1|0>>>31)&-2|H;return (C=n,o)|0}function k5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;Ab[a&31](b|0,c|0,d|0,e|0,f|0)}function l5(a,b){a=a|0;b=b|0;Bb[a&127](b|0)}function m5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=+d;e=+e;return Cb[a&3](b|0,c|0,+d,+e)|0}function n5(a,b,c){a=a|0;b=b|0;c=c|0;Db[a&31](b|0,c|0)}function o5(a,b,c,d,e,f,g,h,i,j,k){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;return Eb[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0,k|0)|0}function p5(a,b){a=a|0;b=b|0;return Fb[a&63](b|0)|0}function q5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Gb[a&63](b|0,c|0,d|0,e|0,f|0)|0}function r5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Hb[a&63](b|0,c|0,d|0)|0}function s5(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Ib[a&15](b|0,c|0,d|0,e|0,f|0,g|0)}function t5(a,b){a=a|0;b=b|0;return +Jb[a&1](b|0)}function u5(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;return Kb[a&1](b|0,c|0,d|0,e|0,f|0,g|0)|0}function v5(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;return +Lb[a&7](+b,+c,+d)}function w5(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;Mb[a&1](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function x5(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;Nb[a&0](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function y5(a,b,c){a=a|0;b=b|0;c=c|0;return Ob[a&127](b|0,c|0)|0}function z5(a){a=a|0;return +Pb[a&1]()}function A5(a){a=a|0;return Qb[a&7]()|0}function B5(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;f=+f;g=g|0;Rb[a&15](b|0,c|0,d|0,+e,+f,g|0)}function C5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Sb[a&127](b|0,c|0,d|0,e|0)|0}function D5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Tb[a&127](b|0,c|0,d|0)}function E5(a){a=a|0;Ub[a&7]()}function F5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Vb[a&31](b|0,c|0,d|0,e|0)}function G5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ba(0)}function H5(a){a=a|0;ba(1)}function I5(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;ba(2);return 0}function J5(a,b){a=a|0;b=b|0;ba(3)}function K5(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;ba(4);return 0}function L5(a){a=a|0;ba(5);return 0}function M5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ba(6);return 0}function N5(a,b,c){a=a|0;b=b|0;c=c|0;ba(7);return 0}function O5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ba(8)}function P5(a){a=a|0;ba(9);return 0.0}function Q5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ba(10);return 0}function R5(a,b,c){a=+a;b=+b;c=+c;ba(11);return 0.0}function S5(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ba(12)}function T5(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ba(13)}function U5(a,b){a=a|0;b=b|0;ba(14);return 0}function V5(){ba(15);return 0.0}function W5(){ba(16);return 0}function X5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=+e;f=f|0;ba(17)}function Y5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ba(18);return 0}function Z5(a,b,c){a=a|0;b=b|0;c=c|0;ba(19)}function _5(){ba(20)}function $5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ba(21)}
	
	// EMSCRIPTEN_END_FUNCS
	var Ab=[G5,_c,md,td,Jd,ne,i0,h0,K$,L$,g0,f$,g$,B_,C_,Xk,mG,JP,a_,b_,G5,G5,G5,G5,G5,G5,G5,G5,G5,G5,G5,G5];var Bb=[H5,jc,kc,lc,mc,nc,Gc,Hc,Ic,Jc,Kc,Lc,Mc,Yc,Zc,ad,bd,cd,ed,fd,gd,hd,id,jd,kd,ld,wd,xd,yd,Ad,Bd,Cd,Dd,Ed,Fd,Gd,Hd,Id,Kd,Wd,Xd,Yd,Zd,ke,le,me,oe,Ae,Be,Ce,Ee,Fe,Ge,He,Ie,Je,Ke,Le,Me,Ue,Ve,We,Xe,tf,sf,wl,sl,$n,Sn,ep,fp,pn,qn,Zo,_o,ol,pl,un,vn,En,Fn,DB,kM,xM,mM,lM,PM,FL,GL,VR,_R,nf,_k,Zn,_n,go,O4,qv,sA,oG,TH,kK,xU,HQ,WK,IU,tX,OX,PX,VX,r4,s4,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5,H5];var Cb=[I5,Lt,Mt,I5];var Db=[J5,Oc,Tc,sd,Qd,de,ue,Se,bf,ZB,BM,ZM,TM,OM,vM,wM,YR,aS,lL,kG,oK,zP,aA,wW,sX,RX,SX,WX,YX,J5,J5,J5];var Eb=[K5,WZ,TZ,K5];var Fb=[L5,Fg,_f,ym,zm,SB,WB,PP,QP,NR,OR,PR,QR,RR,SR,TR,UR,I2,dc,lF,Vk,Yk,fm,cK,kB,$B,jB,iK,nK,lB,AP,bK,FP,GP,XX,N4,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5,L5];var Gb=[M5,zB,AM,SM,o0,f1,g1,t0,q0,d1,e1,u0,v0,w0,x0,y0,V0,W0,M0,F0,A0,z0,B0,C0,E0,D0,r0,p0,G0,H0,I0,J0,K0,L0,N0,O0,P0,Q0,U0,S0,R0,T0,$0,X0,Y0,Z0,_0,a1,b1,c1,h1,i1,j1,k1,M5,M5,M5,M5,M5,M5,M5,M5,M5,M5];var Hb=[N5,pm,nv,zz,Gz,Mz,Rz,AB,CB,QB,TB,gL,vP,uU,B$,H$,Y_,c$,s_,y_,D4,L2,K2,J2,M2,$z,mm,Vu,Jo,Is,xx,zx,Cx,Tz,k3,FD,Y2,WN,_K,NQ,QX,VZ,SZ,g_,k_,v4,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5,N5];var Ib=[O5,rc,Rc,qd,Od,be,se,Qe,$e,O5,O5,O5,O5,O5,O5,O5];var Jb=[P5,gO];var Kb=[Q5,uX];var Lb=[R5,XI,YI,ZI,_I,R5,R5,R5];var Mb=[S5,KP];var Nb=[T5];var Ob=[U5,yB,RB,XB,_M,YM,RM,NM,zM,IW,JW,KW,LW,MW,NW,PW,QW,RW,SW,TW,UW,VW,WW,XW,YW,ZW,_W,$W,aX,bX,cX,dX,eX,fX,gX,hX,iX,jX,kX,lX,D$,E$,G$,M$,N$,O$,P$,Q$,R$,S$,T$,__,$_,b$,u_,v_,x_,jF,Qf,Eg,Sh,bi,$h,gk,ek,Wk,Zk,po,zp,Fq,Zq,$q,br,cr,jr,ir,hr,Ds,Js,Ou,pw,_w,wE,xE,yE,lG,aC,eK,qG,TG,WG,XG,jH,_2,Z2,ZN,iP,yA,HU,OA,QA,BP,CR,iT,HW,TX,UX,Q4,ZZ,_Z,$Z,M4,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5,U5];var Pb=[V5,$N];var Qb=[W5,vq,lK,mK,VK,W5,W5,W5];var Rb=[X5,lH,mH,nH,oH,pH,qH,rH,sH,X5,X5,X5,X5,X5,X5,X5];var Sb=[Y5,rm,or,ov,Bz,Iz,_A,MD,ZA,qB,OB,NB,YB,iC,jC,iL,xP,pQ,nQ,PS,wU,RU,QU,v$,w$,x$,y$,z$,A$,C$,F$,J$,S_,T_,U_,V_,W_,X_,Z_,a$,e$,m_,n_,o_,p_,q_,r_,t_,w_,A_,Hs,Wz,jG,MC,nG,YN,SY,KZ,dZ,nZ,ZY,wZ,BZ,zZ,CZ,XZ,QZ,d_,e_,i_,j_,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5,Y5];var Tb=[Z5,oc,pc,sc,Nc,Pc,Sc,nd,od,rd,Ld,Md,Pd,_d,$d,ce,pe,qe,te,Ne,Oe,Re,Ye,Ze,af,Lj,Mj,Nj,qm,Az,Hz,KA,BB,EB,oC,JC,ND,_F,rJ,jL,hL,NL,wP,rP,oQ,mQ,WR,XR,ZR,$R,bS,vU,iW,hW,NA,WA,gC,UC,VC,hK,XN,YK,DP,HP,IP,jW,lW,mW,vW,xW,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5,Z5];var Ub=[_5,_N,jK,pK,qK,rK,yU,_5];var Vb=[$5,qc,Qc,dd,pd,zd,Nd,ae,re,De,Pe,_e,qf,pf,of,mf,lf,hf,fc,kf,jf,yM,QM,I$,d$,z_,w3,CP,EP,f_,$5,$5];return{_vizRenderFromString:ec,_i64Subtract:U4,_fflush:T2,_aglasterr:_z,_realloc:Q4,_dtextract:Kz,_memmove:_4,_saveSetjmp:W4,_memset:$4,_malloc:N4,_i64Add:V4,_memcpy:Z4,_bitshift64Lshr:X4,_free:O4,_bitshift64Shl:a5,___errno_location:L1,_testSetjmp:Y4,runPostSets:T4,stackAlloc:Wb,stackSave:Xb,stackRestore:Yb,establishStackSpace:Zb,setThrew:_b,setTempRet0:bc,getTempRet0:cc,dynCall_viiiii:k5,dynCall_vi:l5,dynCall_iiidd:m5,dynCall_vii:n5,dynCall_iiiiiiiiiii:o5,dynCall_ii:p5,dynCall_iiiiii:q5,dynCall_iiii:r5,dynCall_viiiiii:s5,dynCall_di:t5,dynCall_iiiiiii:u5,dynCall_dddd:v5,dynCall_viiiiiii:w5,dynCall_viiiiiiiii:x5,dynCall_iii:y5,dynCall_d:z5,dynCall_i:A5,dynCall_viiiddi:B5,dynCall_iiiii:C5,dynCall_viii:D5,dynCall_v:E5,dynCall_viiii:F5}})
	
	
	// EMSCRIPTEN_END_ASM
	(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var _vizRenderFromString=Module["_vizRenderFromString"]=asm["_vizRenderFromString"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _fflush=Module["_fflush"]=asm["_fflush"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var _aglasterr=Module["_aglasterr"]=asm["_aglasterr"];var _realloc=Module["_realloc"]=asm["_realloc"];var _dtextract=Module["_dtextract"]=asm["_dtextract"];var _memmove=Module["_memmove"]=asm["_memmove"];var _saveSetjmp=Module["_saveSetjmp"]=asm["_saveSetjmp"];var _testSetjmp=Module["_testSetjmp"]=asm["_testSetjmp"];var _memset=Module["_memset"]=asm["_memset"];var _malloc=Module["_malloc"]=asm["_malloc"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _free=Module["_free"]=asm["_free"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_iiidd=Module["dynCall_iiidd"]=asm["dynCall_iiidd"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_iiiiiiiiiii=Module["dynCall_iiiiiiiiiii"]=asm["dynCall_iiiiiiiiiii"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_iiiiii=Module["dynCall_iiiiii"]=asm["dynCall_iiiiii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];var dynCall_di=Module["dynCall_di"]=asm["dynCall_di"];var dynCall_iiiiiii=Module["dynCall_iiiiiii"]=asm["dynCall_iiiiiii"];var dynCall_dddd=Module["dynCall_dddd"]=asm["dynCall_dddd"];var dynCall_viiiiiii=Module["dynCall_viiiiiii"]=asm["dynCall_viiiiiii"];var dynCall_viiiiiiiii=Module["dynCall_viiiiiiiii"]=asm["dynCall_viiiiiiiii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_d=Module["dynCall_d"]=asm["dynCall_d"];var dynCall_i=Module["dynCall_i"]=asm["dynCall_i"];var dynCall_viiiddi=Module["dynCall_viiiddi"]=asm["dynCall_viiiddi"];var dynCall_iiiii=Module["dynCall_iiiii"]=asm["dynCall_iiiii"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){assert(runDependencies==0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length==0,"cannot call main when preRun functions remain to be called");args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["stdout"]["once"]("drain",(function(){process["exit"](status)}));console.log(" ");setTimeout((function(){process["exit"](status)}),500)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()
	
	
	
	
	
	  return Module;
	};
	  function Viz(src) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var format = options.format === undefined ? "svg" : options.format;
	    var engine = options.engine === undefined ? "dot" : options.engine;
	  
	    if (format == "png-image-element") {
	      return Viz.svgXmlToPngImageElement(render(src, "svg", engine));
	    } else {
	      return render(src, format, engine);
	    }
	  }
	
	  var graphviz;
	  var errors;
	  
	  function appendError(buf) {
	    errors += graphviz["Pointer_stringify"](buf);
	  }
	  
	  function render(src, format, engine) {
	    if (typeof graphviz === "undefined") {
	      graphviz = Module();
	    }
	    
	    errors = "";
	    
	    var resultPointer = graphviz["ccall"]("vizRenderFromString", "number", ["string", "string", "string"], [src, format, engine]);
	    var resultString = graphviz["Pointer_stringify"](resultPointer);
	    graphviz["_free"](resultPointer);
	    
	    if (errors != "") {
	      throw errors;
	    }
	    
	    return resultString;
	  }
	  
	  Viz.svgXmlToPngImageElement = function(svgXml) {
	    var scaleFactor = 1;
	    
	    if ("devicePixelRatio" in window) {
	      if (window.devicePixelRatio > 1) {
	        scaleFactor = window.devicePixelRatio;
	      }
	    }
	    
	    var svgImage = new Image();
	    svgImage.src = "data:image/svg+xml;utf8," + svgXml;
	
	    var pngImage = new Image();
	
	    svgImage.onload = function() {
	      var canvas = document.createElement("canvas");
	      canvas.width = svgImage.width * scaleFactor;
	      canvas.height = svgImage.height * scaleFactor;
	
	      var context = canvas.getContext("2d");
	      context.drawImage(svgImage, 0, 0, canvas.width, canvas.height);
	
	      pngImage.src = canvas.toDataURL("image/png");
	      pngImage.width = svgImage.width;
	      pngImage.height = svgImage.height;
	    }
	    
	    return pngImage;
	  }
	  
	  if (typeof module === "object" && module.exports) {
	    module.exports = Viz;
	  } else {
	    global.Viz = Viz;
	  }
	  
	})(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14), "/", __webpack_require__(30)(module), __webpack_require__(3).Buffer))

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map