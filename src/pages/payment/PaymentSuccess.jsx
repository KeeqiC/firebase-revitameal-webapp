import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Home,
  FileText,
  Loader,
  Package,
  AlertCircle,
} from "lucide-react";

// Firebase Setup
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      fetchOrderData(orderId);
    } else {
      setError("Order ID tidak ditemukan di URL");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderData = async (orderId) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("dokuOrderId", "==", orderId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const data = orderDoc.data();

        setOrderDetails({
          id: orderDoc.id,
          orderId: orderId,
          ...data,
        });
        setError(null);
      } else {
        setError("Pesanan tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(
        error.message || "Terjadi kesalahan saat mengambil data pesanan"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-md w-full">
          <Loader className="h-16 w-16 text-[#F27F34] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Menunggu Konfirmasi Pembayaran
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Mohon tunggu, kami sedang memverifikasi pembayaran Anda...
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Proses ini biasanya memakan waktu 10-30 detik
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Perhatian
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard/order-history")}
              className="w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Cek Order History
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Pending Payment
  if (orderDetails?.status === "pending_payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              Menunggu Pembayaran
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Pesanan Anda telah dibuat. Silakan selesaikan pembayaran untuk
              melanjutkan proses.
            </p>
          </div>

          {orderDetails && (
            <div className="bg-white/50 rounded-2xl p-6 mb-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Order ID</span>
                <span className="font-bold text-gray-800">
                  {orderDetails.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="font-bold text-[#B23501] text-xl">
                  Rp{orderDetails.pricing?.total?.toLocaleString("id-ID") || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Status</span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  Menunggu Pembayaran
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard/order-history")}
              className="w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Cek Status Pesanan</span>
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Kembali ke Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Payment Completed
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Pembayaran Berhasil! 🎉
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Terima kasih atas pembelian Anda. Pesanan Anda sedang diproses dan
            akan segera dikirim.
          </p>
        </div>

        {orderDetails && (
          <div className="bg-white/50 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Order ID</span>
              <span className="font-bold text-gray-800">
                {orderDetails.orderId}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">
                Total Pembayaran
              </span>
              <span className="font-bold text-[#B23501] text-2xl">
                Rp{orderDetails.pricing?.total?.toLocaleString("id-ID") || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Jumlah Item</span>
              <span className="font-semibold text-gray-800">
                {orderDetails.items?.length || 0} item
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Status</span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                ✓ Pembayaran Berhasil
              </span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800 text-sm mb-1">
                Langkah Selanjutnya
              </p>
              <p className="text-blue-700 text-xs">
                Pesanan Anda akan segera diproses oleh tim kami. Anda akan
                menerima notifikasi melalui email atau WhatsApp untuk update
                pengiriman.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all"
          >
            <Home className="h-5 w-5" />
            <span>Kembali ke Home</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/order-history")}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            <FileText className="h-5 w-5" />
            <span>Lihat Pesanan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
