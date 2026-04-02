"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AdminContext = createContext(false);

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for the non-HttpOnly hint cookie
    setIsAdmin(document.cookie.includes("admin_logged_in=1"));
  }, []);

  return (
    <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>
  );
}
