import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

function ReviewModal({ item, onClose, onSubmitted, queueCount = 0 }) {
  const { backendUrl, token } = useContext(ShopContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a short comment");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        backendUrl + "/api/review/add",
        { orderId: item.orderId, productId: item.productId, rating, comment: comment.trim() },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Thanks for your review! ⭐");
        onSubmitted && onSubmitted(item);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700">×</button>

        <p className="text-lg font-medium mb-1">How was your purchase?</p>
        <p className="text-xs text-gray-400 mb-4">
          {queueCount > 1 ? `1 of ${queueCount} items to review` : "Your feedback helps other shoppers"}
        </p>

        <div className="flex items-center gap-3 mb-5 bg-gray-50 rounded-md p-3">
          {item.image && <img src={item.image} className="w-14 h-14 object-cover rounded" alt={item.name} />}
          <p className="text-sm font-medium">{item.name}</p>
        </div>

        <p className="text-sm mb-2">Your rating</p>
        <div className="flex gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <img
              key={n}
              src={n <= (hoverRating || rating) ? assets.star_icon : assets.star_dull_icon}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              className="w-7 cursor-pointer"
              alt={`${n} star`}
            />
          ))}
        </div>

        <p className="text-sm mb-2">Your review</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike?"
          className="w-full border border-gray-300 rounded-md p-2 text-sm mb-5 min-h-[90px] outline-none focus:border-gray-500"
        />

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300">
            Maybe later
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-black text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
