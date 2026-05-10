import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './OrderManagement.css';

const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await axios.get('https://shopper-backend-37ge.onrender.com/api/admin/orders', {
                headers: { 'auth-token': token }
            });
            if (response.data.success) {
                setOrders(response.data.orders);
                console.log("Admin Orders fetched:", response.data.orders);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('auth-token');
                navigate('/admin-login');
            } else {
                toast.error("Failed to fetch orders");
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const idMatches = order._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const nameMatches = order.address?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatches = order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSearch = idMatches || nameMatches || emailMatches;
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Paginated Orders
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await axios.put(`https://shopper-backend-37ge.onrender.com/api/admin/orders/${orderId}/status`, 
                { status: newStatus },
                { headers: { 'auth-token': token } }
            );
            if (response.data.success) {
                toast.success(`Order updated to ${newStatus}`);
                fetchOrders();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.response?.data?.message || "Update failed");
            fetchOrders(); // Refresh to reset UI state if backend rejects the change
        }
    };

    if (loading) {
        return (
            <div className="order-management">
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Loading Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-management">
            <h1>Order Management</h1>

            <div className="order-controls">
                <input 
                    type="text" 
                    placeholder="Search by ID or Name..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="order-list-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No orders found</td></tr>
                        ) : (
                            currentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(0, 8)}...</td>
                                    <td>{order.address.name} <br /> <small>{order.userId?.email}</small></td>
                                   <td>
  {new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(order.createdAt))}
</td>
                                    <td>₹{order.totalAmount}</td>
                                    <td>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="out_for_delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="pagination" style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px'
                }}>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => paginate(currentPage - 1)}
                        style={{ padding: '8px 15px', border: 'none', background: '#ff4141', color: 'white', borderRadius: '5px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => paginate(currentPage + 1)}
                        style={{ padding: '8px 15px', border: 'none', background: '#ff4141', color: 'white', borderRadius: '5px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >Next</button>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
