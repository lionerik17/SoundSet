import React from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";

function InstructorScreen() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Perform logout logic here (e.g., clear auth token, sign out from Firebase)
        alert("Logged out successfully!");
        navigate("/"); // Redirect to login screen
    };

    return (
        <div className="instructor-container">
            {/* Header Section */}
            <header className="instructor-header">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={() => navigate("/manage-materials")}>Manage Materials</button>
                <button onClick={() => navigate("/forum")}>Access Forum</button>
                <button onClick={() => navigate("/chat")}>Access Chat</button>
                <button onClick={() => navigate("/view-student-progress")}>View Student Progress</button>
                <button onClick={handleLogout}>Logout</button>
            </header>

            {/* Main Content Section */}
            <main className="instructor-content">
                <h1>Welcome to the SoundSet Platform!</h1>
                <p>Select an option from the header to get started.</p>
            </main>
        </div>
    );
}

export default InstructorScreen;
