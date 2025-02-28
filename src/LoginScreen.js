import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {auth, db} from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./styles.css";

function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Hook for navigation

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            // Perform login logic here
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user role from Firestore (e.g., "student" or "instructor")
            const userDoc = await getDoc(doc(db, "users", user.uid));

            // Check if the document exists
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === "student") {
                    navigate("/student");
                } else if (userData.role === "instructor") {
                    navigate("/instructor");
                } else {
                    setError("Invalid role. Please contact support.");
                }
            } else {
                setError("User document not found in Firestore.");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1>SoundSet Platform Login</h1>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
            <a href="/register">Don't have an account? Register</a>
        </div>
    );
}

export default LoginScreen;
