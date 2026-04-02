"use client";

import { createContext, useContext } from "react";

const AdminContext = createContext(false);

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>
  );
}
