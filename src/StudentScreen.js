import React from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";

function StudentScreen() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Perform logout logic here (e.g., clear auth token, sign out from Firebase)
        alert("Logged out successfully!");
        navigate("/"); // Redirect to login screen
    };

    const openSongsterr = () => {
        window.open("https://www.songsterr.com", "_blank"); // Opens Songsterr in a new tab
    };

    return (
        <div className="student-container">
            {/* Header Section */}
            <header className="student-header">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={openSongsterr}>Access Tabs</button>
                <button onClick={() => navigate("/access-materials")} className="header-button">
                    Access Materials
                </button>
                <button onClick={() => navigate("/forum")}>Access Forum</button>
                <button onClick={() => navigate("/chat")}>Access Chat</button>
                <button onClick={handleLogout}>Logout</button>
            </header>

            {/* Main Content Section */}
            <main className="student-content">
                <h1>Welcome to the SoundSet Platform!</h1>
                <p>Select an option from the header to get started.</p>
            </main>
        </div>
    );
}

export default StudentScreen;
