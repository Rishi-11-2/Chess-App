import React, { useState, useContext } from "react";
import { auth, db, storage } from "../firebase";
import Add from "../img/addAvatar.png";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { ThemeContext } from "../context/ThemeContext";

const Register = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const { colors, styles } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // If there's a file, upload it
      if (file) {
        const storageRef = ref(storage, displayName);
        await uploadBytesResumable(storageRef, file).then(() => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            try {
              await updateProfile(res.user, {
                displayName,
                photoURL: downloadURL,
              });
              console.log("Profile updated successfully.");
              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                displayName,
                email,
                photoURL: downloadURL,
              });
              console.log("User registered successfully, navigating to home.");
              navigate("/");
            } catch (error) {
              console.error("Registration error:", error);
              setErr(error.message);
              setLoading(false);
            }
          });
        });
      } else {
        // No file, just update the profile with display name
        await updateProfile(res.user, {
          displayName
        });
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName,
          email,
          photoURL: null,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErr(error.message);
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      navigate("/");
    } catch (error) {
      console.error("Google registration error:", error);
      setErr(error.message);
      setLoading(false);
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
    cursor: loading ? 'wait' : 'pointer',
    transition: styles.transition,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    opacity: loading ? 0.7 : 1
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

  // Avatar label style
  const avatarLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    color: colors.textSecondary
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
        <h1 style={headingStyle}>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Display Name" 
            style={inputStyle}
            required
          />
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
          <input
            style={{
              display: "none",
            }}
            id="file"
            type="file"
          />
          <label htmlFor="file" style={avatarLabelStyle}>
            <img 
              src={Add} 
              alt="Add avatar" 
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'cover',
                borderRadius: '50%',
                backgroundColor: colors.surfaceSecondary,
                padding: '4px'
              }}
            />
            <span>Add a profile picture (optional)</span>
          </label>
          
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          
          <button 
            type="button" 
            style={googleButtonStyle} 
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
              width="18"
              height="18"
            />
            Register with Google
          </button>
          
          {err && <div style={errorStyle}>{err}</div>}
        </form>
        <p style={accountTextStyle}>
          Already have an account?
          <Link to="/login" style={linkStyle}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;