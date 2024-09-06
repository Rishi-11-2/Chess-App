import React, { useState } from "react";
import { auth } from "../firebase";
import "../styles/login.css";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the home page after successful login
      navigate("/");
    } catch (err) {
      setErr(true);
    }
  };

  return (
    <div className="formWrapper">
      <div className="formContainer">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button className="submit">Sign in</button>
          {err && <span>Something went wrong</span>}
        </form>
        <p className="account-text">
          Don't have an account?
          <Link to="/register" className="account-link">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;