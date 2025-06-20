import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ✅ Add this line

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback"
        />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/5.3.0/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        {children}

        {/* ✅ Add ToastContainer here */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          toastStyle={{ marginTop: "5rem" , marginRight: "1rem" }}
        
        />

        <Script src="https://code.jquery.com/jquery-3.6.0.min.js" />
        <Script src="https://stackpath.bootstrapcdn.com/bootstrap/5.3.0/js/bootstrap.bundle.min.js" />
        {/* <script src="https://cdn.jsdelivr.net/npm/react-hot-toast@2.4.1/dist/index.umd.min.js"></script> */}
      </body>
    </html>
  );
}
