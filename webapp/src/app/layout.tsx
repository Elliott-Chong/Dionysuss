import "@/styles/globals.css";
import { GeistSans } from "geist/font";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import ApplicationShell from "@/components/ApplicationShell";

export const metadata = {
  title: "Dionysus",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full bg-white">
        <body
          className={`font-sans ${GeistSans.className} grainy min-h-screen`}
        >
          <TRPCReactProvider headers={headers()}>
            <ApplicationShell>{children}</ApplicationShell>
          </TRPCReactProvider>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
