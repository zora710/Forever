import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShopContext } from "../context/ShopContext";

function NewArrivalsMarquee() {
  const { products, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // newest products first (products are appended over time, so reverse + take latest)
    const latest = [...products].reverse().slice(0, 12);
    setItems(latest);
  }, [products]);

  if (items.length === 0) return null;

  // duplicate the list so the CSS animation can loop seamlessly
  const track = [...items, ...items];

  return (
    <div className="py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-y border-gray-200">
      <div className="flex items-center gap-3 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mb-5">
        <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
        <p className="font-medium text-sm md:text-base tracking-wide text-[#414141]">✨ JUST DROPPED</p>
      </div>

      <div className="marquee-wrapper overflow-hidden">
        <div className="marquee-track">
          {track.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/product/${item._id}`)}
              className="flex-shrink-0 w-40 sm:w-48 mx-2 sm:mx-3 cursor-pointer group"
            >
              <div className="overflow-hidden rounded-lg bg-gray-100 aspect-square">
                <img
                  src={item.images && item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-xs sm:text-sm mt-2 truncate">{item.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">{currency}{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewArrivalsMarquee;
