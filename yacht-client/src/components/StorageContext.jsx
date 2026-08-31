import { createContext, useContext, useState } from "react";

const StorageContext = createContext();

export const useStorageContext = () => useContext(StorageContext);

export const StorageProvider = ({ children }) => {
  const [favourites, setFavourites] = useState(() => {
    const stored = localStorage.getItem("favourites");
    return stored ? JSON.parse(stored).map(Number) : [];
  });

  const toggleFavourite = (id) => {
    setFavourites(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(f => f !== id);
      } else {
        updated = [...prev, id];
      }
      localStorage.setItem("favourites", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <StorageContext.Provider value={{ favourites, toggleFavourite }}>
      {children}
    </StorageContext.Provider>
  );
};