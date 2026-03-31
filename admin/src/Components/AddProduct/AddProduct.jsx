import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: ""
  });
  const [loading, setLoading] = useState(false);

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    if (!image) {
      return alert("Please upload an image first");
    }
    if (!productDetails.name || !productDetails.new_price || !productDetails.old_price) {
      return alert("Please fill all product fields");
    }

    setLoading(true);

    try {
      // 1️⃣ Upload image to backend (Cloudinary handles it)
      const formData = new FormData();
      formData.append('product', image);

      const uploadResp = await fetch('https://shopper-backend-f01t.onrender.com/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResp.json();

      if (!uploadData.success) {
        setLoading(false);
        return alert("Image upload failed");
      }

      // 2️⃣ Add product with Cloudinary image URL
      const product = { ...productDetails, image_url: uploadData.image_url };
      const addResp = await fetch('https://shopper-backend-f01t.onrender.com/addproduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      const addData = await addResp.json();
      setLoading(false);

      addData.success ? alert("Product Added Successfully") : alert("Failed to add product");

      // Reset form
      setProductDetails({ name: "", image: "", category: "women", new_price: "", old_price: "" });
      setImage(null);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Something went wrong!");
    }
  };

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name='name'
          placeholder='Type here'
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder='Type here'
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder='Type here'
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className='add-product-selector'
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            alt="upload"
            className='addproduct-thumnail-img'
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>

      <button
        onClick={Add_Product}
        className='addproduct-btn'
        disabled={loading}
      >
        {loading ? "Adding..." : "ADD"}
      </button>
    </div>
  );
};

export default AddProduct;
