import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import {collection, getDocs, query, orderBy, addDoc, Timestamp, getDoc, doc} from "firebase/firestore";
import "./styles.css";

function Forum() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const forumQuery = query(collection(db, "forum"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(forumQuery);
            const postsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to create a post.");
            return;
        }

        try {
            const newPost = {
                userId: user.uid,
                username: user.email || "Anonymous",
                title: newPostTitle,
                content: newPostContent,
                createdAt: Timestamp.now(),
            };
            await addDoc(collection(db, "forum"), newPost);
            setNewPostTitle("");
            setNewPostContent("");
            setShowCreatePost(false);
            fetchPosts(); // Refresh posts
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Error creating post. Please try again.");
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="forum-container">
            <header className="forum-header">
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

                <h1 style={{ color: '#f5f5f5', fontSize: '28px' }}>Forum</h1>
                <button
                    className="header-button"
                    onClick={() => setShowCreatePost(true)} // Show modal for creating post
                >
                    Create Post
                </button>
            </header>

            <div className="posts-list">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="post-item"
                            onClick={() => navigate(`/forum/${post.id}`)}
                        >
                            <div className="post-content">
                                <h3>{post.title}</h3>
                                <p>{post.content}</p>
                            </div>
                            <div className="post-user-info">
                                <p>Posted by: {post.username}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts yet. Be the first to create one!</p>
                )}
            </div>

            {/* Modal for Creating Post */}
            {showCreatePost && (
                <div className="forum-modal">
                    <div className="forum-modal-content">
                        <h2>Create a New Post</h2>
                        <form onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={newPostTitle}
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit">Create Post</button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePost(false)}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Forum;
