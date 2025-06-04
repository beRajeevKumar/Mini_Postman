import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mini Postman Clone",
  description:
    "A simple REST client application built with Next.js to make HTTP requests and view history.",
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
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
      </head>
      <body
        className={`${inter.variable || inter.className} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
