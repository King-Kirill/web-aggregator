import React, { createContext, useState } from "react";

// Создаём контекст
export const RoleContext = createContext();

// Провайдер контекста
export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState("user"); // "user" или "admin"

  const toggleRole = () => {
    setRole((prev) => (prev === "user" ? "admin" : "user"));
  };

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
};