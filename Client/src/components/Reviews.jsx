import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

function Stars({ rating, size = "w-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <img key={n} src={n <= Math.round(rating) ? assets.star_icon : assets.star_dull_icon} className={size} alt="" />
      ))}
    </div>
  );
}

function timeAgo(timestamp) {
  const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function Reviews({ productId }) {
  const { backendUrl } = useContext(ShopContext);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/review/list", { productId });
      if (res.data.success) {
        setReviews(res.data.reviews);
        setAverage(res.data.average);
        setCount(res.data.count);
        setBreakdown(res.data.breakdown);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisibleCount(5);
    loadReviews();
  }, [productId]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-6">Loading reviews…</p>;
  }

  if (count === 0) {
    return <p className="text-sm text-gray-500 py-6">No reviews yet — be the first to review this product!</p>;
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-1 sm:min-w-[140px]">
          <p className="text-4xl font-medium">{average}</p>
          <Stars rating={average} size="w-4" />
          <p className="text-xs text-gray-500">{count} review{count !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 w-full flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = breakdown[star] || 0;
            const pct = count > 0 ? Math.round((n / count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="w-8 text-right">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      <div className="flex flex-col divide-y divide-gray-100">
        {reviews.slice(0, visibleCount).map((r) => (
          <div key={r._id} className="py-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-gray-400">{timeAgo(r.date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Stars rating={r.rating} size="w-3.5" />
              {r.verifiedPurchase && <span className="text-[10px] text-green-600 font-medium">Verified Purchase</span>}
            </div>
            <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
          </div>
        ))}
      </div>

      {visibleCount < reviews.length && (
        <button
          onClick={() => setVisibleCount((v) => v + 10)}
          className="text-sm underline text-gray-600 self-start"
        >
          Show more reviews
        </button>
      )}
    </div>
  );
}

export default Reviews;
