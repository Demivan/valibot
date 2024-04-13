type MaybeAwait<P> = P extends Promise<infer T> ? T : P;

/**
 * Wraps a generator function to be run synchronously or asynchronously.
 * 
 * @param _this This value.
 * @param body Body of a generator function.
 * 
 * @returns Promise or value.
 */
export function maybeAsync<TThis, TYield, TReturn>(
  _this: TThis,
  body: () => Generator<TYield, TReturn, MaybeAwait<TYield>>
): Promise<TReturn> | TReturn {
  const gen = body.call(_this);
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
