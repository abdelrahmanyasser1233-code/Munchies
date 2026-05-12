import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="Munchies" className="footer-logo" />
          <div className="footer-title">munchies</div>
          <div className="footer-tagline">Better Food, Better School Days</div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Munchies School Canteen. Made with 💚
        </div>
      </div>
    </footer>
  );
}
