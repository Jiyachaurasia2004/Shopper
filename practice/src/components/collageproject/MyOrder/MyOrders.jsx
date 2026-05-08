import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                const response = await axios.get('https://shopper-e-commerce-backend-gip0.onrender.com/api/payment/my-orders', {
                    headers: { 'auth-token': token }
                });
                if (response.data.success) {
                    setOrders(response.data.orders);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleDownloadInvoice = async (orderId) => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await axios.get(`https://shopper-e-commerce-backend-gip0.onrender.com/api/invoice/download-invoice/${orderId}`, {
                headers: { 'auth-token': token },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download invoice", error);
        }
    };
const handleDeleteOrder = async (orderId) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {

        const token = localStorage.getItem('auth-token');

        const response = await axios.delete(
            `https://shopper-e-commerce-backend-gip0.onrender.com/api/payment/delete-order/${orderId}`,
            {
                headers: { 'auth-token': token }
            }
        );

        if (response.data.success) {

            setOrders(
                orders.filter((order) => order._id !== orderId)
            );

            alert("Order deleted successfully");
        }

    } catch (error) {

        console.error("Delete failed:", error);

        alert("Failed to delete order");
    }
};
    if (loading) {
        return (
            <div className="my-orders">
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Loading Your Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders">
            <h1>My Orders</h1>
            <div className="orders-container">
                {orders.length === 0 ? (
                    <p>You have no orders yet.</p>
                ) : (
                    orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <p className="label">Order ID</p>
                                    <p className="value">#{order._id.substring(0, 8)}...</p>
                                </div>
                                <div>
                                    <p className="label">Date</p>
                                    <p className="value">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="label">Total</p>
                                    <p className="value">₹{order.amount}</p>
                                </div>
                                <div>
                                    <span className={`status ${order.status}`}>{order.status}</span>
                                </div>
                            </div>
                            <div className="order-items">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="item">
                                        <img src={item.image} alt={item.name} />
                                        <p>{item.name} x {item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="order-footer">
                                <button onClick={() => navigate(`/track-order/${order._id}`)}>Track Order</button>
                                <button className="secondary" onClick={() => handleDownloadInvoice(order._id)}>Invoice</button>
                                 <button
                  className="delete-btn"
                  onClick={() => handleDeleteOrder(order._id)}
                >
                  Delete Order
                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;
