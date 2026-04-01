import React from 'react';

function Register() {
  return (
    <div className="register">
      <h2>Register</h2>
      <form>
        <label>
          Name:
          <input type="text" placeholder="Enter your name" />
        </label>
        <label>
          Email:
          <input type="email" placeholder="Enter your email" />
        </label>
        <label>
          Password:
          <input type="password" placeholder="Enter your password" />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
