import { useContext } from 'react'
import { useSearchParams } from 'react-router'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useEffect } from 'react'

function Verify() {

    const [ searchParams, setSearchParams ] = useSearchParams()
    const {navigate, token, setCartItems, backendUrl } = useContext(ShopContext)

    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async ()=> {
        try {
            if(!token){
                return null;
            }

            const response = await axios.post(backendUrl+'/api/order/verifyStripe', {success, orderId}, {headers:{token}})
            console.log(response.data);
            
            if(response.data.success){
                setCartItems({})
                navigate('/orders')
            }else{
                toast.error("Payment Failed! Try Again")
                navigate('/');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    useEffect( ()=>{
        verifyPayment();
    }, [token] )

  return (
    <div>
      <p>verify</p>
    </div>
  )
}

export default Verify
