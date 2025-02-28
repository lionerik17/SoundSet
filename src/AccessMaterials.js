import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./styles.css";

function AccessMaterials() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        const materialsCollection = collection(db, "materials");
        const querySnapshot = await getDocs(materialsCollection);
        const materialsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setMaterials(materialsList);
    };

    return (
        <div className="manage-materials-container">
            <header className="student-header">
                <button onClick={() => navigate("/student")} className="header-button">
                    Back to Dashboard
                </button>
                <h1 style={{ color: '#f5f5f5', fontSize: '28px' }}>View Materials</h1>
            </header>

            <div className="materials-list">
                {materials.length > 0 ? (
                    materials.map((material) => (
                        <div key={material.id} className="material-item">
                            <h3>{material.title}</h3>
                            <p>{material.description}</p>
                            <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                                View PDF
                            </a>
                        </div>
                    ))
                ) : (
                    <p>No materials uploaded yet.</p>
                )}
            </div>
        </div>
    );
}

export default AccessMaterials;
