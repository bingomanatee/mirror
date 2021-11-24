import Mirror from './Mirror';
import * as constants from './constants';
import * as utils from './utils';
import mirrorWatcher from './mirrorWatcherUtil';
import MirrorTrans from './MirrorTrans';
import { setMirrorClass } from './newMirror';
import * as idGen from './idGen';

setMirrorClass(Mirror);
export default {
  ...constants, ...idGen, idGen, utils, Mirror, mirrorWatcher, MirrorTrans,
};
