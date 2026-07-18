import { useState } from 'react'
import axios from "axios"
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Login = ({setToken}) => {
    const [email, setEmail] = useState("admin@gmail.com")
    const [password, setPassword] = useState("1234567890")

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
            console.log(response);
            if(response.data.success){
             setToken(response.data.token)   
            }else{
                toast.error(response.data.message)
            }


        } catch (error) {
            console.log(error);

        }
    }

    return (
        <div className='w-full min-h-screen flex items-center justify-center'>
            <div className='max-w-md  p-7 bg-white shadow-lg rounded-md'>
                <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
                <form onSubmit={onSubmitHandler} >
                    <div className='min-w-72 mb-3'>
                        <p className='mb-2 text-sm font-md text-gray-700'>Email Address</p>
                        <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='your@gmail.com' className='w-full border rounded-md border-gray-300 py-2 px-2 outline-none' required />
                    </div>
                    <div className='min-w-72 mb-3'>
                        <p className='mb-2 text-sm font-md text-gray-700'>Password</p>
                        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder='Enter your Password' className='w-full border rounded-md border-gray-300 py-2 px-2 outline-none' required />
                    </div>

                    <button type='submit' className=' py-2 px-2  mt-2 hover:bg-gray-900 transition-shadow bg-black text-white w-full rounded-md'>Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login
