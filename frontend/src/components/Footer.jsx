import "./styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Compliance</h3>
            <p className="footer-description">
              Automate compliance management for growing teams
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><a href="/">Features</a></li>
              <li><a href="/">How it works</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="/">About</a></li>
              <li><a href="/">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Compliance Platform. Student project.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
