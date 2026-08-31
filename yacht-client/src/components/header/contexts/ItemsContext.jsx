// ItemsContext.jsx
import { createContext, useState, useEffect } from "react";
import { BASE_URL } from '../../../config';

export const ItemsContext = createContext();

export default function ItemsProvider({ children }) {
  const [items, setItems] = useState([]);

useEffect(() => {
    const fetchCatalog = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({
          name: "header"
        })
      });

      if (res.status === 200) {
        const data = await res.json();

        const group1 = []

        data.content.forEach(item => {
          group1.push(item)
        });

        const sortByOrderId = (arr) => arr.sort((a, b) => a.id - b.id);
        sortByOrderId(group1);

        setItems(group1);

      }

    } catch (err) {
    }
  };

  fetchCatalog();
  }, []);
  
  return (
    <ItemsContext.Provider value={{ items, setItems }}>
      {children}
    </ItemsContext.Provider>
  );
}
