import Mirror from './Mirror';
import * as constants from './constants';
import * as utils from './utils';
import * as idGen from './idGen';
import isMirror, { setInstance } from './utils/isMirror';

setInstance(Mirror);
export default {
  ...constants, ...idGen, idGen, utils, Mirror, isMirror,
};
