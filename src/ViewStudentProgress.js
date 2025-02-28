import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./styles.css";

function ViewStudentProgress() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Fetch all students
                    const studentsQuery = query(
                        collection(db, "users"),
                        where("role", "==", "student")
                    );
                    const snapshot = await getDocs(studentsQuery);
                    const studentData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setStudents(studentData);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="student-progress-container">
            <header className="progress-header">
                <button
                    onClick={() => navigate("/instructor")}
                    className="header-button"
                >
                    Back to Dashboard
                </button>
                <h1 style={{color: "#f5f5f5", fontSize: "28px"}}>View Student Progress</h1>
            </header>
            <div className="progress-table-container">
                <table className="progress-table">
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Progress</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.email}</td>
                                <td>{student.progress || 0}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">No students found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ViewStudentProgress;
