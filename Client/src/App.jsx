
import { Routes, Route } from "react-router"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Collections from "./pages/Collections"
import Contact from "./pages/Contact"
import Login from "./pages/Login"
import Orders from "./pages/Orders"
import PlaceOrder from "./pages/PlaceOrder"
import Product from "./pages/Product"
import Cart from "./pages/Cart"
import About from "./pages/About"
import SearchBar from "./components/SearchBar"
import ChatBot from "./components/ChatBot"
import { ToastContainer, toast } from "react-toastify"
import Verify from "./pages/Verify"

function App() {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:[9vw]">
      <ToastContainer />
    <NavBar />
    <SearchBar />
    <Routes>
        <Route path="/" element= {<Home />} />
        <Route path="/collection" element= {<Collections />} > 
        </Route >
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={ <About /> } />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/verify" element={<Verify />} />
    </Routes>
    <Footer />
    <ChatBot />
    </div>
  )
}

export default App

