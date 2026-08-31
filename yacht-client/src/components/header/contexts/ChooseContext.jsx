import { createContext, useContext, useState } from "react";

export const ChosenContext = createContext();

export default function ChosenContextProvider({children}){
    const [added, setAdded] = useState(0); // глобальное состояние выбранной категории

  return (
    <ChosenContext.Provider value={{ added, setAdded }}>
      {children}
    </ChosenContext.Provider>
  )
}

export function useAdded(){
    return useContext(ChosenContext);
}