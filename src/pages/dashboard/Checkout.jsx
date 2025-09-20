// src/pages/Checkout.jsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Ambil data keranjang dari state navigasi, atau array kosong jika tidak ada
  const [cartItems, setCartItems] = useState(location.state?.items || []);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(true);

  // Efek ini akan berjalan saat komponen pertama kali dimuat.
  // Jika pengguna masuk ke halaman ini tanpa membawa data (misal, refresh),
  // atau keranjangnya kosong, mereka akan dikembalikan ke halaman menu.
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      console.log("Keranjang kosong, kembali ke menu.");
      navigate("/lunch-boost"); // Ganti '/lunch-boost' dengan path halaman menu Anda
    }
  }, [cartItems, navigate]);

  // Pindahkan logika pembayaran ke sini
  const handlePayment = async () => {
    setIsLoading(true);
    setMessage(null);

    const orderDetails = {
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      status: "pending",
      createdAt: serverTimestamp(),
      userId: currentUser?.uid || "anon",
    };

    try {
      const orderRef = await addDoc(collection(db, "orders"), orderDetails);
      const orderId = orderRef.id;

      const response = await fetch("/api/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // BENAR: Buat objek transaction_details dan gunakan snake_case
          transaction_details: {
            order_id: orderId, // order_id ini akan ditimpa oleh backend, tapi tidak apa-apa
          },
          gross_amount: orderDetails.total,
          // BENAR: Gunakan snake_case
          customer_details: {
            first_name: currentUser?.displayName || "Anonymous User",
            email: currentUser?.email || "user@email.com",
            phone: "081234567890",
          },
          // BENAR: Gunakan snake_case
          item_details: orderDetails.items.map((item) => ({
            id: item.name.replace(/\s+/g, "-").toLowerCase(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal membuat transaksi.");
      }

      const data = await response.json();
      const snapToken = data.snapToken;

      if (window.snap && snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: (result) => {
            console.log("Pembayaran sukses:", result);
            setMessage("Pembayaran berhasil! 🎉");
            setIsSuccess(true);
            setIsLoading(false);
            // Kosongkan keranjang setelah berhasil & arahkan ke halaman status
            setCartItems([]);
            setTimeout(() => navigate("/order-status"), 3000); // Contoh: Arahkan setelah 3 detik
          },
          onPending: (result) => {
            console.log("Pembayaran pending:", result);
            setMessage("Menunggu pembayaran Anda.");
            setIsSuccess(true);
            setIsLoading(false);
          },
          onError: (result) => {
            console.error("Pembayaran gagal:", result);
            setMessage("Pembayaran gagal. Silakan coba lagi.");
            setIsSuccess(false);
            setIsLoading(false);
          },
          onClose: () => {
            console.log("Popup pembayaran ditutup.");
            setIsLoading(false);
          },
        });
      } else {
        throw new Error("Snap.js tidak termuat atau token tidak ada.");
      }
    } catch (error) {
      console.error("Error saat pembayaran:", error);
      setMessage(`Gagal memproses pembayaran: ${error.message}`);
      setIsSuccess(false);
      setIsLoading(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white font-semibold flex items-center space-x-2 ${
            isSuccess ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isSuccess ? <CheckCircle /> : <X />}
          <span>{message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center mb-6">
          <Link
            to="/lunch-boost"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Ringkasan Pesanan
          </h1>
        </div>

        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b pb-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image_url || "/placeholder.png"}
                  alt={item.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div>
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-gray-500">
                    {item.quantity} x Rp{item.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <p className="font-bold text-lg">
                Rp{(item.quantity * item.price).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold">Total Pembayaran</span>
            <span className="text-3xl font-bold text-[#B23501]">
              Rp{cartTotal.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-[#B23501] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#F9A03F] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
