"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export interface User {
  users_id?: number;
  users_name?: string;
  email?: string;
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
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    let isCancelled = false;

    async function loadUserData() {
      if (isCancelled) return;

      const token = sessionStorage.getItem("token");
      if (!token) {
        if (!isCancelled) {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userImage");
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
            router.push("/");
          }
          return;
        }

        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          const storedImage = sessionStorage.getItem("userImage");
          if (storedImage) {
            setUserImage(storedImage);
          } else {
            const response = await fetch(`/api/data/user_image?users_id=${parsedUser.users_id}`);
            const data = await response.json();
            if (!isCancelled) {
              if (response.ok) {
                setUserImage(data.imagePath);
                sessionStorage.setItem("userImage", data.imagePath);
              } else {
                setUserImage("/Uploads/user_image/Default-avatar.jpg");
                sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
              }
            }
          }
        } else {
          const response = await fetch("/api/data/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            if (!isCancelled) {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("userImage");
              router.push("/");
            }
            return;
          }
          const { user: fetchedUser } = await response.json();
          if (!isCancelled) {
            setUser(fetchedUser);
            sessionStorage.setItem("user", JSON.stringify(fetchedUser));

            const imageResponse = await fetch(`/api/data/user_image?users_id=${fetchedUser.users_id}`);
            const imageData = await imageResponse.json();
            if (!isCancelled) {
              if (imageResponse.ok) {
                setUserImage(imageData.imagePath);
                sessionStorage.setItem("userImage", imageData.imagePath);
              } else {
                setUserImage("/Uploads/user_image/Default-avatar.jpg");
                sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
              }
            }
          }
        }
      } catch (error) {
        if (!isCancelled) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userImage");
          router.push("/");
        }
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
    setUser(null);
    setUserImage(null);
    router.push("/");
  };

  if (!isMounted) return null;

  return (
    <UserDataContext.Provider value={{ user, userImage, setUser, setUserImage, handleLogout }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataProvider;