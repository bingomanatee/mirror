let Mirror = null;

export function setMirrorClass(MirrorClass) {
  Mirror = MirrorClass;
}

export function newMirror(...args) {
  return new Mirror(...args);
}
