export const ACTION_NEXT = Symbol('action-next');
export const SKIP = Symbol('skip');
export const errorWrapperParamErrorMsg = 'requires an event as the second parameter';
export const identity = (n) => n;
export const ACTION_CHANGE_KEYS = Symbol('action-update');
export const ACTION_CHILD_ERROR = Symbol('action-child-error');
export const UNHANDLED = Symbol('do-action-unhandled');

export const PHASE_INIT = null;
export const PHASE_PRE = -1;
export const PHASE_ON = 0;
export const PHASE_POST = 1;

export const PHASE_DEFAULT_LIST = [PHASE_PRE, PHASE_ON, PHASE_POST];

