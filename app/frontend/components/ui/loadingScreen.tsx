"use client";

import { Toaster } from "react-hot-toast";
import React from "react";

const spinnerContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
//   alignItems: "center",
//   justifyContent: "center",
  width: "100vw",
  height: "100vh",
  background: "white",
  animation: "fadeIn 0.5s ease-in-out",
  marginRight: "16px",
  paddingTop: "300px",
  paddingLeft: "500px",
};

const spinnerCubeStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  background: "#2563eb",
  borderRadius: "8px",
  display: "flex",
//   alignItems: "center",
  justifyContent: "center",
  position: "relative",
  marginLeft: "62px",
};

const spinnerCircleStyle: React.CSSProperties = {
  paddingTop: "35px",
  width: "32px",
  height: "32px",
  border: "4px solid transparent",
  borderTopColor: "white",
  borderRadius: "50%",
  animation: "spin 0.1s linear infinite",
  position: "absolute",
};

const messageStyle: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: 500,
  marginTop: "16px",
  
};

// Keyframes need to be injected into a <style> tag dynamically
const keyframes = `
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const LoadingScreen: React.FC<{ message?: string }> = ({
  message = "Getting everything ready...",
}) => {
  return (
    <>
      <style>{keyframes}</style>
      <div style={spinnerContainerStyle}>
        <Toaster position="top-right" />
        <div style={spinnerCubeStyle}>
          <div style={spinnerCircleStyle} />
        </div>
        <p style={messageStyle}>{message}</p>
      </div>
    </>
  );
};

export default LoadingScreen;
