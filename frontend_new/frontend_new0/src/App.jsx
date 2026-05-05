import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentHome from "./pages/students/StudentHome";
import StudentCabinet from "./pages/students/StudentCabinet";
import StudentWork from "./pages/students/StudentWork";
import GOST from "./pages/students/GOST";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/cabinet" element={<StudentCabinet />} />
        <Route path="/work" element={<StudentWork />} />
        <Route path="/templates" element={<GOST />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
