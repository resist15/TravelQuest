// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "TravelQuest",
  description: "Track your adventures",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 pt-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
