import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Assessment from "./Assessment";
import Impact from "./Impact";
import About from "./About";
import Ingredients from "./Ingredients";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/about" element={<About />} />
      <Route path="/ingredients" element={<Ingredients />} />
    </Routes>
  );
}

export default App;
