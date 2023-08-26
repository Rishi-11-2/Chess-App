import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import "../styles/register.css";
import Add from "../img/addAvatar.png";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
const Register = () => {
  // const navigate = useNavigate();
  const [err, setErr] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const storageRef = ref(storage, displayName);
      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });
            // navigate("/");
          } catch (err) {
            console.log(err);
            setErr(true);
          }
        });
      });
    } catch (err) {
      console.log(err);
      setErr(true);
    }
  };
  return (
    <div className="formWrapper">
      <div className="formContainer">
        <h1>Register</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input type="text" placeholder="displayname" />
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <input
            style={{
              display: "none",
            }}
            id="file"
            type="file"
          />
          <label htmlFor="file">
            <img className="add" src={Add} />
            <span> Add an Avatar</span>
          </label>
          <button type="submit" className="submit">
            Register
          </button>
          {err && <span> Something went wrong</span>}
        </form>
      </div>
    </div>
  );
};

export default Register;
