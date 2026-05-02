import React, { useState } from 'react'
import "./Item.css"
import { Link } from 'react-router-dom'

const Item = ({ id, image, name, new_price, old_price }) => {
  const [wished, setWished] = useState(false);

  return (
    <div className='item'>
      {/* Image + Wishlist */}
      <div className='item-image-wrapper'>
        <Link to={`/product/${id}`} onClick={() => window.scrollTo(0, 0)}>
          <img src={image} alt={name} />
        </Link>
        <button
          className={`item-wishlist${wished ? ' wished' : ''}`}
          onClick={() => setWished(!wished)}
          aria-label="Add to wishlist"
        >
          {wished ? '♥' : '♡'}
        </button>
      </div>

      {/* Product Name */}
      <p className='item-name'>{name}</p>

      {/* Prices */}
      <div className='item-prices'>
        <span className='item-price-new'>₹{new_price}</span>
        <span className='item-price-old'>₹{old_price}</span>
      </div>
    </div>
  );
};

export default Item;