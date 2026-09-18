import { AnimatePresence, motion } from "framer-motion";
import { RouterProvider, useRouter } from "@/lib/router";
import { I18nProvider } from "@/i18n";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { RoutesPage } from "@/pages/RoutesPage";
import { FleetPage } from "@/pages/FleetPage";
import { TrackPage } from "@/pages/TrackPage";
import { AboutPage } from "@/pages/AboutPage";
import { BookConfirmation, BookPassengers, BookPayment, BookResults, BookSearch, BookSeats } from "@/pages/Booking";
import { Account } from "@/pages/Account";
import { Admin } from "@/pages/Admin";

function Routes() {
  const { path, segments, locale } = useRouter();

  let page: React.ReactNode = <Home />;
  let overHero = true;
  let chrome = true;

  if (segments[0] === "routes") {
    page = <RoutesPage />;
    overHero = false;
  } else if (segments[0] === "fleet") {
    page = <FleetPage />;
    overHero = false;
  } else if (segments[0] === "track") {
    page = <TrackPage />;
    overHero = false;
  } else if (segments[0] === "about") {
    page = <AboutPage />;
    overHero = false;
  } else if (segments[0] === "account") {
    page = <Account />;
    overHero = false;
  } else if (segments[0] === "admin") {
    page = <Admin />;
    chrome = false;
  } else if (segments[0] === "book") {
    overHero = false;
    if (segments[1] === "search") page = <BookSearch />;
    else if (segments[1] === "results") page = <BookResults />;
    else if (segments[2] === "seats") page = <BookSeats tripId={segments[1]} />;
    else if (segments[2] === "passengers") page = <BookPassengers tripId={segments[1]} />;
    else if (segments[2] === "payment") page = <BookPayment tripId={segments[1]} />;
    else if (segments[2] === "confirmation") page = <BookConfirmation tripId={segments[1]} />;
    else page = <BookSearch />;
  }

  return (
    <div className="min-h-screen bg-white">
      {chrome && <Navbar overHero={overHero} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={locale + path}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {page}
        </motion.main>
      </AnimatePresence>
      {chrome && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <I18nProvider>
        <StoreProvider>
          <ToastProvider>
            <Routes />
          </ToastProvider>
        </StoreProvider>
      </I18nProvider>
    </RouterProvider>
  );
}
