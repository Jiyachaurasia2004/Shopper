import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './CartItems.css'
import { ShopContext } from '../../collageproject/ShopContex'; 
import remove_icon from '../../Assets/cart_cross_icon.png'

const CartItems = () => {
    const navigate = useNavigate();

    const { getTotalCartAmount, all_product, cartItems, removeFromCart, discount, promoMessage, applyPromo } = useContext(ShopContext)

    // ✅ promo state
    const [promoCode, setPromoCode] = useState("");

    // ✅ apply promo
    const handlePromo = () => {
        const code = promoCode.toUpperCase();
        applyPromo(code);
    };

    const subtotal = getTotalCartAmount();
    const total = subtotal - (subtotal * discount) / 100;

    return (
        <div className='cartItems'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />

            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className='cartitems-product-icon' />
                                <p>{e.name}</p>
                                <p>₹{e.new_price}</p>
                                <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                                <p>₹{e.new_price * cartItems[e.id]}</p>
                                <img src={remove_icon} onClick={() => removeFromCart(e.id)} alt="" />
                            </div>
                            <hr />
                        </div>
                    )
                }
                return null;
            })}

            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>

                    <div className="cartitems-total-item">
                        <p>Subtotal</p>
                        <p>₹{subtotal}</p>
                    </div>

                    <div className="cartitems-total-item">
                        <p>Discount</p>
                        <p>{discount}%</p>
                    </div>

                    <div className="cartitems-total-item">
                        <h3>Total</h3>
                        <h3>₹{subtotal - (subtotal * discount) / 100}</h3>
                    </div>

                    <button onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
                </div>

                {/* ✅ PROMO SECTION */}
                <div className="cartitems-promocode">
                    <p>If you have a promo code, enter it here</p>

                    <div className="cartitems-promobox">
                        <input
                            type="text"
                            placeholder='promo code'
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <button onClick={handlePromo}>Submit</button>
                    </div>

                    {/* message show */}
                    <p>{promoMessage}</p>
                </div>
            </div>
        </div>
    )
}

export default CartItems;