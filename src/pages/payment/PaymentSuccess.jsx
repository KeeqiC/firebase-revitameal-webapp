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
  doc,
  updateDoc,
  serverTimestamp,
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
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const updateOrderStatus = async () => {
      try {
        const orderId = searchParams.get("order_id");
        const status = searchParams.get("status");
        const transactionId = searchParams.get("transaction_id");

        console.log("=== PAYMENT SUCCESS PAGE ===");
        console.log("Order ID:", orderId);
        console.log("Status:", status);
        console.log("Transaction ID:", transactionId);

        if (!orderId) {
          throw new Error("Order ID tidak ditemukan");
        }

        // Cek apakah status pending
        const isPendingPayment = status && status.toLowerCase() === "pending";
        setIsPending(isPendingPayment);

        // Cari order di Firestore berdasarkan dokuOrderId
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("dokuOrderId", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Pesanan tidak ditemukan di database");
        }

        // Ambil order pertama yang match
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();

        console.log("✅ Order found in Firebase:", orderDoc.id);

        // ✅ UPDATE STATUS ORDER DI FIRESTORE
        const newStatus = isPendingPayment ? "pending_payment" : "paid";

        // Prepare update data
        const updateData = {
          status: newStatus,
          paymentStatus: status || "success",
          updatedAt: serverTimestamp(),
        };

        // Only add transactionId if provided
        if (transactionId) {
          updateData.dokuTransactionId = transactionId;
        }

        // Only add paidAt if payment is completed (not pending)
        if (!isPendingPayment) {
          updateData.paidAt = serverTimestamp();
        }

        await updateDoc(doc(db, "orders", orderDoc.id), updateData);

        console.log(`✅ Order status updated to: ${newStatus}`);

        // Set order details untuk ditampilkan
        setOrderDetails({
          id: orderDoc.id,
          orderId: orderId,
          transactionId: transactionId,
          ...orderData,
          status: newStatus, // ✅ Update status di state juga
        });
      } catch (err) {
        console.error("❌ Error updating order status:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [searchParams]); // ✅ Remove isPending from dependency

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-md w-full">
          <Loader className="h-16 w-16 text-[#F27F34] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Memverifikasi Pembayaran
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Mohon tunggu, kami sedang memproses data pesanan Anda...
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
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Kembali ke Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Pending Payment
  if (isPending) {
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
                  Rp{orderDetails.pricing?.total?.toLocaleString("id-ID")}
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
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
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
            {orderDetails.transactionId && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">
                  Transaction ID
                </span>
                <span className="font-mono text-sm text-gray-700">
                  {orderDetails.transactionId}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">
                Total Pembayaran
              </span>
              <span className="font-bold text-[#B23501] text-2xl">
                Rp{orderDetails.pricing?.total?.toLocaleString("id-ID")}
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
