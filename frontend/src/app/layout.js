import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Gym OS | Next-Gen Fitness",
  description: "Advanced AI-powered fitness platform for personalized workouts and diet planning.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}

