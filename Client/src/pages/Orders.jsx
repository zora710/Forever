import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import ReviewModal from '../components/ReviewModal';

function Orders() {

  const { currency, token, backendUrl } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [activeReviewItem, setActiveReviewItem] = useState(null);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(backendUrl + "/api/order/userorders", {}, { headers: { token } });

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            item['productId'] = item._id
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  const loadPendingReviews = async () => {
    if (!token) return;
    try {
      const res = await axios.post(backendUrl + "/api/review/pending", {}, { headers: { token } });
      if (res.data.success) {
        setPendingReviews(res.data.pending);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadOrderData();
    loadPendingReviews();
  }, [token])

  // Pop the review prompt shortly after the page loads if there's anything left to review
  // (e.g. right after coming back from a purchase).
  useEffect(() => {
    if (pendingReviews.length > 0 && !activeReviewItem) {
      const t = setTimeout(() => setActiveReviewItem(pendingReviews[0]), 900);
      return () => clearTimeout(t);
    }
  }, [pendingReviews])

  const isPending = (item) => pendingReviews.some((p) => p.orderId === item.orderId && p.productId === item.productId);

  const handleReviewSubmitted = (item) => {
    setPendingReviews((prev) => prev.filter((p) => !(p.orderId === item.orderId && p.productId === item.productId)));
    setActiveReviewItem(null);
  }

  return (
    <div className='border-t border-gray-300 pt-16'>
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {
          orderData.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-gray-200 text-gray-700 gap-4">
              <div className="flex items-start gap-6 text-sm">
                <img src={item.images[0]} className='w-16 sm:w-20' alt="" />
                <div>
                  <p className="text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p className=''> {currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-1'>Date:<span className='text-gray-400'>{new Date(item.date).toDateString().slice(4)}</span></p>
                  <p className='mt-1'>Date:<span className='text-gray-400'>{item.paymentMethod}</span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between items-center'>
                <div className="flex items-center gap-2">
                  <p className='min-w-2 h-2 rounded bg-green-500 '></p>
                  <p>{item.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isPending(item) ? (
                    <button
                      onClick={() => setActiveReviewItem({ orderId: item.orderId, productId: item.productId, name: item.name, image: item.images[0] })}
                      className='border border-black px-4 py-2 text-sm font-medium rounded-sm hover:bg-black hover:text-white transition'
                    >
                      ✍ Write a Review
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 font-medium px-2">✓ Reviewed</span>
                  )}
                  <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {activeReviewItem && (
        <ReviewModal
          item={activeReviewItem}
          queueCount={pendingReviews.length}
          onClose={() => setActiveReviewItem(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
}

export default Orders
