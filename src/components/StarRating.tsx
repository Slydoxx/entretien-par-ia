
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
}

const StarRating = ({ rating, onChange, size = 24 }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none transition-colors"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={size}
            className={`
              cursor-pointer transition-colors
              ${(hover || rating) >= star 
                ? "fill-destructive text-destructive" 
                : "fill-none text-gray-300"}
            `}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
