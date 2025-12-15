import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import ToasterContext from "@/app/api/contex/ToasetContex";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" enableSystem defaultTheme="light">
          <AuthProvider>

            {/* ✅ LAYOUT CHUẨN */}
            <div className="flex flex-col min-h-screen">
              <Header />

              {/* MAIN CONTENT – chiếm phần còn lại */}
              <main className="flex-1">
                {children}
              </main>

              <ScrollToTop />
            </div>

            {/* Toast nên để ngoài layout */}
            <ToasterContext />
            <ToastContainer />

          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
