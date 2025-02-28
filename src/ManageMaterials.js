import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "./firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./styles.css";

function ManageMaterials() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        file: null,
    });
    const [loading, setLoading] = useState(false);

    const materialsCollection = collection(db, "materials");

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        const querySnapshot = await getDocs(materialsCollection);
        const materialsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setMaterials(materialsList);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleAddMaterial = async () => {
        setLoading(true);
        try {
            if (formData.file) {
                const fileRef = ref(storage, `materials/${formData.file.name}`);
                await uploadBytes(fileRef, formData.file);
                const fileURL = await getDownloadURL(fileRef);

                await addDoc(materialsCollection, {
                    title: formData.title,
                    description: formData.description,
                    fileURL,
                });

                alert("Material added successfully!");
                fetchMaterials(); // Refresh materials
                setShowModal(false);
            }
        } catch (error) {
            alert("Error adding material: " + error.message);
        } finally {
            setLoading(false);
            setFormData({ title: "", description: "", file: null });
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (window.confirm("Are you sure you want to delete this material?")) {
            try {
                await deleteDoc(doc(db, "materials", id));
                alert("Material deleted successfully!");
                fetchMaterials(); // Refresh materials
            } catch (error) {
                alert("Error deleting material: " + error.message);
            }
        }
    };

    return (
        <div className="manage-materials-container">
            <header className="instructor-header">
                <button onClick={() => navigate("/instructor")} className="header-button">
                    Back to Dashboard
                </button>
                <h1 style={{ color: '#f5f5f5', fontSize: '28px' }}>Manage Materials</h1>
                <button onClick={() => setShowModal(true)} className="header-button">
                    Add New Material
                </button>
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
                            <button onClick={() => handleDeleteMaterial(material.id)} className="delete-button">
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No materials uploaded yet.</p>
                )}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Add New Material</h2>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter title"
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter short description"
                        ></textarea>
                        <input type="file" accept="application/pdf" onChange={handleFileChange} />
                        <div className="modal-actions">
                            <button onClick={handleAddMaterial} disabled={loading}>
                                {loading ? "Uploading..." : "Add Material"}
                            </button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageMaterials;
