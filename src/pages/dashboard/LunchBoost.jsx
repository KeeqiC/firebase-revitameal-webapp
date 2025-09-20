import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Perubahan: Ditambahkan untuk navigasi
import { ShoppingCart, X, CheckCircle } from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

function LunchBoost() {
  const navigate = useNavigate(); // Perubahan: Inisialisasi hook navigasi
  const { currentUser } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    if (!currentUser) return; // Notifikasi pembayaran akan ditangani oleh webhook.

    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "paid") {
          setMessage("Pembayaran berhasil 🎉");
          setIsSuccess(true);
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    let menuQuery;
    if (selectedCategory === "semua") {
      menuQuery = query(collection(db, "lunchBoostMen"), orderBy("name"));
    } else {
      menuQuery = query(
        collection(db, "lunchBoostMen"),
        where("type", "==", selectedCategory),
        orderBy("name")
      );
    }

    const unsubscribe = onSnapshot(
      menuQuery,
      (snapshot) => {
        const menu = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuData(menu);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching menu:", error);
        setLoading(false);
        setMessage("Gagal memuat menu.");
        setIsSuccess(false);
      }
    );

    return () => unsubscribe();
  }, [selectedCategory]);

  const categoryLabels = {
    "menu-nasi": "Menu Nasi",
    "lauk-utama": "Lauk Utama",
    "sayuran-sehat": "Sayuran Sehat",
    paket: "Paket Campuran Lengkap",
    "menu-spesial": "Menu Spesial & Hajatan",
    tambahan: "Minuman & Tambahan",
    "snack-box": "Snack Box Sehat",
  };

  const addToCart = (menu) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === menu.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...menu, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (menuId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== menuId));
  };

  const updateQuantity = (menuId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === menuId ? { ...item, quantity: newQuantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setMessage("Keranjang belanja kosong.");
      setIsSuccess(false);
      return;
    }
    // Alihkan ke halaman checkout dan kirim data keranjang
    navigate('/dashboard/checkout', { state: { items: cartItems } }); 
  };


  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Memuat menu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white font-semibold flex items-center space-x-2 transition-transform duration-300 ${
            isSuccess ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isSuccess ? <CheckCircle /> : <X />}
          <span>{message}</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Lunch Boost
          </h1>
          <p className="text-gray-600">
            Pilih menu sehat dan lezat yang sesuai dengan preferensi diet Anda.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#B23501] text-white py-2 px-4 rounded-full font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center space-x-2"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>({cartItems.length})</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory("semua")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
            selectedCategory === "semua"
              ? "bg-[#B23501] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Semua Kategori
        </button>
        {Object.keys(categoryLabels).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
              selectedCategory === category
                ? "bg-[#B23501] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {selectedCategory === "semua"
            ? "Semua Menu"
            : categoryLabels[selectedCategory] || selectedCategory}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuData.length === 0 ? (
            <p className="text-gray-500">Tidak ada menu di kategori ini.</p>
          ) : (
            menuData.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
              >
                {menu.items ? (
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {menu.name}
                    </h3>
                    <ul className="mb-4 text-gray-600 text-sm space-y-1">
                      {menu.items?.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-[#34B26A]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-lg">
                        Rp{menu.price.toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() => addToCart(menu)}
                        className="bg-[#B23501] text-white py-2 px-4 rounded-full font-semibold hover:bg-[#F9A03F] transition-colors duration-200"
                      >
                        + Pesan
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative h-48">
                      <img
                        src={menu.image_url}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {menu.name}
                      </h3>
                      <span className="text-sm font-semibold text-[#34B26A]">
                        {menu.calories} kcal
                      </span>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-lg">
                          Rp{menu.price.toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => addToCart(menu)}
                          className="bg-[#B23501] text-white py-2 px-4 rounded-full font-semibold hover:bg-[#F9A03F] transition-colors duration-200"
                        >
                          + Pesan
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Keranjang Belanja
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 transition"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Keranjang kosong. Yuk pilih menu dulu 🍽️
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image_url || "/placeholder.png"}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rp{item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="border-t p-6 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#B23501]">
                    Rp{cartTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={handleCheckout} // Memanggil fungsi checkout yang baru
                  className="w-full bg-[#B23501] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#F9A03F] transition-colors"
                >
                  Checkout Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LunchBoost;
