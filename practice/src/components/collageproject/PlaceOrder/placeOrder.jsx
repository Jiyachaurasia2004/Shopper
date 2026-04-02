import React, { useContext, useState } from "react";
import "./placeOrder.css";
import { ShopContext } from "../ShopContex";

import qrImage from "../../Assets/QR.JPG";
function PlaceOrder() {
  const { getTotalCartAmount, getTotalCartItems, discount } =
    useContext(ShopContext);
  const subtotal = getTotalCartAmount();
  const shipping = subtotal > 0 ? 50 : 0; // optional shipping logic

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    pincode: "",
    state: "",
    city: "",
    house: "",
    landmark: "",
  });
  const [payment, setPayment] = useState("cod");
  const [errors, setErrors] = useState({});
  const [isPlaced, setIsPlaced] = useState(false);

  const orderTotal = subtotal - (subtotal * discount) / 100 + shipping;

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full Name is required";
    if (!form.mobile.trim()) errs.mobile = "Mobile Number is required";
    if (!/^[0-9]{10}$/.test(form.mobile.trim()))
      errs.mobile = "Enter a valid 10-digit mobile";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";
    if (!/^[0-9]{5,6}$/.test(form.pincode.trim()))
      errs.pincode = "Enter valid pincode";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.house.trim()) errs.house = "House/Area/Street is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmitAddress = (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setIsPlaced(false);
    alert("Address saved successfully.");
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setIsPlaced(true);
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <section className="checkout-card address">
          <h2>1. Delivery Address</h2>
          <form onSubmit={handleSubmitAddress} noValidate>
            <div className="form-row">
              <label>Full Name*</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <span className="error">{errors.fullName}</span>
              )}
            </div>
            <div className="form-row">
              <label>Mobile Number*</label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="9876543210"
              />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>
            <div className="row-cols">
              <div className="form-row">
                <label>Pincode*</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                />
                {errors.pincode && (
                  <span className="error">{errors.pincode}</span>
                )}
              </div>
              <div className="form-row">
                <label>State*</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                />
                {errors.state && <span className="error">{errors.state}</span>}
              </div>
            </div>
            <div className="row-cols">
              <div className="form-row">
                <label>City*</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>
              <div className="form-row">
                <label>House No / Area / Street*</label>
                <input
                  type="text"
                  name="house"
                  value={form.house}
                  onChange={handleChange}
                  placeholder="123 Green Lane"
                />
                {errors.house && <span className="error">{errors.house}</span>}
              </div>
            </div>
            <div className="form-row">
              <label>Landmark (optional)</label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Near City Mall"
              />
            </div>
            <button type="submit" className="primary-btn">
              Save Address
            </button>
          </form>
        </section>

        <section className="checkout-card summary">
          <h2>2. Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Discount ({discount}%)</span>
            <span>- ₹ {((subtotal * discount) / 100).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>₹ {shipping.toFixed(2)}</span>
          </div>
          <hr />
          <div className="summary-total">
            <strong>Total</strong>
            <strong> {orderTotal.toFixed(2)}</strong>
          </div>
          <small>Data is loaded from cart context in real time.</small>
        </section>

        <section className="checkout-card payment">
          <h2>3. Payment Options</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="payment-option">
              <input
                type="radio"
                id="cod"
                name="payment "
                value="cod"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
              />
              <label htmlFor="cod">Cash on Delivery</label>
            </div>
            <div className="payment-option">
              <input
                type="radio"
                id="upi"
                name="payment"
                value="upi"
                checked={payment === "upi"}
                onChange={() => setPayment("upi")}
              />
              <label htmlFor="upi">UPI</label>
            </div>

            {/* 👇 Show QR only when UPI selected */}
            {payment === "upi" && (
              <div className="upi-qr">
                <p>Scan this QR to pay</p>
                <img src={qrImage} alt="UPI QR Code" />
              </div>
            )}
            <div className="payment-option">
              <input
                type="radio"
                id="card"
                name="payment"
                value="card"
                checked={payment === "card"}
                onChange={() => setPayment("card")}
              />
              <label htmlFor="card">Debit/Credit Card</label>
            </div>

            <button type="submit" className="primary-btn">
              Place Order
            </button>

            {isPlaced && (
              <div className="success-message">
                Order Confirmed 🎉 Your order will be delivered soon.
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

export default PlaceOrder;
