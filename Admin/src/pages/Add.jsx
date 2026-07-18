import { useState } from 'react'
import { assets } from '../assets/assets.js'
import axios from 'axios'
import { backendUrl } from '../App.jsx'
import { toast } from 'react-toastify'

function Add({ token }) {

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [generating, setGenerating] = useState(false);

  const generateWithAI = async () => {
    if (!name.trim()) {
      toast.error("Enter a product name first");
      return;
    }
    setGenerating(true);
    try {
      const res = await axios.post(
        backendUrl + "/api/ai/generate-description",
        { name, category, subCategory, price, sizes: JSON.stringify(sizes) },
        { headers: { token } }
      );
      if (res.data.success) {
        setDescription(res.data.description);
        toast.success("Description generated ✨");
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const formdata = new FormData();

      formdata.append("name", name);
      formdata.append("description", description);
      formdata.append("price", price);
      formdata.append("category", category);
      formdata.append("subCategory", subCategory);
      formdata.append("bestseller", bestseller);
      formdata.append("sizes", JSON.stringify(sizes));

      formdata.append("image1", image1);
      formdata.append("image2", image2);
      formdata.append("image3", image3);
      formdata.append("image4", image4);

      const res = await axios.post(backendUrl + "/api/product/add", formdata, { headers: { token } })
      console.log(res.data);

      if (res.data.success) {
        toast.success(res.data.message, {
          icon: "🚀"
        });
      } else {
        toast.error(res.data.message)
      }

      setImage1(false);
      setImage2(false);
      setImage3(false);
      setImage4(false);

      setName("")
      setDescription("")
      setPrice("")
      setCategory("Men")
      setSubCategory("Topwear")
      setSizes([])
      setBestSeller(false)


    } catch (e) {
      console.log(e);

      toast.error(e.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div className=''>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} className='w-20 cursor-pointer' alt="" />
            <input type="file" onChange={(e) => setImage1(e.target.files[0])} hidden id='image1' />
          </label>
          <label htmlFor="image2">
            <img src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} className='w-20 cursor-pointer' alt="" />
            <input type="file" onChange={(e) => setImage2(e.target.files[0])} hidden id='image2' />
          </label>
          <label htmlFor="image3">
            <img src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} className='w-20 cursor-pointer' alt="" />
            <input type="file" onChange={(e) => setImage3(e.target.files[0])} hidden id='image3' />
          </label>
          <label htmlFor="image4">
            <img src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} className='w-20 cursor-pointer' alt="" />
            <input type="file" onChange={(e) => setImage4(e.target.files[0])} hidden id='image4' />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input type="text" onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' placeholder='Type here' required />
      </div>

      <div className='w-full'>
        <div className='flex items-center justify-between max-w-[500px] mb-2'>
          <p>Product Description</p>
          <button
            type="button"
            onClick={generateWithAI}
            disabled={generating}
            className='text-xs px-3 py-1 rounded-full bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {generating ? "Generating..." : "✨ Generate with AI"}
          </button>
        </div>
        <textarea type="text" onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' placeholder='Write content here! Or fill in name, category & price above and click "Generate with AI".' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 sm:gap-8 w-full'>
        <div className=''>
          <p className='mb-2'>Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div className=''>
          <p className='mb-2'>Sub Category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input type="Number" onChange={(e) => setPrice(e.target.value)} defaultValue={0} className='w-full px-3 py-2 sm:w-[120px]' placeholder='25' />
        </div>
      </div>

      <div>
        <p className='mb-2'> Product Sizes</p>

        <div className="flex gap-3">
          <div>

            <p onClick={() =>
              setSizes(sizes.some((prev) => prev === 'S') ?
                sizes.filter((prev) => prev !== 'S') :
                [...sizes, 'S'])
            }
              className={`${sizes.some((prev) => prev == 'S') ?
                "bg-pink-100 " :
                "bg-slate-200"} px-3 py-1 cursor-pointer`}>S</p>

          </div>

          <div>
            <p
              onClick={() => setSizes(prev => prev.includes("M") ?
                prev.filter((item) => item != "M") :
                [...prev, 'M']
              )}
              className={`${sizes.some((prev) => prev == 'M') ?
                "bg-pink-100 " :
                "bg-slate-200"} px-3 py-1 cursor-pointer`}>M</p>
          </div>

          <div>
            <p
              onClick={() => setSizes(prev => prev.includes("L") ?
                prev.filter((item) => item != "L") :
                [...prev, 'L']
              )}
              className={`${sizes.some((prev) => prev == 'L') ?
                "bg-pink-100 " :
                "bg-slate-200"} px-3 py-1 cursor-pointer`}>L</p>
          </div>

          <div>
            <p
              onClick={() => setSizes(prev => prev.includes("XL") ?
                prev.filter((item) => item != "XL") :
                [...prev, "XL"]
              )}
              className={`${sizes.some((prev) => prev == 'XL') ?
                "bg-pink-100 " :
                "bg-slate-200"} px-3 py-1 cursor-pointer`}>XL</p>
          </div>

          <div>
            <p
              onClick={() => setSizes(prev => prev.includes("XXL") ?
                prev.filter((item) => item != "XXL") :
                [...prev, "XXL"]
              )}
              className={`${sizes.some((prev) => prev == 'XXL') ?
                "bg-pink-100 " :
                "bg-slate-200"} px-3 py-1 cursor-pointer`}>XXL</p>
          </div>

        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input type="checkbox" onChange={() => setBestSeller(!bestseller)} checked={bestseller} className='' id='bestseller' />
        <label htmlFor="bestseller" className='cursor-pointer'>Bestseller</label>
      </div>

      <button type="submit" className='w-28 py-3 mt-4 bg-black text-white rounded-sm'>ADD</button>
    </form >
  )
}

export default Add
