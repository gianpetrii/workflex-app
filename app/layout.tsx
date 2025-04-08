import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { TeamProvider } from "@/lib/team-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkFlex App",
  description: "A flexible work scheduling application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen items-center justify-center w-full`}
      >
        <AuthProvider>
          <TeamProvider>
            <div className="w-full max-w-[1440px] mx-auto">
              {children}
            </div>
            <Toaster />
          </TeamProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
