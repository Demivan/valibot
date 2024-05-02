import { maybeAsync } from '../../methods/pipe/common.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Dataset,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  MaybePromise,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { ArrayIssue, ArrayPathItem } from './types.ts';

function maybePromiseAll<T extends object>(runner: () => MaybePromise<T>[], onError: () => T[]) {
  try {
    const array = runner()
    const isAnyPromise = array.some(value => typeof value === 'object' && value != null && 'then' in value && typeof value.then === 'function')
    return isAnyPromise ? Promise.all(array).catch(onError) : array
  } catch {
    return onError()
  }
}

/**
 * Array schema type.
 */
export interface ArraySchemaAsync<
  TItem extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<ArrayIssue> | undefined,
> extends BaseSchemaAsync<
    InferInput<TItem>[],
    InferOutput<TItem>[],
    ArrayIssue | InferIssue<TItem>
  > {
  /**
   * The schema type.
   */
  readonly type: 'array';
  /**
   * The schema reference.
   */
  readonly reference: typeof array;
  /**
   * The expected property.
   */
  readonly expects: 'Array';
  /**
   * The array item schema.
   */
  readonly item: TItem;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 *
 * @returns An array schema.
 */
export function array<
  const TItem extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(item: TItem): ArraySchemaAsync<TItem, undefined>;

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 * @param message The error message.
 *
 * @returns An array schema.
 */
export function array<
  const TItem extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ArrayIssue> | undefined,
>(item: TItem, message: TMessage): ArraySchemaAsync<TItem, TMessage>;

export function array(
  item:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<ArrayIssue>
): ArraySchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<ArrayIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'array',
    reference: array,
    expects: 'Array',
    item,
    message,
    _run(dataset, config) {
      return maybeAsync(this, function* () {
        // Get input value from dataset
        const input = dataset.value;

        // If root type is valid, check nested types
        if (Array.isArray(input)) {
          // Set typed to true and value to empty array
          dataset.typed = true;

          // Parse schema of each array item
          dataset.value = yield maybePromiseAll(() => input.map((value, key) => {
            return maybeAsync(this, function* () {
              const itemDataset = yield this.item._run(
                { typed: false, value },
                config
              );

              // If not aborted early, continue execution
              if (!config.abortEarly || !dataset.issues) {
                // If there are issues, capture them
                if (itemDataset.issues) {
                  // Create array path item
                  const pathItem: ArrayPathItem = {
                    type: 'array',
                    origin: 'value',
                    input,
                    key,
                    value,
                  };

                  // Add modified item dataset issues to issues
                  for (const issue of itemDataset.issues) {
                    if (issue.path) {
                      issue.path.unshift(pathItem);
                    } else {
                      // @ts-expect-error
                      issue.path = [pathItem];
                    }
                    // @ts-expect-error
                    dataset.issues?.push(issue);
                  }
                  if (!dataset.issues) {
                    // @ts-expect-error
                    dataset.issues = itemDataset.issues;
                  }

                  // If necessary, abort early
                  if (config.abortEarly) {
                    dataset.typed = false;
                    throw null;
                  }
                }

                // If not typed, set typed to false
                if (!itemDataset.typed) {
                  dataset.typed = false;
                }

                // Add item to dataset
                return itemDataset.value;
              }
            })
          }), () => []);

          // Otherwise, add array issue
        } else {
          _addIssue(this, 'type', dataset, config);
        }

        // Return output dataset
        return dataset as Dataset<
          InferOutput<
            | BaseSchema<unknown, unknown, BaseIssue<unknown>>
            | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
          >[],
          | ArrayIssue
          | InferIssue<
              | BaseSchema<unknown, unknown, BaseIssue<unknown>>
              | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
            >
        >;
      })
    }
  };
}
