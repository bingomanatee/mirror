(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global['@wonderlandlabs/mirror'] = factory());
}(this, function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isFunction(x) {
        return typeof x === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    var config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = /*@__PURE__*/ new Error();
                /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function hostReportError(err) {
        setTimeout(function () { throw err; }, 0);
    }

    /** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
    var empty = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        },
        complete: function () { }
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isObject(x) {
        return x !== null && typeof x === 'object';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
        function UnsubscriptionErrorImpl(errors) {
            Error.call(this);
            this.message = errors ?
                errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
            return this;
        }
        UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return UnsubscriptionErrorImpl;
    })();
    var UnsubscriptionError = UnsubscriptionErrorImpl;

    /** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
    var Subscription = /*@__PURE__*/ (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._ctorUnsubscribe = true;
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) {
                _parentOrParents.remove(this);
            }
            else if (_parentOrParents !== null) {
                for (var index = 0; index < _parentOrParents.length; ++index) {
                    var parent_1 = _parentOrParents[index];
                    parent_1.remove(this);
                }
            }
            if (isFunction(_unsubscribe)) {
                if (_ctorUnsubscribe) {
                    this._unsubscribe = undefined;
                }
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            if (!teardown) {
                return Subscription.EMPTY;
            }
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            var _parentOrParents = subscription._parentOrParents;
            if (_parentOrParents === null) {
                subscription._parentOrParents = this;
            }
            else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) {
                    return subscription;
                }
                subscription._parentOrParents = [_parentOrParents, this];
            }
            else if (_parentOrParents.indexOf(this) === -1) {
                _parentOrParents.push(this);
            }
            else {
                return subscription;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions === null) {
                this._subscriptions = [subscription];
            }
            else {
                subscriptions.push(subscription);
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var rxSubscriber = /*@__PURE__*/ (function () {
        return typeof Symbol === 'function'
            ? /*@__PURE__*/ Symbol('rxSubscriber')
            : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
    })();

    /** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
    var Subscriber = /*@__PURE__*/ (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _parentOrParents = this._parentOrParents;
            this._parentOrParents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parentOrParents = _parentOrParents;
            return this;
        };
        return Subscriber;
    }(Subscription));
    var SafeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== empty) {
                    context = Object.create(observerOrNext);
                    if (isFunction(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }

    /** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber]) {
                return nextOrObserver[rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber(empty);
        }
        return new Subscriber(nextOrObserver, error, complete);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function identity(x) {
        return x;
    }

    /** PURE_IMPORTS_START _identity PURE_IMPORTS_END */
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

    /** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
    var Observable = /*@__PURE__*/ (function () {
        function Observable(subscribe) {
            this._isScalar = false;
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
            var operator = this.operator;
            var sink = toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
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
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor =  Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
        function ObjectUnsubscribedErrorImpl() {
            Error.call(this);
            this.message = 'object unsubscribed';
            this.name = 'ObjectUnsubscribedError';
            return this;
        }
        ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return ObjectUnsubscribedErrorImpl;
    })();
    var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var SubjectSubscription = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscription, _super);
        function SubjectSubscription(subject, subscriber) {
            var _this = _super.call(this) || this;
            _this.subject = subject;
            _this.subscriber = subscriber;
            _this.closed = false;
            return _this;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.closed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.subscriber);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription));

    /** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
    var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscriber, _super);
        function SubjectSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.destination = destination;
            return _this;
        }
        return SubjectSubscriber;
    }(Subscriber));
    var Subject = /*@__PURE__*/ (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.observers = [];
            _this.closed = false;
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype[rxSubscriber] = function () {
            return new SubjectSubscriber(this);
        };
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.next = function (value) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            if (!this.isStopped) {
                var observers = this.observers;
                var len = observers.length;
                var copy = observers.slice();
                for (var i = 0; i < len; i++) {
                    copy[i].next(value);
                }
            }
        };
        Subject.prototype.error = function (err) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.hasError = true;
            this.thrownError = err;
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].error(err);
            }
            this.observers.length = 0;
        };
        Subject.prototype.complete = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].complete();
            }
            this.observers.length = 0;
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = true;
            this.closed = true;
            this.observers = null;
        };
        Subject.prototype._trySubscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return _super.prototype._trySubscribe.call(this, subscriber);
            }
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription.EMPTY;
            }
            else if (this.isStopped) {
                subscriber.complete();
                return Subscription.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                return new SubjectSubscription(this, subscriber);
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
    var AnonymousSubject = /*@__PURE__*/ (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var destination = this.destination;
            if (destination && destination.next) {
                destination.next(value);
            }
        };
        AnonymousSubject.prototype.error = function (err) {
            var destination = this.destination;
            if (destination && destination.error) {
                this.destination.error(err);
            }
        };
        AnonymousSubject.prototype.complete = function () {
            var destination = this.destination;
            if (destination && destination.complete) {
                this.destination.complete();
            }
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var source = this.source;
            if (source) {
                return this.source.subscribe(subscriber);
            }
            else {
                return Subscription.EMPTY;
            }
        };
        return AnonymousSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
    var BehaviorSubject = /*@__PURE__*/ (function (_super) {
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
            enumerable: true,
            configurable: true
        });
        BehaviorSubject.prototype._subscribe = function (subscriber) {
            var subscription = _super.prototype._subscribe.call(this, subscriber);
            if (subscription && !subscription.closed) {
                subscriber.next(this._value);
            }
            return subscription;
        };
        BehaviorSubject.prototype.getValue = function () {
            if (this.hasError) {
                throw this.thrownError;
            }
            else if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return this._value;
            }
        };
        BehaviorSubject.prototype.next = function (value) {
            _super.prototype.next.call(this, this._value = value);
        };
        return BehaviorSubject;
    }(Subject));

    function n(n){for(var t=arguments.length,r=Array(t>1?t-1:0),e=1;e<t;e++)r[e-1]=arguments[e];if("production"!==process.env.NODE_ENV){var i=Y[n],o=i?"function"==typeof i?i.apply(null,r):i:"unknown error nr: "+n;throw Error("[Immer] "+o)}throw Error("[Immer] minified error nr: "+n+(r.length?" "+r.map((function(n){return "'"+n+"'"})).join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function t(n){return !!n&&!!n[Q]}function r(n){return !!n&&(function(n){if(!n||"object"!=typeof n)return !1;var t=Object.getPrototypeOf(n);if(null===t)return !0;var r=Object.hasOwnProperty.call(t,"constructor")&&t.constructor;return r===Object||"function"==typeof r&&Function.toString.call(r)===Z}(n)||Array.isArray(n)||!!n[L]||!!n.constructor[L]||s(n)||v(n))}function i(n,t,r){void 0===r&&(r=!1),0===o(n)?(r?Object.keys:nn)(n).forEach((function(e){r&&"symbol"==typeof e||t(e,n[e],n);})):n.forEach((function(r,e){return t(e,r,n)}));}function o(n){var t=n[Q];return t?t.i>3?t.i-4:t.i:Array.isArray(n)?1:s(n)?2:v(n)?3:0}function u(n,t){return 2===o(n)?n.has(t):Object.prototype.hasOwnProperty.call(n,t)}function a(n,t){return 2===o(n)?n.get(t):n[t]}function f(n,t,r){var e=o(n);2===e?n.set(t,r):3===e?(n.delete(t),n.add(r)):n[t]=r;}function c(n,t){return n===t?0!==n||1/n==1/t:n!=n&&t!=t}function s(n){return X&&n instanceof Map}function v(n){return q&&n instanceof Set}function p(n){return n.o||n.t}function l(n){if(Array.isArray(n))return Array.prototype.slice.call(n);var t=tn(n);delete t[Q];for(var r=nn(t),e=0;e<r.length;e++){var i=r[e],o=t[i];!1===o.writable&&(o.writable=!0,o.configurable=!0),(o.get||o.set)&&(t[i]={configurable:!0,writable:!0,enumerable:o.enumerable,value:n[i]});}return Object.create(Object.getPrototypeOf(n),t)}function d(n,e){return void 0===e&&(e=!1),y(n)||t(n)||!r(n)?n:(o(n)>1&&(n.set=n.add=n.clear=n.delete=h),Object.freeze(n),e&&i(n,(function(n,t){return d(t,!0)}),!0),n)}function h(){n(2);}function y(n){return null==n||"object"!=typeof n||Object.isFrozen(n)}function b(t){var r=rn[t];return r||n(18,t),r}function m(n,t){rn[n]||(rn[n]=t);}function _(){return "production"===process.env.NODE_ENV||U||n(0),U}function j(n,t){t&&(b("Patches"),n.u=[],n.s=[],n.v=t);}function O(n){g(n),n.p.forEach(S),n.p=null;}function g(n){n===U&&(U=n.l);}function w(n){return U={p:[],l:U,h:n,m:!0,_:0}}function S(n){var t=n[Q];0===t.i||1===t.i?t.j():t.O=!0;}function P(t,e){e._=e.p.length;var i=e.p[0],o=void 0!==t&&t!==i;return e.h.g||b("ES5").S(e,t,o),o?(i[Q].P&&(O(e),n(4)),r(t)&&(t=M(e,t),e.l||x(e,t)),e.u&&b("Patches").M(i[Q],t,e.u,e.s)):t=M(e,i,[]),O(e),e.u&&e.v(e.u,e.s),t!==H?t:void 0}function M(n,t,r){if(y(t))return t;var e=t[Q];if(!e)return i(t,(function(i,o){return A(n,e,t,i,o,r)}),!0),t;if(e.A!==n)return t;if(!e.P)return x(n,e.t,!0),e.t;if(!e.I){e.I=!0,e.A._--;var o=4===e.i||5===e.i?e.o=l(e.k):e.o;i(3===e.i?new Set(o):o,(function(t,i){return A(n,e,o,t,i,r)})),x(n,o,!1),r&&n.u&&b("Patches").R(e,r,n.u,n.s);}return e.o}function A(e,i,o,a,c,s){if("production"!==process.env.NODE_ENV&&c===o&&n(5),t(c)){var v=M(e,c,s&&i&&3!==i.i&&!u(i.D,a)?s.concat(a):void 0);if(f(o,a,v),!t(v))return;e.m=!1;}if(r(c)&&!y(c)){if(!e.h.F&&e._<1)return;M(e,c),i&&i.A.l||x(e,c);}}function x(n,t,r){void 0===r&&(r=!1),n.h.F&&n.m&&d(t,r);}function z(n,t){var r=n[Q];return (r?p(r):n)[t]}function I(n,t){if(t in n)for(var r=Object.getPrototypeOf(n);r;){var e=Object.getOwnPropertyDescriptor(r,t);if(e)return e;r=Object.getPrototypeOf(r);}}function k(n){n.P||(n.P=!0,n.l&&k(n.l));}function E(n){n.o||(n.o=l(n.t));}function R(n,t,r){var e=s(t)?b("MapSet").N(t,r):v(t)?b("MapSet").T(t,r):n.g?function(n,t){var r=Array.isArray(n),e={i:r?1:0,A:t?t.A:_(),P:!1,I:!1,D:{},l:t,t:n,k:null,o:null,j:null,C:!1},i=e,o=en;r&&(i=[e],o=on);var u=Proxy.revocable(i,o),a=u.revoke,f=u.proxy;return e.k=f,e.j=a,f}(t,r):b("ES5").J(t,r);return (r?r.A:_()).p.push(e),e}function D(e){return t(e)||n(22,e),function n(t){if(!r(t))return t;var e,u=t[Q],c=o(t);if(u){if(!u.P&&(u.i<4||!b("ES5").K(u)))return u.t;u.I=!0,e=F(t,c),u.I=!1;}else e=F(t,c);return i(e,(function(t,r){u&&a(u.t,t)===r||f(e,t,n(r));})),3===c?new Set(e):e}(e)}function F(n,t){switch(t){case 2:return new Map(n);case 3:return Array.from(n)}return l(n)}function C(){function t(n,t){function r(){this.constructor=n;}a(n,t),n.prototype=(r.prototype=t.prototype,new r);}function e(n){n.o||(n.D=new Map,n.o=new Map(n.t));}function o(n){n.o||(n.o=new Set,n.t.forEach((function(t){if(r(t)){var e=R(n.A.h,t,n);n.p.set(t,e),n.o.add(e);}else n.o.add(t);})));}function u(t){t.O&&n(3,JSON.stringify(p(t)));}var a=function(n,t){return (a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t;}||function(n,t){for(var r in t)t.hasOwnProperty(r)&&(n[r]=t[r]);})(n,t)},f=function(){function n(n,t){return this[Q]={i:2,l:t,A:t?t.A:_(),P:!1,I:!1,o:void 0,D:void 0,t:n,k:this,C:!1,O:!1},this}t(n,Map);var o=n.prototype;return Object.defineProperty(o,"size",{get:function(){return p(this[Q]).size}}),o.has=function(n){return p(this[Q]).has(n)},o.set=function(n,t){var r=this[Q];return u(r),p(r).has(n)&&p(r).get(n)===t||(e(r),k(r),r.D.set(n,!0),r.o.set(n,t),r.D.set(n,!0)),this},o.delete=function(n){if(!this.has(n))return !1;var t=this[Q];return u(t),e(t),k(t),t.D.set(n,!1),t.o.delete(n),!0},o.clear=function(){var n=this[Q];u(n),p(n).size&&(e(n),k(n),n.D=new Map,i(n.t,(function(t){n.D.set(t,!1);})),n.o.clear());},o.forEach=function(n,t){var r=this;p(this[Q]).forEach((function(e,i){n.call(t,r.get(i),i,r);}));},o.get=function(n){var t=this[Q];u(t);var i=p(t).get(n);if(t.I||!r(i))return i;if(i!==t.t.get(n))return i;var o=R(t.A.h,i,t);return e(t),t.o.set(n,o),o},o.keys=function(){return p(this[Q]).keys()},o.values=function(){var n,t=this,r=this.keys();return (n={})[V]=function(){return t.values()},n.next=function(){var n=r.next();return n.done?n:{done:!1,value:t.get(n.value)}},n},o.entries=function(){var n,t=this,r=this.keys();return (n={})[V]=function(){return t.entries()},n.next=function(){var n=r.next();if(n.done)return n;var e=t.get(n.value);return {done:!1,value:[n.value,e]}},n},o[V]=function(){return this.entries()},n}(),c=function(){function n(n,t){return this[Q]={i:3,l:t,A:t?t.A:_(),P:!1,I:!1,o:void 0,t:n,k:this,p:new Map,O:!1,C:!1},this}t(n,Set);var r=n.prototype;return Object.defineProperty(r,"size",{get:function(){return p(this[Q]).size}}),r.has=function(n){var t=this[Q];return u(t),t.o?!!t.o.has(n)||!(!t.p.has(n)||!t.o.has(t.p.get(n))):t.t.has(n)},r.add=function(n){var t=this[Q];return u(t),this.has(n)||(o(t),k(t),t.o.add(n)),this},r.delete=function(n){if(!this.has(n))return !1;var t=this[Q];return u(t),o(t),k(t),t.o.delete(n)||!!t.p.has(n)&&t.o.delete(t.p.get(n))},r.clear=function(){var n=this[Q];u(n),p(n).size&&(o(n),k(n),n.o.clear());},r.values=function(){var n=this[Q];return u(n),o(n),n.o.values()},r.entries=function(){var n=this[Q];return u(n),o(n),n.o.entries()},r.keys=function(){return this.values()},r[V]=function(){return this.values()},r.forEach=function(n,t){for(var r=this.values(),e=r.next();!e.done;)n.call(t,e.value,e.value,this),e=r.next();},n}();m("MapSet",{N:function(n,t){return new f(n,t)},T:function(n,t){return new c(n,t)}});}var G,U,W="undefined"!=typeof Symbol&&"symbol"==typeof Symbol("x"),X="undefined"!=typeof Map,q="undefined"!=typeof Set,B="undefined"!=typeof Proxy&&void 0!==Proxy.revocable&&"undefined"!=typeof Reflect,H=W?Symbol.for("immer-nothing"):((G={})["immer-nothing"]=!0,G),L=W?Symbol.for("immer-draftable"):"__$immer_draftable",Q=W?Symbol.for("immer-state"):"__$immer_state",V="undefined"!=typeof Symbol&&Symbol.iterator||"@@iterator",Y={0:"Illegal state",1:"Immer drafts cannot have computed properties",2:"This object has been frozen and should not be mutated",3:function(n){return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? "+n},4:"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",5:"Immer forbids circular references",6:"The first or second argument to `produce` must be a function",7:"The third argument to `produce` must be a function or undefined",8:"First argument to `createDraft` must be a plain object, an array, or an immerable object",9:"First argument to `finishDraft` must be a draft returned by `createDraft`",10:"The given draft is already finalized",11:"Object.defineProperty() cannot be used on an Immer draft",12:"Object.setPrototypeOf() cannot be used on an Immer draft",13:"Immer only supports deleting array indices",14:"Immer only supports setting array indices and the 'length' property",15:function(n){return "Cannot apply patch, path doesn't resolve: "+n},16:'Sets cannot have "replace" patches.',17:function(n){return "Unsupported patch operation: "+n},18:function(n){return "The plugin for '"+n+"' has not been loaded into Immer. To enable the plugin, import and call `enable"+n+"()` when initializing your application."},20:"Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",21:function(n){return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '"+n+"'"},22:function(n){return "'current' expects a draft, got: "+n},23:function(n){return "'original' expects a draft, got: "+n},24:"Patching reserved attributes like __proto__, prototype and constructor is not allowed"},Z=""+Object.prototype.constructor,nn="undefined"!=typeof Reflect&&Reflect.ownKeys?Reflect.ownKeys:void 0!==Object.getOwnPropertySymbols?function(n){return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n))}:Object.getOwnPropertyNames,tn=Object.getOwnPropertyDescriptors||function(n){var t={};return nn(n).forEach((function(r){t[r]=Object.getOwnPropertyDescriptor(n,r);})),t},rn={},en={get:function(n,t){if(t===Q)return n;var e=p(n);if(!u(e,t))return function(n,t,r){var e,i=I(t,r);return i?"value"in i?i.value:null===(e=i.get)||void 0===e?void 0:e.call(n.k):void 0}(n,e,t);var i=e[t];return n.I||!r(i)?i:i===z(n.t,t)?(E(n),n.o[t]=R(n.A.h,i,n)):i},has:function(n,t){return t in p(n)},ownKeys:function(n){return Reflect.ownKeys(p(n))},set:function(n,t,r){var e=I(p(n),t);if(null==e?void 0:e.set)return e.set.call(n.k,r),!0;if(!n.P){var i=z(p(n),t),o=null==i?void 0:i[Q];if(o&&o.t===r)return n.o[t]=r,n.D[t]=!1,!0;if(c(r,i)&&(void 0!==r||u(n.t,t)))return !0;E(n),k(n);}return n.o[t]===r&&"number"!=typeof r&&(void 0!==r||t in n.o)||(n.o[t]=r,n.D[t]=!0,!0)},deleteProperty:function(n,t){return void 0!==z(n.t,t)||t in n.t?(n.D[t]=!1,E(n),k(n)):delete n.D[t],n.o&&delete n.o[t],!0},getOwnPropertyDescriptor:function(n,t){var r=p(n),e=Reflect.getOwnPropertyDescriptor(r,t);return e?{writable:!0,configurable:1!==n.i||"length"!==t,enumerable:e.enumerable,value:r[t]}:e},defineProperty:function(){n(11);},getPrototypeOf:function(n){return Object.getPrototypeOf(n.t)},setPrototypeOf:function(){n(12);}},on={};i(en,(function(n,t){on[n]=function(){return arguments[0]=arguments[0][0],t.apply(this,arguments)};})),on.deleteProperty=function(t,r){return "production"!==process.env.NODE_ENV&&isNaN(parseInt(r))&&n(13),en.deleteProperty.call(this,t[0],r)},on.set=function(t,r,e){return "production"!==process.env.NODE_ENV&&"length"!==r&&isNaN(parseInt(r))&&n(14),en.set.call(this,t[0],r,e,t[0])};var un=function(){function e(t){var e=this;this.g=B,this.F=!0,this.produce=function(t,i,o){if("function"==typeof t&&"function"!=typeof i){var u=i;i=t;var a=e;return function(n){var t=this;void 0===n&&(n=u);for(var r=arguments.length,e=Array(r>1?r-1:0),o=1;o<r;o++)e[o-1]=arguments[o];return a.produce(n,(function(n){var r;return (r=i).call.apply(r,[t,n].concat(e))}))}}var f;if("function"!=typeof i&&n(6),void 0!==o&&"function"!=typeof o&&n(7),r(t)){var c=w(e),s=R(e,t,void 0),v=!0;try{f=i(s),v=!1;}finally{v?O(c):g(c);}return "undefined"!=typeof Promise&&f instanceof Promise?f.then((function(n){return j(c,o),P(n,c)}),(function(n){throw O(c),n})):(j(c,o),P(f,c))}if(!t||"object"!=typeof t){if((f=i(t))===H)return;return void 0===f&&(f=t),e.F&&d(f,!0),f}n(21,t);},this.produceWithPatches=function(n,t){return "function"==typeof n?function(t){for(var r=arguments.length,i=Array(r>1?r-1:0),o=1;o<r;o++)i[o-1]=arguments[o];return e.produceWithPatches(t,(function(t){return n.apply(void 0,[t].concat(i))}))}:[e.produce(n,t,(function(n,t){r=n,i=t;})),r,i];var r,i;},"boolean"==typeof(null==t?void 0:t.useProxies)&&this.setUseProxies(t.useProxies),"boolean"==typeof(null==t?void 0:t.autoFreeze)&&this.setAutoFreeze(t.autoFreeze);}var i=e.prototype;return i.createDraft=function(e){r(e)||n(8),t(e)&&(e=D(e));var i=w(this),o=R(this,e,void 0);return o[Q].C=!0,g(i),o},i.finishDraft=function(t,r){var e=t&&t[Q];"production"!==process.env.NODE_ENV&&(e&&e.C||n(9),e.I&&n(10));var i=e.A;return j(i,r),P(void 0,i)},i.setAutoFreeze=function(n){this.F=n;},i.setUseProxies=function(t){t&&!B&&n(20),this.g=t;},i.applyPatches=function(n,r){var e;for(e=r.length-1;e>=0;e--){var i=r[e];if(0===i.path.length&&"replace"===i.op){n=i.value;break}}var o=b("Patches").$;return t(n)?o(n,r):this.produce(n,(function(n){return o(n,r.slice(e+1))}))},e}(),an=new un,fn=an.produce,cn=an.produceWithPatches.bind(an),sn=an.setAutoFreeze.bind(an),vn=an.setUseProxies.bind(an),pn=an.applyPatches.bind(an),ln=an.createDraft.bind(an),dn=an.finishDraft.bind(an);

    const TYPE_MAP = Symbol('type:map');
    const TYPE_OBJECT = Symbol('type:object');
    const TYPE_VALUE = Symbol('type:value');

    const NAME_UNNAMED = Symbol('unnamed');

    const ABSENT = Symbol('ABSENT');

    const CHILDREN = Symbol('CHILDREN');

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        TYPE_MAP: TYPE_MAP,
        TYPE_OBJECT: TYPE_OBJECT,
        TYPE_VALUE: TYPE_VALUE,
        NAME_UNNAMED: NAME_UNNAMED,
        ABSENT: ABSENT,
        CHILDREN: CHILDREN
    });

    const isNumberLodash = require('lodash/isNumber');

    function asMap(m, force) {
      if (m instanceof Map) {
        return force ? new Map(m) : m;
      }
      const map = new Map();
      Object.keys(m)
        .forEach((key) => map.set(key, m[key]));
      return map;
    }

    /*** ****************** INTROSPECTION ****************** */

    /**
     * note - the tests isObject, isArray, isMap are EXCLUSIVE
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
    function isObject$1(o) {
      return o && (typeof o === 'object') && (!Array.isArray(o)) && (!(o instanceof Map));
    }

    function isArray$1(a) {
      return Array.isArray(a);
    }

    const isMap = (m) => m && (m instanceof Map);

    const isFunction$1 = (f) => typeof f === 'function';

    const e = (err, notes = {}) => {
      if (typeof err === 'string') err = new Error(err);
      return Object.assign(err, notes);
    };

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
    function asObject(m, force = false) {
      if (!(isObject$1(m) || isMap(m))) {
        throw Object.assign(new Error('cannot convert target to object'), { target: m });
      }
      let out = m;
      if (isObject$1(m)) {
        if (force) out = { ...m };
      } else if (isMap(m)) {
        out = {};
        m.forEach((val, key) => {
          if (!((typeof key === 'number') || (typeof key === 'string'))) {
            return;
          }
          try {
            out[key] = val;
          } catch (e) {
            console.warn('asObject map/object conversion -- skipping exporting of child key', key, 'of ', m);
          }
        });
      }

      return out;
    }

    function asUserAction(str) {
      if (typeof str !== 'string') throw new Error('bad user action');

      while (str.substr(0, 2) !== '$$') str = `$${str}`;
      return str;
    }

    const noop = (n) => n;

    function maybeImmer(target) {
      if (!r(target)) return target;
      return fn(target, noop);
    }

    const isNumber = isNumberLodash;

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        asMap: asMap,
        isObject: isObject$1,
        isArray: isArray$1,
        isMap: isMap,
        isFunction: isFunction$1,
        e: e,
        asObject: asObject,
        asUserAction: asUserAction,
        noop: noop,
        maybeImmer: maybeImmer,
        isNumber: isNumber
    });

    /* eslint-disable no-param-reassign */

    function mirrorType(target, value) {
      if (!target.$_type) {
        if (isMap(value)) {
          return TYPE_MAP;
        }
        if (isObject$1(value)) {
          return TYPE_OBJECT;
        }
        return TYPE_VALUE;
      }
      return target.$_type;
    }

    function hasOrIs(target, value) {
      if (target === value) return true;
      if (!(target instanceof BehaviorSubject)) return false;
      return target.value === value;
    }

    function utilLogs(target, ...args) {
      if (target.$_debug === false) return;

      let [n, message, ...rest] = args;
      if (typeof n === 'string') {
        [message, ...rest] = args;
        n = 0;
      }

      if (typeof target.$_debug === 'number') {
        if (n < target.$_debug) return;
      }

      console.warn(message, '(target:', target, ')', rest);
    }

    /**
     *
     * @param target {Mirror}
     * @param config {Object}
     */
    function parseConfig(target, config = {}) {
      target.$_name = NAME_UNNAMED;
      target.$_debug = false;

      if (isObject$1(config)) {
        Object.keys(config)
          .forEach((key) => {
            const fieldValue = config[key];
            switch (key.toLowerCase()) {
              case 'children':
                target.$addChildren(fieldValue);
                break;

              case 'type':
                target.$_type = fieldValue;
                break;

              case 'name':
                target.$_setName(fieldValue);
                break;

              case 'lockChildren':
                target.$_lockFields = !!fieldValue;
                break;

              case 'debug':
                target.$_debug = fieldValue;
                break;

              default:
                target.$_log(0, 'unknown config field ', { key });
            }
          });
      }

      let configTests = config.test || config.tests;
      if (configTests) configTests = asMap(configTests);

      if (configTests) {
        if (isObject$1(configTests) || isMap(configTests)) {
          if (target.$isCollection) {
            configTests.forEach((test, name) => {
              if (name === CHILDREN) return;
              if (target.$hasChild(name)) {
                target.$children.get(name).$addTest(test);
              } else {
                target.$addTest(test, name);
              }
            });
          } else {
            configTests.forEach((test, name) => {
              target.$addTest(test, name);
            });
          }

          if (configTests.has(CHILDREN)) {
            if (target.$isCollection) {
              target.$children.forEach((child, name) => {
               // const test = (value) => configTests.get(CHILDREN)(value, child, name);
               // Object.defineProperty(test, 'name', { value: name });
                child.$addTest(configTests.get(CHILDREN));
              });
            }
          }
        } else if (isArray$1(config.test) || isFunction$1(config.test)) {
          target.$addTest(config.test);
        }
      }
    }

    function setParent(newParent, target, Mirror) {
      if (!newParent) {
        // eslint-disable-next-line no-param-reassign
        target.$_parent = null;
        return;
      }
      if (!(newParent instanceof Mirror)) {
        throw e('cannot parent a Mirror to a non-mirror', {
          newParent,
          target,
        });
      }
      // @TODO -- unparent current?
      // eslint-disable-next-line no-param-reassign
      target.$_parent = newParent;
    }

    function mirrorHas(field, target) {
      if (target.$isValue && target.$_constructed) {
        throw e('cannot use $has on TYPE_VALUE MIRROR', {
          field,
          target,
        });
      }
      if (!target.$_children) return false; // prevent autogeneration of lazy collection
      return target.$children.has(field);
    }

    /**
     * returns true if:
     *
     * 1) value is absent and key is a valid child
     * 2) value is present and is (the mirror that)  is stored in target.$children.get(key);
     * 3) value is present and is the VALUE OF THE MIRROR that is stored in target.$children.get(key);
     *
     * @param key {any}
     * @param value {any|Mirror}
     * @param target {Mirror}
     * @returns {boolean}
     */
    function hasChild(key, value, target) {
      const has = mirrorHas(key, target);
      if (!has) {
        return false;
      }

      if (value === ABSENT) return true;
      // don't care what the child's value is -- just that the key is a valid child key

      const child = target.$children.get(key);
      return hasOrIs(child, value);
    }

    /**
     * seed child mirrors with the value of an injected value -- OR the current
     * target's value. Can be used to "reset" globally a target to a known state.
     *
     * @param value
     * @param target
     * @param returnNewFields {boolean}
     * @returns {Map<*, V>|Map<any, any>}
     */
    function updateChildren(value = ABSENT, target, returnNewFields = false) {
      if (target.$isValue) {
        throw new Error('do not call $updateChildren on a TYPE_VALUE; use next instead');
      }
      if (value === ABSENT) {
        if (value !== target.value) {
          updateChildren(target.value, target);
        }
        return new Map();
      }

      const badFields = [];
      const map = asMap(value);
      map.forEach((keyValue, newKey) => {
        if (!target.$has(newKey)) badFields.push(newKey);
      });

      if (badFields.length) {
        if (!returnNewFields) {
          throw e('invalid $updateChildren - unknown fields; use $addChildren on new fields', {
            badFields,
            target,
          });
        }
      }

      map.forEach((keyValue, key) => {
        target.$children.get(key)
          .next(keyValue);
      });

      return new Map(badFields.map((f) => [f, map.get(f)]));
    }

    /**
     * removes a child by key OR identity
     * @param nameOrMirror
     * @param target
     * @param Mirror
     * @returns {*}
     */
    function removeChild(nameOrMirror, target, Mirror) {
      if (nameOrMirror instanceof Mirror) {
        let key = ABSENT;
        target.$children.forEach((child, childKey) => {
          if (child === nameOrMirror) {
            key = childKey;
          }
        });
        if (key === ABSENT) {
          target.$_log('trying to remove child and its currently registered', { name: nameOrMirror });
          return;
        }
        return removeChild(key, target, Mirror);
      }


      if (target.$_lockFields) {
        target.$_log(2, 'attempt to remove child of a field-locked mirror', { name: nameOrMirror });
      }
      if (!target.$has(nameOrMirror)) {
        target.$_log(0, 'cannot find child ', nameOrMirror, 'to remove from ', target);
        return;
      }
      const child = target.$children.get(nameOrMirror);
      let sub = target.$_childSubs.get(nameOrMirror);
      if (!sub) sub = target.$_childSubs.get(child);
      if (!sub) return;

      sub.unsubscribe();
      target.$_childSubs.delete(nameOrMirror);
      target.$_childSubs.delete(child);
    }

    function addChild(name = ABSENT, value = ABSENT, target, Mirror) {
      if ((name === ABSENT) || (value === ABSENT)) {
        console.log('addChild -- no name, value', name, value);
        return;
      }
      switch (target.$type) {
        case TYPE_MAP:
          if (target.$hasChild(name, value)) {
            return;
          }
          // any keys are acceptable
          break;

        case TYPE_VALUE:
          throw e('cannot add children to a value Mirror', {
            target,
            name,
            value,
          });
          // eslint-disable-next-line no-unreachable
          break;

        case TYPE_OBJECT:
          if (target.$hasChild(name, value)) {
            return;
          }
          switch (typeof (name)) {
            case 'string':
              if (name === '') {
                throw new Error('cannot accept "" as a child key for a TYPE_OBJECT');
              }
              break;

            case 'number':
              // all numbers acceptable but wonky
              // eslint-disable-next-line no-param-reassign
              value = `${value}`;
              break;

            default:
              target.$_log('only strings, numbers acceptable as TYPE_OBJECT child keys');
              return;
          }
          break;
        default:
          target.$_log(3, 'bad typed mirror');
          return;
      }

      if (!(value instanceof BehaviorSubject)) {
        // eslint-disable-next-line no-param-reassign
        value = new Mirror(value);
      }
      // @TODO: prevent/warn renaming after constructor?
      target.$children.set(name, value); // @TODO: use an add event
      if (value instanceof Mirror) {
        value.$_setName(name);
        value.$setParent(target);
      }

      const sub = value.subscribe({
        next(newValue) {
          target.$_updateField(name, newValue);
        },
        error(err) {
          target.$_log('error in child observer', {
            err,
          });
        },
        complete() {
          // ??
        },
      });

      target.$_childSubs.set(value, sub);
      target.$_childSubs.set(name, sub);
    }

    /* eslint-disable */

    C();

    /**
     * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
     * which, when updated, update the parent.
     * This allows for field level validation, transactional updates and all sorts of other goodies.
     */
    class Mirror extends BehaviorSubject {
      constructor(value, config) {
        super(maybeImmer(value));

        this.$_parseConfig(config);
        this.$_type = mirrorType(this, value);

        this.$_shard(value);
        this.$_constructed = true;
      }

      $_parseConfig(config) {
        parseConfig(this, config);
      }

      get $name() {
        return this.$_name;
      }

      $_setName(newName) {
        this.$_name = newName;
      }

      /*** *********** VALIDATION  *********** */

      get $hasTests() {
        return this.$_tests && this.$_tests.size > 0;
      }

      get $tests() {
        if (!this.$_tests) {
          this.$_tests = new Set();
        }
        return this.$_tests;
      }

      $addTest(v, name = ABSENT) {
        if (name !== ABSENT) {
          const v2 = (...args) => v(...args);
          Object.defineProperty(v2, 'name', { value: name });
          return this.$addTest(v2);
        }

        if (isFunction$1(v)) {
          this.$tests.add(v);
        } else if (isArray$1(v) || isMap(v)) {
          v.forEach((vv, name) => this.$addTest(vv, isNumber(name) ? ABSENT : name));
        } else {
          this.$_log(1, 'bad test -- did not add ', v);
        }

        return this;
      }

      /**
       * returns the validation status of the value | mirror; ignores details,
       * just gives thumbs up/down.
       * @param value
       * @returns {boolean}
       */
      $hasErrors(value = ABSENT) {
        const errs = this.$testErrors(value);
        if (!errs) return false;
        if (isMap(errs)) {
          return errs.size > 0;
        }
        this.$_log(2, 'non-map returend from $valueErrors', errs);
        return true;
      }

      /***
       *
       * @param value {any}
       * @returns {*|Map<any, any>}
       */
      $testErrors(value = ABSENT) {
        if (!this.$hasTests) return new Map();
        if (value === ABSENT && value !== this.value) {
          value = this.value;
        }

        let errors = [];
        this.$tests.forEach((fn) => {
          if (!isFunction$1(fn)) {
            this.$_log(1, 'non-function in tests', { fn });
            return;
          }
          let output;
          try {
            output = fn(value, this);
          } catch (err) {
            output = (err instanceof Error) ? err.message : err;
          }
            if (output) {
              let name = undefined;
              try {
                let name = fn.name;
              } catch (err) {

              }
              errors.push({fn, name, output});
            }
        });

        if ((errors.length)) {
          this.$_log(2, 'invalid value for test "' + name + '"', {
            value,
            errors
          });
        }
        return errors;
      }

      /*** *********** TYPE  *********** */

      /**
       * Mirrors are either collective nodes -- TYPE_OBJECT/TYPE_MAP --
       * in which case their value is a dynamic snapshot of their children --
       * or TYPE_VALUE -- in which case their value is stored using the standard
       * BehaviorSubject system.
       *
       * TYPE_VALUE means the value is not sharded amongst children
       * but is stored as a single value.
       * It _MAY IN FACT_ be an object, or a Map, array or even a class instance --
       * its mirror will not utilize/observe/add/remove children.
       *
       * @returns {TYPE_MAP|TYPE_OBJECT|TYPE_VALUE}
       */
      get $type() {
        return this.$_type;
      }

      get $isCollection() {
        return [TYPE_OBJECT, TYPE_MAP].includes(this.$type);
      }

      get $isValue() {
        return this.$type === TYPE_VALUE;
      }

      /*** *********** PARENT ********** */

      get $parent() {
        return this.$_parent || null;
      }

      $setParent(newParent) {
        setParent(newParent, this, Mirror);
      }

      /*** *********** CHILDREN MANAGERS *********** */
      $lock(lock = true) {
        this.$_lockFields = lock;
      }

      get $locked() {
        return !!this.$_lockFields;
      }

      $addChildren(collection) {
        asMap(collection)
          .forEach((child, name) => this.$addChild(name, child));
      }


      /**
       * returns true if:
       *
       * 1) value is absent and key is a valid child
       * 2) value is present and is (the mirror that)  is stored in this.$children.get(key);
       * 3) value is present and is the VALUE OF THE MIRROR that is stored in this.$children.get(key);
       *
       * @param key {any}
       * @param value {any|Mirror}
       * @returns {boolean}
       */
      $hasChild(key, value = ABSENT) {
        return hasChild(key, value, this);
      }

      /**
       * note - acceptable children are either full-fledged Mirrors themselves
       * or RXJS BehaviorSubjects -- they ar required to have a current value always, and be subscribable.
       * ideally are mirrors so they have the full validation suite.
       *
       * @param name {any}
       * @param value {any}
       * @returns {Mirror}
       */
      $addChild(name, value) {
        addChild(name, value, this, Mirror);
        return this;
      }

      /**
       * a registry of the listener subs for all my children
       * @returns {Map}
       */
      get $_childSubs() {
        if (!this.$__childSubs) {
          this.$__childSubs = new Map();
        }
        return this.$__childSubs;
      }

      /**
       * removes a child from a mirror.
       * @param name {any|Mirror} the name of the children in the children collection --
       * -- or a value in the children collection
       */
      $removeChild(name) {
        removeChild(name, this, Mirror);
        return this;
      }

      /**
       * $children is a map of <key, BehaviorSubject | Mirror>;
       * 99% of the time its values are Mirrors.
       * The only exception is if the configuration
       * deliberately passes a BehaviorSubject as a child; this allows for interfacing
       * with the broader RxJS ecosystem.
       * @returns {Map<any, Mirror|BehaviorSubject>}
       */
      get $children() {
        if (this.$type === TYPE_VALUE) {
          this.$_log(1, 'attempt to get the children of a TYPE_VALUE Mirror');
          return null;
        }
        if (!this.$_children) this.$_children = new Map();
        return this.$_children;
      }

      get $keys() {
        if (!(this.$isCollection && this.$_children)) {
          return new Set();
        }
        return new Set(Array.from(this.$children.keys()));
      }

      $get(field) {
        if (this.$isValue) {
          console.warn('cannot get a member of a TYPE_VALUE mirror');
          return undefined;
        }

        if (!this.$has(field)) {
          this.$_log(0, 'attempt to get non-present child', { field });
          return undefined;
        }
        return this.$children.get(field).value;
      }

      /**
       * returns the mirror that manages a particular child
       * @param field
       * @returns {Mirror|BehaviorSubject|undefined}
       */
      $getChild(field) {
        if (this.$isValue) {
          console.warn('cannot get a member of a TYPE_VALUE mirror');
          return undefined;
        }

        if (!this.$has(field)) {
          this.$_log(0, 'attempt to get non-present child', { field });
          return undefined;
        }
        return this.$children.get(field);
      }

      $set(alpha, value) {
        if (this.$type === TYPE_VALUE) {
          this.next(alpha);
          return;
        }

        if (this.$has(alpha)) {
          this.$children.get(alpha)
            .next(value);
        } else {
          if (this.$_lockFields) {
            if (this.$_constructed) {
              console.warn('attempt to set child', alpha,
                'of a field- locked Mirror', this);
            }
          } else {
            this.$addChild(alpha, value);
          }
        }
      }

      /**
       * a very simple check on the child keys.
       * @param field {any}
       * @returns {boolean}
       */
      $has(field) {
        return mirrorHas(field, this);
      }

      /**
       * distributes a value to the children of the mirror; throws if constructed and new keys are added.
       * Ignores validation.
       *
       * @param newValue {collection | ABSENT}
       */
      $_shard(newValue = ABSENT, allowNewFields = false) {
        if (!this.$isCollection) {
          this.$_log('cannot shard TYPE_VALUE Mirrors');
          return;
        }
        if (this.$_constructed) {
          const newChildren = this.$updateChildren(newValue, allowNewFields);
          if (allowNewFields && newChildren.size) {
            this.$addChildren(newChildren);
          }
        } else {
          this.$addChildren(newValue === ABSENT ? this.value : newValue);
        }
      }

      /**
       * similar to setState; it updates the currently defined fields,
       * if the passed in collection (current value of mirror) has new fields,
       * either they are thrown (and no update occurs), or if returnNewFields is true,
       * they are returned as a map(and the current field set is updated.
       *
       * @param value {object|map|ABSENT} a set of name/value updates; if ABSENT, uses the mirrors current value.
       *
       * @param returnNewFields {boolean}
       * @returns {Map<*, V>|Map<*, *>}
       */
      $updateChildren(value = ABSENT, returnNewFields = false) {
        return updateChildren(value, this, returnNewFields);
      }

      /**
       * transforms the 'immered' value; warning, this should be the end product
       * of updating children; manually mutating the value of a Mirror may break
       * mirror/child consistency
       * @param fn {function}
       */
      $_mutate(fn$1) {
        if (!isFunction$1(fn$1)) {
          throw e('non-function passed to $_mutate', {
            target: this,
            fn: fn$1
          });
        }
        const nextValue = fn(this.value, fn$1);
        this.$$pendingValue = nextValue;
        const errors = this.$hasErrors(nextValue);
        if (errors) {
          console.log('--- errors: ', errors, nextValue );
        }
        else {
          super.next(nextValue);
        }
        delete this.$$pendingValue;
      }

      /**
       * update the collections value with a single field change.
       *  note -- this is a final update utility - it shouldn't be
       *  called directly, only by the update manager.
       * @param name
       * @param value
       */
      $_updateField(name, value) {
        if (typeof name !== 'string') {
          this.$_log(3, 'bad updateField pair:', name, value);
          return;
        }
        switch (this.$type) {
          case TYPE_OBJECT:
            this.$_mutate((draft) => {
              draft[name] = value;
            });
            break;

          case TYPE_MAP:
            this.$_mutate((draft) => {
              draft.set(name, value);
            });
            break;

          default:
            console.warn(
              'attempt to $_updateField', name, value,
              'on a Mirror of type ', this.$type, this
            );
        }
      }

      $_updateFields(collection) {
        const changes = asMap(collection);
        switch (this.$type) {
          case TYPE_OBJECT:
            let nextObject = { ...this.value };
            changes.forEach((value, field) => nextObject[field] = value);
            super.next(nextObject);
            break;

          case TYPE_MAP:
            const nextMap = new Map(this.value);
            changes.forEach((value, field) => nextMap.set(field, value));
            super.next(nextMap);
            break;

          default:
            console.warn(
              'attempt to $_updateFields', name, value,
              'on a Mirror of type ', this.$type, this
            );
        }
      }

      /*** *********** reducers *********** **/

      /**
       * returns the current value of the Mirror as an immer object.
       * OR, a POJO, if raw = true;
       * @param raw {boolean}
       * @returns {immer<Object>|Object}
       */
      $asObject(raw = false) {
        const out = {};
        this.$children.forEach((child, key) => {
          out[key] = child.value;
        });
        return fn(out, noop);
      }

      /**
       * returns the current value of the Mirror as an immer Map.
       * OR, a standard MAP, if raw = true;
       * @param raw {boolean}
       * @returns {immer<Map>|Map}
       */
      $asMap(raw = false) {
        const out = new Map();
        this.$children.forEach((child, key) => {
          out.set(key, child.value);
        });
        if (raw) return out;
        return fn(out, noop);
      }

      /*** *********** BehaviorSubject overrides *********** */

      next(update) {
        if (this.$isValue) {
          this.$_mutate((draft) => update);
        } else {
          this.$updateChildren(update); // will call super.next via subscribers to children.
        }
      }

      /**
       * note - unlike BS, mirrors retain their last value after completion.
       *
       * @returns {unknown}
       */
      get value() {
        return this.$$pendingValue ? this.$$pendingValue : this._value;
      }

      /**
       * a polymorphic method with signatures ranging from:
       *
       * - msg, ...args
       * - msg, ...args
       * - n, msg ...args
       * - n, msg, ...args
       *
       * with N being the severity of the issue - the higher the more likely
       * the message is to be broadcast
       * msg being a string
       * any subsequent args being any optional output to the log
       *
       * @param args
       * @returns {boolean}
       */
      $_log(...args) {
        utilLogs(this, ...args);
      }
    }

    var index = {
      ...constants, utils, Mirror,
    };

    return index;

}));
