import Mirror from './Mirror';
import * as constants from './constants';
import * as utils from './utils';
import * as idGen from './idGen';
import {isMirror,  setInstance, create } from './utils/reflection';
import {enableMapSet} from 'immer';
enableMapSet();

setInstance(Mirror);
export default {
  ...constants, ...idGen, idGen, utils, Mirror, isMirror, create
};
