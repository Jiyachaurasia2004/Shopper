import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.get(`https://shopper-backend-37ge.onrender.com/api/invoice/download-invoice/${orderId}`, {
        headers: { 'auth-token': token },
        responseType: 'blob' // important for file download
      });

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to download invoice", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  return (
    <div className="order-success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been placed successfully and is being processed.</p>
        
        <div className="order-details">
          <div className="detail-row">
            <span>Order ID</span>
            <span>{orderId}</span>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <span style={{ color: '#4caf50' }}>PAID</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-download" onClick={handleDownloadInvoice}>
            📄 Download Invoice
          </button>
          <button className="btn-track" onClick={() => navigate(`/track-order/${orderId}`)}>
            🚚 Track Order
          </button>
          <button className="btn-home" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
