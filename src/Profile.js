import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig"; // Ensure auth and db are configured
import { doc, getDoc } from "firebase/firestore";
import "./styles.css";

function Profile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser; // Get the current logged-in user
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid)); // Fetch user data
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        console.error("No such user document!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!userData) {
        return <p>Error loading user data. Please try again later.</p>;
    }

    const { email, progress, role } = userData; // Destructure user data

    return (
        <div className="profile-container">
            {/* Header */}
            <header className="student-header">
                <button onClick={() => navigate(role === "student" ? "/student" : "/instructor")} className="header-button">
                    Back to Dashboard
                </button>
                <h1>Profile</h1>
            </header>

            {/* Profile Content */}
            <div className="profile-content">
                <div className="profile-section">
                    {/* Common Image on the Left */}
                    <div className="profile-image">
                        <img
                            src={"/default.png"}
                            alt={"profile"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <div className="profile-info">
                        <p><strong>Email:</strong> {email}</p>
                        {role === "instructor" ? (
                            <p><strong>Students Helped:</strong> {progress}</p>
                        ) : (
                            <p><strong>Progress:</strong> {progress}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
