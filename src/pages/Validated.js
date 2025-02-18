import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import './Validated.css';

const Validated = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  useEffect(() => {
    axios.get("https://pipepoly-ordermanager-back.onrender.com/orders/validated")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  const finishOrder = (id) => {
    axios.put(`https://pipepoly-ordermanager-back.onrender.com/orders/${id}/finish`)
      .then(() => setOrders(orders.filter(order => order.id !== id)));
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle row click
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  return (
    <div className="container">
      <h1>Validated Orders</h1>

      <div className="search-pagination-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Order Number or Client Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search search-icon"></i> {/* FontAwesome icon */}
        </div>

        <select onChange={(e) => setOrdersPerPage(Number(e.target.value))} value={ordersPerPage}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Client</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map(order => (
              <tr key={order.id} onClick={() => handleRowClick(order)} style={{ cursor: "pointer" }}>
                <td>{order.order_number}</td>
                <td>{order.client_name}</td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>
                  {order.delivery_date
                    ? format(new Date(order.delivery_date), "dd/MM/yyyy", { locale: fr })
                    : "N/A"}
                </td>
                <td>{order.status}</td>
                <td>{order.remarks}</td>
                <td>
                  <button onClick={(e) => { e.stopPropagation(); finishOrder(order.id); }}>Mark as Finished</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }, (_, index) => (
          <button key={index + 1} onClick={() => paginate(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* Popup for order details */}
      {showPopup && selectedOrder && (
        <div className="popup">
          <div className="popup-content">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
            <p><strong>Client:</strong> {selectedOrder.client_name}</p>
            <p><strong>Product:</strong> {selectedOrder.product}</p>
            <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
            <p><strong>Delivery Date:</strong> {format(new Date(selectedOrder.delivery_date), "dd/MM/yyyy", { locale: fr })}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Remarks:</strong> {selectedOrder.remarks}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validated;