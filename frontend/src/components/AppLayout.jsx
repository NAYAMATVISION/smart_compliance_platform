import Navbar from "./Navbar";
import Footer from "./Footer";
import "./styles/layout.css";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
