import { useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import { assets } from "../assets/assets";
import { useLocation } from "react-router";


function SearchBar() {
    const [visible, setVisible] = useState(false);
    const { search, setSearch, showSearch, setShowSearch, smartSearch, aiSearching } = useContext(ShopContext);
    let location = useLocation();
    useEffect( ()=>{
        if(location.pathname.includes('collection')){
            setVisible(true);
        }else{
            setVisible(false);
        } 
    },[location])

    // Debounce the AI natural-language search so we don't hit the backend on every keystroke
    useEffect(() => {
        const handle = setTimeout(() => {
            smartSearch(search);
        }, 400);
        return () => clearTimeout(handle);
    }, [search]);

  return  showSearch && visible? (
    <div className="border-t border-b border-gray-200 bg-gray-50 text-center">
      <div className="inline-flex w-3/4 sm:1/2 items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full ">
        <input value={search} onChange={ (e)=>setSearch(e.target.value) } type="text" placeholder='Try "cotton shirts under 500" or "warm jackets"' className="flex-1 outline-none bg-inherit text-sm" />
        {aiSearching ? (
          <span className="text-[10px] text-gray-400 mr-1 animate-pulse">thinking…</span>
        ) : null}
        <img src={assets.search_icon} className="w-4" alt="" />
      </div>
      <img src={assets.cross_icon} onClick={()=>{setShowSearch(false); setSearch('')}} className="inline w-3 cursor-pointer" alt="" />
    </div>
  ):null
}

export default SearchBar
