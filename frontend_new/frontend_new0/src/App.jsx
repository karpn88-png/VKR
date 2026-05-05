import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentHome from "./pages/students/StudentHome";
import StudentCabinet from "./pages/students/StudentCabinet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/cabinet" element={<StudentCabinet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;