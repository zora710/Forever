import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router"
import { ShopContext } from "../context/ShopContext"
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import Reviews from "../components/Reviews";
import axios from "axios";


function Product() {
  const { products, currency, addToCart, backendUrl } = useContext(ShopContext);
  const { productId } = useParams();
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });

  const loadRatingSummary = async () => {
    try {
      const res = await axios.post(backendUrl + "/api/review/list", { productId });
      if (res.data.success) {
        setRatingSummary({ average: res.data.average, count: res.data.count });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProductData = () => {
    products.map((item) => {
      if (item._id == productId) {
        setProductData(item);
        setImage(item.images[0])
        

        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  useEffect(() => {
    loadRatingSummary();
  }, [productId])

  return productData ? (
    <div className="border-t-2 border-gray-200 pt-10 transiton-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">

        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3 ">
          {/* Left Nav Images */}
          <div className="flex overflow-x-auto  justify-between w-full sm:flex-col sm:overflow-y-scroll sm:justify-normal sm:w-[18.7%]">
            {
              productData.images.map((item, index) => (
                <img onClick={() => setImage(item)} src={item} key={index} className="w-[24%] sm:w-full sm:mb-3 flex flex-shrink-0 cursor-pointer" alt="" />
              ))
            }
          </div>
          {/* Main Image */}
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 pt-3">
          <h1 className="font-medium text-3xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <img key={n} src={n <= Math.round(ratingSummary.average) ? assets.star_icon : assets.star_dull_icon} className="w-4" alt="" />
            ))}
            <p className="pl-2" >({ratingSummary.count})</p>
          </div>
          <p className="mt-5 text-3xl font-medium">{currency} {productData.price}</p>
          <p className="mt-5 text-l text-gray-500 md:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Sizes</p>
            <div className="flex gap-2">
              {
                productData.sizes.map((item, index) => (
                  <button onClick={() => setSize(item)} key={index} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} >{item}</button>
                ))
              }
            </div>
          </div>

          <button onClick={ ()=> addToCart(productData._id, size) } className="bg-black text-white px-8 py-4 text-sm active:bg-gray-700 ">ADD TO CART</button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>
      {/* Description and Review section */}
      <div className="mt-20">
        <div className="flex">
          <b
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm cursor-pointer ${activeTab === 'description' ? 'bg-gray-50' : 'text-gray-500 font-normal'}`}
          >
            Description
          </b>
          <p
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm cursor-pointer ${activeTab === 'reviews' ? 'bg-gray-50 font-medium text-black' : 'text-gray-500'}`}
          >
            Reviews ({ratingSummary.count})
          </p>
        </div>

        {activeTab === 'description' ? (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm lg:text-[16px] text-gray-500">
            <p>{productData.description}</p>
          </div>
        ) : (
          <div className="border px-6">
            <Reviews productId={productData._id} />
          </div>
        )}
      </div>

        {/* Display relates products */}
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) :
    <div className="opacity-0"></div>

}

export default Product
