// src/pages/dashboard/OrderHistory.jsx
import { Package, Calendar, DollarSign, CheckCircle } from "lucide-react";

const orderHistoryData = [
  {
    id: "ORD-928374",
    date: "28 November 2024",
    total: 75000,
    status: "delivered",
    items: [
      { name: "Salad Ayam Panggang", qty: 1, price: 45000 },
      { name: "Smoothie Protein", qty: 1, price: 30000 },
    ],
  },
  {
    id: "ORD-123985",
    date: "25 November 2024",
    total: 50000,
    status: "processing",
    items: [{ name: "Salmon Panggang Keto", qty: 1, price: 50000 }],
  },
  {
    id: "ORD-893021",
    date: "20 November 2024",
    total: 100000,
    status: "cancelled",
    items: [{ name: "Tahu & Tempe Rica-rica", qty: 2, price: 50000 }],
  },
];

function OrderHistory() {
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Riwayat Pesanan
        </h1>
        <p className="text-gray-600">
          Lihat semua pesanan `Lunch Boost` Anda sebelumnya.
        </p>
      </div>

      {/* Daftar Pesanan */}
      <section className="space-y-6">
        {orderHistoryData.length > 0 ? (
          orderHistoryData.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div className="flex items-center space-x-4">
                  <Package className="h-8 w-8 text-[#B23501]" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Pesanan #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {order.date}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full font-semibold text-sm capitalize ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {item.qty} x {item.name}
                    </span>
                    <span>Rp{item.price.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>Rp{order.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg">
            Anda belum memiliki riwayat pesanan.
          </div>
        )}
      </section>
    </div>
  );
}

export default OrderHistory;
