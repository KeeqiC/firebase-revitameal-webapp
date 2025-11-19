import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// Firebase
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

const db = getFirestore();

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Memverifikasi pembayaran Anda...");
  const [orderData, setOrderData] = useState(null);
  const [displayCount, setDisplayCount] = useState(0); // ✅ Untuk display saja

  // ✅ FIX: Pakai useRef untuk tracking count yang akurat
  const pollCountRef = useRef(0);
  const isPollingRef = useRef(true);

  const dokuOrderId =
    searchParams.get("order_id") || searchParams.get("invoice_number");
  const MAX_ATTEMPTS = 6;

  useEffect(() => {
    if (!dokuOrderId) {
      setStatus("error");
      setMessage("Order ID tidak ditemukan");
      setTimeout(() => navigate("/dashboard/order-history"), 2000);
      return;
    }

    console.log("🔍 Starting payment verification for:", dokuOrderId);
    checkPaymentStatus();

    return () => {
      isPollingRef.current = false;
    };
  }, [dokuOrderId]);

  const findOrderByDokuId = async (dokuId) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("dokuOrderId", "==", dokuId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error finding order:", error);
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId,
    newStatus,
    transactionStatus,
    orderStatus
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId);

      const updateData = {
        status: newStatus,
        dokuTransactionStatus: transactionStatus,
        dokuOrderStatus: orderStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === "paid") {
        updateData.paidAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);
      console.log(`✅ Order ${orderId} updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const checkPaymentStatus = async () => {
    if (!isPollingRef.current) {
      console.log("⏹️ Polling stopped");
      return;
    }

    // ✅ FIX: Increment SEBELUM check
    pollCountRef.current += 1;
    const currentAttempt = pollCountRef.current;
    setDisplayCount(currentAttempt);

    try {
      console.log(
        `📡 Polling #${currentAttempt}/${MAX_ATTEMPTS} - Checking status...`
      );

      const response = await fetch(
        `https://revitameal-api2.vercel.app/api/doku-check-status?invoice_number=${dokuOrderId}`
      );

      const result = await response.json();
      console.log("📥 DOKU Response:", result);

      if (!result.success) {
        throw new Error(result.error || "Gagal mengecek status pembayaran");
      }

      const { orderStatus, transactionStatus } = result;

      const orderDoc = await findOrderByDokuId(dokuOrderId);

      if (!orderDoc) {
        throw new Error("Order tidak ditemukan di database");
      }

      setOrderData(orderDoc);

      // Handle payment status
      if (transactionStatus === "SUCCESS") {
        isPollingRef.current = false;
        await updateOrderStatus(
          orderDoc.id,
          "paid",
          transactionStatus,
          orderStatus
        );
        console.log("✅ Payment confirmed! Redirecting immediately...");
        navigate(`/payment/success?order_id=${dokuOrderId}`, { replace: true });
        return;
      } else if (transactionStatus === "FAILED") {
        isPollingRef.current = false;
        await updateOrderStatus(
          orderDoc.id,
          "failed",
          transactionStatus,
          orderStatus
        );
        console.log("❌ Payment failed! Redirecting...");
        navigate(`/payment/cancel?order_id=${dokuOrderId}`, { replace: true });
        return;
      } else if (orderStatus === "ORDER_EXPIRED") {
        isPollingRef.current = false;
        await updateOrderStatus(
          orderDoc.id,
          "expired",
          transactionStatus,
          orderStatus
        );
        console.log("⏰ Order expired! Redirecting...");
        navigate(`/payment/cancel?order_id=${dokuOrderId}&reason=expired`, {
          replace: true,
        });
        return;
      } else if (transactionStatus === "PENDING" || !transactionStatus) {
        setMessage(
          `Menunggu konfirmasi pembayaran... (${currentAttempt}/${MAX_ATTEMPTS})`
        );

        // ✅ FIX: Check dengan ref value
        if (currentAttempt >= MAX_ATTEMPTS) {
          isPollingRef.current = false;
          setStatus("timeout");
          setMessage(
            "Verifikasi terlalu lama. Silakan cek order history Anda."
          );
          console.log("⏱️ Timeout reached, redirecting to cancel...");
          setTimeout(() => {
            navigate(`/payment/cancel?order_id=${dokuOrderId}&reason=timeout`, {
              replace: true,
            });
          }, 2000);
          return;
        }

        // Continue polling
        setTimeout(() => {
          if (isPollingRef.current) {
            checkPaymentStatus();
          }
        }, 5000);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      isPollingRef.current = false;
      setStatus("error");
      setMessage(`Error: ${error.message}`);
      setTimeout(() => {
        navigate("/dashboard/order-history", { replace: true });
      }, 3000);
    }
  };

  const StatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-20 w-20 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-20 w-20 text-green-500" />;
      case "failed":
        return <XCircle className="h-20 w-20 text-red-500" />;
      case "expired":
        return <Clock className="h-20 w-20 text-orange-500" />;
      case "timeout":
        return <Clock className="h-20 w-20 text-yellow-500" />;
      default:
        return <AlertCircle className="h-20 w-20 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-12 max-w-lg w-full">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <StatusIcon />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {status === "checking" && "Memverifikasi Pembayaran"}
              {status === "timeout" && "Verifikasi Terlalu Lama"}
              {status === "error" && "Terjadi Kesalahan"}
            </h1>
            <p className="text-gray-600 text-lg">{message}</p>
          </div>

          {orderData && (
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-bold text-gray-800">
                  {orderData.dokuOrderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-2xl text-[#B23501]">
                  Rp{orderData.pricing?.total?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          {status === "checking" && (
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span>
                Attempt {displayCount}/{MAX_ATTEMPTS}
              </span>
            </div>
          )}

          {(status === "error" || status === "timeout") && (
            <div className="space-y-3 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-3 rounded-full font-semibold hover:shadow-xl transition-all"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate("/dashboard/order-history")}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                Lihat Order History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
