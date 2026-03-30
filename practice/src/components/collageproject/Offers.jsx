import React, { useEffect, useState } from "react";
import "./Offers.css";

import img1 from "../Assets/ad1.png";
import img2 from "../Assets/ad2.png";
import img3 from "../Assets/ad3.png";

const Offers = () => {

  // ✅ slides define karo
  const slides = [
    { img: img1 },
    { img: img2 },
    { img: img3 },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000); // 3 sec better lagta hai

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="slider">
      <div
        className="slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((item, index) => (
          <img
            key={index}
            src={item.img}
            alt={`Slide ${index + 1}`}
            className="slide"
          />
        ))}
      </div>
    </div>
  );
};

export default Offers;