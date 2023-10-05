export function deepMerge(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source;
  }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (target.hasOwnProperty(key) && typeof target[key] === 'object' && typeof source[key] === 'object') {
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}