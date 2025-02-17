import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import './Validated.css'; // Import the CSS file

const Validated = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10); // Default to 10

  useEffect(() => {
    axios.get("http://localhost:5000/orders/validated")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  const finishOrder = (id) => {
    axios.put(`http://localhost:5000/orders/${id}/finish`)
      .then(() => setOrders(orders.filter(order => order.id !== id)));
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <h1>Validated Orders</h1>

      <div className="search-pagination-container">
        <input
          type="text"
          placeholder="Search by Order Number or Client Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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
            <th>Delivery Date</th>
            <th>Remarks</th> {/* New column for Remarks */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map(order => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>{order.client_name}</td>
              <td>{order.product}</td>
              <td>{order.quantity}</td>
              <td>
                {order.delivery_date
                  ? format(new Date(order.delivery_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
                  : "N/A"}
              </td>
              <td>{order.remarks}</td> {/* Display Remarks */}
              <td>
                <button onClick={() => finishOrder(order.id)}>Mark as Finished</button>
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
    </div>
  );
};

export default Validated;