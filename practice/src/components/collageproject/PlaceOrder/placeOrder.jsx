import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./placeOrder.css";
import { ShopContext } from "../ShopContex";

function PlaceOrder() {
  const { getTotalCartAmount, discount, all_product, cartItems, getTotalCartItems } = useContext(ShopContext);
  const subtotal = getTotalCartAmount();
  const shipping = subtotal > 0 ? 50 : 0; 
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    street: "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const orderTotal = subtotal - (subtotal * discount) / 100 + shipping;

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full Name is required";
    if (!form.phone.trim()) errs.phone = "Phone Number is required";
    if (!/^[0-9]{10}$/.test(form.phone.trim())) errs.phone = "Enter a valid 10-digit phone number";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";
    if (!/^[0-9]{5,6}$/.test(form.pincode.trim())) errs.pincode = "Enter valid pincode";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.street.trim()) errs.street = "Street/House is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    
    if (getTotalCartItems() === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    // Prepare Items
    let items = [];
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find((product) => product.id === Number(item));
        if (itemInfo) {
            items.push({ ...itemInfo, quantity: cartItems[item] });
        }
      }
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        alert("Please login to place an order");
        navigate("/login");
        return;
      }

      // 1. Create order on backend
      const { data } = await axios.post("https://shopper-backend-37ge.onrender.com/api/payment/create-order", {
        amount: orderTotal,
        items,
        address: form
      }, {
        headers: { "auth-token": token }
      });

      // Fetch Razorpay Key
      const { data: { key } } = await axios.get("https://shopper-backend-37ge.onrender.com/api/payment/get-key");

      if (data.success) {
        // 2. Open Razorpay Popup
        const options = {
          key: key, 
          amount: data.order.amount,

          currency: "INR",
          name: "MERN E-Commerce",
          description: "Test Transaction",
          order_id: data.order.id,
          handler: async function (response) {
            // 3. Verify Payment
            try {
              const verifyRes = await axios.post("https://shopper-backend-37ge.onrender.com/api/payment/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: data.dbOrderId
              }, {
                headers: { "auth-token": token }
              });

              if (verifyRes.data.success) {
                navigate(`/order-success/${data.dbOrderId}`);
              } else {
                alert("Payment verification failed");
              }
            } catch (err) {
              console.error(err);
              alert("Payment Verification Error!");
            }
          },
          prefill: {
            name: form.name,
            contact: form.phone,
          },
          theme: {
            color: "#007bff"
          }
        };

        // Note: fetch the actual key id from backend if you want to avoid hardcoding, but hardcoding test key is fine for dev.
        // Actually we will fetch the key from backend to be perfectly safe as per prompt "Do NOT expose secret key on frontend".
        // Wait, Razorpay's frontend script ALWAYS requires the `key` (which is KEY_ID). The secret is not exposed.
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          alert("Payment Failed: " + response.error.description);
        });
        rzp.open();
      }
    } catch (error) {
      console.error(error);
      alert("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
    <h1 className="checkout-heading">
  🛒 Checkout
</h1>
      <div className="checkout-grid">
        <section className="checkout-card address">
          <h2>1. Shipping Details</h2>
          <form id="checkout-form" onSubmit={handlePlaceOrder} noValidate>
            <div className="form-row">
              <label>Full Name*</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-row">
              <label>Phone Number*</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            <div className="row-cols">
              <div className="form-row">
                <label>Pincode*</label>
                <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" />
                {errors.pincode && <span className="error">{errors.pincode}</span>}
              </div>
              <div className="form-row">
                <label>State*</label>
                <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
                {errors.state && <span className="error">{errors.state}</span>}
              </div>
            </div>
            <div className="row-cols">
              <div className="form-row">
                <label>City*</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>
              <div className="form-row">
                <label>House No / Area / Street*</label>
                <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="123 Green Lane" />
                {errors.street && <span className="error">{errors.street}</span>}
              </div>
            </div>
          </form>
        </section>

        <section className="checkout-card summary" style={{ position: 'relative' }}>
          {loading && <div className="loading-overlay">Processing...</div>}
          <h2>2. Order Summary</h2>
          <div className="items-list">
            {all_product.map((e) => {
              if (cartItems[e.id] > 0) {
                return (
                  <div key={e.id} className="item-row">
                    <div className="item-info">
                      <img src={e.image} alt={e.name} className="item-image" />
                      <div>
                        <div className="item-name">{e.name}</div>
                        <div className="item-qty">Qty: {cartItems[e.id]}</div>
                      </div>
                    </div>
                    <div>₹{e.new_price * cartItems[e.id]}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row" style={{color: '#27ae60'}}>
              <span>Discount ({discount}%)</span>
              <span>- ₹ {((subtotal * discount) / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>₹ {shipping.toFixed(2)}</span>
          </div>
          <hr style={{borderColor: '#eee', margin: '15px 0'}} />
          <div className="summary-total">
            <strong>Total Amount</strong>
            <strong style={{color: '#e74c3c'}}>₹ {orderTotal.toFixed(2)}</strong>
          </div>
          
          <div style={{marginTop: '30px'}}>
             <button form="checkout-form" type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Processing..." : "Pay ₹" + orderTotal}
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PlaceOrder;
