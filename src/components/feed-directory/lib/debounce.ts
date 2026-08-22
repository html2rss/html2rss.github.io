export function debounce<T extends (...args: never[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function debounced(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}
