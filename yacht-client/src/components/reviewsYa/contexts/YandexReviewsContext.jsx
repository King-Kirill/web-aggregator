import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "../../../config";

export const YandexReviewsContext = createContext();

export default function YandexReviewsContextProvider({children}){
const [yaReviews, setYaReviews] = useState([]);

useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${BASE_URL}/get-yandex-reviews`);

        if(res.status === 200)
        {
          const data = await res.json();
          setYaReviews(data.content);
        }
        else if(res.status === 404)
        {
          setYaReviews([]);
        }
      } catch (err) {
        
      }
    };
    fetchItems();
  }, []);

  return (
    <YandexReviewsContext.Provider value={{ yaReviews, setYaReviews }}>
      {children}
    </YandexReviewsContext.Provider>
  )
}

export function useYaReviews(){
    return useContext(YandexReviewsContext);
}