import { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function MyDeals() {
  const [buyerDeals, setBuyerDeals] = useState([]);
  const [sellerDeals, setSellerDeals] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buyer');
  const [otpInputs, setOtpInputs] = useState({});
  const [resendCooldowns, setResendCooldowns] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/deals/my-buys')
      .then(res => setBuyerDeals(res.data))
      .catch(err => setError('Failed to fetch buyer deals'));

    axios.get('/deals/my-sells')
      .then(res => setSellerDeals(res.data))
      .catch(err => setError('Failed to fetch seller deals'));
  }, []);

  const handleVerifyOtp = async (dealId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/deals/verify-otp', {
        dealId,
        otp: otpInputs[dealId]
      }, {
        headers: { Authorization: token }
      });
      alert(res.data.message || 'OTP Verified!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleResendOtp = async (dealId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/deals/resend-otp', { dealId }, {
        headers: { Authorization: token }
      });
      alert('🔁 OTP resent to seller');

      setResendCooldowns(prev => ({ ...prev, [dealId]: 60 }));
      const interval = setInterval(() => {
        setResendCooldowns(prev => {
          if (!prev[dealId]) return prev;
          const newTime = prev[dealId] - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            const { [dealId]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [dealId]: newTime };
        });
      }, 1000);

      const [buyRes, sellRes] = await Promise.all([
        axios.get('/deals/my-buys'),
        axios.get('/deals/my-sells')
      ]);
      setBuyerDeals(buyRes.data);
      setSellerDeals(sellRes.data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Resend failed');
    }
  };

  const handlePayment = async (dealId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/deals/${dealId}/pay`, {}, {
        headers: { Authorization: token }
      });
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || 'Payment failed');
    }
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm('Are you sure you want to permanently delete this deal?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/deals/${dealId}/delete`, {
        headers: { Authorization: token }
      });
      alert(res.data.message);
      navigate('/my-deals');
      //window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete deal');
    }
  };

  const renderDeals = (deals, role) => {
    if (!deals.length) return <p className="text-muted">No {role} deals found.</p>;

    const handleStatusUpdate = async (deal, type) => {
      if (type === 'shipped' && !deal.paymentReceived) {
        alert('❌ You cannot mark the product as shipped before payment.');
        return;
      }
      if (type === 'delivered' && !deal.itemShipped) {
        alert('❌ You cannot mark the product as delivered until it is shipped.');
        return;
      }

      try {
        const endpoint = `/deals/${deal._id}/${type === 'shipped' ? 'mark-shipped' : 'mark-delivered'}`;
        const token = localStorage.getItem('token');
        await axios.put(endpoint, {}, {
          headers: { Authorization: token }
        });
        alert(`✅ Deal marked as ${type}`);
        window.location.reload();
      } catch (err) {
        alert(`❌ Failed to mark as ${type}`);
      }
    };

    return (
      <div className="row">
        {deals.map(deal => (
          <div key={deal._id} className="col-md-6 mb-4">
            <div className="card shadow-sm h-100 animate__animated animate__fadeInUp">
              <div className="card-body">
                <h5 className="card-title">
                  {deal.itemName} <span className="badge bg-secondary">₹{deal.amount}</span>
                </h5>
                <p className="card-text">
                  {role === 'buyer'
                    ? <>To: <strong>{deal.sellerUsername || deal.sellerId}</strong></>
                    : <>From: <strong>{deal.buyerId?.username || deal.buyerId}</strong></>}
                  <br />
                  Status: <span className="badge bg-info text-dark">{deal.status}</span>
                </p>

                {/* Seller: Mark as Shipped */}
                {role === 'seller' && deal.status === 'pending' && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <button className="btn btn-warning btn-sm" onClick={() => handleStatusUpdate(deal, 'shipped')}>
                      📦 Mark as Shipped
                    </button>
                    {!deal.paymentReceived && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deal._id)}>
                        🗑️ Delete Deal
                      </button>
                    )}
                  </div>
                )}

                {role === 'buyer' && !deal.otpVerified && (
                  <div className="mt-2">
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="Enter Seller OTP"
                      value={otpInputs[deal._id] || ''}
                      onChange={(e) => setOtpInputs(prev => ({ ...prev, [deal._id]: e.target.value }))}
                    />
                    <div className="d-flex flex-wrap gap-2">
                      <button className="btn btn-success btn-sm" onClick={() => handleVerifyOtp(deal._id)}>✅ Verify OTP</button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleResendOtp(deal._id)}
                        disabled={resendCooldowns[deal._id] > 0}
                      >
                        🔁 Resend OTP {resendCooldowns[deal._id] ? `(${resendCooldowns[deal._id]}s)` : ''}
                      </button>
                    </div>
                  </div>
                )}

                {role === 'buyer' && deal.otpVerified && !deal.paymentReceived && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <button className="btn btn-success btn-sm" onClick={() => handlePayment(deal._id)}>
                      💸 Pay to Ship
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deal._id)}>
                      🗑️ Delete Deal
                    </button>
                  </div>
                )}

                {role === 'buyer' && deal.paymentReceived && deal.status === 'shipped' && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(deal, 'delivered')}>
                      ✅ Mark as Delivered
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h2 className="mb-4 animate__animated animate__fadeInDown">My Deals</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="btn-group mb-4" role="group">
        <button
          className={`btn ${activeTab === 'buyer' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('buyer')}
        >As Buyer</button>
        <button
          className={`btn ${activeTab === 'seller' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('seller')}
        >As Seller</button>
      </div>

      {activeTab === 'buyer' ? (
        <>
          <h4 className="mb-3">🛒 Buyer Deals</h4>
          {renderDeals(buyerDeals, 'buyer')}
        </>
      ) : (
        <>
          <h4 className="mb-3">📦 Seller Deals</h4>
          {renderDeals(sellerDeals, 'seller')}
        </>
      )}
    </div>
  );
}

export default MyDeals;