// src/pages/dashboard/LunchBoost.jsx
import { useState } from "react";
import { ShoppingCart, X, Heart } from "lucide-react";

// Data dummy untuk menu
const menuData = [
  {
    id: 1,
    name: "Salad Ayam Panggang",
    description: "Salad segar dengan potongan ayam panggang protein tinggi.",
    calories: 350,
    price: 45000,
    category: ["low-carb", "protein", "diet"],
    image: "https://via.placeholder.com/400x300.png?text=Salad+Ayam",
    options: ["tanpa saus", "dengan keju feta"],
  },
  {
    id: 2,
    name: "Salmon Panggang Keto",
    description: "Ikan salmon panggang dengan sayuran, cocok untuk diet keto.",
    calories: 480,
    price: 50000,
    category: ["keto", "low-carb", "protein"],
    image: "https://via.placeholder.com/400x300.png?text=Salmon+Keto",
    options: ["tambahan lemon", "saus pedas"],
  },
  {
    id: 3,
    name: "Tofu Kari Vegetarian",
    description: "Tahu lembut dimasak dengan bumbu kari kaya rempah.",
    calories: 420,
    price: 40000,
    category: ["vegetarian", "low-carb"],
    image: "https://via.placeholder.com/400x300.png?text=Tofu+Kari",
    options: ["tanpa nasi", "dengan nasi merah"],
  },
];

function LunchBoost() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMenu = menuData.filter((menu) =>
    selectedCategory === "all" ? true : menu.category.includes(selectedCategory)
  );

  const addToCart = (menu) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === menu.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...menu, quantity: 1, customization: "" }];
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

  const updateCustomization = (menuId, newCustomization) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === menuId ? { ...item, customization: newCustomization } : item
      )
    );
  };

  const handleCheckout = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let message = "Halo Revitameal, saya ingin memesan:\n\n";

    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.calories} kcal)\n`;
      message += `   Jumlah: ${item.quantity} x Rp${item.price.toLocaleString(
        "id-ID"
      )}\n`;
      if (item.customization) {
        message += `   Kustomisasi: ${item.customization}\n`;
      }
    });

    message += `\nTotal: Rp${total.toLocaleString("id-ID")}\n\n`;
    message += "Mohon konfirmasi pesanan saya. Terima kasih!";

    const whatsappUrl = `https://wa.me/+6285123099276?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
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

      {/* Filter Kategori */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["all", "low-carb", "keto", "vegetarian", "protein"].map(
          (category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold capitalize transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-[#F27F34] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category === "all" ? "Semua Menu" : category}
            </button>
          )
        )}
      </div>

      {/* Daftar Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {menu.name}
                  </h3>
                  <span className="text-sm font-semibold text-[#34B26A]">
                    {menu.calories} kcal
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4 flex-1">
                  {menu.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {menu.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 text-xs font-semibold text-[#B23501] bg-[#F27F34]/20 rounded-full capitalize"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => addToCart(menu)}
                    className="w-full bg-[#B23501] text-white py-2 rounded-full font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Pesan Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">
            Tidak ada menu yang sesuai dengan filter Anda.
          </div>
        )}
      </div>

      {/* Modal Keranjang */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Keranjang Belanja
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500">
                Keranjang Anda kosong.
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Rp{item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                          }
                          className="w-16 px-2 py-1 text-center border rounded-lg"
                        />
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-bold text-gray-800 text-right">
                    Total: Rp{cartTotal.toLocaleString("id-ID")}
                  </h3>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#34B26A] text-white py-3 rounded-full font-semibold hover:bg-green-700 transition-colors duration-200"
                  >
                    Lanjutkan ke WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LunchBoost;
