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

/* НОРМОКОНТРОЛЬ */

import NormHome from "./pages/normcontrol/NormHome";
import NormCabinet from "./pages/normcontrol/NormCabinet";
import NormWork from "./pages/normcontrol/NormWork";
import NormView from "./pages/normcontrol/NormView";
import GOSTLoad from "./pages/normcontrol/GOSTLoad";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* СТУДЕНТ */}

        <Route path="/" element={<StudentHome />} />
        <Route path="/cabinet" element={<StudentCabinet />} />
        <Route path="/gost" element={<GOST />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/topics" element={<VKRTopic />} />
        <Route path="/archive" element={<VKRArchive />} />
        <Route path="/work" element={<StudentWork />} />

        {/* ПРЕПОД */}

        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher-cabinet" element={<TeacherCabinet />} />
        <Route path="/teacher-work" element={<TeacherWork />} />
        <Route path="/mytopic" element={<MyVKRTopic />} />

        {/* НОРМОКОНТРОЛЬ */}

        <Route path="/reviewer" element={<NormHome />} />
        <Route path="/reviewer-cabinet" element={<NormCabinet />} />
        <Route path="/reviewer-work" element={<NormWork />} />
        <Route path="/reviewer-view" element={<NormView />} />
        <Route path="/GOSTLoad" element={<GOSTLoad />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;