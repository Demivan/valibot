import type { BaseTransformation, TypedDataset } from '../../types/index.ts';

/**
 * Brand symbol.
 */
export const BrandSymbol = Symbol('brand');

/**
 * Brand name type.
 */
export type BrandName = string | number | symbol;

/**
 * Brand type.
 */
export interface Brand<TName extends BrandName> {
  [BrandSymbol]: { [TValue in TName]: TValue };
}

/**
 * Brand action type.
 */
export interface BrandAction<TInput, TBrand>
  extends BaseTransformation<TInput, TInput & TBrand, never> {
  /**
   * The action type.
   */
  readonly type: 'brand';
}

export interface BrandMarker<TBrand> {
  type: 'brand',
  brandType?: TBrand
}

/**
 * Creates a brand transformation action.
 *
 * @param name The brand name.
 *
 * @returns A brand action.
 */
export function brand<TBrand>(
): BrandMarker<TBrand> {
  return {
    type: 'brand',
  };
}
