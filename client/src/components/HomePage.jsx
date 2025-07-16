import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'animate.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
      {/* Hero Section */}
      <header className="text-center text-dark py-5" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <h1 className="display-3 fw-bold animate__animated animate__fadeInDown">
            Welcome to <span className="text-primary">TrustGuard</span>
          </h1>
          <p className="lead mt-3 animate__animated animate__fadeInUp animate__delay-1s">
            India’s Trusted Escrow System – Secure, Transparent, and Hassle-Free Transactions.
          </p>
          <button
            className="btn btn-lg btn-gradient mt-4 px-5 py-2 animate__animated animate__fadeInUp animate__delay-2s"
            style={{
              background: 'linear-gradient(135deg, #007bff, #00c6ff)',
              border: 'none',
              color: 'white',
              borderRadius: '30px'
            }}
            onClick={() => navigate('/signup')}
          >
            🚀 Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="container py-5">
        <h2 className="text-center mb-5 fw-semibold">Why Choose TrustGuard?</h2>
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="p-4 shadow border rounded bg-white animate__animated animate__fadeInUp">
              <h5 className="mb-3">🔒 Buyer Protection</h5>
              <p className="text-muted">Payments are secured until the buyer confirms delivery.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 shadow border rounded bg-white animate__animated animate__fadeInUp animate__delay-1s">
              <h5 className="mb-3">📦 Verified Shipping</h5>
              <p className="text-muted">Sellers ship only after confirmation of payment by our system.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 shadow border rounded bg-white animate__animated animate__fadeInUp animate__delay-2s">
              <h5 className="mb-3">⚖️ Fair Dispute Handling</h5>
              <p className="text-muted">TrustGuard ensures every party gets a fair resolution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <p className="mb-0 fw-light">© 2025 TrustGuard. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
