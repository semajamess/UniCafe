import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Homepage from "./pages/Homepage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
