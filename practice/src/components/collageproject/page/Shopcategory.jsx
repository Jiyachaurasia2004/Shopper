import React, { useContext, useState } from 'react'
import "./CSS/Shopcategory.css"
import { ShopContext } from '../ShopContex'
import dropdown_icon from "../../Assets/dropdown_icon.png"
import Item from "../Item"

const ShopCategory = (props) => { 

  const { all_product } = useContext(ShopContext);

  const [sortType, setSortType] = useState("default");
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Filter by category
  let filteredProducts = all_product.filter(
    (item) => props.category === item.category
  );

  // ✅ Sorting logic
  if (sortType === "low-high") {
    filteredProducts.sort((a, b) => a.new_price - b.new_price);
  }
  else if (sortType === "high-low") {
    filteredProducts.sort((a, b) => b.new_price - a.new_price);
  }
  else if (sortType === "a-z") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className='shop-category'>

      <img className='shopcategory-banner' src={props.banner} alt='' />

      <div className="shopcategory-indexsort">
        <p>
          <span>Showing {filteredProducts.length}</span> products
        </p>

        {/* ✅ SORT DROPDOWN */}
        <div className="shopcategory-sort" onClick={() => setShowDropdown(!showDropdown)}>
          Sort by <img src={dropdown_icon} alt="" />

          {showDropdown && (
            <div className="dropdown-menu">
              <p onClick={() => setSortType("default")}>Default</p>
              <p onClick={() => setSortType("low-high")}> Low to High</p>
              <p onClick={() => setSortType("high-low")}> High to Low</p>
              <p onClick={() => setSortType("a-z")}> A to Z</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ PRODUCTS */}
      <div className='shopcategory-products'>
        {filteredProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>

      <div className='shopcategory-loadmore'>
         <button>Explore More</button> 
      </div>

    </div>
  )
}

export default ShopCategory;