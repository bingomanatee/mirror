let instance = null;

export const setInstance = (inst) => {
  instance = inst;
};

export default function isMirror(target) {
  return target instanceof instance;
}
