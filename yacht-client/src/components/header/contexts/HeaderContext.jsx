import { createContext, useContext, useState } from "react";

export const HeaderContext = createContext();

export default function HeaderProvider({children}){
    const [selected, setSelected] = useState("категории"); // глобальное состояние выбранной категории

  return (
    <HeaderContext.Provider value={{ selected, setSelected }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useCategory(){
    return useContext(HeaderContext);
}