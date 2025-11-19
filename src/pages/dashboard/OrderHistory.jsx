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
  XCircle,
  AlertTriangle,
  DollarSign,
  Eye,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

// ✅ HELPER FUNCTION: Safe date formatting
const formatFirebaseDate = (timestamp, formatString = "d MMMM yyyy, HH:mm") => {
  try {
    if (!timestamp) return "Tanggal tidak tersedia";
    if (typeof timestamp.toDate !== "function") return "Tanggal tidak valid";
    return format(timestamp.toDate(), formatString, { locale: id });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Tanggal tidak valid";
  }
};

function OrderHistory() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          description: "Pembayaran berhasil diterima",
        };
      case "awaiting_payment":
      case "pending_payment":
      case "pending":
        return {
          color: "bg-yellow-500 text-white",
          bgColor: "from-yellow-500/10 to-orange-500/5",
          icon: Clock,
          label: "Menunggu Pembayaran",
          description: "Silakan selesaikan pembayaran",
        };
      case "processing":
        return {
          color: "bg-blue-500 text-white",
          bgColor: "from-blue-500/10 to-cyan-500/5",
          icon: Package,
          label: "Diproses",
          description: "Pesanan sedang disiapkan",
        };
      case "delivered":
        return {
          color: "bg-emerald-500 text-white",
          bgColor: "from-emerald-500/10 to-green-500/5",
          icon: CheckCircle,
          label: "Terkirim",
          description: "Pesanan telah berhasil dikirim",
        };
      case "cancelled":
      case "cancel":
        return {
          color: "bg-red-500 text-white",
          bgColor: "from-red-500/10 to-pink-500/5",
          icon: XCircle,
          label: "Dibatalkan",
          description: "Pesanan dibatalkan",
        };
      case "expired":
      case "expire":
        return {
          color: "bg-orange-500 text-white",
          bgColor: "from-orange-500/10 to-red-500/5",
          icon: AlertTriangle,
          label: "Kedaluwarsa",
          description: "Batas waktu pembayaran habis",
        };
      case "failed":
      case "failure":
        return {
          color: "bg-red-600 text-white",
          bgColor: "from-red-600/10 to-pink-600/5",
          icon: AlertCircle,
          label: "Gagal",
          description: "Pembayaran gagal diproses",
        };
      default:
        return {
          color: "bg-gray-500 text-white",
          bgColor: "from-gray-500/10 to-slate-500/5",
          icon: Package,
          label: status || "Unknown",
          description: "Status tidak diketahui",
        };
    }
  };

  const generateWhatsAppMessage = (order) => {
    const phoneNumber = "6289620284488";
    const message = encodeURIComponent(
      `Halo, saya ingin menanyakan pesanan saya:

📋 *Detail Pesanan*
- ID Pesanan: ${order.dokuOrderId || `#${order.id.substring(0, 8)}`}
- Tanggal: ${
        order.createdAt
          ? format(order.createdAt.toDate(), "d MMMM yyyy, HH:mm", {
              locale: id,
            })
          : "N/A"
      }
- Total: Rp${(order.pricing?.total || 0).toLocaleString("id-ID")}
- Status: ${getStatusInfo(order.status).label}

📦 *Item Pesanan*
${order.items
  ?.map(
    (item) =>
      `• ${item.name} (${item.quantity}x) - Rp${item.price.toLocaleString(
        "id-ID"
      )}`
  )
  .join("\n")}

🏠 *Info Pengiriman*
- Nama: ${order.customerDetails?.name || "N/A"}
- Alamat: ${order.customerDetails?.address || "N/A"}
- HP: ${order.customerDetails?.phone || "N/A"}

Terima kasih!`
    );

    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus riwayat pesanan ini?")
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "orders", orderId));
      console.log("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Gagal menghapus pesanan. Silakan coba lagi.");
    }
  };

  // ✅ FIXED: Redirect ke checkout URL untuk continue payment
  const handleContinuePayment = (order) => {
    if (order.checkoutUrl) {
      // Jika ada checkout URL dari DOKU, redirect ke sana
      window.location.href = order.checkoutUrl;
    } else {
      // Jika tidak ada, buat order baru
      alert("Link pembayaran sudah expired. Silakan buat pesanan baru.");
      navigate("/dashboard/lunch-boost");
    }
  };

  // ✅ FIXED: Reorder functionality
  const handleReorder = (order) => {
    // Redirect ke checkout dengan items dari order sebelumnya
    navigate("/dashboard/checkout", {
      state: {
        items: order.items.map((item) => ({
          ...item,
          cartId: `reorder-${Date.now()}-${Math.random()}`,
          basePrice: item.price,
          quantity: item.quantity,
          selectedVegetable: item.selectedVegetable?.id || null,
        })),
      },
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    const status = order.status;
    switch (filter) {
      case "pending":
        return ["pending", "pending_payment", "awaiting_payment"].includes(
          status
        );
      case "paid":
        return [
          "paid",
          "settlement",
          "capture",
          "processing",
          "delivered",
        ].includes(status);
      case "cancelled":
        return ["cancelled", "cancel"].includes(status);
      case "expired":
        return ["expired", "expire"].includes(status);
      case "failed":
        return ["failed", "failure"].includes(status);
      default:
        return true;
    }
  });

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);
    const displayTotal = order.pricing?.total || 0;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Detail Pesanan
                </h2>
                <p className="text-sm text-gray-600 font-mono">
                  {order.dokuOrderId || `#${order.id.substring(0, 8)}`}
                </p>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium mt-3 ${statusInfo.color}`}
                >
                  <statusInfo.icon className="h-4 w-4" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Tanggal Pesanan
                  </span>
                  <p className="text-gray-800">
                    {order.createdAt
                      ? format(order.createdAt.toDate(), "d MMMM yyyy, HH:mm", {
                          locale: id,
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Payment Gateway
                  </span>
                  <p className="text-gray-800 capitalize">
                    {order.paymentGateway || "DOKU"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {order.dokuTransactionId && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      ID Transaksi
                    </span>
                    <p className="text-gray-800 font-mono text-sm">
                      {order.dokuTransactionId}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <p className="text-gray-800">{statusInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            {order.customerDetails && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Informasi Pelanggan
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Nama:</span>{" "}
                    <span className="font-medium">
                      {order.customerDetails.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="font-medium">
                      {order.customerDetails.email}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Telepon:</span>{" "}
                    <span className="font-medium">
                      {order.customerDetails.phone}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Alamat:</span>{" "}
                    <span className="font-medium">
                      {order.customerDetails.address}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Item Pesanan
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.selectedVegetable && (
                        <p className="text-xs text-green-600">
                          + {item.selectedVegetable.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        Rp{item.price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-gray-500">
                        Subtotal: Rp
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  Rp{order.pricing?.subtotal?.toLocaleString("id-ID") || "0"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span>
                  Rp
                  {order.pricing?.shippingCost?.toLocaleString("id-ID") || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-[#F27F34]">
                  Rp{displayTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {order.paidAt && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-green-700">
                  Dibayar pada:{" "}
                  {format(order.paidAt.toDate(), "d MMMM yyyy, HH:mm", {
                    locale: id,
                  })}
                </span>
              </div>
            )}

            {order.dokuExpiredDate &&
              ["awaiting_payment", "pending_payment"].includes(
                order.status
              ) && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                  <span className="text-sm font-medium text-yellow-700">
                    Batas pembayaran:{" "}
                    {format(
                      new Date(order.dokuExpiredDate),
                      "d MMMM yyyy, HH:mm",
                      {
                        locale: id,
                      }
                    )}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    );
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
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
                count: orders.filter((o) =>
                  ["pending", "pending_payment", "awaiting_payment"].includes(
                    o.status
                  )
                ).length,
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
                  ["cancelled", "cancel"].includes(o.status)
                ).length,
                color: "from-red-500 to-pink-600",
              },
              {
                key: "expired",
                label: "Kedaluwarsa",
                count: orders.filter((o) =>
                  ["expired", "expire"].includes(o.status)
                ).length,
                color: "from-orange-500 to-red-500",
              },
              {
                key: "failed",
                label: "Gagal",
                count: orders.filter((o) =>
                  ["failed", "failure"].includes(o.status)
                ).length,
                color: "from-red-600 to-red-500",
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

        <section className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const displayTotal = order.pricing?.total || 0;

              return (
                <div
                  key={order.id}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-102"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${statusInfo.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  <div className="relative">
                    <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {order.dokuOrderId ||
                              `Pesanan #${order.id.substring(0, 8)}`}
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
                                  : "N/A"}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <CreditCard className="h-4 w-4" />
                              <span className="capitalize">
                                {order.paymentGateway || "DOKU"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-3">
                        <div
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${statusInfo.color}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span>{statusInfo.label}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="group inline-flex items-center space-x-2 bg-white/50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/70 transition-all duration-300 hover:scale-105"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Lihat Detail</span>
                          </button>

                          {["pending_payment", "awaiting_payment"].includes(
                            order.status
                          ) && (
                            <button
                              onClick={() => handleContinuePayment(order)}
                              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <Clock className="h-4 w-4" />
                              <span>Lanjutkan Pembayaran</span>
                            </button>
                          )}

                          {[
                            "expired",
                            "expire",
                            "failed",
                            "failure",
                            "cancelled",
                            "cancel",
                          ].includes(order.status) && (
                            <button
                              onClick={() => handleReorder(order)}
                              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                              <span>Pesan Ulang</span>
                            </button>
                          )}

                          {[
                            "paid",
                            "settlement",
                            "capture",
                            "processing",
                            "delivered",
                          ].includes(order.status) && (
                            <button
                              onClick={() =>
                                window.open(
                                  generateWhatsAppMessage(order),
                                  "_blank"
                                )
                              }
                              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                              </svg>
                              <span>Hubungi Penjual</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="group inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {order.items?.length > 0 ? (
                        <>
                          {order.items.slice(0, 2).map((item, index) => (
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
                                  {item.selectedVegetable && (
                                    <p className="text-xs text-green-600">
                                      + {item.selectedVegetable.name}
                                    </p>
                                  )}
                                  <div className="text-sm text-gray-600">
                                    Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-gray-800">
                                Rp{item.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-center py-2 text-gray-500 text-sm">
                              dan {order.items.length - 2} item lainnya
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 bg-white/20 rounded-2xl">
                          <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 italic">
                            Tidak ada item di pesanan ini.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-white/20">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-[#B23501]" />
                        <span className="font-bold text-xl text-gray-800">
                          Total Pembayaran
                        </span>
                      </div>
                      <span className="font-black text-2xl bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
                        Rp{displayTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
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
                        : filter === "cancelled"
                        ? "yang Dibatalkan"
                        : filter === "expired"
                        ? "yang Kedaluwarsa"
                        : filter === "failed"
                        ? "yang Gagal"
                        : "dengan Status Ini"
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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default OrderHistory;
