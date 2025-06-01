import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuickAPI - Your Lightweight API Client",
  description: "A simple REST client similar to Postman, built with Next.js.",
  icons: {
    icon: "./favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.png" sizes="any" />
        <link
          rel="icon"
          href="./favicon.png"
          type="image/png"
          sizes="192x192"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}> {children}</body>
    </html>
  );
}
