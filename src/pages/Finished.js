import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as XLSX from "xlsx"; // Import the xlsx library
import './Finished.css'; // Import the CSS file

const Finished = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10); // Default to 10
  const [startDate, setStartDate] = useState(""); // Start date for period selection
  const [endDate, setEndDate] = useState(""); // End date for period selection

  useEffect(() => {
    axios.get("http://localhost:5000/orders/finished")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  // Filter orders by search term
  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter orders by date range (With the Delivery Date)
  const filteredByDate = filteredOrders.filter((order) => {
    const deliveryDate = new Date(order.delivery_date); // Use delivery_date instead of finished_date
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
  
    if (start && deliveryDate < start) return false;
    if (end && deliveryDate > end) return false;
    return true;
  });
  /**
    With the Validated Date :
    const filteredByDate = filteredOrders.filter((order) => {
    const validatedDate = new Date(order.validated_date); // Use validated_date instead of finished_date
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && validatedDate < start) return false;
    if (end && validatedDate > end) return false;
    return true;
  });
   

  // with the Finished Date :
   const filteredByDate = filteredOrders.filter((order) => {
    const finishedDate = new Date(order.finished_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && finishedDate < start) return false;
    if (end && finishedDate > end) return false;
    return true;
  });
   */

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredByDate.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to export orders to Excel
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

  return (
    <div className="container">
      <h1>Finished Orders</h1>

      <div className="search-pagination-container">
        <input
          type="text"
          placeholder="Search by Order Number or Client Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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

        {/* Date Range Selection */}
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
    </div>
  );
};

export default Finished;