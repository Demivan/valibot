import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferOutput,
} from '../../types/index.ts';

/**
 * Set issue type.
 */
export interface SetIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'set';
  /**
   * The expected input.
   */
  readonly expected: 'Set';
}

/**
 * Set path item type.
 */
export interface SetPathItem {
  type: 'set';
  origin: 'value';
  input: Set<unknown>;
  key: number;
  value: unknown;
}

/**
 * Infer set input type.
 */
export type InferSetInput<
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = Set<InferInput<TValue>>;

/**
 * Infer set output type.
 */
export type InferSetOutput<
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = Set<InferOutput<TValue>>;
