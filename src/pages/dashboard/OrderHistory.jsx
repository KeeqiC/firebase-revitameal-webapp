// src/pages/dashboard/OrderHistory.jsx
import { useState, useEffect } from "react";
import { Package, Calendar } from "lucide-react";
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

  // 🔹 warna status
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "paid":
        return "bg-blue-100 text-blue-700"; // sudah dibayar
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Memuat riwayat pesanan...</p>
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
        <p className="text-gray-600">
          Lihat semua pesanan <b>Lunch Boost</b> Anda sebelumnya.
        </p>
      </div>

      {/* Daftar Pesanan */}
      <section className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              {/* Header Pesanan */}
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div className="flex items-center space-x-4">
                  <Package className="h-8 w-8 text-[#B23501]" />
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
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full font-semibold text-sm capitalize ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status || "unknown"}
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
              <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>Rp{order.total?.toLocaleString("id-ID") || 0}</span>
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
