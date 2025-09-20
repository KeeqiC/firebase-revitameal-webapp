// src/pages/dashboard/OrderHistory.jsx
import { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
} from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, paid, cancelled

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching order history:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Enhanced status colors and icons
  const getStatusInfo = (status) => {
    switch (status) {
      case "paid":
      case "settlement":
      case "capture":
        return {
          color: "bg-green-100 text-green-700",
          icon: CheckCircle,
          label: "Dibayar",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-700",
          icon: Clock,
          label: "Menunggu Pembayaran",
        };
      case "processing":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: Package,
          label: "Diproses",
        };
      case "delivered":
        return {
          color: "bg-emerald-100 text-emerald-700",
          icon: CheckCircle,
          label: "Terkirim",
        };
      case "cancelled":
      case "cancel":
      case "expire":
      case "deny":
        return {
          color: "bg-red-100 text-red-700",
          icon: AlertCircle,
          label: "Dibatalkan",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          icon: Package,
          label: status || "Unknown",
        };
    }
  };

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;

    const status = order.status;
    switch (filter) {
      case "pending":
        return status === "pending";
      case "paid":
        return [
          "paid",
          "settlement",
          "capture",
          "processing",
          "delivered",
        ].includes(status);
      case "cancelled":
        return ["cancelled", "cancel", "expire", "deny"].includes(status);
      default:
        return true;
    }
  });

  // Retry payment for pending orders
  const handleRetryPayment = async (order) => {
    try {
      // Re-create transaction for the same order
      const requestBody = {
        transaction_details: {
          gross_amount: order.total,
        },
        customer_details: {
          first_name: currentUser?.displayName || "User",
          email: currentUser?.email || "user@email.com",
          phone: "+6281234567890",
        },
        item_details: order.items.map((item, index) => ({
          id: `item-${index + 1}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(
        "https://revitameal-api2.vercel.app/api/create-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create new transaction");
      }

      const data = await response.json();

      if (data.success && data.data?.snapToken && window.snap) {
        window.snap.pay(data.data.snapToken, {
          onSuccess: (result) => {
            console.log("Payment successful:", result);
            alert("Pembayaran berhasil!");
          },
          onPending: (result) => {
            console.log("Payment pending:", result);
            alert("Pembayaran sedang diproses");
          },
          onError: (result) => {
            console.error("Payment failed:", result);
            alert("Pembayaran gagal");
          },
        });
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      alert("Gagal memproses pembayaran ulang");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B23501] mx-auto mb-4"></div>
          <p className="text-xl text-gray-500">Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Riwayat Pesanan
        </h1>
        <p className="text-gray-600 mb-4">
          Lihat semua pesanan <b>Lunch Boost</b> Anda sebelumnya.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Semua", count: orders.length },
            {
              key: "pending",
              label: "Menunggu",
              count: orders.filter((o) => o.status === "pending").length,
            },
            {
              key: "paid",
              label: "Dibayar",
              count: orders.filter((o) =>
                [
                  "paid",
                  "settlement",
                  "capture",
                  "processing",
                  "delivered",
                ].includes(o.status)
              ).length,
            },
            {
              key: "cancelled",
              label: "Dibatalkan",
              count: orders.filter((o) =>
                ["cancelled", "cancel", "expire", "deny"].includes(o.status)
              ).length,
            },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? "bg-[#B23501] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Pesanan */}
      <section className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                {/* Header Pesanan */}
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div className="flex items-start space-x-4">
                    <Package className="h-8 w-8 text-[#B23501] mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Pesanan #{order.id.substring(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {order.createdAt
                          ? format(
                              order.createdAt.toDate(),
                              "d MMMM yyyy, HH:mm",
                              { locale: id }
                            )
                          : "Tanggal tidak diketahui"}
                      </p>
                      {/* Payment Type */}
                      {order.paymentType && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <CreditCard className="h-4 w-4 mr-1" />
                          {order.paymentType}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full font-semibold text-sm capitalize flex items-center space-x-1 ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span>{statusInfo.label}</span>
                    </div>

                    {/* Retry Payment Button for Pending Orders */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        className="mt-2 px-3 py-1 bg-[#B23501] text-white text-sm rounded-lg hover:bg-[#8B1D00] transition-colors"
                      >
                        Bayar Sekarang
                      </button>
                    )}
                  </div>
                </div>

                {/* Item Pesanan */}
                <div className="space-y-3">
                  {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-gray-600"
                      >
                        <span>
                          {item.quantity} x {item.name}
                        </span>
                        <span>Rp{item.price.toLocaleString("id-ID")}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">
                      Tidak ada item di pesanan ini.
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl text-[#B23501]">
                    Rp{order.total?.toLocaleString("id-ID") || 0}
                  </span>
                </div>

                {/* Transaction ID if available */}
                {order.transactionId && (
                  <div className="mt-2 text-sm text-gray-500">
                    ID Transaksi: {order.transactionId}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-medium mb-2">
              {filter === "all"
                ? "Belum ada pesanan"
                : `Tidak ada pesanan ${
                    filter === "pending"
                      ? "yang menunggu pembayaran"
                      : filter === "paid"
                      ? "yang sudah dibayar"
                      : "yang dibatalkan"
                  }`}
            </p>
            <p className="text-gray-400">
              Pesanan Anda akan muncul di sini setelah melakukan pembelian
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default OrderHistory;
