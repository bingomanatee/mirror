(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('crypto'), require('buffer')) :
    typeof define === 'function' && define.amd ? define(['crypto', 'buffer'], factory) :
    (global = global || self, global['@wonderlandlabs/mirror'] = factory(global.crypto, global.buffer));
}(this, (function (crypto, buffer) { 'use strict';

    crypto = crypto && Object.prototype.hasOwnProperty.call(crypto, 'default') ? crypto['default'] : crypto;
    buffer = buffer && Object.prototype.hasOwnProperty.call(buffer, 'default') ? buffer['default'] : buffer;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function createErrorClass(createImpl) {
        var _super = function (instance) {
            Error.call(instance);
            instance.stack = new Error().stack;
        };
        var ctorFunc = createImpl(_super);
        ctorFunc.prototype = Object.create(Error.prototype);
        ctorFunc.prototype.constructor = ctorFunc;
        return ctorFunc;
    }

    var UnsubscriptionError = createErrorClass(function (_super) {
        return function UnsubscriptionErrorImpl(errors) {
            _super(this);
            this.message = errors
                ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
                : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
        };
    });

    function arrRemove(arr, item) {
        if (arr) {
            var index = arr.indexOf(item);
            0 <= index && arr.splice(index, 1);
        }
    }

    var Subscription = (function () {
        function Subscription(initialTeardown) {
            this.initialTeardown = initialTeardown;
            this.closed = false;
            this._parentage = null;
            this._teardowns = null;
        }
        Subscription.prototype.unsubscribe = function () {
            var e_1, _a, e_2, _b;
            var errors;
            if (!this.closed) {
                this.closed = true;
                var _parentage = this._parentage;
                if (_parentage) {
                    this._parentage = null;
                    if (Array.isArray(_parentage)) {
                        try {
                            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                                var parent_1 = _parentage_1_1.value;
                                parent_1.remove(this);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    else {
                        _parentage.remove(this);
                    }
                }
                var initialTeardown = this.initialTeardown;
                if (isFunction(initialTeardown)) {
                    try {
                        initialTeardown();
                    }
                    catch (e) {
                        errors = e instanceof UnsubscriptionError ? e.errors : [e];
                    }
                }
                var _teardowns = this._teardowns;
                if (_teardowns) {
                    this._teardowns = null;
                    try {
                        for (var _teardowns_1 = __values(_teardowns), _teardowns_1_1 = _teardowns_1.next(); !_teardowns_1_1.done; _teardowns_1_1 = _teardowns_1.next()) {
                            var teardown_1 = _teardowns_1_1.value;
                            try {
                                execTeardown(teardown_1);
                            }
                            catch (err) {
                                errors = errors !== null && errors !== void 0 ? errors : [];
                                if (err instanceof UnsubscriptionError) {
                                    errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                                }
                                else {
                                    errors.push(err);
                                }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_teardowns_1_1 && !_teardowns_1_1.done && (_b = _teardowns_1.return)) _b.call(_teardowns_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                if (errors) {
                    throw new UnsubscriptionError(errors);
                }
            }
        };
        Subscription.prototype.add = function (teardown) {
            var _a;
            if (teardown && teardown !== this) {
                if (this.closed) {
                    execTeardown(teardown);
                }
                else {
                    if (teardown instanceof Subscription) {
                        if (teardown.closed || teardown._hasParent(this)) {
                            return;
                        }
                        teardown._addParent(this);
                    }
                    (this._teardowns = (_a = this._teardowns) !== null && _a !== void 0 ? _a : []).push(teardown);
                }
            }
        };
        Subscription.prototype._hasParent = function (parent) {
            var _parentage = this._parentage;
            return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
        };
        Subscription.prototype._addParent = function (parent) {
            var _parentage = this._parentage;
            this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
        };
        Subscription.prototype._removeParent = function (parent) {
            var _parentage = this._parentage;
            if (_parentage === parent) {
                this._parentage = null;
            }
            else if (Array.isArray(_parentage)) {
                arrRemove(_parentage, parent);
            }
        };
        Subscription.prototype.remove = function (teardown) {
            var _teardowns = this._teardowns;
            _teardowns && arrRemove(_teardowns, teardown);
            if (teardown instanceof Subscription) {
                teardown._removeParent(this);
            }
        };
        Subscription.EMPTY = (function () {
            var empty = new Subscription();
            empty.closed = true;
            return empty;
        })();
        return Subscription;
    }());
    var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
    function isSubscription(value) {
        return (value instanceof Subscription ||
            (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
    }
    function execTeardown(teardown) {
        if (isFunction(teardown)) {
            teardown();
        }
        else {
            teardown.unsubscribe();
        }
    }

    var config = {
        onUnhandledError: null,
        onStoppedNotification: null,
        Promise: undefined,
        useDeprecatedSynchronousErrorHandling: false,
        useDeprecatedNextContext: false,
    };

    var timeoutProvider = {
        setTimeout: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var delegate = timeoutProvider.delegate;
            return ((delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) || setTimeout).apply(void 0, __spreadArray([], __read(args)));
        },
        clearTimeout: function (handle) {
            var delegate = timeoutProvider.delegate;
            return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
        },
        delegate: undefined,
    };

    function reportUnhandledError(err) {
        timeoutProvider.setTimeout(function () {
            {
                throw err;
            }
        });
    }

    function noop() { }

    function errorContext(cb) {
        {
            cb();
        }
    }

    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destination) {
            var _this = _super.call(this) || this;
            _this.isStopped = false;
            if (destination) {
                _this.destination = destination;
                if (isSubscription(destination)) {
                    destination.add(_this);
                }
            }
            else {
                _this.destination = EMPTY_OBSERVER;
            }
            return _this;
        }
        Subscriber.create = function (next, error, complete) {
            return new SafeSubscriber(next, error, complete);
        };
        Subscriber.prototype.next = function (value) {
            if (this.isStopped) ;
            else {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (!this.closed) {
                this.isStopped = true;
                _super.prototype.unsubscribe.call(this);
                this.destination = null;
            }
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            try {
                this.destination.error(err);
            }
            finally {
                this.unsubscribe();
            }
        };
        Subscriber.prototype._complete = function () {
            try {
                this.destination.complete();
            }
            finally {
                this.unsubscribe();
            }
        };
        return Subscriber;
    }(Subscription));
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            var next;
            if (isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                (next = observerOrNext.next, error = observerOrNext.error, complete = observerOrNext.complete);
                var context_1;
                if (_this && config.useDeprecatedNextContext) {
                    context_1 = Object.create(observerOrNext);
                    context_1.unsubscribe = function () { return _this.unsubscribe(); };
                }
                else {
                    context_1 = observerOrNext;
                }
                next = next === null || next === void 0 ? void 0 : next.bind(context_1);
                error = error === null || error === void 0 ? void 0 : error.bind(context_1);
                complete = complete === null || complete === void 0 ? void 0 : complete.bind(context_1);
            }
            _this.destination = {
                next: next ? wrapForErrorHandling(next) : noop,
                error: wrapForErrorHandling(error !== null && error !== void 0 ? error : defaultErrorHandler),
                complete: complete ? wrapForErrorHandling(complete) : noop,
            };
            return _this;
        }
        return SafeSubscriber;
    }(Subscriber));
    function wrapForErrorHandling(handler, instance) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                handler.apply(void 0, __spreadArray([], __read(args)));
            }
            catch (err) {
                {
                    reportUnhandledError(err);
                }
            }
        };
    }
    function defaultErrorHandler(err) {
        throw err;
    }
    var EMPTY_OBSERVER = {
        closed: true,
        next: noop,
        error: defaultErrorHandler,
        complete: noop,
    };

    var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

    function identity(x) {
        return x;
    }

    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    var Observable = (function () {
        function Observable(subscribe) {
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var _this = this;
            var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
            errorContext(function () {
                var _a = _this, operator = _a.operator, source = _a.source;
                subscriber.add(operator
                    ?
                        operator.call(subscriber, source)
                    : source
                        ?
                            _this._subscribe(subscriber)
                        :
                            _this._trySubscribe(subscriber));
            });
            return subscriber;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                sink.error(err);
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var _a;
            return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        var _a;
        return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
    }
    function isObserver(value) {
        return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
    }
    function isSubscriber(value) {
        return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
    }

    function hasLift(source) {
        return isFunction(source === null || source === void 0 ? void 0 : source.lift);
    }
    function operate(init) {
        return function (source) {
            if (hasLift(source)) {
                return source.lift(function (liftedSource) {
                    try {
                        return init(liftedSource, this);
                    }
                    catch (err) {
                        this.error(err);
                    }
                });
            }
            throw new TypeError('Unable to lift unknown Observable type');
        };
    }

    var OperatorSubscriber = (function (_super) {
        __extends(OperatorSubscriber, _super);
        function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
            var _this = _super.call(this, destination) || this;
            _this.onFinalize = onFinalize;
            _this._next = onNext
                ? function (value) {
                    try {
                        onNext(value);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                }
                : _super.prototype._next;
            _this._error = onError
                ? function (err) {
                    try {
                        onError(err);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._error;
            _this._complete = onComplete
                ? function () {
                    try {
                        onComplete();
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._complete;
            return _this;
        }
        OperatorSubscriber.prototype.unsubscribe = function () {
            var _a;
            var closed = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        };
        return OperatorSubscriber;
    }(Subscriber));

    var ObjectUnsubscribedError = createErrorClass(function (_super) {
        return function ObjectUnsubscribedErrorImpl() {
            _super(this);
            this.name = 'ObjectUnsubscribedError';
            this.message = 'object unsubscribed';
        };
    });

    var Subject = (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.closed = false;
            _this.observers = [];
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype._throwIfClosed = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
        };
        Subject.prototype.next = function (value) {
            var _this = this;
            errorContext(function () {
                var e_1, _a;
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    var copy = _this.observers.slice();
                    try {
                        for (var copy_1 = __values(copy), copy_1_1 = copy_1.next(); !copy_1_1.done; copy_1_1 = copy_1.next()) {
                            var observer = copy_1_1.value;
                            observer.next(value);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (copy_1_1 && !copy_1_1.done && (_a = copy_1.return)) _a.call(copy_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
        };
        Subject.prototype.error = function (err) {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.hasError = _this.isStopped = true;
                    _this.thrownError = err;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().error(err);
                    }
                }
            });
        };
        Subject.prototype.complete = function () {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.isStopped = true;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().complete();
                    }
                }
            });
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = this.closed = true;
            this.observers = null;
        };
        Object.defineProperty(Subject.prototype, "observed", {
            get: function () {
                var _a;
                return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
            },
            enumerable: false,
            configurable: true
        });
        Subject.prototype._trySubscribe = function (subscriber) {
            this._throwIfClosed();
            return _super.prototype._trySubscribe.call(this, subscriber);
        };
        Subject.prototype._subscribe = function (subscriber) {
            this._throwIfClosed();
            this._checkFinalizedStatuses(subscriber);
            return this._innerSubscribe(subscriber);
        };
        Subject.prototype._innerSubscribe = function (subscriber) {
            var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
            return hasError || isStopped
                ? EMPTY_SUBSCRIPTION
                : (observers.push(subscriber), new Subscription(function () { return arrRemove(observers, subscriber); }));
        };
        Subject.prototype._checkFinalizedStatuses = function (subscriber) {
            var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
            if (hasError) {
                subscriber.error(thrownError);
            }
            else if (isStopped) {
                subscriber.complete();
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
        };
        AnonymousSubject.prototype.error = function (err) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
        };
        AnonymousSubject.prototype.complete = function () {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var _a, _b;
            return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
        };
        return AnonymousSubject;
    }(Subject));

    var BehaviorSubject = (function (_super) {
        __extends(BehaviorSubject, _super);
        function BehaviorSubject(_value) {
            var _this = _super.call(this) || this;
            _this._value = _value;
            return _this;
        }
        Object.defineProperty(BehaviorSubject.prototype, "value", {
            get: function () {
                return this.getValue();
            },
            enumerable: false,
            configurable: true
        });
        BehaviorSubject.prototype._subscribe = function (subscriber) {
            var subscription = _super.prototype._subscribe.call(this, subscriber);
            !subscription.closed && subscriber.next(this._value);
            return subscription;
        };
        BehaviorSubject.prototype.getValue = function () {
            var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
            if (hasError) {
                throw thrownError;
            }
            this._throwIfClosed();
            return _value;
        };
        BehaviorSubject.prototype.next = function (value) {
            _super.prototype.next.call(this, (this._value = value));
        };
        return BehaviorSubject;
    }(Subject));

    var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

    function isPromise(value) {
        return isFunction(value === null || value === void 0 ? void 0 : value.then);
    }

    function isInteropObservable(input) {
        return isFunction(input[observable]);
    }

    function isAsyncIterable(obj) {
        return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
    }

    function createInvalidObservableTypeError(input) {
        return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
    }

    function getSymbolIterator() {
        if (typeof Symbol !== 'function' || !Symbol.iterator) {
            return '@@iterator';
        }
        return Symbol.iterator;
    }
    var iterator = getSymbolIterator();

    function isIterable(input) {
        return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
    }

    function readableStreamLikeToAsyncGenerator(readableStream) {
        return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
            var reader, _a, value, done;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        reader = readableStream.getReader();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 9, 10]);
                        _b.label = 2;
                    case 2:
                        return [4, __await(reader.read())];
                    case 3:
                        _a = _b.sent(), value = _a.value, done = _a.done;
                        if (!done) return [3, 5];
                        return [4, __await(void 0)];
                    case 4: return [2, _b.sent()];
                    case 5: return [4, __await(value)];
                    case 6: return [4, _b.sent()];
                    case 7:
                        _b.sent();
                        return [3, 2];
                    case 8: return [3, 10];
                    case 9:
                        reader.releaseLock();
                        return [7];
                    case 10: return [2];
                }
            });
        });
    }
    function isReadableStreamLike(obj) {
        return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
    }

    function innerFrom(input) {
        if (input instanceof Observable) {
            return input;
        }
        if (input != null) {
            if (isInteropObservable(input)) {
                return fromInteropObservable(input);
            }
            if (isArrayLike(input)) {
                return fromArrayLike(input);
            }
            if (isPromise(input)) {
                return fromPromise(input);
            }
            if (isAsyncIterable(input)) {
                return fromAsyncIterable(input);
            }
            if (isIterable(input)) {
                return fromIterable(input);
            }
            if (isReadableStreamLike(input)) {
                return fromReadableStreamLike(input);
            }
        }
        throw createInvalidObservableTypeError(input);
    }
    function fromInteropObservable(obj) {
        return new Observable(function (subscriber) {
            var obs = obj[observable]();
            if (isFunction(obs.subscribe)) {
                return obs.subscribe(subscriber);
            }
            throw new TypeError('Provided object does not correctly implement Symbol.observable');
        });
    }
    function fromArrayLike(array) {
        return new Observable(function (subscriber) {
            for (var i = 0; i < array.length && !subscriber.closed; i++) {
                subscriber.next(array[i]);
            }
            subscriber.complete();
        });
    }
    function fromPromise(promise) {
        return new Observable(function (subscriber) {
            promise
                .then(function (value) {
                if (!subscriber.closed) {
                    subscriber.next(value);
                    subscriber.complete();
                }
            }, function (err) { return subscriber.error(err); })
                .then(null, reportUnhandledError);
        });
    }
    function fromIterable(iterable) {
        return new Observable(function (subscriber) {
            var e_1, _a;
            try {
                for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                    var value = iterable_1_1.value;
                    subscriber.next(value);
                    if (subscriber.closed) {
                        return;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            subscriber.complete();
        });
    }
    function fromAsyncIterable(asyncIterable) {
        return new Observable(function (subscriber) {
            process$1(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
        });
    }
    function fromReadableStreamLike(readableStream) {
        return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
    }
    function process$1(asyncIterable, subscriber) {
        var asyncIterable_1, asyncIterable_1_1;
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function () {
            var value, e_2_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 11]);
                        asyncIterable_1 = __asyncValues(asyncIterable);
                        _b.label = 1;
                    case 1: return [4, asyncIterable_1.next()];
                    case 2:
                        if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                        value = asyncIterable_1_1.value;
                        subscriber.next(value);
                        if (subscriber.closed) {
                            return [2];
                        }
                        _b.label = 3;
                    case 3: return [3, 1];
                    case 4: return [3, 11];
                    case 5:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3, 11];
                    case 6:
                        _b.trys.push([6, , 9, 10]);
                        if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                        return [4, _a.call(asyncIterable_1)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [3, 10];
                    case 9:
                        if (e_2) throw e_2.error;
                        return [7];
                    case 10: return [7];
                    case 11:
                        subscriber.complete();
                        return [2];
                }
            });
        });
    }

    function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
        if (delay === void 0) { delay = 0; }
        if (repeat === void 0) { repeat = false; }
        var scheduleSubscription = scheduler.schedule(function () {
            work();
            if (repeat) {
                parentSubscription.add(this.schedule(null, delay));
            }
            else {
                this.unsubscribe();
            }
        }, delay);
        parentSubscription.add(scheduleSubscription);
        if (!repeat) {
            return scheduleSubscription;
        }
    }

    function observeOn(scheduler, delay) {
        if (delay === void 0) { delay = 0; }
        return operate(function (source, subscriber) {
            source.subscribe(new OperatorSubscriber(subscriber, function (value) { return executeSchedule(subscriber, scheduler, function () { return subscriber.next(value); }, delay); }, function () { return executeSchedule(subscriber, scheduler, function () { return subscriber.complete(); }, delay); }, function (err) { return executeSchedule(subscriber, scheduler, function () { return subscriber.error(err); }, delay); }));
        });
    }

    function subscribeOn(scheduler, delay) {
        if (delay === void 0) { delay = 0; }
        return operate(function (source, subscriber) {
            subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
        });
    }

    function scheduleObservable(input, scheduler) {
        return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
    }

    function schedulePromise(input, scheduler) {
        return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
    }

    function scheduleArray(input, scheduler) {
        return new Observable(function (subscriber) {
            var i = 0;
            return scheduler.schedule(function () {
                if (i === input.length) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(input[i++]);
                    if (!subscriber.closed) {
                        this.schedule();
                    }
                }
            });
        });
    }

    function scheduleIterable(input, scheduler) {
        return new Observable(function (subscriber) {
            var iterator$1;
            executeSchedule(subscriber, scheduler, function () {
                iterator$1 = input[iterator]();
                executeSchedule(subscriber, scheduler, function () {
                    var _a;
                    var value;
                    var done;
                    try {
                        (_a = iterator$1.next(), value = _a.value, done = _a.done);
                    }
                    catch (err) {
                        subscriber.error(err);
                        return;
                    }
                    if (done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(value);
                    }
                }, 0, true);
            });
            return function () { return isFunction(iterator$1 === null || iterator$1 === void 0 ? void 0 : iterator$1.return) && iterator$1.return(); };
        });
    }

    function scheduleAsyncIterable(input, scheduler) {
        if (!input) {
            throw new Error('Iterable cannot be null');
        }
        return new Observable(function (subscriber) {
            executeSchedule(subscriber, scheduler, function () {
                var iterator = input[Symbol.asyncIterator]();
                executeSchedule(subscriber, scheduler, function () {
                    iterator.next().then(function (result) {
                        if (result.done) {
                            subscriber.complete();
                        }
                        else {
                            subscriber.next(result.value);
                        }
                    });
                }, 0, true);
            });
        });
    }

    function scheduleReadableStreamLike(input, scheduler) {
        return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
    }

    function scheduled(input, scheduler) {
        if (input != null) {
            if (isInteropObservable(input)) {
                return scheduleObservable(input, scheduler);
            }
            if (isArrayLike(input)) {
                return scheduleArray(input, scheduler);
            }
            if (isPromise(input)) {
                return schedulePromise(input, scheduler);
            }
            if (isAsyncIterable(input)) {
                return scheduleAsyncIterable(input, scheduler);
            }
            if (isIterable(input)) {
                return scheduleIterable(input, scheduler);
            }
            if (isReadableStreamLike(input)) {
                return scheduleReadableStreamLike(input, scheduler);
            }
        }
        throw createInvalidObservableTypeError(input);
    }

    function from(input, scheduler) {
        return scheduler ? scheduled(input, scheduler) : innerFrom(input);
    }

    function filter(predicate, thisArg) {
        return operate(function (source, subscriber) {
            var index = 0;
            source.subscribe(new OperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
        });
    }

    function switchMap(project, resultSelector) {
        return operate(function (source, subscriber) {
            var innerSubscriber = null;
            var index = 0;
            var isComplete = false;
            var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
            source.subscribe(new OperatorSubscriber(subscriber, function (value) {
                innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
                var innerIndex = 0;
                var outerIndex = index++;
                innerFrom(project(value, outerIndex)).subscribe((innerSubscriber = new OperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                    innerSubscriber = null;
                    checkComplete();
                })));
            }, function () {
                isComplete = true;
                checkComplete();
            }));
        });
    }

    function n(n){for(var t=arguments.length,r=Array(t>1?t-1:0),e=1;e<t;e++)r[e-1]=arguments[e];if("production"!==process.env.NODE_ENV){var i=Y[n],o=i?"function"==typeof i?i.apply(null,r):i:"unknown error nr: "+n;throw Error("[Immer] "+o)}throw Error("[Immer] minified error nr: "+n+(r.length?" "+r.map((function(n){return "'"+n+"'"})).join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function t(n){return !!n&&!!n[Q]}function r(n){return !!n&&(function(n){if(!n||"object"!=typeof n)return !1;var t=Object.getPrototypeOf(n);if(null===t)return !0;var r=Object.hasOwnProperty.call(t,"constructor")&&t.constructor;return r===Object||"function"==typeof r&&Function.toString.call(r)===Z}(n)||Array.isArray(n)||!!n[L]||!!n.constructor[L]||s(n)||v(n))}function i(n,t,r){void 0===r&&(r=!1),0===o(n)?(r?Object.keys:nn)(n).forEach((function(e){r&&"symbol"==typeof e||t(e,n[e],n);})):n.forEach((function(r,e){return t(e,r,n)}));}function o(n){var t=n[Q];return t?t.i>3?t.i-4:t.i:Array.isArray(n)?1:s(n)?2:v(n)?3:0}function u(n,t){return 2===o(n)?n.has(t):Object.prototype.hasOwnProperty.call(n,t)}function a(n,t){return 2===o(n)?n.get(t):n[t]}function f(n,t,r){var e=o(n);2===e?n.set(t,r):3===e?(n.delete(t),n.add(r)):n[t]=r;}function c(n,t){return n===t?0!==n||1/n==1/t:n!=n&&t!=t}function s(n){return X&&n instanceof Map}function v(n){return q&&n instanceof Set}function p(n){return n.o||n.t}function l(n){if(Array.isArray(n))return Array.prototype.slice.call(n);var t=tn(n);delete t[Q];for(var r=nn(t),e=0;e<r.length;e++){var i=r[e],o=t[i];!1===o.writable&&(o.writable=!0,o.configurable=!0),(o.get||o.set)&&(t[i]={configurable:!0,writable:!0,enumerable:o.enumerable,value:n[i]});}return Object.create(Object.getPrototypeOf(n),t)}function d(n,e){return void 0===e&&(e=!1),y(n)||t(n)||!r(n)?n:(o(n)>1&&(n.set=n.add=n.clear=n.delete=h),Object.freeze(n),e&&i(n,(function(n,t){return d(t,!0)}),!0),n)}function h(){n(2);}function y(n){return null==n||"object"!=typeof n||Object.isFrozen(n)}function b(t){var r=rn[t];return r||n(18,t),r}function m(n,t){rn[n]||(rn[n]=t);}function _(){return "production"===process.env.NODE_ENV||U||n(0),U}function j(n,t){t&&(b("Patches"),n.u=[],n.s=[],n.v=t);}function O(n){g(n),n.p.forEach(S),n.p=null;}function g(n){n===U&&(U=n.l);}function w(n){return U={p:[],l:U,h:n,m:!0,_:0}}function S(n){var t=n[Q];0===t.i||1===t.i?t.j():t.O=!0;}function P(t,e){e._=e.p.length;var i=e.p[0],o=void 0!==t&&t!==i;return e.h.g||b("ES5").S(e,t,o),o?(i[Q].P&&(O(e),n(4)),r(t)&&(t=M(e,t),e.l||x(e,t)),e.u&&b("Patches").M(i[Q],t,e.u,e.s)):t=M(e,i,[]),O(e),e.u&&e.v(e.u,e.s),t!==H?t:void 0}function M(n,t,r){if(y(t))return t;var e=t[Q];if(!e)return i(t,(function(i,o){return A(n,e,t,i,o,r)}),!0),t;if(e.A!==n)return t;if(!e.P)return x(n,e.t,!0),e.t;if(!e.I){e.I=!0,e.A._--;var o=4===e.i||5===e.i?e.o=l(e.k):e.o;i(3===e.i?new Set(o):o,(function(t,i){return A(n,e,o,t,i,r)})),x(n,o,!1),r&&n.u&&b("Patches").R(e,r,n.u,n.s);}return e.o}function A(e,i,o,a,c,s){if("production"!==process.env.NODE_ENV&&c===o&&n(5),t(c)){var v=M(e,c,s&&i&&3!==i.i&&!u(i.D,a)?s.concat(a):void 0);if(f(o,a,v),!t(v))return;e.m=!1;}if(r(c)&&!y(c)){if(!e.h.F&&e._<1)return;M(e,c),i&&i.A.l||x(e,c);}}function x(n,t,r){void 0===r&&(r=!1),n.h.F&&n.m&&d(t,r);}function z(n,t){var r=n[Q];return (r?p(r):n)[t]}function I(n,t){if(t in n)for(var r=Object.getPrototypeOf(n);r;){var e=Object.getOwnPropertyDescriptor(r,t);if(e)return e;r=Object.getPrototypeOf(r);}}function k(n){n.P||(n.P=!0,n.l&&k(n.l));}function E(n){n.o||(n.o=l(n.t));}function R(n,t,r){var e=s(t)?b("MapSet").N(t,r):v(t)?b("MapSet").T(t,r):n.g?function(n,t){var r=Array.isArray(n),e={i:r?1:0,A:t?t.A:_(),P:!1,I:!1,D:{},l:t,t:n,k:null,o:null,j:null,C:!1},i=e,o=en;r&&(i=[e],o=on);var u=Proxy.revocable(i,o),a=u.revoke,f=u.proxy;return e.k=f,e.j=a,f}(t,r):b("ES5").J(t,r);return (r?r.A:_()).p.push(e),e}function D(e){return t(e)||n(22,e),function n(t){if(!r(t))return t;var e,u=t[Q],c=o(t);if(u){if(!u.P&&(u.i<4||!b("ES5").K(u)))return u.t;u.I=!0,e=F(t,c),u.I=!1;}else e=F(t,c);return i(e,(function(t,r){u&&a(u.t,t)===r||f(e,t,n(r));})),3===c?new Set(e):e}(e)}function F(n,t){switch(t){case 2:return new Map(n);case 3:return Array.from(n)}return l(n)}function C(){function t(n,t){function r(){this.constructor=n;}a(n,t),n.prototype=(r.prototype=t.prototype,new r);}function e(n){n.o||(n.D=new Map,n.o=new Map(n.t));}function o(n){n.o||(n.o=new Set,n.t.forEach((function(t){if(r(t)){var e=R(n.A.h,t,n);n.p.set(t,e),n.o.add(e);}else n.o.add(t);})));}function u(t){t.O&&n(3,JSON.stringify(p(t)));}var a=function(n,t){return (a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t;}||function(n,t){for(var r in t)t.hasOwnProperty(r)&&(n[r]=t[r]);})(n,t)},f=function(){function n(n,t){return this[Q]={i:2,l:t,A:t?t.A:_(),P:!1,I:!1,o:void 0,D:void 0,t:n,k:this,C:!1,O:!1},this}t(n,Map);var o=n.prototype;return Object.defineProperty(o,"size",{get:function(){return p(this[Q]).size}}),o.has=function(n){return p(this[Q]).has(n)},o.set=function(n,t){var r=this[Q];return u(r),p(r).has(n)&&p(r).get(n)===t||(e(r),k(r),r.D.set(n,!0),r.o.set(n,t),r.D.set(n,!0)),this},o.delete=function(n){if(!this.has(n))return !1;var t=this[Q];return u(t),e(t),k(t),t.D.set(n,!1),t.o.delete(n),!0},o.clear=function(){var n=this[Q];u(n),p(n).size&&(e(n),k(n),n.D=new Map,i(n.t,(function(t){n.D.set(t,!1);})),n.o.clear());},o.forEach=function(n,t){var r=this;p(this[Q]).forEach((function(e,i){n.call(t,r.get(i),i,r);}));},o.get=function(n){var t=this[Q];u(t);var i=p(t).get(n);if(t.I||!r(i))return i;if(i!==t.t.get(n))return i;var o=R(t.A.h,i,t);return e(t),t.o.set(n,o),o},o.keys=function(){return p(this[Q]).keys()},o.values=function(){var n,t=this,r=this.keys();return (n={})[V]=function(){return t.values()},n.next=function(){var n=r.next();return n.done?n:{done:!1,value:t.get(n.value)}},n},o.entries=function(){var n,t=this,r=this.keys();return (n={})[V]=function(){return t.entries()},n.next=function(){var n=r.next();if(n.done)return n;var e=t.get(n.value);return {done:!1,value:[n.value,e]}},n},o[V]=function(){return this.entries()},n}(),c=function(){function n(n,t){return this[Q]={i:3,l:t,A:t?t.A:_(),P:!1,I:!1,o:void 0,t:n,k:this,p:new Map,O:!1,C:!1},this}t(n,Set);var r=n.prototype;return Object.defineProperty(r,"size",{get:function(){return p(this[Q]).size}}),r.has=function(n){var t=this[Q];return u(t),t.o?!!t.o.has(n)||!(!t.p.has(n)||!t.o.has(t.p.get(n))):t.t.has(n)},r.add=function(n){var t=this[Q];return u(t),this.has(n)||(o(t),k(t),t.o.add(n)),this},r.delete=function(n){if(!this.has(n))return !1;var t=this[Q];return u(t),o(t),k(t),t.o.delete(n)||!!t.p.has(n)&&t.o.delete(t.p.get(n))},r.clear=function(){var n=this[Q];u(n),p(n).size&&(o(n),k(n),n.o.clear());},r.values=function(){var n=this[Q];return u(n),o(n),n.o.values()},r.entries=function(){var n=this[Q];return u(n),o(n),n.o.entries()},r.keys=function(){return this.values()},r[V]=function(){return this.values()},r.forEach=function(n,t){for(var r=this.values(),e=r.next();!e.done;)n.call(t,e.value,e.value,this),e=r.next();},n}();m("MapSet",{N:function(n,t){return new f(n,t)},T:function(n,t){return new c(n,t)}});}var G,U,W="undefined"!=typeof Symbol&&"symbol"==typeof Symbol("x"),X="undefined"!=typeof Map,q="undefined"!=typeof Set,B="undefined"!=typeof Proxy&&void 0!==Proxy.revocable&&"undefined"!=typeof Reflect,H=W?Symbol.for("immer-nothing"):((G={})["immer-nothing"]=!0,G),L=W?Symbol.for("immer-draftable"):"__$immer_draftable",Q=W?Symbol.for("immer-state"):"__$immer_state",V="undefined"!=typeof Symbol&&Symbol.iterator||"@@iterator",Y={0:"Illegal state",1:"Immer drafts cannot have computed properties",2:"This object has been frozen and should not be mutated",3:function(n){return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? "+n},4:"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",5:"Immer forbids circular references",6:"The first or second argument to `produce` must be a function",7:"The third argument to `produce` must be a function or undefined",8:"First argument to `createDraft` must be a plain object, an array, or an immerable object",9:"First argument to `finishDraft` must be a draft returned by `createDraft`",10:"The given draft is already finalized",11:"Object.defineProperty() cannot be used on an Immer draft",12:"Object.setPrototypeOf() cannot be used on an Immer draft",13:"Immer only supports deleting array indices",14:"Immer only supports setting array indices and the 'length' property",15:function(n){return "Cannot apply patch, path doesn't resolve: "+n},16:'Sets cannot have "replace" patches.',17:function(n){return "Unsupported patch operation: "+n},18:function(n){return "The plugin for '"+n+"' has not been loaded into Immer. To enable the plugin, import and call `enable"+n+"()` when initializing your application."},20:"Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",21:function(n){return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '"+n+"'"},22:function(n){return "'current' expects a draft, got: "+n},23:function(n){return "'original' expects a draft, got: "+n},24:"Patching reserved attributes like __proto__, prototype and constructor is not allowed"},Z=""+Object.prototype.constructor,nn="undefined"!=typeof Reflect&&Reflect.ownKeys?Reflect.ownKeys:void 0!==Object.getOwnPropertySymbols?function(n){return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n))}:Object.getOwnPropertyNames,tn=Object.getOwnPropertyDescriptors||function(n){var t={};return nn(n).forEach((function(r){t[r]=Object.getOwnPropertyDescriptor(n,r);})),t},rn={},en={get:function(n,t){if(t===Q)return n;var e=p(n);if(!u(e,t))return function(n,t,r){var e,i=I(t,r);return i?"value"in i?i.value:null===(e=i.get)||void 0===e?void 0:e.call(n.k):void 0}(n,e,t);var i=e[t];return n.I||!r(i)?i:i===z(n.t,t)?(E(n),n.o[t]=R(n.A.h,i,n)):i},has:function(n,t){return t in p(n)},ownKeys:function(n){return Reflect.ownKeys(p(n))},set:function(n,t,r){var e=I(p(n),t);if(null==e?void 0:e.set)return e.set.call(n.k,r),!0;if(!n.P){var i=z(p(n),t),o=null==i?void 0:i[Q];if(o&&o.t===r)return n.o[t]=r,n.D[t]=!1,!0;if(c(r,i)&&(void 0!==r||u(n.t,t)))return !0;E(n),k(n);}return n.o[t]===r&&"number"!=typeof r&&(void 0!==r||t in n.o)||(n.o[t]=r,n.D[t]=!0,!0)},deleteProperty:function(n,t){return void 0!==z(n.t,t)||t in n.t?(n.D[t]=!1,E(n),k(n)):delete n.D[t],n.o&&delete n.o[t],!0},getOwnPropertyDescriptor:function(n,t){var r=p(n),e=Reflect.getOwnPropertyDescriptor(r,t);return e?{writable:!0,configurable:1!==n.i||"length"!==t,enumerable:e.enumerable,value:r[t]}:e},defineProperty:function(){n(11);},getPrototypeOf:function(n){return Object.getPrototypeOf(n.t)},setPrototypeOf:function(){n(12);}},on={};i(en,(function(n,t){on[n]=function(){return arguments[0]=arguments[0][0],t.apply(this,arguments)};})),on.deleteProperty=function(t,r){return "production"!==process.env.NODE_ENV&&isNaN(parseInt(r))&&n(13),en.deleteProperty.call(this,t[0],r)},on.set=function(t,r,e){return "production"!==process.env.NODE_ENV&&"length"!==r&&isNaN(parseInt(r))&&n(14),en.set.call(this,t[0],r,e,t[0])};var un=function(){function e(t){var e=this;this.g=B,this.F=!0,this.produce=function(t,i,o){if("function"==typeof t&&"function"!=typeof i){var u=i;i=t;var a=e;return function(n){var t=this;void 0===n&&(n=u);for(var r=arguments.length,e=Array(r>1?r-1:0),o=1;o<r;o++)e[o-1]=arguments[o];return a.produce(n,(function(n){var r;return (r=i).call.apply(r,[t,n].concat(e))}))}}var f;if("function"!=typeof i&&n(6),void 0!==o&&"function"!=typeof o&&n(7),r(t)){var c=w(e),s=R(e,t,void 0),v=!0;try{f=i(s),v=!1;}finally{v?O(c):g(c);}return "undefined"!=typeof Promise&&f instanceof Promise?f.then((function(n){return j(c,o),P(n,c)}),(function(n){throw O(c),n})):(j(c,o),P(f,c))}if(!t||"object"!=typeof t){if((f=i(t))===H)return;return void 0===f&&(f=t),e.F&&d(f,!0),f}n(21,t);},this.produceWithPatches=function(n,t){return "function"==typeof n?function(t){for(var r=arguments.length,i=Array(r>1?r-1:0),o=1;o<r;o++)i[o-1]=arguments[o];return e.produceWithPatches(t,(function(t){return n.apply(void 0,[t].concat(i))}))}:[e.produce(n,t,(function(n,t){r=n,i=t;})),r,i];var r,i;},"boolean"==typeof(null==t?void 0:t.useProxies)&&this.setUseProxies(t.useProxies),"boolean"==typeof(null==t?void 0:t.autoFreeze)&&this.setAutoFreeze(t.autoFreeze);}var i=e.prototype;return i.createDraft=function(e){r(e)||n(8),t(e)&&(e=D(e));var i=w(this),o=R(this,e,void 0);return o[Q].C=!0,g(i),o},i.finishDraft=function(t,r){var e=t&&t[Q];"production"!==process.env.NODE_ENV&&(e&&e.C||n(9),e.I&&n(10));var i=e.A;return j(i,r),P(void 0,i)},i.setAutoFreeze=function(n){this.F=n;},i.setUseProxies=function(t){t&&!B&&n(20),this.g=t;},i.applyPatches=function(n,r){var e;for(e=r.length-1;e>=0;e--){var i=r[e];if(0===i.path.length&&"replace"===i.op){n=i.value;break}}var o=b("Patches").$;return t(n)?o(n,r):this.produce(n,(function(n){return o(n,r.slice(e+1))}))},e}(),an=new un,fn=an.produce,cn=an.produceWithPatches.bind(an),sn=an.setAutoFreeze.bind(an),vn=an.setUseProxies.bind(an),pn=an.applyPatches.bind(an),ln=an.createDraft.bind(an),dn=an.finishDraft.bind(an);

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    var _listCacheClear = listCacheClear;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    var eq_1 = eq;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq_1(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    var _assocIndexOf = assocIndexOf;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    var _listCacheDelete = listCacheDelete;

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    var _listCacheGet = listCacheGet;

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return _assocIndexOf(this.__data__, key) > -1;
    }

    var _listCacheHas = listCacheHas;

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    var _listCacheSet = listCacheSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = _listCacheClear;
    ListCache.prototype['delete'] = _listCacheDelete;
    ListCache.prototype.get = _listCacheGet;
    ListCache.prototype.has = _listCacheHas;
    ListCache.prototype.set = _listCacheSet;

    var _ListCache = ListCache;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction$1(value) {
      if (!isObject_1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1 = isFunction$1;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = _root['__core-js_shared__'];

    var _coreJsData = coreJsData;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    var _isMasked = isMasked;

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    var _toSource = toSource;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject_1(value) || _isMasked(value)) {
        return false;
      }
      var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(_toSource(value));
    }

    var _baseIsNative = baseIsNative;

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    var _getValue = getValue;

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = _getValue(object, key);
      return _baseIsNative(value) ? value : undefined;
    }

    var _getNative = getNative;

    /* Built-in method references that are verified to be native. */
    var Map$1 = _getNative(_root, 'Map');

    var _Map = Map$1;

    /* Built-in method references that are verified to be native. */
    var nativeCreate = _getNative(Object, 'create');

    var _nativeCreate = nativeCreate;

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
      this.size = 0;
    }

    var _hashClear = hashClear;

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    var _hashDelete = hashDelete;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
    }

    var _hashGet = hashGet;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
    }

    var _hashHas = hashHas;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    var _hashSet = hashSet;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = _hashClear;
    Hash.prototype['delete'] = _hashDelete;
    Hash.prototype.get = _hashGet;
    Hash.prototype.has = _hashHas;
    Hash.prototype.set = _hashSet;

    var _Hash = Hash;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new _Hash,
        'map': new (_Map || _ListCache),
        'string': new _Hash
      };
    }

    var _mapCacheClear = mapCacheClear;

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    var _isKeyable = isKeyable;

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return _isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    var _getMapData = getMapData;

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = _getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    var _mapCacheDelete = mapCacheDelete;

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return _getMapData(this, key).get(key);
    }

    var _mapCacheGet = mapCacheGet;

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return _getMapData(this, key).has(key);
    }

    var _mapCacheHas = mapCacheHas;

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = _getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    var _mapCacheSet = mapCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = _mapCacheClear;
    MapCache.prototype['delete'] = _mapCacheDelete;
    MapCache.prototype.get = _mapCacheGet;
    MapCache.prototype.has = _mapCacheHas;
    MapCache.prototype.set = _mapCacheSet;

    var _MapCache = MapCache;

    /** Built-in value references. */
    var Uint8Array$1 = _root.Uint8Array;

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    var _setToArray = setToArray;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    var isArray_1 = isArray;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$4.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /* Built-in method references that are verified to be native. */
    var DataView = _getNative(_root, 'DataView');

    var _DataView = DataView;

    /* Built-in method references that are verified to be native. */
    var Promise$1 = _getNative(_root, 'Promise');

    var _Promise = Promise$1;

    /* Built-in method references that are verified to be native. */
    var Set$1 = _getNative(_root, 'Set');

    var _Set = Set$1;

    /* Built-in method references that are verified to be native. */
    var WeakMap = _getNative(_root, 'WeakMap');

    var _WeakMap = WeakMap;

    /** `Object#toString` result references. */
    var mapTag = '[object Map]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        setTag = '[object Set]',
        weakMapTag = '[object WeakMap]';

    var dataViewTag = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = _toSource(_DataView),
        mapCtorString = _toSource(_Map),
        promiseCtorString = _toSource(_Promise),
        setCtorString = _toSource(_Set),
        weakMapCtorString = _toSource(_WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = _baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (_Map && getTag(new _Map) != mapTag) ||
        (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
        (_Set && getTag(new _Set) != setTag) ||
        (_WeakMap && getTag(new _WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = _baseGetTag(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? _toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    /**
     * This method returns `undefined`.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Util
     * @example
     *
     * _.times(2, _.noop);
     * // => [undefined, undefined]
     */
    function noop$1() {
      // No operation performed.
    }

    var noop_1 = noop$1;

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /**
     * Creates a set object of `values`.
     *
     * @private
     * @param {Array} values The values to add to the set.
     * @returns {Object} Returns the new set.
     */
    var createSet = !(_Set && (1 / _setToArray(new _Set([,-0]))[1]) == INFINITY) ? noop_1 : function(values) {
      return new _Set(values);
    };

    const TYPE_MAP = Symbol('type:map');
    const TYPE_OBJECT = Symbol('type:object');
    const TYPE_VALUE = Symbol('type:value');

    const NAME_UNNAMED = Symbol('unnamed');

    const ABSENT = Symbol('ABSENT');

    const CHILDREN = Symbol('CHILDREN');

    const STAGE_INIT = 'init';
    const STAGE_VALIDATE = 'stage:validate';
    const STAGE_PERFORM = 'stage:perform';
    const STAGE_POST = 'stage:post';
    const STAGE_ERROR = 'stage:error';
    const STAGE_FINAL = 'stage:final';

    const EVENT_TYPE_NEXT = 'next';
    const EVENT_TYPE_CHILD_ADDED = 'childAdded';
    const EVENT_TYPE_REVERT = 'event:revert';
    const EVENT_TYPE_COMMIT = 'event:commit';
    const EVENT_TYPE_ACTION = 'event:action';
    const EVENT_TYPE_MUTATE = 'event:mutate';

    const defaultNextStages = Object.freeze([STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL]);
    const defaultActionStages = Object.freeze([STAGE_INIT, STAGE_PERFORM, STAGE_FINAL]);
    const defaultMutateStages = Object.freeze([STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL]);
    const defaultStageMap = Object.freeze(new Map(
      [
        [EVENT_TYPE_NEXT, defaultNextStages],
        [EVENT_TYPE_ACTION, defaultActionStages],
        [EVENT_TYPE_MUTATE, defaultMutateStages],
      ],
    ));
    const SET_RE = /^set(.+)$/i;

    const TRANS_TYPE_CHANGE = 'trans:change';
    const TRANS_TYPE_ACTION = 'trans:action';

    const TRANS_STATE_NEW = 'trans:state:new';
    const TRANS_STATE_ERROR = 'trans:state:error';
    const TRANS_STATE_COMPLETE = 'trans:state:complete';

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        TYPE_MAP: TYPE_MAP,
        TYPE_OBJECT: TYPE_OBJECT,
        TYPE_VALUE: TYPE_VALUE,
        NAME_UNNAMED: NAME_UNNAMED,
        ABSENT: ABSENT,
        CHILDREN: CHILDREN,
        STAGE_INIT: STAGE_INIT,
        STAGE_VALIDATE: STAGE_VALIDATE,
        STAGE_PERFORM: STAGE_PERFORM,
        STAGE_POST: STAGE_POST,
        STAGE_ERROR: STAGE_ERROR,
        STAGE_FINAL: STAGE_FINAL,
        EVENT_TYPE_NEXT: EVENT_TYPE_NEXT,
        EVENT_TYPE_CHILD_ADDED: EVENT_TYPE_CHILD_ADDED,
        EVENT_TYPE_REVERT: EVENT_TYPE_REVERT,
        EVENT_TYPE_COMMIT: EVENT_TYPE_COMMIT,
        EVENT_TYPE_ACTION: EVENT_TYPE_ACTION,
        EVENT_TYPE_MUTATE: EVENT_TYPE_MUTATE,
        defaultNextStages: defaultNextStages,
        defaultActionStages: defaultActionStages,
        defaultMutateStages: defaultMutateStages,
        defaultStageMap: defaultStageMap,
        SET_RE: SET_RE,
        TRANS_TYPE_CHANGE: TRANS_TYPE_CHANGE,
        TRANS_TYPE_ACTION: TRANS_TYPE_ACTION,
        TRANS_STATE_NEW: TRANS_STATE_NEW,
        TRANS_STATE_ERROR: TRANS_STATE_ERROR,
        TRANS_STATE_COMPLETE: TRANS_STATE_COMPLETE
    });

    const isNumberLodash = require('lodash/isNumber');

    function toMap(m, force) {
      if (m instanceof Map) {
        return force ? new Map(m) : m;
      }
      const map = new Map();
      Object.keys(m)
        .forEach((key) => map.set(key, m[key]));
      return map;
    }

    /** * ****************** INTROSPECTION ****************** */

    /**
     * note - the tests isObj, isArr, isMap are EXCLUSIVE
     * - only one (or none) of them should test true
     * for any given target
     */

    /**
     * returns true if the object is a POJO object -- that is,
     * its non-null, is an instance of Object, and is not an array.
     *
     * @param o
     * @returns {boolean}
     */
    function isObj(o) {
      return o && (typeof o === 'object') && (!Array.isArray(o)) && (!(o instanceof Map));
    }

    /**
     * a type check; if nonEmpty = true, only true if array has indexed values.
     * @param a
     * @param nonEmpty
     * @returns {boolean}
     */
    function isArr(a, nonEmpty = false) {
      return Array.isArray(a) && (!nonEmpty || a.length);
    }

    const isMap = (m) => m && (m instanceof Map);

    const isFn = (f) => typeof f === 'function';

    const e = (err, notes = {}) => {
      if (typeof err === 'string') {
        err = new Error(err);
      }
      if (!isThere(notes)) {
        notes = {};
      } else if (!isObj(notes)) {
        notes = { notes };
      }
      return Object.assign(err, notes);
    };

    function isStr(s, nonEmpty = false) {
      if (typeof s === 'string') {
        return nonEmpty ? !!s : true;
      }
      return false;
    }

    /**
     * returns a POJO object equivalent to the input;
     * or the input itself if force !== true;
     * If a map is passed, its keys are forced into a POJO; unusable keys
     * are silently skipped.
     *
     * @param m
     * @param force {boolean} returns a clone of an input object; otherwise is a noop for POJOS
     * @returns {Object}
     */
    function toObj(m, force = false) {
      if (!(isObj(m) || isMap(m))) {
        throw Object.assign(new Error('cannot convert target to object'), { target: m });
      }
      let out = m;
      if (isObj(m)) {
        if (force) {
          out = { ...m };
        }
      } else if (isMap(m)) {
        out = {};
        m.forEach((val, key) => {
          if (!((typeof key === 'number') || (typeof key === 'string'))) {
            return;
          }
          try {
            out[key] = val;
          } catch (e) {
            console.warn('toObj map/object conversion -- skipping exporting of child key', key, 'of ', m);
          }
        });
      }

      return out;
    }

    function asUserAction(str) {
      if (typeof str !== 'string') {
        throw new Error('bad user action');
      }

      while (str.substr(0, 2) !== '$$') str = `$${str}`;
      return str;
    }

    const noop$2 = (n) => n;

    function maybeImmer(target) {
      if (!r(target)) {
        return target;
      }
      return fn(target, noop$2);
    }

    const isNumber = isNumberLodash;

    /**
     * returns true unless item is ABSENT or undefined;
     *
     * @param item {any}
     * @returns {boolean}
     */
    function isThere(item) {
      return ![ABSENT, NAME_UNNAMED, undefined].includes(item);
    }

    function unsub(sub) {
      if (sub) {
        try {
          sub.unsubscribe();
        } catch (err) {

        }
      }
    }

    function ucFirst(str) {
      if (!isStr(str, true)) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function strip(name, target) {
      if (isMap(target)) {
        const newMap = new Map(target);
        newMap.delete(name);
        return newMap;
      }
      if (isObj(target)) {
        const out = { ...target };
        delete out[name];
        return out;
      }
      console.warn('cannot strip', target);
      return target;
    }

    function mapFromKeys(target, keyMap) {
      if (!(isMap(target) && isMap(keyMap))) throw e('mapFromKeys - bad values:', { target, keyMap });
      const out = new Map();
      keyMap.forEach((_, key) => {
        if (target.has(key)) {
          out.set(key, target.get(key));
        }
      });

      return out;
    }

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        toMap: toMap,
        isObj: isObj,
        isArr: isArr,
        isMap: isMap,
        isFn: isFn,
        e: e,
        isStr: isStr,
        toObj: toObj,
        asUserAction: asUserAction,
        noop: noop$2,
        maybeImmer: maybeImmer,
        isNumber: isNumber,
        isThere: isThere,
        unsub: unsub,
        ucFirst: ucFirst,
        strip: strip,
        mapFromKeys: mapFromKeys
    });

    /* eslint-disable no-param-reassign */

    function mirrorType(target, value = ABSENT) {
      if (value === ABSENT) value = target.value;

      if (isMap(value)) {
        return TYPE_MAP;
      }
      if (isObj(value)) {
        return TYPE_OBJECT;
      }
      return TYPE_VALUE;
    }

    function makeDoProxy(mirror) {
      return new Proxy(mirror, {
        get(target, prop) {
          if (target.$__actions && target.$_actions.has(prop)) {
            return (...args) => target.$event(EVENT_TYPE_ACTION, {
              name: prop,
              args,
            });
          }
          if (target.$isContainer) {
            if (isStr(prop)) {
              if (SET_RE.test(prop)) {
                const setName = SET_RE.exec(prop)[1];
                const keyFor = target.$keyFor(setName);
                if (keyFor) {
                  return (value) => target.$set(keyFor, value);
                }
              }
            }
          }
          console.warn('cannot find action ', prop, 'in', target);
          return noop$2;
        },
      });
    }

    function makeDoObj(target) {
      const doObj = {};
      this.$_actions.forEach((fn, name) => {
        doObj[name] = (...args) => target.$event(EVENT_TYPE_ACTION, { name, args });
      });
      if (this.$isContainer) {
        this.$keys.forEach((name) => {
          doObj[`set${ucFirst(name)}`] = (...args) => target.$event(EVENT_TYPE_ACTION, { name, args });
        });
      }
      return doObj;
    }

    /**
     *
     * @param target {object}
     * @param name {string}
     * @param creator {function}
     */
    function lazy(target, name, creator) {
      if (!(name in target)) {
        target[name] = creator(target, name);
      }
      return target[name];
    }

    class MirrorEvent extends BehaviorSubject {
      constructor(value, type, target = ABSENT, stage = STAGE_INIT, err = ABSENT) {
        super(value);
        // todo: use $stagesFor to set initial target
        this.$target = target;
        this.$type = type;
        this.$_constructed = true;
        this.$stage = stage;
        this.$err = err;
      }

      error(err) {
        if (!this.isStopped) {
          this.complete();
          this.$target.$_eventQueue.next(new MirrorEvent(this.value, this.$type, this.$target, STAGE_ERROR, err));
        }
      }
    }

    const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

    let poolPtr = rnds8Pool.length;
    function rng() {
      if (poolPtr > rnds8Pool.length - 16) {
        crypto.randomFillSync(rnds8Pool);
        poolPtr = 0;
      }

      return rnds8Pool.slice(poolPtr, poolPtr += 16);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    const byteToHex = [];

    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr, offset = 0) {
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    //
    // Inspired by https://github.com/LiosK/UUID.js
    // and http://docs.python.org/library/uuid.html

    let _nodeId;

    let _clockseq; // Previous uuid creation time


    let _lastMSecs = 0;
    let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

    function v1(options, buf, offset) {
      let i = buf && offset || 0;
      const b = buf || new Array(16);
      options = options || {};
      let node = options.node || _nodeId;
      let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
      // specified.  We do this lazily to minimize issues related to insufficient
      // system entropy.  See #189

      if (node == null || clockseq == null) {
        const seedBytes = options.random || (options.rng || rng)();

        if (node == null) {
          // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
          node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        }

        if (clockseq == null) {
          // Per 4.2.2, randomize (14 bit) clockseq
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
        }
      } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
      // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
      // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
      // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


      let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
      // cycle to simulate higher resolution clock

      let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

      const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

      if (dt < 0 && options.clockseq === undefined) {
        clockseq = clockseq + 1 & 0x3fff;
      } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
      // time interval


      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
        nsecs = 0;
      } // Per 4.2.1.2 Throw error if too many uuids are requested


      if (nsecs >= 10000) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }

      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

      msecs += 12219292800000; // `time_low`

      const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
      b[i++] = tl >>> 24 & 0xff;
      b[i++] = tl >>> 16 & 0xff;
      b[i++] = tl >>> 8 & 0xff;
      b[i++] = tl & 0xff; // `time_mid`

      const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
      b[i++] = tmh >>> 8 & 0xff;
      b[i++] = tmh & 0xff; // `time_high_and_version`

      b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

      b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

      b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

      b[i++] = clockseq & 0xff; // `node`

      for (let n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }

      return buf || stringify(b);
    }

    function parse(uuid) {
      if (!validate(uuid)) {
        throw TypeError('Invalid UUID');
      }

      let v;
      const arr = new Uint8Array(16); // Parse ########-....-....-....-............

      arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
      arr[1] = v >>> 16 & 0xff;
      arr[2] = v >>> 8 & 0xff;
      arr[3] = v & 0xff; // Parse ........-####-....-....-............

      arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
      arr[5] = v & 0xff; // Parse ........-....-####-....-............

      arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
      arr[7] = v & 0xff; // Parse ........-....-....-####-............

      arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
      arr[9] = v & 0xff; // Parse ........-....-....-....-############
      // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

      arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
      arr[11] = v / 0x100000000 & 0xff;
      arr[12] = v >>> 24 & 0xff;
      arr[13] = v >>> 16 & 0xff;
      arr[14] = v >>> 8 & 0xff;
      arr[15] = v & 0xff;
      return arr;
    }

    function stringToBytes(str) {
      str = unescape(encodeURIComponent(str)); // UTF8 escape

      const bytes = [];

      for (let i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
      }

      return bytes;
    }

    const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
    function v35 (name, version, hashfunc) {
      function generateUUID(value, namespace, buf, offset) {
        if (typeof value === 'string') {
          value = stringToBytes(value);
        }

        if (typeof namespace === 'string') {
          namespace = parse(namespace);
        }

        if (namespace.length !== 16) {
          throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
        } // Compute hash of namespace and value, Per 4.3
        // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
        // hashfunc([...namespace, ... value])`


        let bytes = new Uint8Array(16 + value.length);
        bytes.set(namespace);
        bytes.set(value, namespace.length);
        bytes = hashfunc(bytes);
        bytes[6] = bytes[6] & 0x0f | version;
        bytes[8] = bytes[8] & 0x3f | 0x80;

        if (buf) {
          offset = offset || 0;

          for (let i = 0; i < 16; ++i) {
            buf[offset + i] = bytes[i];
          }

          return buf;
        }

        return stringify(bytes);
      } // Function#name is not settable on some platforms (#270)


      try {
        generateUUID.name = name; // eslint-disable-next-line no-empty
      } catch (err) {} // For CommonJS default export support


      generateUUID.DNS = DNS;
      generateUUID.URL = URL;
      return generateUUID;
    }

    function md5(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === 'string') {
        bytes = Buffer.from(bytes, 'utf8');
      }

      return crypto.createHash('md5').update(bytes).digest();
    }

    const v3 = v35('v3', 0x30, md5);

    function v4(options, buf, offset) {
      options = options || {};
      const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    function sha1(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === 'string') {
        bytes = Buffer.from(bytes, 'utf8');
      }

      return crypto.createHash('sha1').update(bytes).digest();
    }

    const v5 = v35('v5', 0x50, sha1);

    var nil = '00000000-0000-0000-0000-000000000000';

    function version(uuid) {
      if (!validate(uuid)) {
        throw TypeError('Invalid UUID');
      }

      return parseInt(uuid.substr(14, 1), 16);
    }



    var esmNode = /*#__PURE__*/Object.freeze({
        __proto__: null,
        v1: v1,
        v3: v3,
        v4: v4,
        v5: v5,
        NIL: nil,
        version: version,
        validate: validate,
        stringify: stringify,
        parse: parse
    });

    var uuid_1 = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID
      : esmNode.v4;

    // Maps for number <-> hex string conversion
    var _byteToHex = [];
    var _hexToByte = {};
    for (var i$1 = 0; i$1 < 256; i$1++) {
      _byteToHex[i$1] = (i$1 + 0x100).toString(16).substr(1);
      _hexToByte[_byteToHex[i$1]] = i$1;
    }

    // **`parse()` - Parse a UUID into it's component bytes**
    function parse$1(s, buf, offset) {
      var i = (buf && offset) || 0;
      var ii = 0;

      buf = buf || [];
      s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
        if (ii < 16) { // Don't overflow!
          buf[i + ii++] = _hexToByte[oct];
        }
      });

      // Zero out remaining bytes if string was short
      while (ii < 16) {
        buf[i + ii++] = 0;
      }

      return buf;
    }

    // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
    function unparse(buf, offset) {
      var i = offset || 0;
      var bth = _byteToHex;
      return  bth[buf[i++]] + bth[buf[i++]] +
              bth[buf[i++]] + bth[buf[i++]] + '-' +
              bth[buf[i++]] + bth[buf[i++]] + '-' +
              bth[buf[i++]] + bth[buf[i++]] + '-' +
              bth[buf[i++]] + bth[buf[i++]] + '-' +
              bth[buf[i++]] + bth[buf[i++]] +
              bth[buf[i++]] + bth[buf[i++]] +
              bth[buf[i++]] + bth[buf[i++]];
    }

    var uuidParse = {
      parse: parse$1,
      unparse: unparse
    };

    const maxInt = Math.pow(2, 31) - 1;
    const Buffer$1 = buffer.Buffer;

    function hyperid (opts) {
      let fixedLength = false;
      let urlSafe = false;
      if (typeof opts === 'boolean') {
        fixedLength = opts;
      } else {
        opts = opts || {};
        urlSafe = !!opts.urlSafe;
        fixedLength = !!opts.fixedLength;
      }

      generate.uuid = uuid_1();
      generate.decode = decode;

      let id = baseId(generate.uuid, urlSafe);
      let count = Math.floor(opts.startFrom || 0);

      if (isNaN(count) || !(maxInt > count && count >= 0)) {
        throw new Error([
          `when passed, opts.startFrom must be a number between 0 and ${maxInt}.`,
          'Only the integer part matters.',
          `- got: ${opts.startFrom}`
        ].join('\n'))
      }

      return generate

      function generate () {
        const result = fixedLength
          ? id + pad(count++)
          : id + count++;

        if (count === maxInt) {
          generate.uuid = uuid_1();
          id = baseId(generate.uuid, urlSafe); // rebase
          count = 0;
        }

        return result
      }
    }

    function pad (count) {
      if (count < 10) return '000000000' + count
      if (count < 100) return '00000000' + count
      if (count < 1000) return '0000000' + count
      if (count < 10000) return '000000' + count
      if (count < 100000) return '00000' + count
      if (count < 1000000) return '0000' + count
      if (count < 10000000) return '000' + count
      if (count < 100000000) return '00' + count
      if (count < 1000000000) return '0' + count
      return count
    }

    function baseId (id, urlSafe) {
      let base64Id = Buffer$1.from(uuidParse.parse(id)).toString('base64');
      const l = base64Id.length;
      if (urlSafe) {
        if (base64Id[l - 2] === '=' && base64Id[l - 1] === '=') {
          base64Id = base64Id.substr(0, l - 2) + '-';
        }
        return base64Id.replace(/\+/g, '_').replace(/\//g, '-')
      }
      if (base64Id[l - 2] === '=' && base64Id[l - 1] === '=') {
        return base64Id.substr(0, l - 2) + '/'
      }
      return base64Id
    }

    function decode (id, opts) {
      opts = opts || {};
      const urlSafe = !!opts.urlSafe;

      if (urlSafe) {
        id = id.replace(/-/g, '/').replace(/_/g, '+');
      }

      const lastSlashIndex = id.lastIndexOf('/');
      if (lastSlashIndex === -1) {
        return null
      }
      const uuidPart = id.substring(0, lastSlashIndex);
      const countPart = Number(id.substring(lastSlashIndex + 1));
      if (!uuidPart || isNaN(countPart)) {
        return null
      }

      const result = {
        uuid: uuidParse.unparse(Buffer$1.from(uuidPart + '==', 'base64')),
        count: countPart
      };

      return result
    }

    var hyperid_1 = hyperid;
    var decode_1 = decode;
    hyperid_1.decode = decode_1;

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
    }

    var isSymbol_1 = isSymbol;

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray_1(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol_1(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    var _isKey = isKey;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || _MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = _MapCache;

    var memoize_1 = memoize;

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize_1(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    var _memoizeCapped = memoizeCapped;

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = _memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 /* . */) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    var _stringToPath = stringToPath;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    var _arrayMap = arrayMap;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
        symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray_1(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return _arrayMap(value, baseToString) + '';
      }
      if (isSymbol_1(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    var _baseToString = baseToString;

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : _baseToString(value);
    }

    var toString_1 = toString;

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray_1(value)) {
        return value;
      }
      return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
    }

    var _castPath = castPath;

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol_1(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
    }

    var _toKey = toKey;

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = _castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[_toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    var _baseGet = baseGet;

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : _baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    var get_1 = get;

    const hyper = hyperid_1();

    class MirrorTrans {
      constructor({
        name = ABSENT,
        creator = ABSENT,
        parent = ABSENT,
        type = TRANS_TYPE_CHANGE,
        value = ABSENT,
      }) {
        this.id = hyper();
        this.name = name;
        this.sharded = false;
        this.validated = false;
        this.creator = creator;
        this.parent = parent;
        this.type = type;
        this.value = value;
        this.state = TRANS_STATE_NEW;
      }

      matches(compareTo) {
        return (get_1(compareTo, 'id', compareTo) === this.id);
      }
    }

    MirrorTrans[L] = true;

    /* eslint-disable camelcase */

    var withTrans = (BaseClass) => (class WithTrans extends BaseClass {
      get $_pending() {
        return lazy(this, '$__pending', (target) => {
          const pending = new BehaviorSubject([]);
          pending.subscribe({
            next(list) {
              target.$_flushPendingIfDone(list);
            },
          });
          return pending;
        });
      }

      $_upsertTrans(item) {
        let list = [...this.$_pending.value];
        if (list.some((candidate) => candidate.id === item.id)) {
          list = this.$_pending.map((candidate) => (candidate.id === item.id ? item : candidate));
        } else {
          list.push(item);
        }
        this.$_pending.next(fn(list, (draft) => draft));
      }

      /**
       * flushTrans checks if the transactions are all complete;
       * if they are, then the last value in the list is committed, and all the transactions
       * are removed from the $pending queue.
       * @param list
       */
      $_flushPendingIfDone(list) {
        if (!isThere(list)) return this.$_flushPendingIfDone(this.$_pending.value);
        if (list.length) {
          if (list.all((transaction) => transaction.state === TRANS_STATE_COMPLETE)) {
            if (this.$isContainer) {
              this.$children.forEach((child) => child.$_flushPendingIfDone());
            }
            this.$_commitTrans(list);
          }
        } else if (this.$isContainer) {
          // no transactions in this container, but there may be some in children
          // @TODO: might cause more than one update to root (this);
          // put under their own transaction? or poll then flush (or both)?
          // or, float shards into the parent class?
          this.$children.forEach((child) => child.$_flushPendingIfDone());
        }
        return this;
      }

      /**
       * commits the most recent value changes;
       * and empties the $_pending queue of all entries.
       * Should only be done if all the transactions are complete -- eg, after a $_flushPendingIfDone
       * @param list
       */
      $_commitTrans(list = ABSENT) {
        if (!isThere(list)) return this.$_commitTrans(this.$_pending.value);
        const changes = list.filter((trans) => trans.type === TRANS_TYPE_CHANGE);
        const lastChange = changes.pop();
        if (lastChange && isThere(lastChange.value)) {
          super.next(lastChange.value);
        }
        this.$_pending.next([]);
        return this;
      }

      /**
       * $_try needs to be updated -- its not really where it should be
       * @param value
       */
      $_try(value, parent = ABSENT) {
        if (this.isStopped) {
          throw e('cannot try value on stopped Mirror', {
            value,
            target: this,
          });
        }

        this.$_addTrans({
          value,
          type: TRANS_TYPE_CHANGE,
          parent,
          sharded: !this.$isContainer,
        });
      }

      $_addTrans(def) {
        if (this.isStopped) {
          throw e('cannot transact on stopped mirror', { trans: def });
        }
        const trans = fn(def, (draft) => new MirrorTrans(draft));
        this.$_upsertTrans(fn(def, (draft) => new MirrorTrans(draft)));
        if (trans.type === TRANS_TYPE_CHANGE) {
          // @TODO: shard
          if (!this.$isValid()) {
            const value = this.getValue();
            if (!this.$_pending.value.some((trans) => trans.type === TRANS_TYPE_ACTION)) {
              this.$_pending.next([]);
            } // else let  action closure clear pending and rethrow to allow parent actions to catch.
            throw e('invalid value', { value, target: this });
          }
        }
        return trans;
      }

      /**
       * updates an existing transaction with a mutator function
       * @param matchTo {int|MirrorTrans} the original transaction (or its ID)
       * @param fn {function}
       * @returns {null|MirrorTrans}
       */
      $_updateTrans(matchTo, fn$1) {
        const matched = this.$_pending.value.find((trans) => trans.matches(matchTo));
        if (matched) {
          const nextTrans = fn(matched, fn$1);
          this.$_upsertTrans(nextTrans);
          return nextTrans;
        }
        return null;
      }
    });

    var withAction = (BaseClass) => class WithAction extends BaseClass {
      $keyFor(fieldName) {
        if (!this.$isContainer) {
          return null;
        }
        if (!isStr(fieldName)) {
          return null;
        }
        if (this.$has(fieldName)) {
          return fieldName;
        }
        const lowerCaseFieldName = fieldName.toLowerCase();
        let match = null;
        const test = (key) => {
          if (isStr(key) && key.toLowerCase() === lowerCaseFieldName) {
            match = key;
          }
        };
        if (this.$type === TYPE_MAP) {
          this.value.forEach(test);
        }
        if (this.$type === TYPE_OBJECT) {
          Object.keys(this.value)
            .forEach(test);
        }
        return match;
      }

      get $_doObj() {
        return lazy(this, '$__doObj', makeDoObj);
      }

      get $_doProxy() {
        return lazy(this, '$__doProxy', makeDoProxy);
      }

      get $do() {
        if (typeof Proxy === 'undefined') {
          return this.$_doObj;
        }
        return this.$_doProxy;
      }

      $addAction(name, fn) {
        if (this.$_actions.has(name)) {
          console.warn('overwriting existing action in mirror', this);
        }
        this.$_actions.set(name, fn);
      }
    };

    function newMirror(...args) {
      return new Mirror(...args);
    }

    var withChildren = (BaseClass) => class WithChildren extends BaseClass {
      get $children() {
        return lazy(this, '$_children', () => new Map());
      }

      get $_childSubs() {
        return lazy(this, '$__childSubs', () => new Map());
      }

      $addChild(name, value, type = TYPE_VALUE) {
        if (this.isStopped) {
          throw e('attempt to redefine stopped mirror', {
            target: this,
            name,
            value,
          });
        }
        const childMirror = newMirror(value, {
          name,
          type,
          parent: this,
        });

        this.$children.set(name, childMirror);
        const target = this;
        this.$_childSubs.set(name, childMirror.subscribe({
          next() {
            // on a child sub change, set the target to next;
            // child value will get mixed in.
            if (!target.$isTrying) {
              target.next(target.getValue());
            }
          },
          error(err) {
            console.log('--- child error thrown', err,
              'for child', name, 'of', target);
          },
        }));
        if (this.$_constructed) {
          this.$event(EVENT_TYPE_CHILD_ADDED, {
            name,
            childMirror,
          });
        }
        this.next(this.getValue());
      }

      /**
       * returns false if any children are invalid.
       * @returns {boolean}
       */
      get $childErrors() {
        if (!this.$isContainer) {
          return false;
        }
        if (this.$parent) {
          return this.$parent.$errors;
        }
        return false;
      }

      /**
       * override/assert child values over the current value.
       * @param value
       * @returns {symbol}
       */
      $_valueWithChildren(value = ABSENT) {
        if (!isThere(value)) {
          value = this.$_pendingValue;
        }

        const target = this;
        return fn(value, (draft) => {
          target.$children.forEach((childMirror, name) => {
            switch (target.$type) {
              case TYPE_MAP:
                draft.set(name, childMirror.value);
                break;

              case TYPE_OBJECT:
                draft[name] = childMirror.value;
                break;
            }
          });
        });
      }
    };

    /* eslint-disable */

    C();

    /**
     * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
     * which, when updated, update the parent.
     * This allows for field level validation, transactional updates and all sorts of other goodies.
     */
    class Mirror extends withAction(withChildren((withTrans(BehaviorSubject)))) {
      constructor(value, config = ABSENT) {
        super(value);
        this.$configure(config);
        this.$_listen();
        this.$_constructed = true;
      }

      /** *************** configuration/type ****************** */

      $configure(config = {}) {
        if (!this.$_constructed) {
          this.$_type = mirrorType(this, this.value);
        }
        if (!(isObj(config) || (isMap(config)))) {
          return this.$configure({});
        }
        const {
          name = NAME_UNNAMED,
          test = ABSENT,
          type = ABSENT,
          parent = ABSENT,
          children = ABSENT,
          actions = ABSENT,
        } = toObj(config);

        if (isThere(actions) && isObj(actions)) {
          Object.keys(actions)
            .forEach((actionName) => {
              this.$addAction(actionName, actions[actionName]);
            });
        }

        if (isThere(name)) {
          this.$name = name;
        }

        if (isThere(test)) {
          this.$_test = test;
        }

        if (isThere(type)) {
          this.$_type = type;
        }

        if (isThere(parent)) {
          this.$parent = parent;
        }

        if (isThere(children)) {
          toMap(children)
            .forEach((child, name) => {
              this.$addChild(name, child);
            });
        }
      }

      get $type() {
        return this.$_type;
      }

      get $isContainer() {
        return this.$type === TYPE_MAP || this.$type === TYPE_OBJECT;
      }

      get $isValue() {
        return this.$type === TYPE_VALUE;
      }

      $keys() {
        const childKeys = this.$_children ? Array.from(this.$children.keys()) : [];
        let valueKeys = [];
        if (this.$type === TYPE_MAP) {
          const valueKeys = Array.from(this.value.keys());
        }
        if (this.$type === TYPE_OBJECT) {
          valueKeys = Array.from(Object.keys(this.value));
        }
        const uniqValKeys = valueKeys.filter(key => !childKeys.includes(key));
        return [...uniqValKeys, ...childKeys].filter(k => isStr(k, true))
          .sort();
      }

      /** *************** Subject handlers ****************** */

      /**
       *
       * @param nextValue
       * @return {Subscription};
       */
      next(nextValue) {
        if (!this.$_constructed) {
          // do not validate first value; accept it no matter what
          super.next(nextValue);
        } else {
          return this.$event(EVENT_TYPE_NEXT, nextValue);
        }
      }

      /**
       * returns the value that is queued to replace the current value.
       * If there is no pending value, returns the actual current value.
       * @returns {*}
       */
      get $_pendingValue() {
        // let queuedValue = this.$_lastQueuedValue;
        // if (queuedValue !== ABSENT) {
        //   return queuedValue;
        // }
        return isThere(this.$_trialValue) ? this.$_trialValue : super.getValue(); // $_trialValue is being deprecated
      }

      getValue() {
        let value = this.$_pendingValue;
        if (this.$isValue) {
          return value;
        }
        return this.$_valueWithChildren(value);
      }

      /** *************** try/catch, validation ****************** */

      get $isTrying() {
        return isThere(this.$_trialValue);
      }

      /**
       *
       * @returns {undefined|function}
       */
      get $test() {
        return isFn(this.$_test) ? this.$_test : undefined;
      }

      $isValid(candidate = ABSENT) {
        if (!isThere(candidate)) {
          candidate = this.getValue();
        }
        return !this.$errors(candidate);
      }

      $errors(candidate = ABSENT) {
        if (!isThere(candidate)) {
          candidate = this.getValue();
        }
        let errors = false;
        if (isFn(this.$test)) {
          try {
            errors = this.$test(candidate);
          } catch (err) {
            errors = err;
          }
        }

        return errors || (this.$isContainer ? this.$childErrors : false);
      }

      /** *************** event queue ****************** */

      $_listen() {
        this.$on(
          EVENT_TYPE_NEXT,
          (value, p, t) => {
            t.$_trialValue = value;
          },
          STAGE_INIT
        );
        this.$on(
          EVENT_TYPE_NEXT,
          (value, p, t) => {
            const errs = t.$errors();
            if (errs) {
              t.$revert();
              p.error(errs);
            }
          },
          STAGE_VALIDATE
        ); // local validation

        this.$on(
          EVENT_TYPE_NEXT,
          (value, p, t) => t.$commit(),
          STAGE_FINAL
        );

        this.$on(
          EVENT_TYPE_MUTATE,
          ({
            fn: fn$1,
            args
          }, p, t) => {
            try {
              let nextValue = fn(t.value, (draft) => {
                return fn$1(draft, t, ...args);
              });
              p.next({
                fn: fn$1,
                args,
                nextValue
              });
            } catch (err) {
              p.error(err);
            }
          },
          STAGE_PERFORM
        );

        this.$on(
          EVENT_TYPE_MUTATE,
          ({
            fn,
            args,
            nextValue
          }, p, t) => {
            const nextEvent = t.next(nextValue);
            if (nextEvent && nextEvent.thrownError) {
              p.error(nextEvent.thrownError);
            } else {
              p.next({
                fn,
                args,
                nextValue,
                next: t.value
              });
            }
          },
          STAGE_FINAL
        );

        this.$on(EVENT_TYPE_ACTION, ({
          name,
          args
        }, p, t) => {
          if (!t.$_actions.has(name)) {
            p.error(e('no action named ' + name));
          } else {
            try {
              t.$_actions.get(name)(t, ...args);
            } catch (err) {
              p.error(err);
            }
          }
        });
      }

      /**
       *
       * @returns {Observable}
       */
      get $_eventQueue() {
        return lazy(this, '$__eventQueue', () => new Subject()
          .pipe(switchMap((value) => from([value]))));
      }

      /**
       *
       * @returns {Map}
       */
      get $_stages() {
        return lazy(this, '$__stages', () => new Map(defaultStageMap));
      }

      /**
       *
       * @param type
       * @param value
       * @returns {(string)[]}
       */
      $_stagesFor(type, value) {
        if (this.$_stages.has(type)) {
          return this.$_stages.get(type);
        } else {
          return defaultNextStages;
        }
      }

      $setStages(type, list) {
        if (!isArr(list)) {
          throw e('bad input to $setStages', {
            type,
            list
          });
        }

        this.$_stages.set(type, list);
      }

      $event(type, value = ABSENT, onSuccess, onFail, onComplete) {
        let stages = this.$_stagesFor(type, value);
        const target = this;
        const event = new MirrorEvent(value, type, this);
        event.subscribe({
          complete() {
            if (isFn(onComplete)) {
              target.$_do(onComplete);
            }
          },
          error(err) {
            target.$_eventQueue.next({
              value: err,
              $type: type,
              $stage: STAGE_ERROR
            });
            if (isFn(onFail)) {
              target.$_do(onFail, err);
            }
            if (isFn(onComplete)) {
              target.$_do(onComplete, err);
            }
          }
        });
        for (let i = 0; i < stages.length; ++i) {
          event.$stage = stages[i];
          try {
            this.$_eventQueue.next(event);
          } catch (err) {
            console.log('error on next', err);
          }
          if (event.isStopped) {
            break;
          } else {
            value = event.value;
          }
        }
        if (!event.isStopped) {
          event.complete();
        }
        return event;
      }

      $once($type, handler, ...rest) {
        let sub;
        const tap = (...args) => {
          try {
            let out = handler(...args);
            unsub(sub);
            return out;
          } catch (err) {
            unsub(sub);
            throw err;
          }
        };
        sub = this.$on($type, tap, ...rest);
        return sub;
      }

      $on($type, handler, $stage = STAGE_PERFORM, $test = ABSENT) {
        const target = this;
        if (!isFn(handler)) {
          throw e('second argument of $on must be function', {
            target: this,
            type: $type,
            handler
          });
        }

        return this.$_eventQueue
          .pipe(
            filter((phase) => (
              (($type === '*') || (phase.$type === $type))
              && (($stage === '*') || (phase.$stage === $stage))
              && ((!isFn($test)) || $test(phase.value, phase, target)))
            )
          )
          .subscribe({
            error(err) {
              console.log('$on error:', err);
            },
            next(phase) {
              const {
                $type: type,
                $stage: stage,
                value
              } = phase;
              try {
                handler(value, phase, target);
              } catch (err) {
                if (!phase.isStopped) {
                  phase.error(err);
                }
              }
            }
          });
      }

      /**
       * executes a function, silently stifling errors.
       * returns any thrown error as a result -- or the result of fn, if no error is thrown
       * note - $_do is NOT async - async output will return a promise which must be managed externally
       *
       * @param fn
       * @param args
       */
      $_do(fn, ...args) {
        let result = null;
        let error = null;
        if (isFn(fn)) {
          try {
            result = fn(this, this.value, ...args);
          } catch (err) {
            error = err;
          }
        }

        return error ? error : result;
      }

      /**
       * either finalized a new next value, or locks in the trial value.
       * Updates the parent._next value;
       * note -- passing a new value into $commit IGNORES errors!
       * @param value
       */
      $commit(value = ABSENT) {
        if (this.isStopped) {
          throw e('cannot commit value to committed Mirror', {
            value,
            target: this
          });
        }
        if (isThere(value)) {
          super.next(value);
          this.$event(EVENT_TYPE_COMMIT, value);
        } else {
          if (this.$isContainer) {
            this.$children.forEach((child) => child.$flush());
          }
          if (this.$isTrying) {
            const nextValue = this.getValue();
            super.next(nextValue);
            this.$event(EVENT_TYPE_COMMIT, nextValue);
            this.$_clearTrialValue();
          }
        }
        return this;
      }

      /**
       * reverts or commits the $_trialValue.
       * @returns {Mirror}
       */
      $flush() {
        if (this.$isContainer) {
          this.$children.forEach((child) => child.$flush());
        }
        if (this.$isTrying) {
          if (!this.$errors()) {
            this.$commit();
          } else {
            this.$revert();
          }
        }
        return this;
      }

      /**
       * removes trial value; happens on commit and revert.
       */
      $_clearTrialValue() {
        this.$_trialValue = undefined;
      }

      $revert() {
        this.$event(EVENT_TYPE_REVERT, this.$_trialValue);
        this.$_clearTrialValue();
      }

      /******* containers *********** */

      $valueHas(key, value = ABSENT) {
        if (!this.$isContainer) {
          return false;
        }
        if (!isThere(value)) {
          value = this.getValue();
        }
        if (this.$type === TYPE_MAP) {
          return value.has(key);
        }
        return key in value;
      }

      $valueGet(key, value = ABSENT) {
        if (!this.$isContainer) {
          return false;
        }
        if (!isThere(value)) {
          value = this.getValue();
        }
        if (this.$type === TYPE_MAP) {
          return value.get(key);
        }
        return value[key];
      }

      $has(key) {
        if (!this.$isContainer) {
          return false;
        }
        if (this.$hasChild(key)) {
          return true;
        }

        if (this.$type === TYPE_MAP) {
          return this.value.has(key);
        }
        if (this.$type === TYPE_OBJECT) {
          return key in this.value;
        }
      }

      $hasChild(name) {
        // note - respecting the lazy nature of $children
        return this.$_children && this.$children.has(name);
      }

      $removeChild(name) {
        if (this.$hasChild(name)) {
          const child = this.$children.get(name);
          this.$children.delete(name);
          if (!child.isStopped) {
            child.complete();
          }
          if (this.$_childSubs.has(name)) {
            try {
              this.$_childSubs.get(name)
                .unsubscribe();
            } catch (err) {
              console.warn('childSub error unsubscribing:', err);
            }
          }
        }
      }


      $delete(name) {
        let event = this.$mutate((draft) => {
          return strip(name, draft);
        });

        const target = this;
        if (event && !event.isStopped) {
          event.subscribe({
            error() {

            },
            complete() {
              target.$removeChild(name);
            }
          });
        } else {
          this.$removeChild(name);
        }
      }

      /******* actions *********** */

      $mutate(fn, ...args) {
        if (!isFn(fn)) {
          throw e('$mutate passed non-function', { fn });
        }

        return this.$event(EVENT_TYPE_MUTATE, {
          fn,
          args
        });
      }

      $set(name, value) {
        if (!this.$isContainer) {
          throw e('cannot set to non-container', {
            name,
            value,
            target: this
          });
        }

        if (this.$hasChild(name)) {
          return this.$children.get(name)
            .set(value);
        }
        if (this.$type === TYPE_MAP) {
          return this.$mutate((draft) => {
            draft.set(name, value);
          });
        }
        if (this.$type === TYPE_OBJECT) {
          return this.$mutate((draft) => {
            draft[name] = value;
          });
        }
      }

      get $_actions() {
        return lazy(this, '$__actions', () => new Map());
      }
    }

    function mirrorWatcher(mirror) {
      Object.defineProperty(mirror, '$$watcher', {
        configurable: false,
        enumerable: false,
        value: new Subject(),
      });

      let prior;
      Object.defineProperty(mirror, '$_prior', {
        get() { return prior; },
        set(p) {
          const prev = prior;
          prior = p;
          if (mirror.$$watcher) {
            mirror.$$say('(setting)', '$_prior', { to: prior, from: prev });
          }
        },
      });
      Object.defineProperty(mirror, '$$say', {
        value: (message, source, value = ABSENT) => {
          if (isObj(message)) {
            source = message.source;
            value = message.value;
            message = message.message;
          }

          mirror.$$watcher.next({
            message,
            source,
            value: isThere(value) ? value : message.value,
            mirrorValue: mirror.value,
            name: mirror.$name,
          });
        },
      });
    }

    var index = {
      ...constants, utils, Mirror, mirrorWatcher, Event: MirrorEvent,
    };

    return index;

})));
