// Nx convention: models / pure helpers → util lib (ui may depend on util, not on data-access).
export interface Product {
  id: number;
  name: string;
  price: number;
}
