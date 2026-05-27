import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollegeHunt — Find Your Perfect College",
  description:
    "Discover, compare, and shortlist colleges across India. Airbnb-style clean experience for smarter college decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#222222]">
        {children}
      </body>
    </html>
  );
}