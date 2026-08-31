import { createContext, useContext, useState } from "react";

export const ProductsContext = createContext();

export const ProductsProvider = ({children}) => {
    const [productsContext, setProductsContext] = useState([]);

  return (
    <ProductsContext.Provider value={{ productsContext, setProductsContext }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProductsContext(){
    return useContext(ProductsContext);
}