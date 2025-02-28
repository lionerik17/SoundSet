import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import StudentScreen from "./StudentScreen";
import InstructorScreen from "./InstructorScreen";
import ManageMaterials from "./ManageMaterials";
import AccessMaterials from "./AccessMaterials";
import Profile from "./Profile";
import Forum from "./Forum";
import PostDetails from "./PostDetails";
import Chat from "./Chat";
import ViewStudentProgress from "./ViewStudentProgress";
import "./App.css";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginScreen />} />
                    <Route path="/register" element={<RegisterScreen />} />
                    <Route path="/student" element={<StudentScreen />} />
                    <Route path="/instructor" element={<InstructorScreen />} />
                    <Route path="/manage-materials" element={<ManageMaterials />} />
                    <Route path="/access-materials" element={<AccessMaterials />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/:id" element={<PostDetails />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/view-student-progress" element={<ViewStudentProgress />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
