import { useContext, useState } from "react"
import { assets } from "../assets/assets"
import { NavLink, Link } from "react-router"
import { ShopContext } from "../context/ShopContext";


function NavBar() {

    const { showSearch, setShowSearch, getCartCount, token, setToken, setCartItems, navigate } = useContext(ShopContext);
    const [visible, setVisible] = useState(false);

    const logout = ()=>{
      localStorage.removeItem("token")
      setToken("");
      setCartItems({})
      navigate('/login')
    }

  return (
    <div className="flex items-center py-5 font-medium justify-between">
      <Link to='/' > <img src={assets.logo} className="w-36 outline-none" alt="Logo Image" /> </Link>

      <ul className="hidden sm:flex text-sm text-gray-700 gap-5">
        <NavLink to="/" className={({ isActive }) => (` ${isActive ? "active" : ""} flex flex-col items-center gap-0.5`)} >
          <p>HOME</p>
          <hr className="w-1/3 border-none h-[2px] bg-gray-700 mx-auto hidden" />
        </NavLink>

        <NavLink to="/collection" className={({ isActive }) => (` ${isActive ? "active" : ""} flex flex-col items-center gap-0.5`)} >
          <p>COLLECTION</p>
          <hr className="w-1/3 border-none h-[2px] bg-gray-700 mx-auto hidden" />
        </NavLink>

        <NavLink to="/about" className={({ isActive }) => (` ${isActive ? "active" : ""} flex flex-col items-center gap-0.5`)} >
          <p>ABOUT</p>
          <hr className="w-1/3 border-none h-[2px] bg-gray-700 mx-auto hidden" />
        </NavLink>

        <NavLink to="/contact" className={({ isActive }) => (` ${isActive ? "active" : ""} flex flex-col items-center gap-0.5`)} >
          <p>CONTACT</p>
          <hr className="w-1/3 border-none h-[2px] bg-gray-700 mx-auto hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <img src={assets.search_icon} onClick={ ()=> setShowSearch(!showSearch) } className="w-5 cursor-pointer" alt="" />

        <div className="group relative">
         <img onClick={()=> token? null: navigate('/login')} src={assets.profile_icon} className="w-5 cursor-pointer" alt="" /> 
         {/* Dropdown Menu */}
         {token &&
          <div className="group-hover:block hidden absolute dropdown-menu right-[-12px] pt-4">
            <div className="flex flex-col gap-2 w-36 px-4 py-5 bg-slate-100 text-gray-500 rounded-2xl " >
              <p className="cursor-pointer hover:text-black"> WELCOME </p>
              <p onClick={()=> navigate('/orders')} className="cursor-pointer hover:text-black"> Orders </p>
              <p onClick={logout} className="cursor-pointer hover:text-black"> Logout </p>
            </div>
          </div>
          }
        </div>
          <Link to="/cart" className="relative" >
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 aspect-square bg-black text-white rounded-full text-[8px]">
            {getCartCount()}
          </p>
          </Link>
          <img src={assets.menu_icon} onClick={()=> setVisible(true)} className="w-5 cursor-pointer sm:hidden" alt="" />
      </div>
      {/* sidebar menu for smaller screen */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible?"w-full":"w-0"}`}>
        <div className="flex flex-col text-gray-600">
          <div onClick={()=> setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer">
            <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="" />
            <p>Back</p>
            <hr />
          </div>
        
          <NavLink onClick={()=> setVisible(false)} className='py-3 pl-6 border' to='/'>HOME</NavLink>
          <NavLink onClick={()=> setVisible(false)} className='py-3 pl-6 border' to='/collection'>COLLECTIONS</NavLink>
          <NavLink onClick={()=> setVisible(false)} className='py-3 pl-6 border' to='/about'>ABOUT</NavLink>
          <NavLink onClick={()=> setVisible(false)}className='py-3 pl-6 border' to='/contact'>CONTACT</NavLink>
        </div>
      </div>
    </div>
  )
}

export default NavBar
