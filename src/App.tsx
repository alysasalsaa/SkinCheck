import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Assessment from "./Assessment";
import Impact from "./Impact";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/impact" element={<Impact />} />
    </Routes>
  );
}

export default App;
