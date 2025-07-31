import { useState } from 'react';
import axios from '../axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function Login() {
  const [loginType, setLoginType] = useState('password');
  const [form, setForm] = useState({ identifier: '', password: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', {
        identifier: form.identifier,
        password: form.password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendOtp = async () => {
    try {
      await axios.post('/auth/send-otp', { identifier: form.identifier });
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP send failed');
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/verify-otp', {
        identifier: form.identifier,
        otp: form.otp
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP login failed');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <div className="card shadow-lg p-5 animate__animated animate__fadeInUp" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 className="text-center mb-4 text-primary"> Login to TrustGuard</h2>

        <div className="d-flex justify-content-center mb-3">
          <button
            className={`btn ${loginType === 'password' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
            onClick={() => setLoginType('password')}
          >
            Password
          </button>
          <button
            className={`btn ${loginType === 'otp' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setLoginType('otp')}
          >
            OTP
          </button>
        </div>

        {loginType === 'password' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <input
                name="identifier"
                type="text"
                placeholder="Email or Phone"
                className="form-control"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
        ) : (
          <form onSubmit={handleOtpLogin}>
            <div className="form-group mb-3">
              <input
                name="identifier"
                type="text"
                placeholder="Email or Phone"
                className="form-control"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>
            {otpSent ? (
              <>
                <div className="form-group mb-3">
                  <input
                    name="otp"
                    type="text"
                    placeholder="Enter OTP"
                    className="form-control"
                    value={form.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">Login with OTP</button>
              </>
            ) : (
              <button type="button" onClick={handleSendOtp} className="btn btn-warning w-100">Send OTP</button>
            )}
          </form>
        )}

        {error && <p className="text-danger mt-3">{error}</p>}

        <p className="text-center mt-4">
          New User? <Link to="/signup" className="text-decoration-none">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
