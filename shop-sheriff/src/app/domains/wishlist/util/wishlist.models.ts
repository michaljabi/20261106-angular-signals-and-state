/** Front-end models of the wishlist. Lives in `util` so data-access, feature and ui may all use them. */
export interface WishlistDetails {
  name: string;
  description: string;
  giftSlug: string;
}


export interface WishlistProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  slug: string;
  priceCents: number;
  stock: number;
}
