import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
const Login = () => {
  // const navigate = useNavigate();
  const [err, setErr] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setErr(true);
    }
  };
  return (
    <div className="formWrapper">
      <div className="formContainer">
        <h1>Login</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button type="submit" className="submit">
            Login
          </button>
          {err && <span> Something went wrong</span>}
        </form>
      </div>
    </div>
  );
};

export default Login;
