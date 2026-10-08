/** Fuel products every station stocks. Each pump sells exactly one; each station has one reservoir per product. */
export enum Product {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  KEROSENE = 'kerosene',
}

export const PRODUCTS: readonly Product[] = Object.values(Product);

export const PRODUCT_LABELS: Record<Product, string> = {
  [Product.PETROL]: 'Petrol (PMS)',
  [Product.DIESEL]: 'Diesel (AGO)',
  [Product.KEROSENE]: 'Kerosene (DPK)',
};
