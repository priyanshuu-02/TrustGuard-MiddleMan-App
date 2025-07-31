import { useState } from 'react';
import axios from '../axios'; // your custom axios instance
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/signup', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Signup failed');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <div className="card shadow-lg p-5 animate__animated animate__fadeInUp" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 className="text-center text-primary mb-4"> Register for TrustGuard</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              name="username"
              placeholder="Username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group mb-3">
            <input
              name="email"
              placeholder="Email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group mb-3">
            <input
              name="phone"
              placeholder="Phone Number"
              type="tel"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>

          <div className="form-group mb-4">
            <input
              name="password"
              placeholder="Password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-success w-100">Register</button>
        </form>

        {message && (
          <div className="alert alert-info text-center mt-4 animate__animated animate__fadeInUp">
            {message}
          </div>
        )}

        <p className="text-center mt-3">
          Already registered? <Link to="/login" className="text-decoration-none">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
