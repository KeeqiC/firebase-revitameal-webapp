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
import {
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Settings,
  Package,
  Image,
  DollarSign,
  Flame,
  Activity,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  List,
  Layers,
  ChefHat,
} from "lucide-react";

function AdminPage() {
  const { currentUser } = useAuth();
  const [menuItem, setMenuItem] = useState({
    name: "",
    calories: "",
    carbs: "",
    protein: "",
    fats: "",
    price: "",
    type: "menu-nasi",
    image_url: "",
    description: "",
    category: "",
    // Paket-specific fields
    isPackage: false,
    components: {},
    basePrice: "",
    priceRange: { min: "", max: "" },
  });
  const [menuData, setMenuData] = useState([]);
  const [componentData, setComponentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const adminUid = "x1QFpZjvvBfGLNugPfaXI3eF0zf1";

  const menuTypes = [
    {
      value: "menu-nasi",
      label: "Menu Nasi",
      color: "from-amber-500 to-orange-600",
    },
    {
      value: "lauk-utama",
      label: "Lauk Utama",
      color: "from-red-500 to-pink-600",
    },
    {
      value: "sayuran-sehat",
      label: "Sayuran Sehat",
      color: "from-green-500 to-emerald-600",
    },
    {
      value: "menu-spesial",
      label: "Menu Spesial & Hajatan",
      color: "from-purple-500 to-violet-600",
    },
    {
      value: "tambahan",
      label: "Minuman & Tambahan",
      color: "from-blue-500 to-cyan-600",
    },
    {
      value: "snack-box",
      label: "Snack Box Sehat",
      color: "from-indigo-500 to-blue-600",
    },
    {
      value: "paket",
      label: "Paket Campuran",
      color: "from-pink-500 to-rose-600",
    },
    {
      value: "komponen",
      label: "Komponen Individual",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const componentCategories = [
    "nasi",
    "protein",
    "sayur",
    "buah",
    "lauk-tambahan",
    "snack",
    "minuman",
  ];

  useEffect(() => {
    if (currentUser?.uid !== adminUid) return;

    const q = query(collection(db, "lunchBoostMen"), orderBy("type", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(menu);
      setFilteredData(menu);

      // Separate components for package building
      const components = menu.filter((item) => item.type === "komponen");
      setComponentData(components);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = menuData;

    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [menuData, searchTerm, filterType]);

  // Image preview functionality
  useEffect(() => {
    if (menuItem.image_url && menuItem.image_url.startsWith("http")) {
      setPreviewImage(menuItem.image_url);
    } else {
      setPreviewImage("");
    }
  }, [menuItem.image_url]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    if (inputType === "checkbox") {
      setMenuItem((prev) => ({ ...prev, [name]: checked }));

      // Reset package-specific fields when switching modes
      if (name === "isPackage") {
        if (checked) {
          setMenuItem((prev) => ({
            ...prev,
            components: {},
            calories: "",
            protein: "",
            carbs: "",
            fats: "",
          }));
        } else {
          setMenuItem((prev) => ({
            ...prev,
            components: {},
            basePrice: "",
            priceRange: { min: "", max: "" },
          }));
        }
      }
    } else {
      setMenuItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleComponentChange = (category, field, value) => {
    setMenuItem((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [category]: {
          ...prev.components[category],
          [field]: value,
        },
      },
    }));
  };

  const addComponentOption = (category, componentId) => {
    const component = componentData.find((c) => c.id === componentId);
    if (!component) return;

    setMenuItem((prev) => {
      const currentOptions = prev.components[category]?.options || [];
      if (currentOptions.includes(componentId)) return prev;

      return {
        ...prev,
        components: {
          ...prev.components,
          [category]: {
            ...prev.components[category],
            options: [...currentOptions, componentId],
          },
        },
      };
    });
  };

  const removeComponentOption = (category, componentId) => {
    setMenuItem((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [category]: {
          ...prev.components[category],
          options:
            prev.components[category]?.options?.filter(
              (id) => id !== componentId
            ) || [],
        },
      },
    }));
  };

  const handleEdit = (menu) => {
    setEditingItem(menu.id);
    setMenuItem({
      name: menu.name || "",
      calories: menu.calories || "",
      carbs: menu.carbs || "",
      protein: menu.protein || "",
      fats: menu.fats || "",
      price: menu.price || "",
      type: menu.type || "menu-nasi",
      image_url: menu.image_url || "",
      description: menu.description || "",
      category: menu.category || "",
      isPackage: menu.type === "paket" && menu.components,
      components: menu.components || {},
      basePrice: menu.basePrice || "",
      priceRange: menu.priceRange || { min: "", max: "" },
    });
    setShowForm(true);
  };

  const handleDelete = async (menuId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await deleteDoc(doc(db, "lunchBoostMen", menuId));
        showMessage("Item berhasil dihapus!", "success");
      } catch (error) {
        console.error("Gagal menghapus item:", error);
        showMessage("Gagal menghapus item. Silakan coba lagi.", "error");
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
      description: "",
      category: "",
      isPackage: false,
      components: {},
      basePrice: "",
      priceRange: { min: "", max: "" },
    });
    setShowForm(false);
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let newMenuItem;

    if (menuItem.isPackage && menuItem.type === "paket") {
      // Package item
      newMenuItem = {
        name: menuItem.name.trim(),
        type: "paket",
        price: parseInt(menuItem.price) || 0,
        basePrice:
          parseInt(menuItem.basePrice) || parseInt(menuItem.price) || 0,
        priceRange: {
          min:
            parseInt(menuItem.priceRange.min) || parseInt(menuItem.price) || 0,
          max:
            parseInt(menuItem.priceRange.max) || parseInt(menuItem.price) || 0,
        },
        description: menuItem.description.trim() || "",
        image_url: menuItem.image_url || "",
        components: menuItem.components,
        // Package nutrition will be calculated dynamically
        isPackage: true,
      };
    } else {
      // Regular item or component
      newMenuItem = {
        name: menuItem.name.trim(),
        type: menuItem.type,
        price: parseInt(menuItem.price) || 0,
        calories: parseInt(menuItem.calories) || 0,
        carbs: parseFloat(menuItem.carbs) || 0,
        protein: parseFloat(menuItem.protein) || 0,
        fats: parseFloat(menuItem.fats) || 0,
        description: menuItem.description.trim() || "",
        image_url: menuItem.image_url || "",
        category: menuItem.type === "komponen" ? menuItem.category : undefined,
      };
    }

    try {
      if (editingItem) {
        await updateDoc(doc(db, "lunchBoostMen", editingItem), newMenuItem);
        showMessage("Item berhasil diperbarui!", "success");
      } else {
        await addDoc(collection(db, "lunchBoostMen"), newMenuItem);
        showMessage("Item berhasil ditambahkan!", "success");
      }
      handleReset();
    } catch (error) {
      console.error("Gagal menyimpan item:", error);
      showMessage("Gagal menyimpan item. Silakan coba lagi.", "error");
    }
    setLoading(false);
  };

  const getTypeInfo = (type) => {
    return menuTypes.find((t) => t.value === type) || menuTypes[0];
  };

  const getComponentById = (id) => {
    return componentData.find((c) => c.id === id);
  };

  if (currentUser?.uid !== adminUid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/10 via-pink-500/10 to-red-600/20 flex justify-center items-center">
        <div className="text-center bg-white/80 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-2xl max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600">
            Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const packageCount = menuData.filter((item) => item.type === "paket").length;
  const componentCount = componentData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Revitameal Admin Panel
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Menu
            </span>{" "}
            Management
          </h1>
          <p className="text-xl text-gray-600">
            Kelola menu, paket, dan komponen makanan Revitameal
          </p>
        </header>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl shadow-xl flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Enhanced Stats */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Items
                </p>
                <p className="text-3xl font-black text-gray-800">
                  {menuData.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-[#B23501]" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Paket</p>
                <p className="text-3xl font-black text-gray-800">
                  {packageCount}
                </p>
              </div>
              <Layers className="h-8 w-8 text-pink-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Komponen</p>
                <p className="text-3xl font-black text-gray-800">
                  {componentCount}
                </p>
              </div>
              <List className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Menu Nasi</p>
                <p className="text-3xl font-black text-gray-800">
                  {menuData.filter((item) => item.type === "menu-nasi").length}
                </p>
              </div>
              <ChefHat className="h-8 w-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Snack Box</p>
                <p className="text-3xl font-black text-gray-800">
                  {menuData.filter((item) => item.type === "snack-box").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-3xl shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                {showForm ? (
                  <X className="h-4 w-4 relative z-10" />
                ) : (
                  <Plus className="h-4 w-4 relative z-10" />
                )}
                <span className="relative z-10">
                  {showForm ? "Tutup Form" : "Tambah Item"}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Semua Kategori</option>
                {menuTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Form Section */}
        {showForm && (
          <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Settings className="h-6 w-6 mr-3 text-[#B23501]" />
                {editingItem ? "Edit Item" : "Tambah Item Baru"}
              </h2>
              <Sparkles className="h-5 w-5 text-[#B23501]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nama Item *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={menuItem.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: Nasi + Ayam Goreng + Sayur + Pisang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kategori *
                  </label>
                  <select
                    name="type"
                    value={menuItem.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  >
                    {menuTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Toggle */}
                {menuItem.type === "paket" && (
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPackage"
                        checked={menuItem.isPackage}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Ini adalah paket dengan komponen yang bisa dipilih
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {menuItem.isPackage ? "Harga Dasar (Rp)" : "Harga (Rp)"} *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={menuItem.price}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="18000"
                      required
                    />
                  </div>
                </div>

                {menuItem.isPackage && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Harga Minimum (Rp)
                      </label>
                      <input
                        type="number"
                        value={menuItem.priceRange.min}
                        onChange={(e) =>
                          setMenuItem((prev) => ({
                            ...prev,
                            priceRange: {
                              ...prev.priceRange,
                              min: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Harga Maksimum (Rp)
                      </label>
                      <input
                        type="number"
                        value={menuItem.priceRange.max}
                        onChange={(e) =>
                          setMenuItem((prev) => ({
                            ...prev,
                            priceRange: {
                              ...prev.priceRange,
                              max: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="20000"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Image and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    URL Gambar
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      name="image_url"
                      value={menuItem.image_url}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="https://..."
                    />
                  </div>
                  {previewImage && (
                    <div className="mt-3">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        onError={() => setPreviewImage("")}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={menuItem.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Deskripsikan menu atau paket ini..."
                  />
                </div>
              </div>

              {/* Component Category for individual items */}
              {menuItem.type === "komponen" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kategori Komponen *
                  </label>
                  <select
                    name="category"
                    value={menuItem.category || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    required={menuItem.type === "komponen"}
                  >
                    <option value="">Pilih kategori komponen</option>
                    {componentCategories.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nutrition Info for non-packages */}
              {!menuItem.isPackage && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Kalori (kcal)
                    </label>
                    <div className="relative">
                      <Flame className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="calories"
                        value={menuItem.calories}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="350"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="protein"
                      value={menuItem.protein}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Karbohidrat (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="carbs"
                      value={menuItem.carbs}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="45"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Lemak (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="fats"
                      value={menuItem.fats}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="12"
                    />
                  </div>
                </div>
              )}

              {/* Package Component Builder */}
              {menuItem.isPackage && (
                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-[#B23501]" />
                      Komponen Paket
                    </h3>

                    {componentCategories.map((category) => (
                      <div
                        key={category}
                        className="mb-6 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-700 capitalize">
                            {category}
                          </h4>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={
                                  menuItem.components[category]?.required ||
                                  false
                                }
                                onChange={(e) =>
                                  handleComponentChange(
                                    category,
                                    "required",
                                    e.target.checked
                                  )
                                }
                                className="w-3 h-3 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34]"
                              />
                              <span>Wajib</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={
                                  menuItem.components[category]?.multiSelect ||
                                  false
                                }
                                onChange={(e) =>
                                  handleComponentChange(
                                    category,
                                    "multiSelect",
                                    e.target.checked
                                  )
                                }
                                className="w-3 h-3 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34]"
                              />
                              <span>Multi Pilih</span>
                            </label>
                          </div>
                        </div>

                        {/* Component Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">
                            Pilih Komponen:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {componentData
                              .filter((comp) => comp.category === category)
                              .map((comp) => (
                                <button
                                  key={comp.id}
                                  type="button"
                                  onClick={() => {
                                    const isSelected = menuItem.components[
                                      category
                                    ]?.options?.includes(comp.id);
                                    if (isSelected) {
                                      removeComponentOption(category, comp.id);
                                    } else {
                                      addComponentOption(category, comp.id);
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    menuItem.components[
                                      category
                                    ]?.options?.includes(comp.id)
                                      ? "bg-[#F27F34] text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  {comp.name}
                                </button>
                              ))}
                          </div>

                          {/* Selected Components Display */}
                          {menuItem.components[category]?.options?.length >
                            0 && (
                            <div className="mt-2 p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">
                                Komponen terpilih:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {menuItem.components[category].options.map(
                                  (optionId) => {
                                    const comp = getComponentById(optionId);
                                    return comp ? (
                                      <span
                                        key={optionId}
                                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                      >
                                        {comp.name}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeComponentOption(
                                              category,
                                              optionId
                                            )
                                          }
                                          className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ) : null;
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
                  ) : (
                    <Save className="h-5 w-5 relative z-10" />
                  )}
                  <span className="relative z-10">
                    {loading
                      ? "Menyimpan..."
                      : editingItem
                      ? "Update Item"
                      : "Simpan Item"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full bg-gray-300 text-gray-800 font-bold shadow-lg hover:shadow-xl hover:bg-gray-400 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Menu List */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="h-6 w-6 mr-3 text-[#B23501]" />
              Daftar Menu & Komponen
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {filteredData.length} dari {menuData.length} item
            </span>
          </div>

          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((menu) => {
                const typeInfo = getTypeInfo(menu.type);
                const isPackage = menu.type === "paket" && menu.components;

                return (
                  <div
                    key={menu.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-20 h-20 bg-gradient-to-r ${
                            typeInfo.color
                          } rounded-xl flex items-center justify-center ${
                            menu.image_url ? "hidden" : "flex"
                          }`}
                        >
                          {isPackage ? (
                            <Layers className="h-8 w-8 text-white" />
                          ) : (
                            <Package className="h-8 w-8 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {menu.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-1">
                              <span
                                className={`px-2 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${typeInfo.color}`}
                              >
                                {typeInfo.label}
                              </span>
                              {isPackage && (
                                <span className="px-2 py-1 text-xs font-bold text-purple-800 bg-purple-100 rounded-full">
                                  PAKET
                                </span>
                              )}
                              <span className="text-sm font-bold text-green-600">
                                {isPackage && menu.priceRange
                                  ? `Rp ${menu.priceRange.min?.toLocaleString(
                                      "id-ID"
                                    )} - ${menu.priceRange.max?.toLocaleString(
                                      "id-ID"
                                    )}`
                                  : `Rp ${menu.price?.toLocaleString("id-ID")}`}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleEdit(menu)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                              title="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                              title="Hapus item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {menu.description && (
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                            {menu.description}
                          </p>
                        )}

                        {/* Package Components or Nutrition Info */}
                        {isPackage ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              Komponen Paket:
                            </p>
                            <div className="space-y-1">
                              {Object.entries(menu.components || {}).map(
                                ([category, config]) =>
                                  config.options?.length > 0 && (
                                    <div
                                      key={category}
                                      className="flex items-center space-x-2 text-xs"
                                    >
                                      <span className="font-medium text-gray-700 capitalize min-w-16">
                                        {category}:
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {config.options
                                          .slice(0, 3)
                                          .map((optionId) => {
                                            const comp =
                                              getComponentById(optionId);
                                            return comp ? (
                                              <span
                                                key={optionId}
                                                className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                              >
                                                {comp.name}
                                              </span>
                                            ) : null;
                                          })}
                                        {config.options.length > 3 && (
                                          <span className="text-gray-400">
                                            +{config.options.length - 3} lainnya
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        ) : menu.type !== "komponen" ? (
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span>{menu.calories || 0} kcal</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3 text-blue-500" />
                              <span>{menu.protein || 0}g protein</span>
                            </div>
                            <div className="text-gray-500">
                              <span>{menu.carbs || 0}g karbo</span>
                            </div>
                            <div className="text-gray-500">
                              <span>{menu.fats || 0}g lemak</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Kategori: </span>
                            <span className="capitalize">
                              {menu.category || "Tidak dikategorikan"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {searchTerm || filterType !== "all"
                  ? "Tidak Ada Item Ditemukan"
                  : "Belum Ada Item"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== "all"
                  ? "Coba ubah kata kunci pencarian atau filter kategori."
                  : "Mulai tambahkan menu dan komponen untuk membangun sistem Revitameal."}
              </p>
              {(searchTerm || filterType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </section>

        {/* Tips Section */}
        <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Tips Revitameal Admin</h3>
          </div>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>
              • <strong>Komponen Individual:</strong> Buat semua bahan makanan
              sebagai komponen terlebih dahulu dengan kategori yang tepat
            </li>
            <li>
              • <strong>Paket Campuran:</strong> Gunakan mode paket untuk menu
              dengan pilihan komponen (seperti pilihan sayur)
            </li>
            <li>
              • <strong>Harga Range:</strong> Set rentang harga untuk paket yang
              bervariasi tergantung pilihan komponen
            </li>
            <li>
              • <strong>Nutrisi Otomatis:</strong> Nutrisi paket akan dihitung
              otomatis berdasarkan komponen yang dipilih customer
            </li>
            <li>
              • <strong>Konsistensi Data:</strong> Pastikan data nutrisi
              komponen akurat untuk kalkulasi paket yang benar
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AdminPage;
