import { Routes, Route } from 'react-router-dom'
import Admin from './pages/Admin/Admin'
import AddProduct from './Components/AddProduct/AddProduct'
import ListProduct from './Components/ListProduct/ListProduct'
import Navbar from './Components/Navbar/Navbar'
import LoginSignup from './Components/AdminLogin/LoginSignup'

const App = () => {
  return (
    <div>
      <Navbar />

      <Routes>

        {/* 🔥 Parent Layout */}
        <Route path="/" element={<Admin />}>

          {/* 🔥 Child Pages */}
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="listproduct" element={<ListProduct />} />
          <Route path="admin-login" element={<LoginSignup />} />

        </Route>

      </Routes>
    </div>
  )
}

export default App