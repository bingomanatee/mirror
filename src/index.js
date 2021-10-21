import Mirror from './Mirror';
import * as constants from './constants';
import * as utils from './utils';
import mirrorWatcher from './mirrorWatcherUtil';
import MirrorEvent from './MirrorEvent';

export default {
  ...constants, utils, Mirror, mirrorWatcher, Event: MirrorEvent,
};
