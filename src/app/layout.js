import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Providers from "./providers";
import OriginProvider from "@/components/OriginProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "APT Casino",
  description: "APT Casino - Enhanced with Camp Network Origin SDK",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden w-full`}>
        <Providers>
          <OriginProvider>
            <Navbar />
            {children}
            <Footer />
          </OriginProvider>
        </Providers>
      </body>
    </html>
  );
}
