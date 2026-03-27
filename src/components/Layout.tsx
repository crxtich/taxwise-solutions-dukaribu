import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/254720614530"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-4 pr-2 py-2 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
    style={{ backgroundColor: "#25D366" }}
  >
    <span className="text-white text-sm font-semibold whitespace-nowrap">Chat with us</span>
    {/* Official WhatsApp logo: speech-bubble with phone handset */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="w-10 h-10 shrink-0">
      <defs>
        <linearGradient id="wa-grad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163"/>
          <stop offset="1" stopColor="#23b33a"/>
        </linearGradient>
      </defs>
      <path
        d="M87.184 25c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535L26 148.17l30.498-7.981a61.297 61.297 0 0 0 29.805 7.6h.024c33.71 0 61.144-27.422 61.156-61.13a60.75 60.75 0 0 0-17.886-43.252A60.83 60.83 0 0 0 87.184 25z"
        fill="url(#wa-grad)"
      />
      <path
        d="M87.184 32.235c-29.319 0-53.176 23.846-53.188 53.14a52.75 52.75 0 0 0 8.267 28.304l1.287 2.044-5.469 19.978 20.542-5.384 1.976 1.17a53.07 53.07 0 0 0 26.946 7.35h.021c29.307 0 53.164-23.846 53.176-53.14a52.57 52.57 0 0 0-15.464-37.37 52.68 52.68 0 0 0-38.094-16.092z"
        fill="#ffffff"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.669-13.645z"
        fill="#25D366"
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
