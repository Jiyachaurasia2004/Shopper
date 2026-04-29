import Navbar from "./components/collageproject/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shop from "./components/collageproject/page/Shop";
import Shopcategory from "./components/collageproject/page/Shopcategory";
import Product from "./components/collageproject/page/Product";
import Loginsign from "./components/collageproject/page/Loginsign";
import Cart from "./components/collageproject/page/Cart";
import PlaceOrder from "./components/collageproject/PlaceOrder/placeOrder";
import Footer from "./components/collageproject/Footer";
import mens_banner from "./components/Assets/banner_mens.png"
import women_banner from "./components/Assets/banner_women.png"
import kid_banner from "./components/Assets/banner_kids.png"
import OrderSuccess from "./components/collageproject/OrderSuccess/OrderSuccess";


// Admin Imports
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./AdminPages/Admin";
import AddProduct from "./AdminComponents/AddProduct/AddProduct";
import ListProduct from "./AdminComponents/ListProduct/ListProduct";
import LoginSignup from "./AdminComponents/AdminLogin/LoginSignup";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/mens" element={<Shopcategory banner={mens_banner} category="men" />} />
          <Route path="/women" element={<Shopcategory banner={women_banner} category="women" />} />
          <Route path="/kids" element={<Shopcategory banner={kid_banner} category="kid" />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/checkout" element={<PlaceOrder/>}/>
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/login" element={<Loginsign />} />


          {/* Admin Routes */}
          <Route path="/admin-login" element={<LoginSignup />} />
          <Route path="/admin" element={<ProtectedRoute />}>
             <Route path="" element={<Admin />}>
                 <Route path="addproduct" element={<AddProduct />} />
                 <Route path="listproduct" element={<ListProduct />} />
             </Route>
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

