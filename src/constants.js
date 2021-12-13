export const TYPE_MAP = Symbol('type:map');
export const TYPE_OBJECT = Symbol('type:object');
export const TYPE_VALUE = Symbol('type:value');
export const TYPE_ARRAY = Symbol('type:array');

export const NAME_UNNAMED = Symbol('unnamed');

export const ABSENT = Symbol('ABSENT');

export const CHILDREN = Symbol('CHILDREN');

export const EVENT_TYPE_NEXT = 'next';
export const EVENT_TYPE_SET = 'set';
export const EVENT_TYPE_DEBUG = 'debug';

export const EVENT_TYPE_ACCEPT_FROM = 'event:acceptFrom';
export const EVENT_TYPE_REMOVE_FROM = 'event:removeFrom';

export const EVENT_TYPE_FLUSH_ACTIVE = 'event:commit';
export const EVENT_TYPE_ACTION = 'event:action';
export const EVENT_TYPE_MUTATE = 'event:mutate';
export const EVENT_TYPE_VALIDATE = 'event:validate';
export const SET_RE = /^set(.+)$/i;
