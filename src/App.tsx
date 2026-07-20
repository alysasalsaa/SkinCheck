import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Assessment from "./Assessment";
import Impact from "./Impact";
import About from "./About";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
