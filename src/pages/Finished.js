import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as XLSX from "xlsx";
import './Finished.css';

const Finished = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  useEffect(() => {
    axios.get("https://pipepoly-ordermanager-back-1.onrender.com/orders/finished")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByDate = filteredOrders.filter((order) => {
    const deliveryDate = new Date(order.delivery_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && deliveryDate < start) return false;
    if (end && deliveryDate > end) return false;
    return true;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredByDate.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const data = filteredByDate.map((order) => ({
      "Order Number": order.order_number,
      "Client": order.client_name,
      "Product": order.product,
      "Quantity": order.quantity,
      "Delivery Date": order.delivery_date
        ? format(new Date(order.delivery_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
        : "N/A",
      "Validated Date": order.validated_date
        ? format(new Date(order.validated_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
        : "N/A",
      "Finished Date": order.finished_date
        ? format(new Date(order.finished_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finished Orders");
    XLSX.writeFile(workbook, "Finished_Orders.xlsx");
  };

  // Handle row click
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  return (
    <div className="container">
      <h1>Finished Orders</h1>

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


        <div className="orders-per-page">
          <span>Orders per page : </span>
          <select onChange={(e) => setOrdersPerPage(Number(e.target.value))} value={ordersPerPage}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Client</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Delivery Date</th>
            <th>Validated Date</th>
            <th>Finished Date</th>
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
                  ? format(new Date(order.delivery_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
                  : "N/A"}
              </td>
              <td>
                {order.validated_date
                  ? format(new Date(order.validated_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
                  : "N/A"}
              </td>
              <td>
                {order.finished_date
                  ? format(new Date(order.finished_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bottom-controls">
        <div className="pagination">
          {Array.from({ length: Math.ceil(filteredByDate.length / ordersPerPage) }, (_, index) => (
            <button key={index + 1} onClick={() => paginate(index + 1)}>
              {index + 1}
            </button>
          ))}
        </div>

        <div className="download-container">
          <div className="date-range-container">
            <label>
              From:
              <input
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              To:
              <input
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button onClick={exportToExcel}>Download Excel</button>
          </div>
        </div>
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
            <p><strong>Delivery Date:</strong> {format(new Date(selectedOrder.delivery_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
            <p><strong>Validated Date:</strong> {format(new Date(selectedOrder.validated_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
            <p><strong>Finished Date:</strong> {format(new Date(selectedOrder.finished_date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finished;