// app/components/common/Header/UserDataProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  users_id?: number;
  users_name?: string;
  email?: string;
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
  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedImage = sessionStorage.getItem("userImage");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (storedImage) {
        setUserImage(storedImage);
      } else if (parsedUser.users_id) {
        const fetchUserImage = async () => {
          try {
            const response = await fetch(`/api/data/user_image?users_id=${parsedUser.users_id}`);
            const data = await response.json();
            if (response.ok) {
              setUserImage(data.imagePath);
              sessionStorage.setItem("userImage", data.imagePath);
            } else {
              setUserImage("/Uploads/user_image/Default-avatar.jpg");
              sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
            }
          } catch (error) {
            setUserImage("/Uploads/user_image/Default-avatar.jpg");
            sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
          }
        };
        fetchUserImage();
      } else {
        setUserImage("/Uploads/user_image/Default-avatar.jpg");
        sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
      }
    } else {
      setUserImage("/Uploads/user_image/Default-avatar.jpg");
    }
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userImage");
      setUser(null);
      setUserImage(null);
      router.push("/");
    }
  };

  return (
    <UserDataContext.Provider value={{ user, userImage, setUser, setUserImage, handleLogout }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataProvider;