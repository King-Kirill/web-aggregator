import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearchContext = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [productsIds, setProductsIds] = useState([]);

  return (
    <SearchContext.Provider value={{ productsIds, setProductsIds }}>
      {children}
    </SearchContext.Provider>
  );
};