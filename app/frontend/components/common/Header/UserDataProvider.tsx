"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export interface User {
  users_id?: number;
  users_name?: string;
  email?: string;
  rules_id?: number;
  department_id?: number;
}

// Raw permission flags exactly as returned by GET /api/data/user's `rules` field.
export interface RawRules {
  rules_id: number;
  rules_name: string;
  add_user_status: number;
  edit_user_status: number;
  delete_user_status: number;
  list_user_status: number;
  add_ticket_status: number;
  edit_ticket_status: number;
  delete_ticket_status: number;
  list_ticket_status: number;
  list_ticket_assign: number;
  add_user_rules: number;
  edit_user_rules: number;
  delete_user_rules: number;
  list_user_rules: number;
  add_station: number;
  edit_station: number;
  delete_station: number;
  list_station: number;
  add_department: number;
  edit_department: number;
  delete_department: number;
  list_department: number;
  scope_to_department: number;
  list_dashboard?: number;
  list_track?: number;
  list_report?: number;
  list_alertbot?: number;
  [key: string]: unknown;
}

interface DecodedToken {
  users_id?: number;
  userId?: number;
  id?: number;
  sub?: number;
  exp: number;
}

interface UserDataContextType {
  user: User | null;
  userImage: string | null;
  rules: RawRules | null;
  isAdmin: boolean;
  authLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserImage: React.Dispatch<React.SetStateAction<string | null>>;
  handleLogout: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error("useUserData must be used within UserDataProvider");
  return context;
};

interface UserDataProviderProps {
  children: React.ReactNode;
}

const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [rules, setRules] = useState<RawRules | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    let isCancelled = false;

    async function loadImage(usersId: number) {
      const storedImage = sessionStorage.getItem("userImage");
      if (storedImage) {
        setUserImage(storedImage);
        return;
      }
      const response = await fetch(`/api/data/user_image?users_id=${usersId}`);
      const data = await response.json();
      if (isCancelled) return;
      const imagePath = response.ok ? data.imagePath : "/Uploads/user_image/Default-avatar.jpg";
      setUserImage(imagePath);
      sessionStorage.setItem("userImage", imagePath);
    }

    async function loadUserData() {
      if (isCancelled) return;

      const token = sessionStorage.getItem("token");
      if (!token) {
        if (!isCancelled) {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userImage");
          sessionStorage.removeItem("permissions");
          router.push("/");
        }
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
        if (!userId || decoded.exp * 1000 < Date.now()) {
          if (!isCancelled) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("userImage");
            sessionStorage.removeItem("permissions");
            router.push("/");
          }
          return;
        }

        // `user` + `rules` are always fetched together from the same endpoint,
        // and cached together, so a session never ends up with one but not the other.
        const storedUser = sessionStorage.getItem("user");
        const storedRules = sessionStorage.getItem("permissions");
        if (storedUser && storedRules) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setRules(JSON.parse(storedRules));
          if (!isCancelled) await loadImage(parsedUser.users_id);
          return;
        }

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (!isCancelled) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("userImage");
            sessionStorage.removeItem("permissions");
            router.push("/");
          }
          return;
        }
        const { user: fetchedUser, rules: fetchedRules } = await response.json();
        if (!isCancelled) {
          setUser(fetchedUser);
          setRules(fetchedRules);
          sessionStorage.setItem("user", JSON.stringify(fetchedUser));
          sessionStorage.setItem("permissions", JSON.stringify(fetchedRules));
          await loadImage(fetchedUser.users_id);
        }
      } catch (error) {
        if (!isCancelled) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userImage");
          sessionStorage.removeItem("permissions");
          router.push("/");
        }
      } finally {
        if (!isCancelled) setAuthLoading(false);
      }
    }

    loadUserData();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userImage");
    sessionStorage.removeItem("permissions");
    setUser(null);
    setUserImage(null);
    setRules(null);
    router.push("/");
  };

  const isAdmin = !!rules?.add_user_rules;

  if (!isMounted) return null;

  return (
    <UserDataContext.Provider
      value={{ user, userImage, rules, isAdmin, authLoading, setUser, setUserImage, handleLogout }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataProvider;