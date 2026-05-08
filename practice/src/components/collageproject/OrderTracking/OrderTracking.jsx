import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './OrderTracking.css';

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const statuses = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered"];

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const response = await axios.get(`https://shopper-e-commerce-backend-gip0.onrender.com/api/orders/${orderId}`, {
                    headers: { 'auth-token': token }
                });
                if (response.data.success) {
                    setOrder(response.data.order);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching order:", error);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="order-tracking">
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Loading Tracking Info...</p>
                </div>
            </div>
        );
    }
    if (!order) return <div className="error">Order not found</div>;

    const currentStatusIndex = statuses.indexOf(order.status);

    return (
        <div className="order-tracking">
            <h1>Track Your Order</h1>
            <div className="tracking-card">
              <div className="tracking-header">
    <p>
        Order ID:
        <span className='diving'>{order._id}</span>
    </p>

    <p>
        Expected Delivery:
        <span className='diving'>Soon</span>
    </p>
</div>
                
                <div className="tracking-progress">
                    {statuses.map((status, index) => (
                        <div key={status} className={`step ${index <= currentStatusIndex ? 'active' : ''}`}>
                            <div className="circle">{index + 1}</div>
                            <p className="status-label">{status.replace(/_/g, ' ')}</p>
                            {index < statuses.length - 1 && <div className="line"></div>}
                        </div>
                    ))}
                </div>

                <div className="tracking-history">
                    <h3>Status History</h3>
                    <ul>
                        {order.history.map((h, idx) => (
                            <li key={idx}>
                                <span className="dot"></span>
                                <div className="content">
                                    <p className="h-status">{h.status}</p>
                                    <p className="h-message">{h.message}</p>
                                    <p className="h-date">{new Date(h.updatedAt).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
