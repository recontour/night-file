import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE NIGHT FILE",
  description: "An interactive detective story",
  icons: {
    icon: "/story.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
