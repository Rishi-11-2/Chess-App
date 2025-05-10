import React, { useState, useContext } from "react";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ThemeContext } from "../context/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const { colors, styles } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the home page after successful login
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setErr(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErr(error.message);
    }
  };

  // Container styles
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: colors.background
  };

  // Form container styles
  const formContainerStyle = {
    backgroundColor: colors.surfacePrimary,
    padding: '2rem',
    borderRadius: styles.cardRadius,
    boxShadow: styles.boxShadowMedium,
    width: '100%',
    maxWidth: '400px'
  };

  // Heading style
  const headingStyle = {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '2rem'
  };

  // Input style
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: styles.buttonRadius,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: '1rem'
  };

  // Button styles
  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: styles.buttonRadius,
    border: 'none',
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: styles.transition,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem'
  };
  
  const googleButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd'
  };

  // Error style
  const errorStyle = {
    color: colors.error,
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  };

  // Account text style
  const accountTextStyle = {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: '1rem'
  };

  // Link style
  const linkStyle = {
    color: colors.primary,
    marginLeft: '0.5rem',
    textDecoration: 'none',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={headingStyle}>Login to Chess App</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            style={inputStyle}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            style={inputStyle}
            required
          />
          <button 
            type="submit"
            style={buttonStyle}
          >
            Sign in
          </button>
          <button
            type="button"
            style={googleButtonStyle}
            onClick={handleGoogleSignIn}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
              width="18"
              height="18"
            />
            Sign in with Google
          </button>
          {err && <div style={errorStyle}>{err}</div>}
        </form>
        <p style={accountTextStyle}>
          Don't have an account?
          <Link to="/register" style={linkStyle}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;