import React, { useEffect, useState } from 'react';
import './ListProduct.css';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://shopper-backend-f01t.onrender.com/allproducts');
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete a product by id
  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch('https://shopper-backend-f01t.onrender.com/removeproduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully");
        fetchProducts(); // Refresh list
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Something went wrong while deleting the product");
    }
  };

  if (loading) {
    return <h2 className="loading">Loading products...</h2>;
  }

  return (
    <div className='list-product'>
      <h1 className="list-title">All Products</h1>

      <div className="list-table">
        {/* Table Header */}
        <div className="list-header">
          <p>Product</p>
          <p>Name</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Action</p>
        </div>

        {/* Products List */}
        {allProducts.length === 0 ? (
          <p className="no-data">No products found</p>
        ) : (
          allProducts.map((product) => (
            <div key={product.id} className="list-row">
              <img
                src={product.image || "https://via.placeholder.com/150"}
                alt={product.name}
                className="list-image"
              />
              <p>{product.name}</p>
              <p className="old">₹{product.old_price}</p>
              <p className="new">₹{product.new_price}</p>
              <p className="category">{product.category}</p>
              <button onClick={() => removeProduct(product.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListProduct;
