import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { TabProvider } from "@/context/tabContext";

export const metadata: Metadata = {
  title: "Wanderly",
  description: "A Tour experience posting app - created by web5 KRS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TabProvider>
            {children}
          </TabProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
