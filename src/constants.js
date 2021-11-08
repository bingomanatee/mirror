export const TYPE_MAP = Symbol('type:map');
export const TYPE_OBJECT = Symbol('type:object');
export const TYPE_VALUE = Symbol('type:value');

export const NAME_UNNAMED = Symbol('unnamed');

export const ABSENT = Symbol('ABSENT');

export const CHILDREN = Symbol('CHILDREN');

export const STAGE_INIT = 'init';
export const STAGE_VALIDATE = 'stage:validate';
export const STAGE_PERFORM = 'stage:perform';
export const STAGE_POST = 'stage:post';
export const STAGE_ERROR = 'stage:error';
export const STAGE_FINAL = 'stage:final';

export const EVENT_TYPE_NEXT = 'next';
export const EVENT_TYPE_TRY = 'next';
export const EVENT_TYPE_CHILD_ADDED = 'childAdded';
export const EVENT_TYPE_REVERT = 'event:revert';
export const EVENT_TYPE_COMMIT = 'event:commit';
export const EVENT_TYPE_VALIDATE = 'event:validate';
export const EVENT_TYPE_ACTION = 'event:action';
export const EVENT_TYPE_MUTATE = 'event:mutate';

export const defaultNextStages = Object.freeze([STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL]);
export const defaultActionStages = Object.freeze([STAGE_INIT, STAGE_PERFORM, STAGE_FINAL]);
export const defaultMutateStages = Object.freeze([STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL]);
export const defaultStageMap = Object.freeze(new Map(
  [
    [EVENT_TYPE_NEXT, defaultNextStages],
    [EVENT_TYPE_ACTION, defaultActionStages],
    [EVENT_TYPE_MUTATE, defaultMutateStages],
  ],
));
export const SET_RE = /^set(.+)$/i;

export const TRANS_TYPE_CHANGE = 'trans:change';
export const TRANS_TYPE_ACTION = 'trans:action';

export const TRANS_STATE_NEW = 'trans:state:new';
export const TRANS_STATE_ERROR = 'trans:state:error';
export const TRANS_STATE_COMPLETE = 'trans:state:complete';
