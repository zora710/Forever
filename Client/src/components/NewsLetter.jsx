
function NewsLetter() {

    const onSubmiHandler = (e)=>{
        e.preventDefault();
    }

  return (
    <div className="text-center">
        <p className="text-2xl text-gray-800 font-medium">Suscribe now & get 20% off</p>
        <p className="mt-3 text-gray-400">
            Loerm ipsum is dummy text of printing and typesetting industry.
        </p>

        <form onSubmit={onSubmiHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
            <input className="w-full sm:flex-1 outline-none" type="email" placeholder="Enter your email!" required/>
            <button type="submit" className="bg-black text-white text-xs px-10 py-4">SUSCRIBE</button>
        </form>
    </div>
  )
}

export default NewsLetter
