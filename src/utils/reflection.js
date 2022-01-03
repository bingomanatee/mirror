let Mirror = null;

export const setInstance = (inst) => {
  Mirror = inst;
};

export const isMirror = (target) => target instanceof Mirror;
export const create = (...args) => new Mirror(...args);
