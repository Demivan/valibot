type MaybeAwait<P> = P extends Promise<infer T> ? T : P;

/**
 * Wraps a generator function to be run synchronously or asynchronously.
 * 
 * @param body Body of a generator function.
 * 
 * @returns Promise or value.
 */
export function maybeAsync<Args extends unknown[], TYield, TReturn>(
  body: (...args: Args) => Generator<TYield, TReturn, MaybeAwait<TYield>>
): (...args: Args) => (Promise<TReturn> | TReturn) {
  return (...args: Args) => {
    const gen = body(...args);
    function run(...args: [] | [TYield extends Promise<infer P> ? P : TYield]): Promise<TReturn> | TReturn {
      let result = gen.next(...args);
      while (!result.done) {
        if (result.value instanceof Promise) {
          return result.value.then(run);
        } else {
          result = gen.next(result.value as MaybeAwait<TYield>); // https://github.com/microsoft/TypeScript/issues/47901
        }
      }
      return result.value;
    }
    return run();
  }
}
