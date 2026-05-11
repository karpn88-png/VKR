import { BrowserRouter, Routes, Route } from "react-router-dom";

/* СТУДЕНТ */

import StudentHome from "./pages/students/StudentHome";
import StudentCabinet from "./pages/students/StudentCabinet";
import GOST from "./pages/students/GOST";
import Teachers from "./pages/students/Teachers";
import VKRTopic from "./pages/students/VKRTopic";
import VKRArchive from "./pages/students/VKRArchive";
import StudentWork from "./pages/students/StudentWork";

/* ПРЕПОДАВАТЕЛЬ */

import TeacherHome from "./pages/teachers/TeacherHome";
import TeacherCabinet from "./pages/teachers/TeacherCabinet";
import TeacherWork from "./pages/teachers/TeacherWork";
import MyVKRTopic from "./pages/teachers/MyVKRTopic";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* СТУДЕНТ */}

        <Route path="/" element={<StudentHome />} />
        <Route path="/cabinet" element={<StudentCabinet />} />
        <Route path="/gost" element={<GOST />} />
        <Route path="/templates" element={<GOST />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/topics" element={<VKRTopic />} />
        <Route path="/archive" element={<VKRArchive />} />
        <Route path="/work" element={<StudentWork />} />

        {/* ПРЕПОД */}

        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher-cabinet" element={<TeacherCabinet />} />
        <Route path="/teacher-work" element={<TeacherWork />} />
        <Route path="/mytopic" element={<MyVKRTopic />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
