"use client"

import { UserSummary } from "@/types/wanderly";
import { createContext, useContext, useState, type ReactNode, useEffect } from "react";


interface AuthContextType {
  user: UserSummary | null;
  setUser: (user: UserSummary | null) => void;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  setIsLoadingAuth: (isLoadingAuth: boolean) => void;
}


// three steps
// 1. create the context
// 2. wrap the app inside Provider
// 3. use the context created

const AuthCtx = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true)

  // getting the logged in user details at the time of render of the AuthProvider - implementing this in the Provider so that if user directly jumps to any page, doesn't matter the auth check will always happen, because this page will always load
  useEffect(() => {
     let finished = false;
 
     async function initializeAuth() {
       try {
         const res = await fetch("/api/me", {
           credentials: "include",
         });
 
         if (!res.ok) {
           if (!finished) setUser(null);
           return;
         }
 
         const data = await res.json();
 
         if (!finished) {
           setUser(data.user ?? null);
         }
       } catch (error) {
         console.error("Authentication failed:", error);
 
         if (!finished) setUser(null);
       } finally {
         if (!finished) setIsLoadingAuth(false);
       }
     }
 
     initializeAuth();
 
     return () => {
       finished = true;
     };
   }, []);
  
  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: user !== null,
    isLoadingAuth,
    setIsLoadingAuth
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthCtx);  // it will be undefined if not used inside the AuthProvider because AuthCtx default value is undefined

  if (ctx === undefined) { 
    throw new Error("useAuth must the used inside an authProvider");
  }

  return ctx;
}
