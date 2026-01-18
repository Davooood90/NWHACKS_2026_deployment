import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rambl.tech"),

  title: {
    default: "Rambl",
    template: "%s | Rambl",
  },
  description:
    "A playfully soft platform to help you ramble through your thoughts",
  applicationName: "Rambl",

  icons: {
    icon: "/simple.svg", // SVGs are fine here for modern browsers
    shortcut: "/simple.svg",
    apple: "/icon.png", // Ideally, use a PNG for Apple Touch Icon as well for best support
  },

  openGraph: {
    title: "Rambl",
    description:
      "A playfully soft platform to help you ramble through your thoughts",
    url: "https://rambl.tech",
    siteName: "Rambl",
    images: [
      {
        url: "/icon.png", // CHANGED: Use PNG or JPG here. SVG will not render on social cards.
        width: 1200,
        height: 630,
        alt: "Rambl preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Rambl",
    description:
      "A playfully soft platform to help you ramble through your thoughts",
    // CHANGED: Use PNG or JPG here
    images: ["/icon.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${quicksand.className} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
