import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import "./styles.css";

function PostDetails() {
    const { id } = useParams(); // Get the post ID from the URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPostDetails();
    }, []);

    const fetchPostDetails = async () => {
        try {
            // Fetch post data
            const postRef = doc(db, "forum", id);
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                const postData = { id: postDoc.id, ...postDoc.data() };

                // Fetch user data for the post
                const userDoc = await getDoc(doc(db, "users", postData.userId));
                if (userDoc.exists()) {
                    postData.username = userDoc.data().email;
                    postData.progress = userDoc.data().progress;
                    postData.role = userDoc.data().role;
                }

                setPost(postData);

                // Fetch replies
                const repliesQuery = query(
                    collection(db, `forum/${id}/replies`),
                    orderBy("createdAt", "asc")
                );
                const repliesSnapshot = await getDocs(repliesQuery);

                const repliesData = await Promise.all(
                    repliesSnapshot.docs.map(async (replyDoc) => {
                        const replyData = { id: replyDoc.id, ...replyDoc.data() };
                        // Fetch user data for the reply
                        const replyUserDoc = await getDoc(doc(db, "users", replyData.userId));
                        if (replyUserDoc.exists()) {
                            replyData.username = replyUserDoc.data().email;
                            replyData.progress = replyUserDoc.data().progress;
                            replyData.role = replyUserDoc.data().role;
                        }
                        return replyData;
                    })
                );

                setReplies(repliesData);
            } else {
                console.error("No such post found!");
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to reply.");
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                alert("User data not found. Please log in again.");
                return;
            }

            const userData = userDoc.data();

            const reply = {
                userId: user.uid,
                username: userData.email,
                role: userData.role,
                progress: userData.progress,
                replyContent,
                createdAt: Timestamp.now(),
            };

            const repliesRef = collection(db, `forum/${id}/replies`);
            await addDoc(repliesRef, reply);
            setReplyContent("");
            fetchPostDetails(); // Refresh replies
        } catch (error) {
            console.error("Error submitting reply:", error);
            alert("Error submitting reply. Please try again.");
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="post-details-container">
            <header className="forum-header">
                <button onClick={() => navigate("/forum")} className="header-button">
                    Back to Forum
                </button>
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

                <h1 style={{ color: '#f5f5f5', fontSize: '28px' }}>Post Details</h1>
            </header>

            {post && (
                <div className="post-content">
                    <div className="post-user-info">
                        <img src="/default.png" alt={post.username}/>
                        <p><strong>{post.username}</strong></p>
                        <p>{post.role === "student" ? `Progress: ${post.progress}` : `Students Helped: ${post.progress}`}</p>
                    </div>
                    <div className="post-content-details">
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                    </div>
                </div>
            )}

            <div className="replies-section">
                <h3>Replies</h3>
                {replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                        <div className="reply-user-info">
                            <img src="/default.png" alt={reply.username}/>
                            <p><strong>{reply.username}</strong></p>
                            <p>{reply.role === "student" ? `Progress: ${reply.progress}` : `Students Helped: ${reply.progress}`}</p>
                        </div>
                        <div className="reply-content">
                            <p>{reply.replyContent}</p>
                        </div>
                    </div>
                ))}

                <form onSubmit={handleReplySubmit}>
                    <textarea
                        placeholder="Write your reply here..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit">Reply</button>
                </form>
            </div>
        </div>
    );
}

export default PostDetails;
