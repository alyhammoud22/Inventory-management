import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Tajawal } from "next/font/google";
import { Cairo } from "next/font/google";
import { Poppins } from "next/font/google";
import { Roboto } from "next/font/google";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "700"] });
const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });
const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Inventory Management System",
  description:
    "Manage your inventory efficiently with our user-friendly system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} ${tajawal.className}`}>
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}
