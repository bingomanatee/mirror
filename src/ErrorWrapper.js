import { errorWrapperParamErrorMsg } from './constants';
import Event from './Event';

export default class ErrorWrapper {
  constructor(error, event) {
    if (!(event instanceof Event)) {
      throw new Error(errorWrapperParamErrorMsg);
    }
    this.error = error;
    this.event = event;
  }

  get message() {
    if (typeof this.error === 'string') return this.error;
    return this.error.message;
  }
}
