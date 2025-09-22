// src/pages/dashboard/OrderHistory.jsx
import { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Activity,
  ShoppingBag,
  RefreshCw,
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
          color: "bg-green-500 text-white",
          bgColor: "from-green-500/10 to-emerald-500/5",
          icon: CheckCircle,
          label: "Dibayar",
        };
      case "pending":
        return {
          color: "bg-yellow-500 text-white",
          bgColor: "from-yellow-500/10 to-orange-500/5",
          icon: Clock,
          label: "Menunggu Pembayaran",
        };
      case "processing":
        return {
          color: "bg-blue-500 text-white",
          bgColor: "from-blue-500/10 to-cyan-500/5",
          icon: Package,
          label: "Diproses",
        };
      case "delivered":
        return {
          color: "bg-emerald-500 text-white",
          bgColor: "from-emerald-500/10 to-green-500/5",
          icon: CheckCircle,
          label: "Terkirim",
        };
      case "cancelled":
      case "cancel":
      case "expire":
      case "deny":
        return {
          color: "bg-red-500 text-white",
          bgColor: "from-red-500/10 to-pink-500/5",
          icon: AlertCircle,
          label: "Dibatalkan",
        };
      default:
        return {
          color: "bg-gray-500 text-white",
          bgColor: "from-gray-500/10 to-slate-500/5",
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

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Memuat riwayat pesanan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Enhanced Header - consistent with Dashboard */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Selamat {getCurrentTime()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            Riwayat{" "}
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Pesanan
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Lihat semua pesanan Lunch Boost Anda sebelumnya
          </p>
        </header>

        {/* Enhanced Filter Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-[#B23501]" />
              Filter Pesanan
            </h3>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {orders.length} total pesanan
            </span>
          </div>

          {/* Enhanced Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {[
              {
                key: "all",
                label: "Semua",
                count: orders.length,
                color: "from-gray-500 to-slate-600",
              },
              {
                key: "pending",
                label: "Menunggu",
                count: orders.filter((o) => o.status === "pending").length,
                color: "from-yellow-500 to-orange-500",
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
                color: "from-green-500 to-emerald-600",
              },
              {
                key: "cancelled",
                label: "Dibatalkan",
                count: orders.filter((o) =>
                  ["cancelled", "cancel", "expire", "deny"].includes(o.status)
                ).length,
                color: "from-red-500 to-pink-600",
              },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`group relative overflow-hidden px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 ${
                  filter === filterOption.key
                    ? `bg-gradient-to-r ${filterOption.color} text-white shadow-lg`
                    : "bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30"
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <span className="relative z-10">
                  {filterOption.label} ({filterOption.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Orders List */}
        <section className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-102"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${statusInfo.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  <div className="relative">
                    {/* Enhanced Header Pesanan */}
                    <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Pesanan #{order.id.substring(0, 8)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {order.createdAt
                                  ? format(
                                      order.createdAt.toDate(),
                                      "d MMMM yyyy, HH:mm",
                                      { locale: id }
                                    )
                                  : "Tanggal tidak diketahui"}
                              </span>
                            </span>
                            {order.paymentType && (
                              <span className="flex items-center space-x-1">
                                <CreditCard className="h-4 w-4" />
                                <span>{order.paymentType}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${statusInfo.color}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span>{statusInfo.label}</span>
                        </div>

                        {/* Enhanced Retry Payment Button for Pending Orders */}
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleRetryPayment(order)}
                            className="group mt-3 inline-flex items-center space-x-2 bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                            <span>Bayar Sekarang</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Item Pesanan */}
                    <div className="space-y-4 mb-6">
                      {order.items?.length > 0 ? (
                        order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-4 bg-white/30 rounded-2xl backdrop-blur-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-xl flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800">
                                  {item.name}
                                </span>
                                <div className="text-sm text-gray-600">
                                  Qty: {item.quantity}
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-gray-800">
                              Rp{item.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-white/20 rounded-2xl">
                          <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 italic">
                            Tidak ada item di pesanan ini.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Total */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/20">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-[#B23501]" />
                        <span className="font-bold text-xl text-gray-800">
                          Total Pembayaran
                        </span>
                      </div>
                      <span className="font-black text-2xl bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
                        Rp{order.total?.toLocaleString("id-ID") || 0}
                      </span>
                    </div>

                    {/* Transaction ID */}
                    {order.transactionId && (
                      <div className="mt-4 p-3 bg-white/20 rounded-xl">
                        <span className="text-sm text-gray-600">
                          ID Transaksi:{" "}
                        </span>
                        <span className="text-sm font-mono font-semibold text-gray-800">
                          {order.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {filter === "all"
                  ? "Belum Ada Pesanan"
                  : `Tidak Ada Pesanan ${
                      filter === "pending"
                        ? "yang Menunggu Pembayaran"
                        : filter === "paid"
                        ? "yang Sudah Dibayar"
                        : "yang Dibatalkan"
                    }`}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                {filter === "all"
                  ? "Mulai pesan makanan sehat dari menu Lunch Boost untuk melihat riwayat pesanan Anda"
                  : "Pesanan dengan status ini akan muncul di sini"}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default OrderHistory;
