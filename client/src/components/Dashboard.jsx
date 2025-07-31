import { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [sellerUsername, setSellerUsername] = useState('');
  const [dealStatus, setDealStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    axios.get('/auth/profile')
      .then(res => setUser(res.data))
      .catch(err => {
        setError('Access denied. Please log in.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/deals/create', { itemName, amount, sellerUsername })
      .then(() => {
        setDealStatus("✅ Deal submitted!");
        setItemName('');
        setAmount('');
        setSellerUsername('');
      })
      .catch(err => {
        console.error(err);
        setDealStatus("❌ Failed to create deal");
      });
  };

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-5">Loading user info...</div>;
  }

  return (
    <div className="container py-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary animate__animated animate__fadeInDown">Welcome, {user.username} 👋</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="mb-4">
        <button className="btn btn-dark me-2" onClick={() => navigate('/my-deals')}>📑 View My Deals</button>
      </div>

      <div className="row">
        {/* Create Deal Section */}
        <div className="col-md-6 animate__animated animate__fadeInLeft">
          <div className="card shadow p-4">
            <h4 className="mb-3">💼 Create Escrow Deal</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Item name (max 50 chars)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount in ₹ (1–100000)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  max={100000}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter seller's username"
                  value={sellerUsername}
                  onChange={(e) => setSellerUsername(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100">Submit Deal</button>
            </form>

            {dealStatus && (
              <div className="alert alert-info text-center mt-3">{dealStatus}</div>
            )}
          </div>
        </div>

        {/* Seller View */}
        <div className="col-md-6 animate__animated animate__fadeInRight">
          <div className="card shadow p-4 bg-light">
            <h4 className="mb-3">📦 Incoming Escrow Requests</h4>
            <p className="mb-4">Check your pending deals and confirm transactions securely.</p>
            <button className="btn btn-primary w-100" onClick={() => navigate('/my-deals')}>🔍 View My Deals</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
