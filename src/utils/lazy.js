/**
 *
 * @param target {object}
 * @param name {string}
 * @param creator {function}
 */
export default function lazy(target, name, creator) {
  if (!(name in target)) {
    target[name] = creator(target, name);
  }
  return target[name];
}
