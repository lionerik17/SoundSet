import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import doc and setDoc
import "./styles.css";

function RegisterScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Hook for navigation

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            // Create the user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Add user details to Firestore 'users' collection with uid as document ID
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: role,
                progress: 0, // Default progress
            });

            alert("User registered successfully!");

            // Clear any errors
            setError("");

            // Redirect to login screen
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1>SoundSet Platform Register</h1>
            <form onSubmit={handleRegister}>
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
                <div className="form-group">
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                    </select>
                </div>
                <button type="submit">Register</button>
                {error && <p className="error">{error}</p>}
            </form>
            <a href="/">Already have an account? Login</a>
        </div>
    );
}

export default RegisterScreen;
