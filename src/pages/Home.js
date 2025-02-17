import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import './Home.css';

const Home = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    order_number: "",
    client_name: "",
    product: "",
    quantity: 1,
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    status: "normal",
    remarks: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  useEffect(() => {
    axios
      .get("http://localhost:5000/orders/pending")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  const addOrder = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/orders", newOrder)
      .then(() => {
        axios.get("http://localhost:5000/orders/pending").then((res) => {
          setOrders(res.data);
        });
        setShowForm(false);
      })
      .catch((err) => console.error(err));
  };

  const validateOrder = (orderId) => {
    axios
      .put(`http://localhost:5000/orders/${orderId}/validate`)
      .then(() => {
        axios.get("http://localhost:5000/orders/pending").then((res) => {
          setOrders(res.data);
        });
      })
      .catch((err) => console.error(err));
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
      <h1>Pending Orders</h1>
      <button className="add-order-button" onClick={() => setShowForm(true)}>Add Order</button>

      {showForm && (
        <div className="popup">
          <div className="popup-content">
            <h2>New Order</h2>
            <form onSubmit={addOrder}>
              <input type="text" name="order_number" placeholder="Order Number" onChange={handleChange} required />
              <input type="text" name="client_name" placeholder="Client Name" onChange={handleChange} required />
              <input type="text" name="product" placeholder="Product" onChange={handleChange} required />
              <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} required />
              <label htmlFor="order_date">Order Date</label>
              <input type="date" name="order_date" defaultValue={newOrder.order_date} onChange={handleChange} required />
              <label htmlFor="delivery_date">Delivery Date</label>
              <input type="date" name="delivery_date" onChange={handleChange} required />
              <label htmlFor="status">Status</label>
              <select name="status" onChange={handleChange}>
                <option value="urgent">Urgent</option>
                <option value="normal" selected>Normal</option>
                <option value="can wait">Can Wait</option>
              </select>
              <label htmlFor="remarks">Remarks</label>
              <textarea name="remarks" placeholder="Remarks" onChange={handleChange}></textarea>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit">Save</button>
                <button style={{ background: "red" }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Client</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Order Date</th>
            <th>Delivery Date</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr key={order.id} onClick={() => handleRowClick(order)} style={{ cursor: "pointer" }}>
              <td>{order.order_number}</td>
              <td>{order.client_name}</td>
              <td>{order.product}</td>
              <td>{order.quantity}</td>
              <td>
                {order.order_date
                  ? format(new Date(order.order_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
                  : "N/A"}
              </td>
              <td>
                {order.delivery_date
                  ? format(new Date(order.delivery_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
                  : "N/A"}
              </td>
              <td>{order.status}</td>
              <td>{order.remarks}</td>
              <td>
                <button onClick={(e) => { e.stopPropagation(); validateOrder(order.id); }}>Validate Order</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            <p><strong>Order Date:</strong> {format(new Date(selectedOrder.order_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
            <p><strong>Delivery Date:</strong> {format(new Date(selectedOrder.delivery_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Remarks:</strong> {selectedOrder.remarks}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;