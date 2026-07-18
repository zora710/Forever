import { useContext } from "react"
import { Link } from "react-router"
import { ShopContext } from "../context/ShopContext"


function ProductItem({id, name, image, price}) {

    const {currency} = useContext(ShopContext);

  return (
    <Link to={`/product/${id}`} className='text-gray-700 cursor-pointer transition'>
        <div className='overflow-hidden ' >
            <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
        </div>
        <p className='pt-3 pb-1 text-sm'>
            {name}
        </p>
        <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
