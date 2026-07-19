import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Assessment from "./Assessment";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/assessment" element={<Assessment />} />
    </Routes>
  );
}

export default App;
