import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";

export default function PaymentResult() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing | error

  useEffect(() => {
    const processPaymentRedirect = () => {
      try {
        // Ambil semua parameter yang mungkin dikirim DOKU
        const orderId = params.get("order_id") || params.get("TRANSACTIONID");
        const paymentStatus =
          params.get("status") || params.get("RESPONSECODE");
        const transactionId =
          params.get("transaction_id") || params.get("APPROVALCODE");

        console.log("=== PAYMENT RESULT PARAMS ===");
        console.log("Order ID:", orderId);
        console.log("Status:", paymentStatus);
        console.log("Transaction ID:", transactionId);
        console.log("All params:", Object.fromEntries(params.entries()));

        // Jika tidak ada order_id, redirect ke cancel
        if (!orderId) {
          console.warn("No order_id found, redirecting to cancel");
          navigate("/payment/cancel", { replace: true });
          return;
        }

        // Tentukan redirect berdasarkan status pembayaran
        if (paymentStatus) {
          // DOKU Success codes: "00", "0000", "SUCCESS"
          if (
            paymentStatus === "00" ||
            paymentStatus === "0000" ||
            paymentStatus.toLowerCase() === "success"
          ) {
            console.log("✅ Payment SUCCESS, redirecting to success page");
            navigate(
              `/payment/success?order_id=${orderId}&transaction_id=${
                transactionId || ""
              }&status=${paymentStatus}`,
              { replace: true }
            );
            return;
          }

          // DOKU Pending codes: "PENDING", "01"
          if (
            paymentStatus.toLowerCase() === "pending" ||
            paymentStatus === "01"
          ) {
            console.log("⏳ Payment PENDING, redirecting to success page");
            navigate(`/payment/success?order_id=${orderId}&status=pending`, {
              replace: true,
            });
            return;
          }

          // Failed/Expired/Cancelled
          console.log(
            "❌ Payment FAILED/CANCELLED, redirecting to cancel page"
          );
          navigate(
            `/payment/cancel?order_id=${orderId}&status=${paymentStatus}`,
            { replace: true }
          );
          return;
        }

        // Default: jika ada order_id tapi tidak ada status, anggap success
        console.log("✅ Order ID found without status, redirecting to success");
        navigate(`/payment/success?order_id=${orderId}`, { replace: true });
      } catch (error) {
        console.error("Error processing payment result:", error);
        setStatus("error");

        // Redirect ke cancel setelah 3 detik jika error
        setTimeout(() => {
          navigate("/payment/cancel", { replace: true });
        }, 3000);
      }
    };

    // Jalankan redirect setelah komponen mount
    // Timeout kecil untuk memastikan UI ter-render
    const timer = setTimeout(processPaymentRedirect, 100);

    return () => clearTimeout(timer);
  }, [navigate, params]);

  // UI saat processing
  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-md w-full">
          <Loader className="h-16 w-16 text-[#F27F34] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Memproses Hasil Pembayaran
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Mohon tunggu sebentar, kami sedang memverifikasi pembayaran Anda...
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 bg-[#F27F34] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#E06B2A] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#B23501] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // UI saat error
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            Tidak dapat memproses hasil pembayaran. Anda akan dialihkan ke
            halaman pembatalan...
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/payment/cancel", { replace: true })}
              className="w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Kembali Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
