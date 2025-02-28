import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "./firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    serverTimestamp,
    onSnapshot,
    getDoc,
    updateDoc,
    increment, orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./styles.css";

function Chat() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null); // Ref to track the bottom of the messages container
    const fileInputRef = useRef(null); // Ref for the file input
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);

    const currentUser = auth.currentUser;

    const [canIncrement, setCanIncrement] = useState(true);

    const checkLastClick = async () => {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const lastClick = userData.lastIncrement || null;

            if (lastClick) {
                const lastClickDate = new Date(lastClick.seconds * 1000);
                const today = new Date();
                if (
                    lastClickDate.getDate() === today.getDate() &&
                    lastClickDate.getMonth() === today.getMonth() &&
                    lastClickDate.getFullYear() === today.getFullYear()
                ) {
                    setCanIncrement(false);
                }
            }
        }
    };

    const handleIncrementProgress = async () => {
        try {
            const userDocRef = doc(db, "users", currentUser.uid);

            // Increment instructor's progress
            await updateDoc(userDocRef, {
                progress: increment(1),
                lastIncrement: serverTimestamp(),
            });

            // Increment progress for all students
            const studentsQuery = query(
                collection(db, "users"),
                where("role", "==", "student")
            );
            const studentsSnapshot = await getDocs(studentsQuery);
            const updatePromises = studentsSnapshot.docs.map((studentDoc) =>
                updateDoc(studentDoc.ref, { progress: increment(1) })
            );

            await Promise.all(updatePromises);

            alert("Progress incremented for today!");
            setCanIncrement(false);
        } catch (error) {
            console.error("Error incrementing progress:", error);
            alert("Failed to increment progress. Please try again.");
        }
    };

    useEffect(() => {
        checkLastClick();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            navigate("/");
            return;
        }
        const fetchUserRole = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const role = userDoc.data().role;
                        setUserRole(role);
                    } else {
                        console.error("User document not found!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            } finally {
                setLoadingRole(false);
            }
        };

        fetchUserRole();
        fetchUsers();
    }, []);

    useEffect(() => {
        // Scroll to the bottom whenever messages change
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchUsers = async () => {
        try {
            const usersQuery = query(collection(db, "users"), where("email", "!=", currentUser.email));
            const snapshot = await getDocs(usersQuery);
            const usersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const startChat = async (user) => {
        setSelectedUser(user);

        // Fetch the role of the selected user
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setSelectedUser({ ...user, role: userData.role }); // Include the role in the selected user
        } else {
            console.error("User document not found!");
        }

        // Create or fetch conversation ID
        const conversationId =
            currentUser.uid < user.id
                ? `${currentUser.uid}_${user.id}`
                : `${user.id}_${currentUser.uid}`;

        const messagesRef = collection(db, `conversations/${conversationId}/messages`);
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => doc.data());
            setMessages(fetchedMessages);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    };

    const sendMessage = async () => {
        if (!newMessage.trim() && !file) return;

        const conversationId =
            currentUser.uid < selectedUser.id
                ? `${currentUser.uid}_${selectedUser.id}`
                : `${selectedUser.id}_${currentUser.uid}`;

        const messageRef = collection(db, `conversations/${conversationId}/messages`);

        try {
            setLoading(true);

            let fileUrl = null;
            let fileName = null;
            if (file) {
                fileName = file.name; // Get the original file name
                const fileRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
                fileUrl = await getDownloadURL(fileRef);
            }

            await addDoc(messageRef, {
                senderId: currentUser.uid,
                content: fileUrl || newMessage,
                type: file ? "file" : "text",
                fileName: fileName || null, // Save file name for MP3s
                timestamp: serverTimestamp(),
            });

            setNewMessage("");
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset file input field
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button
                    onClick={async () => {
                        try {
                            const user = auth.currentUser; // Get the logged-in user
                            if (user) {
                                const userDoc = await getDoc(doc(db, "users", user.uid)); // Fetch the user's document
                                if (userDoc.exists()) {
                                    const userRole = userDoc.data().role; // Get the user's role
                                    if (userRole === "student") {
                                        navigate("/student"); // Redirect to student dashboard
                                    } else if (userRole === "instructor") {
                                        navigate("/instructor"); // Redirect to instructor dashboard
                                    } else {
                                        alert("Role not recognized. Please contact support.");
                                    }
                                } else {
                                    console.error("User document not found!");
                                }
                            } else {
                                console.error("No user logged in!");
                                navigate("/"); // Redirect to login page
                            }
                        } catch (error) {
                            console.error("Error navigating to dashboard:", error);
                            alert("Failed to determine user role. Please try again.");
                        }
                    }}
                    className="header-button"
                >
                    Back to Dashboard
                </button>
                <h1 style={{color: "#f5f5f5", fontSize: "28px"}}>Chat</h1>
            </header>

            <div className="chat-body">
                {!selectedUser ? (
                    <div className="user-search">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="user-list">
                            {users
                                .filter((user) =>
                                    user.email.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((user) => (
                                    <div
                                        key={user.id}
                                        className="user-item"
                                        onClick={() => startChat(user)}
                                    >
                                        <p>
                                            <strong>{user.role === "student" ? "Student" : "Instructor"} </strong> {user.email}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-window">
                        <button onClick={() => setSelectedUser(null)} className="back-button">
                            Back to User List
                        </button>

                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${
                                        msg.senderId === currentUser.uid ? "sent" : "received"
                                    }`}
                                >
                                    {msg.type === "file" ? (
                                        <a href={msg.content} target="_blank" rel="noopener noreferrer">
                                            {msg.fileName || "Download MP3"} {/* Display the file name */}
                                        </a>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} /> {/* Dummy div to scroll to */}
                        </div>
                        <div className="message-input">
                            {!loadingRole && userRole === "instructor" && selectedUser?.role === "student" && (
                                <button
                                    onClick={handleIncrementProgress}
                                    disabled={!canIncrement} // Prevent multiple clicks in one day
                                    className="increment-button"
                                    title="Increment Progress" // Tooltip for clarification
                                >
                                    {canIncrement ? "📈" : "⏳"}
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                            <input
                                type="file"
                                accept=".mp3"
                                onChange={(e) => setFile(e.target.files[0])}
                                ref={fileInputRef} // Attach ref to file input
                            />
                            <button onClick={sendMessage} disabled={loading}>
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
