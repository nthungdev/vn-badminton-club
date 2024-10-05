import Script from "next/script"
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Apple Badminton",
  description: "Apple Badminton is a badminton club in Renton, Washington.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased space-y-4`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
