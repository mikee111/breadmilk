import React, { useState } from 'react';
import '../styles/registration.css';

function Registration() {
  const [form, setForm] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    suffix: '',
    house_no: '',
    street: '',
    barangay: '',
    municipality: '',
    province: '',
    email: '',
    password: '',
    birth_month: '',
    birth_day: '',
    birth_year: '',
    age: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/register', { // Make sure this URL is correct
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! You can now log in.');
        setForm({
          firstname: '',
          middlename: '',
          lastname: '',
          suffix: '',
          house_no: '',
          street: '',
          barangay: '',
          municipality: '',
          province: '',
          email: '',
          password: '',
          birth_month: '',
          birth_day: '',
          birth_year: '',
          age: ''
        });
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div
      className="registration-page"
      style={{
        backgroundImage: "url('https://breadtalkindia.files.wordpress.com/2018/10/breadtalk.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="registration-form">
        <h2>Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input type="text" name="firstname" placeholder="Firstname" value={form.firstname} onChange={handleChange} required />
            <input type="text" name="middlename" placeholder="Middlename" value={form.middlename} onChange={handleChange} />
          </div>
          <div className="form-row">
            <input type="text" name="lastname" placeholder="Lastname" value={form.lastname} onChange={handleChange} required />
            <input type="text" name="suffix" placeholder="Suffix" value={form.suffix} onChange={handleChange} />
          </div>
          <div className="form-row">
            <select name="house_no" value={form.house_no} onChange={handleChange} required>
              <option value="">House No</option>
              <option>101</option>
              <option>102</option>
              <option>103</option>
            </select>
            <select name="street" value={form.street} onChange={handleChange} required>
              <option value="">Street</option>
              <option>Main Street</option>
              <option>Elm Street</option>
              <option>Maple Avenue</option>
            </select>
            <select name="barangay" value={form.barangay} onChange={handleChange} required>
              <option value="">Barangay</option>
              <option>Barangay 1</option>
              <option>Barangay 2</option>
              <option>Barangay 3</option>
            </select>
          </div>
          <div className="form-row">
            <select name="municipality" value={form.municipality} onChange={handleChange} required>
              <option value="">Municipality</option>
              <option>Municipality A</option>
              <option>Municipality B</option>
              <option>Municipality C</option>
            </select>
            <select name="province" value={form.province} onChange={handleChange} required>
              <option value="">Province</option>
              <option>Province X</option>
              <option>Province Y</option>
              <option>Province Z</option>
            </select>
          </div>
          <div className="form-row">
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <select name="birth_month" value={form.birth_month} onChange={handleChange} required>
              <option value="">Month</option>
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
            <select name="birth_day" value={form.birth_day} onChange={handleChange} required>
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select name="birth_year" value={form.birth_year} onChange={handleChange} required>
              <option value="">Year</option>
              {[...Array(100)].map((_, i) => (
                <option key={i} value={2023 - i}>{2023 - i}</option>
              ))}
            </select>
            <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
          </div>
          <button type="submit">Register</button>
          {message && <div style={{ color: message.includes('success') ? 'green' : 'red', marginTop: 10 }}>{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default Registration;
