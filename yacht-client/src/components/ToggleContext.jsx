import { createContext, useContext, useState } from "react";

const ToggleContext = createContext();

export const useToggleContext = () => useContext(ToggleContext);

export const ToggleProvider = ({ children }) => {
  const [isOn, setIsOn] = useState(false);

  return (
    <ToggleContext.Provider value={{ isOn, setIsOn }}>
      {children}
    </ToggleContext.Provider>
  );
};