import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowRight, RefreshCw, Home } from "lucide-react";

/**
 * PaymentCancel Component
 * 
 * Halaman ini akan ditampilkan ketika:
 * 1. User klik tombol "Cancel" atau "X" di DOKU Checkout Page
 * 2. User menutup DOKU Checkout Page tanpa complete payment
 * 
 * URL: https://revitameal-82d2e.web.app/payment/cancel?order_id=xxx
 */
function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get("order_id") || searchParams.get("invoice_number");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <XCircle className="h-12 w-12 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Pembayaran Dibatalkan
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-lg mb-6">
            Anda membatalkan proses pembayaran. Pesanan Anda belum diproses.
          </p>

          {/* Order ID if available */}
          {orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
              <div className="text-sm">
                <span className="text-gray-600">Order ID: </span>
                <span className="font-mono font-semibold text-gray-800">
                  {orderId}
                </span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-yellow-600" />
              Apa yang bisa Anda lakukan?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Coba lagi dengan metode pembayaran yang berbeda</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Periksa kembali detail pesanan Anda</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Pastikan saldo atau limit kartu Anda mencukupi</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Hubungi customer service jika butuh bantuan</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Primary CTA: Try Again */}
            <button
              onClick={() => navigate("/dashboard/lunch-boost")}
              className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <RefreshCw className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Pesan Lagi</span>
            </button>

            {/* Secondary CTA: Back to Home */}
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Kembali ke Dashboard</span>
            </button>
          </div>

          {/* View Order History Link */}
          {orderId && (
            <button
              onClick={() => navigate("/dashboard/order-history")}
              className="mt-6 text-[#B23501] hover:text-[#F27F34] font-medium text-sm flex items-center justify-center space-x-2 mx-auto transition-colors"
            >
              <span>Lihat Riwayat Pesanan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-8">
            Butuh bantuan? Hubungi customer service kami di{" "}
            <a 
              href="mailto:support@revitameal.com" 
              className="text-[#B23501] hover:underline"
            >
              support@revitameal.com
            </a>
            {" "}atau WhatsApp{" "}
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B23501] hover:underline"
            >
              081234567890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;

/**
 * 💡 TIPS IMPLEMENTASI:
 * 
 * 1. Update callback_url_cancel di Checkout.jsx:
 *    ```javascript
 *    callback_url_cancel: `${window.location.origin}/payment/cancel`
 *    ```
 * 
 * 2. Optional: Track cancellation di Analytics
 *    ```javascript
 *    useEffect(() => {
 *      // Google Analytics
 *      gtag('event', 'payment_cancelled', {
 *        order_id: orderId,
 *        page_path: '/payment/cancel'
 *      });
 *    }, [orderId]);
 *    ```
 * 
 * 3. Optional: Update order status di Firebase ke "cancelled"
 *    (Tapi biasanya ini di-handle lewat webhook dari DOKU)
 * 
 * 4. Customization Ideas:
 *    - Tambahkan survey: "Kenapa Anda membatalkan?"
 *    - Offer discount/promo untuk encourage re-order
 *    - Show alternative payment methods
 *    - Live chat support button
 */