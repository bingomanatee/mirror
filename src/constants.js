export const TYPE_MAP = Symbol('type:map');
export const TYPE_OBJECT = Symbol('type:object');
export const TYPE_VALUE = Symbol('type:value');
export const TYPE_ARRAY = Symbol('type:array');

export const NAME_UNNAMED = Symbol('unnamed');

export const ABSENT = Symbol('ABSENT');

export const CHILDREN = Symbol('CHILDREN');

export const EVENT_TYPE_NEXT = 'next';
export const EVENT_TYPE_SET = 'set';
export const EVENT_TYPE_SHARD = 'next:shard';
export const EVENT_TYPE_TRY = 'try';
export const EVENT_TYPE_ACCEPT_AFTER = 'event:acceptAfter';
export const EVENT_TYPE_REMOVE_AFTER = 'event:removeAfter';
export const EVENT_TYPE_CHILD_ADDED = 'child:added';
export const EVENT_TYPE_REVERT = 'event:revert';
export const EVENT_TYPE_COMMIT = 'event:commit';
export const EVENT_TYPE_COMMIT_CHILDREN = 'event:commit:children';
export const EVENT_TYPE_VALIDATE = 'event:validate';
export const EVENT_TYPE_ACTION = 'event:action';
export const EVENT_TYPE_MUTATE = 'event:mutate';
export const SET_RE = /^set(.+)$/i;

export const TRANS_TYPE_CHANGE = 'trans:change';
export const TRANS_TYPE_ACTION = 'trans:action';

export const TRANS_STATE_NEW = 'trans:state:new';
export const TRANS_STATE_ERROR = 'trans:state:error';
export const TRANS_STATE_COMPLETE = 'trans:state:complete';
