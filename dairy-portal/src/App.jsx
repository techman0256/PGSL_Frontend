import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BatchTest from "./components/BatchTest";
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
     
    <BrowserRouter>
      <BatchTest />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App