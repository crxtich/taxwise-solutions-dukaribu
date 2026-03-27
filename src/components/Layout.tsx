import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/254720614530"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
    style={{ backgroundColor: "#25D366" }}
  >
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <path
        d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7A19.9 19.9 0 0 0 24 44c11 0 20-9 20-20S35 4 24 4z"
        fill="#25D366"
      />
      <path
        d="M24 6.4A17.6 17.6 0 0 0 6.4 24c0 3.3.9 6.4 2.5 9.1l.4.6-1.7 6.2 6.4-1.7.6.3A17.5 17.5 0 0 0 24 41.6 17.6 17.6 0 0 0 41.6 24 17.6 17.6 0 0 0 24 6.4z"
        fill="#25D366"
      />
      <path
        d="M17.5 14.1c-.4-1-.9-1-1.2-1h-1c-.4 0-1 .1-1.5.7S12 15.4 12 17.5s1.5 4.4 1.7 4.7c.2.3 2.9 4.6 7.1 6.3 3.5 1.4 4.2 1.1 5 1 .7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5s-2.4-1.2-2.8-1.3c-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.6-.2.3-.5.3-.9.1-.4-.2-1.8-.7-3.4-2.1-1.3-1.1-2.1-2.5-2.4-2.9-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3 0-.5-.1-.8-.1-.2-1-2.4-1.4-3.3z"
        fill="white"
      />
    </svg>
  </a>
);

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Layout;
