import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';


function List({token}) {
  const [list, setList] = useState([]);
  
  const fetchData = () => {
  try {
      axios.get(backendUrl + "/api/product/list")
        .then((res) => {
          if (res.data.success) {
            setList(res.data.products)
            
          } else {
            toast.error("Error in fetching data!")
          }
        })
      } catch (error) {
        console.log(error);
        toast.error(error.message)
      }
    }

  const removeItem = async (id)=>{
    try {
      const res = await axios.post(backendUrl+"/api/product/remove", { id }, {headers:{token}})

      if(res.data.success){
        toast.success(res.data.message);
      }else{
        toast.error(res.data.message)
      }

      fetchData();
    } catch (error) {
      console.log(error);
      
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    fetchData()
    console.log(list);
  }, [])


  return (
    <>
  <p className='mb-2'>All Products List</p>

  <div className='grid gap-3'>
    {/* ----------List Table Title----------- */}

    <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] border border-gray-300 py-1 px-2 text-sm bg-gray-100'>
      <b className='ml-2'>Image</b>
      <b>Name</b>
      <b>Category</b>
      <b>Price</b>
      <b className='text-center'>Action</b>
    </div>

   
      {list.map( (item, index)=>(
        <div key={index} className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center text-sm  border border-gray-300 py-1 px-2'>
          <img src={item.images[0]} className='w-14' alt="" />
          <p>{item.name}</p>
          <p>{item.category[0]} </p>
          <p className='pl-2'>{currency} {item.price}</p>
          <p onClick={()=> removeItem(item._id)} className='text-right md:text-center text-lg justify-center cursor-pointer text-gray-400 transition duration-50 ease-in hover:text-red-400'>X</p>
        </div>
      ) )}
    
  </div>
    </>
  )
}

export default List
