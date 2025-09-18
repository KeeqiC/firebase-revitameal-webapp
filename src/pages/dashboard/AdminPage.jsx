import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Edit, Trash2 } from "lucide-react";

function AdminPage() {
  const { currentUser } = useAuth();
  const [menuItem, setMenuItem] = useState({
    name: "",
    calories: "",
    carbs: "",
    protein: "",
    fats: "",
    price: "",
    type: "menu-nasi", // default kategori
    image_url: "",
    items: "",
  });
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const adminUid = "x1QFpZjvvBfGLNugPfaXI3eF0zf1";

  useEffect(() => {
    if (currentUser?.uid !== adminUid) return;

    const q = query(collection(db, "lunchBoostMen"), orderBy("type", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(menu);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (menu) => {
    setEditingItem(menu.id);
    setMenuItem({
      name: menu.name,
      calories: menu.calories || "",
      carbs: menu.carbs || "",
      protein: menu.protein || "",
      fats: menu.fats || "",
      price: menu.price || "",
      type: menu.type || "menu-nasi",
      image_url: menu.image_url || "",
      items: menu.items ? menu.items.join(", ") : "",
    });
  };

  const handleDelete = async (menuId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      try {
        await deleteDoc(doc(db, "lunchBoostMen", menuId));
        setMessage("Menu berhasil dihapus!");
      } catch (error) {
        console.error("Gagal menghapus menu:", error);
        setMessage("Gagal menghapus menu. Silakan coba lagi.");
      }
    }
  };

  const handleReset = () => {
    setEditingItem(null);
    setMenuItem({
      name: "",
      calories: "",
      carbs: "",
      protein: "",
      fats: "",
      price: "",
      type: "menu-nasi",
      image_url: "",
      items: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const newMenuItem = {
      ...menuItem,
      calories: parseInt(menuItem.calories) || 0,
      carbs: parseFloat(menuItem.carbs) || 0,
      protein: parseFloat(menuItem.protein) || 0,
      fats: parseFloat(menuItem.fats) || 0,
      price: parseInt(menuItem.price) || 0,
      type: menuItem.type,
      items:
        menuItem.type === "paket"
          ? menuItem.items
              .split(",")
              .map((item) => item.trim())
              .filter((i) => i !== "")
          : null,
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, "lunchBoostMen", editingItem), newMenuItem);
        setMessage("Menu berhasil diperbarui!");
        setEditingItem(null);
      } else {
        await addDoc(collection(db, "lunchBoostMen"), newMenuItem);
        setMessage("Menu berhasil ditambahkan!");
      }
      handleReset();
    } catch (error) {
      console.error("Gagal menyimpan menu:", error);
      setMessage("Gagal menyimpan menu. Silakan coba lagi.");
    }
    setLoading(false);
  };

  if (currentUser?.uid !== adminUid) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] p-6 text-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="text-xl font-semibold">Akses Ditolak.</p>
          <p className="text-gray-600 mt-2">
            Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        Halaman Admin - Kelola Menu
      </h1>

      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            message.includes("Gagal")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Grid form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Nama Menu */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nama Menu
          </label>
          <input
            type="text"
            name="name"
            value={menuItem.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Harga */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Harga (Rp)
          </label>
          <input
            type="number"
            name="price"
            value={menuItem.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Kalori */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kalori (kcal)
          </label>
          <input
            type="number"
            name="calories"
            value={menuItem.calories}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={menuItem.type === "paket"}
          />
        </div>

        {/* Protein */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Protein (g)
          </label>
          <input
            type="number"
            name="protein"
            value={menuItem.protein}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={menuItem.type === "paket"}
          />
        </div>

        {/* Karbohidrat */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Karbohidrat (g)
          </label>
          <input
            type="number"
            name="carbs"
            value={menuItem.carbs}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={menuItem.type === "paket"}
          />
        </div>

        {/* Lemak */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Lemak (g)
          </label>
          <input
            type="number"
            name="fats"
            value={menuItem.fats}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={menuItem.type === "paket"}
          />
        </div>

        {/* Tipe Menu */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tipe Menu
          </label>
          <select
            name="type"
            value={menuItem.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="menu-nasi">Menu Nasi</option>
            <option value="lauk-utama">Lauk Utama</option>
            <option value="sayuran-sehat">Sayuran Sehat</option>
            <option value="menu-spesial">Menu Spesial & Hajatan</option>
            <option value="tambahan">Minuman & Tambahan</option>
            <option value="snack-box">Snack Box Sehat</option>
            <option value="paket">Paket Campuran</option>
          </select>
        </div>

        {/* URL Gambar */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            URL Gambar
          </label>
          <input
            type="url"
            name="image_url"
            value={menuItem.image_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://..."
          />
        </div>

        {/* Kalau paket → isi items */}
        {menuItem.type === "paket" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Isi Paket (pisahkan dengan koma)
            </label>
            <textarea
              name="items"
              value={menuItem.items}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Contoh: Nasi Putih, Ayam Bakar, Sayur Asem, Buah"
              rows="3"
            ></textarea>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="md:col-span-2 flex space-x-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-green-500 text-white font-semibold shadow-md hover:bg-green-600 disabled:opacity-50"
          >
            {editingItem ? "Perbarui Menu" : "Simpan Menu"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 rounded-lg bg-gray-300 text-gray-800 font-semibold shadow-md hover:bg-gray-400"
          >
            Reset Form
          </button>
        </div>
      </form>

      {/* Daftar menu */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Daftar Menu Saat Ini
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {menuData.length > 0 ? (
            <ul className="space-y-4">
              {menuData.map((menu) => (
                <li
                  key={menu.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gray-50 shadow-sm"
                >
                  {/* Kiri: Gambar + Info */}
                  <div className="flex items-start space-x-4">
                    {menu.image_url ? (
                      <img
                        src={menu.image_url}
                        alt={menu.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                        No Img
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{menu.name}</p>
                      <p className="text-sm text-gray-500">
                        Rp{menu.price?.toLocaleString("id-ID")}
                      </p>

                      {/* Kalau bukan paket → tampilkan nutrisi */}
                      {menu.type !== "paket" && (
                        <p className="text-xs text-gray-600 mt-1">
                          {menu.calories} kcal | {menu.protein}g protein |{" "}
                          {menu.carbs}g karbo | {menu.fats}g lemak
                        </p>
                      )}

                      {/* Kalau paket → tampilkan isi paket */}
                      {menu.type === "paket" && (
                        <ul className="text-xs text-gray-600 mt-2 list-disc ml-4">
                          {menu.items?.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Kanan: Tombol */}
                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="flex items-center px-4 py-2 rounded-full bg-yellow-400 text-white hover:bg-yellow-500"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="flex items-center px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Belum ada menu yang ditambahkan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
