import { useState, useEffect } from "react";
// Impor db dari file pusat Firebase
import { db } from "../../firebase"; // Pastikan path ini benar sesuai struktur proyek Anda

import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
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
  Database,
  Coffee,
  Utensils,
  Tag,
  Soup,
  Egg,
  Salad,
  Apple,
} from "lucide-react";

function AdminPage() {
  // State for Ingredient Database
  const [ingredient, setIngredient] = useState({
    name: "",
    calories: "",
    carbs: "",
    protein: "",
    fats: "",
    weight: "",
    unit: "gr",
    category: "",
    image_url: "",
    description: "",
  });

  // State for Menu Templates
  const [menuTemplate, setMenuTemplate] = useState({
    name: "",
    type: "paket-campuran",
    basePrice: "",
    priceRange: { min: "", max: "" },
    image_url: "",
    description: "",
    components: {},
    dietOptions: {
      lowCarb: false,
      highProtein: false,
      vegetarian: false,
      keto: false,
    },
    dietPriceAdd: { min: 2000, max: 5000 },
  });

  const [ingredientsData, setIngredientsData] = useState([]);
  const [menuTemplatesData, setMenuTemplatesData] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ingredients"); // ingredients, templates
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Categories for Ingredient Database
  const ingredientCategories = [
    {
      value: "nasi",
      label: "Nasi & Karbohidrat",
      color: "from-amber-500 to-orange-600",
      icon: Soup,
    },
    {
      value: "protein-hewani",
      label: "Protein Hewani",
      color: "from-red-500 to-pink-600",
      icon: Egg,
    },
    {
      value: "protein-nabati",
      label: "Protein Nabati",
      color: "from-lime-500 to-green-600",
      icon: ChefHat,
    },
    {
      value: "sayuran",
      label: "Sayuran",
      color: "from-green-500 to-emerald-600",
      icon: Salad,
    },
    {
      value: "buah",
      label: "Buah-buahan",
      color: "from-yellow-400 to-orange-500",
      icon: Apple,
    },
    {
      value: "snack",
      label: "Snack",
      color: "from-purple-500 to-violet-600",
      icon: Coffee,
    },
    {
      value: "minuman",
      label: "Minuman",
      color: "from-blue-500 to-cyan-600",
      icon: Utensils,
    },
  ];

  // Templates for Menu Database
  const menuTemplateTypes = [
    {
      value: "paket-campuran",
      label: "Paket Campuran Lengkap",
      color: "from-pink-500 to-rose-600",
    },
    {
      value: "snack-box",
      label: "Snack Box",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  const unitOptions = ["gr", "ml", "buah", "potong", "sendok"];

  useEffect(() => {
    // Load Ingredient Database
    const ingredientsQuery = query(
      collection(db, "revitameal_ingredients"),
      orderBy("category", "asc")
    );
    const unsubscribeIngredients = onSnapshot(ingredientsQuery, (snapshot) => {
      const ingredients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredientsData(ingredients);
      setFilteredIngredients(ingredients);
    });

    // Load Menu Templates Database
    const templatesQuery = query(
      collection(db, "revitameal_menu_templates"),
      orderBy("type", "asc")
    );
    const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuTemplatesData(templates);
      setFilteredTemplates(templates);
    });

    return () => {
      unsubscribeIngredients();
      unsubscribeTemplates();
    };
  }, []); // Dependency array kosong

  // Filter functionality
  useEffect(() => {
    if (activeTab === "ingredients") {
      let filtered = ingredientsData;
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredIngredients(filtered);
    } else {
      let filtered = menuTemplatesData;
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredTemplates(filtered);
    }
  }, [ingredientsData, menuTemplatesData, searchTerm, activeTab]);

  // Image preview
  useEffect(() => {
    const imageUrl =
      activeTab === "ingredients"
        ? ingredient.image_url
        : menuTemplate.image_url;
    if (imageUrl && imageUrl.startsWith("http")) {
      setPreviewImage(imageUrl);
    } else {
      setPreviewImage("");
    }
  }, [ingredient.image_url, menuTemplate.image_url, activeTab]);

  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setIngredient((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    if (name.startsWith("dietOptions.")) {
      const optionName = name.split(".")[1];
      setMenuTemplate((prev) => ({
        ...prev,
        dietOptions: { ...prev.dietOptions, [optionName]: checked },
      }));
    } else if (name.startsWith("priceRange.")) {
      const field = name.split(".")[1];
      setMenuTemplate((prev) => ({
        ...prev,
        priceRange: { ...prev.priceRange, [field]: value },
      }));
    } else if (name.startsWith("dietPriceAdd.")) {
      const field = name.split(".")[1];
      setMenuTemplate((prev) => ({
        ...prev,
        dietPriceAdd: { ...prev.dietPriceAdd, [field]: parseInt(value) || 0 },
      }));
    } else {
      setMenuTemplate((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleComponentChange = (category, field, value) => {
    setMenuTemplate((prev) => ({
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

  const addComponentOption = (category, ingredientId) => {
    setMenuTemplate((prev) => {
      const currentOptions = prev.components[category]?.options || [];
      if (currentOptions.includes(ingredientId)) return prev;

      return {
        ...prev,
        components: {
          ...prev.components,
          [category]: {
            ...prev.components[category],
            options: [...currentOptions, ingredientId],
          },
        },
      };
    });
  };

  const removeComponentOption = (category, ingredientId) => {
    setMenuTemplate((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [category]: {
          ...prev.components[category],
          options:
            prev.components[category]?.options?.filter(
              (id) => id !== ingredientId
            ) || [],
        },
      },
    }));
  };

  const handleEditIngredient = (item) => {
    setEditingIngredient(item.id);
    setIngredient({
      name: item.name || "",
      calories: item.calories || "",
      carbs: item.carbs || "",
      protein: item.protein || "",
      fats: item.fats || "",
      weight: item.weight || "",
      unit: item.unit || "gr",
      category: item.category || "",
      image_url: item.image_url || "",
      description: item.description || "",
    });
    setShowForm(true);
  };

  const handleEditTemplate = (item) => {
    setEditingTemplate(item.id);
    setMenuTemplate({
      name: item.name || "",
      type: item.type || "paket-campuran",
      basePrice: item.basePrice || "",
      priceRange: item.priceRange || { min: "", max: "" },
      image_url: item.image_url || "",
      description: item.description || "",
      components: item.components || {},
      dietOptions: item.dietOptions || {
        lowCarb: false,
        highProtein: false,
        vegetarian: false,
        keto: false,
      },
      dietPriceAdd: item.dietPriceAdd || { min: 2000, max: 5000 },
    });
    setShowForm(true);
  };

  const handleDelete = async (id, type) => {
    const collectionName =
      type === "ingredient"
        ? "revitameal_ingredients"
        : "revitameal_menu_templates";
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        showMessage("Item berhasil dihapus!", "success");
      } catch (error) {
        console.error("Gagal menghapus item:", error);
        showMessage("Gagal menghapus item. Silakan coba lagi.", "error");
      }
    }
  };

  const handleReset = () => {
    setEditingIngredient(null);
    setEditingTemplate(null);
    setIngredient({
      name: "",
      calories: "",
      carbs: "",
      protein: "",
      fats: "",
      weight: "",
      unit: "gr",
      category: "",
      image_url: "",
      description: "",
    });
    setMenuTemplate({
      name: "",
      type: "paket-campuran",
      basePrice: "",
      priceRange: { min: "", max: "" },
      image_url: "",
      description: "",
      components: {},
      dietOptions: {
        lowCarb: false,
        highProtein: false,
        vegetarian: false,
        keto: false,
      },
      dietPriceAdd: { min: 2000, max: 5000 },
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

    try {
      if (activeTab === "ingredients") {
        const newIngredient = {
          name: ingredient.name.trim(),
          calories: parseInt(ingredient.calories) || 0,
          carbs: parseFloat(ingredient.carbs) || 0,
          protein: parseFloat(ingredient.protein) || 0,
          fats: parseFloat(ingredient.fats) || 0,
          weight: parseInt(ingredient.weight) || 0,
          unit: ingredient.unit,
          category: ingredient.category,
          image_url: ingredient.image_url || "",
          description: ingredient.description.trim() || "",
        };

        if (editingIngredient) {
          await updateDoc(
            doc(db, "revitameal_ingredients", editingIngredient),
            newIngredient
          );
          showMessage("Bahan berhasil diperbarui!", "success");
        } else {
          await addDoc(collection(db, "revitameal_ingredients"), newIngredient);
          showMessage("Bahan berhasil ditambahkan!", "success");
        }
      } else {
        // Logika baru untuk menghitung total nutrisi
        let baseIngredientIds = [];
        if (menuTemplate.components) {
          Object.entries(menuTemplate.components).forEach(
            ([category, config]) => {
              // Untuk sayuran di paket campuran, skip dari perhitungan base
              if (
                category === "sayuran" &&
                menuTemplate.type === "paket-campuran"
              ) {
                return; // Skip sayuran untuk paket campuran
              }

              // Tambahkan komponen lainnya
              if (config.options && Array.isArray(config.options)) {
                baseIngredientIds = [...baseIngredientIds, ...config.options];
              }
            }
          );
        }

        const totals = baseIngredientIds.reduce(
          (acc, id) => {
            const ingredient = ingredientsData.find((item) => item.id === id);
            if (ingredient) {
              acc.totalCalories += ingredient.calories || 0;
              acc.totalProtein += ingredient.protein || 0;
              acc.totalCarbs += ingredient.carbs || 0;
              acc.totalFats += ingredient.fats || 0;
            }
            return acc;
          },
          {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
          }
        );

        const newTemplate = {
          name: menuTemplate.name.trim(),
          type: menuTemplate.type,
          basePrice: parseInt(menuTemplate.basePrice) || 0,
          priceRange: {
            min:
              parseInt(menuTemplate.priceRange.min) ||
              parseInt(menuTemplate.basePrice) ||
              0,
            max:
              parseInt(menuTemplate.priceRange.max) ||
              parseInt(menuTemplate.basePrice) ||
              0,
          },
          image_url: menuTemplate.image_url || "",
          description: menuTemplate.description.trim() || "",
          components: menuTemplate.components,
          dietOptions: menuTemplate.dietOptions,
          dietPriceAdd: menuTemplate.dietPriceAdd,

          // Bulatkan hasil kalkulasi menjadi 1 angka desimal sebelum disimpan
          calories: Math.round(totals.totalCalories),
          protein: parseFloat(totals.totalProtein.toFixed(1)),
          carbs: parseFloat(totals.totalCarbs.toFixed(1)),
          fats: parseFloat(totals.totalFats.toFixed(1)),
        };

        if (editingTemplate) {
          await updateDoc(
            doc(db, "revitameal_menu_templates", editingTemplate),
            newTemplate
          );
          showMessage("Template menu berhasil diperbarui!", "success");
        } else {
          await addDoc(
            collection(db, "revitameal_menu_templates"),
            newTemplate
          );
          showMessage("Template menu berhasil ditambahkan!", "success");
        }
      }
      handleReset();
    } catch (error) {
      console.error("Gagal menyimpan item:", error);
      showMessage("Gagal menyimpan item. Silakan coba lagi.", "error");
    }
    setLoading(false);
  };

  const getCategoryInfo = (category, isTemplate = false) => {
    const categories = isTemplate ? menuTemplateTypes : ingredientCategories;
    return categories.find((c) => c.value === category) || categories[0] || {};
  };

  const getIngredientById = (id) => {
    return ingredientsData.find((item) => item.id === id);
  };

  // Custom Hook for Modal/Confirmation Logic
  const useModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({});
    const [onConfirm, setOnConfirm] = useState(null);

    const openModal = (content, onConfirmAction) => {
      setModalContent(content);
      setOnConfirm(() => onConfirmAction);
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const handleConfirm = () => {
      if (onConfirm) {
        onConfirm();
      }
      closeModal();
    };

    return { isModalOpen, modalContent, openModal, closeModal, handleConfirm };
  };

  const { isModalOpen, modalContent, openModal, closeModal, handleConfirm } =
    useModal();

  const handleDeletionWithModal = (id, type) => {
    openModal(
      {
        title: "Konfirmasi Penghapusan",
        message: "Apakah Anda yakin ingin menghapus item ini?",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      () => handleDelete(id, type)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-12">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
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
              Database
            </span>{" "}
            Management
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Kelola Database Bahan dan Template Menu Revitameal
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Database Bahan
                </p>
                <p className="text-3xl font-black text-gray-800">
                  {ingredientsData.length}
                </p>
              </div>
              <Database className="h-8 w-8 text-[#B23501]" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Template Menu
                </p>
                <p className="text-3xl font-black text-gray-800">
                  {menuTemplatesData.length}
                </p>
              </div>
              <Layers className="h-8 w-8 text-pink-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Protein</p>
                <p className="text-3xl font-black text-gray-800">
                  {
                    ingredientsData.filter(
                      (item) =>
                        item.category === "protein-hewani" ||
                        item.category === "protein-nabati"
                    ).length
                  }
                </p>
              </div>
              <Egg className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Sayuran</p>
                <p className="text-3xl font-black text-gray-800">
                  {
                    ingredientsData.filter(
                      (item) => item.category === "sayuran"
                    ).length
                  }
                </p>
              </div>
              <Salad className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl mb-8 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab("ingredients");
                setShowForm(false);
                handleReset();
              }}
              className={`flex-1 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 font-bold transition-all duration-300 ${
                activeTab === "ingredients"
                  ? "bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Database className="h-5 w-5" />
              <span>Database Bahan</span>
              <span className="text-sm opacity-75">
                ({ingredientsData.length})
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("templates");
                setShowForm(false);
                handleReset();
              }}
              className={`flex-1 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 font-bold transition-all duration-300 ${
                activeTab === "templates"
                  ? "bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Layers className="h-5 w-5" />
              <span>Template Menu</span>
              <span className="text-sm opacity-75">
                ({menuTemplatesData.length})
              </span>
            </button>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-3xl shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <button
                onClick={() => setShowForm(!showForm)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-1 flex justify-center items-center space-x-2"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                {showForm ? (
                  <X className="h-4 w-4 relative z-10" />
                ) : (
                  <Plus className="h-4 w-4 relative z-10" />
                )}
                <span className="relative z-10">
                  {showForm
                    ? "Tutup Form"
                    : `Tambah ${
                        activeTab === "ingredients" ? "Bahan" : "Template"
                      }`}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-4 w-full lg:w-auto mt-4 lg:mt-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Cari ${
                    activeTab === "ingredients" ? "bahan" : "template"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        {showForm && (
          <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl mb-8">
            <div className="flex items-center justify-between flex-wrap mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
                <Settings className="h-6 w-6 mr-3 text-[#B23501]" />
                {activeTab === "ingredients"
                  ? editingIngredient
                    ? "Edit Bahan"
                    : "Tambah Bahan Baru"
                  : editingTemplate
                  ? "Edit Template Menu"
                  : "Tambah Template Menu Baru"}
              </h2>
              <Sparkles className="h-5 w-5 text-[#B23501]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "ingredients" ? (
                /* Ingredient Form */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nama Bahan *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={ingredient.name}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="Contoh: Nasi Putih"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Kategori *
                      </label>
                      <select
                        name="category"
                        value={ingredient.category}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="">Pilih kategori</option>
                        {ingredientCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Weight and Unit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Berat/Volume per Porsi *
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={ingredient.weight}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Satuan *
                      </label>
                      <select
                        name="unit"
                        value={ingredient.unit}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        required
                      >
                        {unitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Kalori (kcal) *
                      </label>
                      <div className="relative">
                        <Flame className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="calories"
                          value={ingredient.calories}
                          onChange={handleIngredientChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                          placeholder="360"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Protein (g) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="protein"
                        value={ingredient.protein}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="6"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Karbohidrat (g) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="carbs"
                        value={ingredient.carbs}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="78.8"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Lemak (g) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="fats"
                        value={ingredient.fats}
                        onChange={handleIngredientChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="0.6"
                        required
                      />
                    </div>
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
                          value={ingredient.image_url}
                          onChange={handleIngredientChange}
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
                        value={ingredient.description}
                        onChange={handleIngredientChange}
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Deskripsikan bahan ini..."
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Menu Template Form */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nama Template Menu *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={menuTemplate.name}
                        onChange={handleTemplateChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="Contoh: Paket Nasi + Ayam + Sayur + Pisang"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tipe Template *
                      </label>
                      <select
                        name="type"
                        value={menuTemplate.type}
                        onChange={handleTemplateChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        required
                      >
                        {menuTemplateTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Harga Dasar (Rp) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="basePrice"
                          value={menuTemplate.basePrice}
                          onChange={handleTemplateChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                          placeholder="18000"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Harga Minimum (Rp)
                      </label>
                      <input
                        type="number"
                        name="priceRange.min"
                        value={menuTemplate.priceRange.min}
                        onChange={handleTemplateChange}
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
                        name="priceRange.max"
                        value={menuTemplate.priceRange.max}
                        onChange={handleTemplateChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                        placeholder="25000"
                      />
                    </div>
                  </div>

                  {/* Diet Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-[#B23501]" />
                      Opsi Diet
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="dietOptions.lowCarb"
                            checked={menuTemplate.dietOptions.lowCarb}
                            onChange={handleTemplateChange}
                            className="w-4 h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Low Carb
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="dietOptions.highProtein"
                            checked={menuTemplate.dietOptions.highProtein}
                            onChange={handleTemplateChange}
                            className="w-4 h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            High Protein
                          </span>
                        </label>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="dietOptions.vegetarian"
                            checked={menuTemplate.dietOptions.vegetarian}
                            onChange={handleTemplateChange}
                            className="w-4 h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Vegetarian
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="dietOptions.keto"
                            checked={menuTemplate.dietOptions.keto}
                            onChange={handleTemplateChange}
                            className="w-4 h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Keto
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Diet Price Addition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tambahan Harga Diet Minimum (Rp)
                        </label>
                        <input
                          type="number"
                          name="dietPriceAdd.min"
                          value={menuTemplate.dietPriceAdd.min}
                          onChange={handleTemplateChange}
                          className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                          placeholder="2000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tambahan Harga Diet Maksimum (Rp)
                        </label>
                        <input
                          type="number"
                          name="dietPriceAdd.max"
                          value={menuTemplate.dietPriceAdd.max}
                          onChange={handleTemplateChange}
                          className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                          placeholder="5000"
                        />
                      </div>
                    </div>
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
                          value={menuTemplate.image_url}
                          onChange={handleTemplateChange}
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
                        Deskripsi Template
                      </label>
                      <textarea
                        name="description"
                        value={menuTemplate.description}
                        onChange={handleTemplateChange}
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Deskripsikan template menu ini..."
                      />
                    </div>
                  </div>

                  {/* --- MODIFIED COMPONENT BUILDER --- */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-[#B23501]" />
                      Komponen Menu
                    </h3>

                    {menuTemplate.type === "paket-campuran" && (
                      <div className="space-y-6">
                        {ingredientCategories.map((category) => (
                          <div
                            key={category.value}
                            className="mb-6 p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center justify-between flex-wrap mb-3">
                              <h4 className="font-semibold text-gray-700 flex items-center mb-2 sm:mb-0">
                                <category.icon className="h-4 w-4 mr-2" />
                                {category.label}
                              </h4>
                              <div className="flex items-center space-x-4 text-xs sm:text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      menuTemplate.components[category.value]
                                        ?.required || false
                                    }
                                    onChange={(e) =>
                                      handleComponentChange(
                                        category.value,
                                        "required",
                                        e.target.checked
                                      )
                                    }
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                                  />
                                  <span>Wajib</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      menuTemplate.components[category.value]
                                        ?.multiSelect || false
                                    }
                                    onChange={(e) =>
                                      handleComponentChange(
                                        category.value,
                                        "multiSelect",
                                        e.target.checked
                                      )
                                    }
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-[#F27F34] bg-gray-100 border-gray-300 rounded focus:ring-[#F27F34] focus:ring-2"
                                  />
                                  <span>Multi Pilih</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ingredientsData
                                .filter(
                                  (ing) => ing.category === category.value
                                )
                                .map((ingredient) => (
                                  <button
                                    key={ingredient.id}
                                    type="button"
                                    onClick={() => {
                                      const isSelected =
                                        menuTemplate.components[
                                          category.value
                                        ]?.options?.includes(ingredient.id);
                                      if (isSelected) {
                                        removeComponentOption(
                                          category.value,
                                          ingredient.id
                                        );
                                      } else {
                                        addComponentOption(
                                          category.value,
                                          ingredient.id
                                        );
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      menuTemplate.components[
                                        category.value
                                      ]?.options?.includes(ingredient.id)
                                        ? "bg-[#F27F34] text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  >
                                    {ingredient.name}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {menuTemplate.type === "snack-box" && (
                      <div className="space-y-4">
                        {/* Snack */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <Coffee className="h-4 w-4 mr-2" />
                            Snack
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ingredientsData
                              .filter((ing) => ing.category === "snack")
                              .map((ingredient) => (
                                <button
                                  key={ingredient.id}
                                  type="button"
                                  onClick={() => {
                                    const isSelected = menuTemplate.components[
                                      "snack"
                                    ]?.options?.includes(ingredient.id);
                                    if (isSelected) {
                                      removeComponentOption(
                                        "snack",
                                        ingredient.id
                                      );
                                    } else {
                                      addComponentOption(
                                        "snack",
                                        ingredient.id
                                      );
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    menuTemplate.components[
                                      "snack"
                                    ]?.options?.includes(ingredient.id)
                                      ? "bg-[#F27F34] text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  {ingredient.name}
                                </button>
                              ))}
                          </div>
                        </div>

                        {/* Minuman */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <Utensils className="h-4 w-4 mr-2" />
                            Minuman
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ingredientsData
                              .filter((ing) => ing.category === "minuman")
                              .map((ingredient) => (
                                <button
                                  key={ingredient.id}
                                  type="button"
                                  onClick={() => {
                                    const isSelected = menuTemplate.components[
                                      "minuman"
                                    ]?.options?.includes(ingredient.id);
                                    if (isSelected) {
                                      removeComponentOption(
                                        "minuman",
                                        ingredient.id
                                      );
                                    } else {
                                      addComponentOption(
                                        "minuman",
                                        ingredient.id
                                      );
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    menuTemplate.components[
                                      "minuman"
                                    ]?.options?.includes(ingredient.id)
                                      ? "bg-[#F27F34] text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  {ingredient.name}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {(menuTemplate.type === "snack-box" ||
                      menuTemplate.type === "paket-campuran") &&
                      Object.keys(menuTemplate.components).map(
                        (categoryKey) =>
                          menuTemplate.components[categoryKey]?.options
                            ?.length > 0 && (
                            <div
                              key={categoryKey}
                              className="mt-2 p-2 bg-white rounded-lg"
                            >
                              <p className="text-xs text-gray-500 mb-1">
                                Bahan terpilih ({categoryKey}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {menuTemplate.components[
                                  categoryKey
                                ].options.map((optionId) => {
                                  const ingredient =
                                    getIngredientById(optionId);
                                  return ingredient ? (
                                    <span
                                      key={optionId}
                                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                    >
                                      {ingredient.name}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeComponentOption(
                                            categoryKey,
                                            optionId
                                          )
                                        }
                                        className="ml-1 text-green-600 hover:text-green-800"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )
                      )}
                  </div>
                </>
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
                      : activeTab === "ingredients"
                      ? editingIngredient
                        ? "Update Bahan"
                        : "Simpan Bahan"
                      : editingTemplate
                      ? "Update Template"
                      : "Simpan Template"}
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

        {/* Data Display Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
              {activeTab === "ingredients" ? (
                <>
                  <Database className="h-6 w-6 mr-3 text-[#B23501]" />
                  Database Bahan
                </>
              ) : (
                <>
                  <Layers className="h-6 w-6 mr-3 text-[#B23501]" />
                  Template Menu
                </>
              )}
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {activeTab === "ingredients"
                ? `${filteredIngredients.length} dari ${ingredientsData.length} bahan`
                : `${filteredTemplates.length} dari ${menuTemplatesData.length} template`}
            </span>
          </div>

          {activeTab === "ingredients" ? (
            /* Ingredients Display */
            filteredIngredients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredIngredients.map((ingredient) => {
                  const categoryInfo = getCategoryInfo(ingredient.category);
                  return (
                    <div
                      key={ingredient.id}
                      className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-4">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            {ingredient.image_url ? (
                              <img
                                src={ingredient.image_url}
                                alt={ingredient.name}
                                className="w-16 h-16 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-16 h-16 bg-gradient-to-r ${
                                categoryInfo.color
                              } rounded-xl items-center justify-center ${
                                ingredient.image_url ? "hidden" : "flex"
                              }`}
                            >
                              {categoryInfo.icon && (
                                <categoryInfo.icon className="h-6 w-6 text-white" />
                              )}
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                              {ingredient.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-1 mt-1">
                              <span
                                className={`px-2 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${categoryInfo.color}`}
                              >
                                {categoryInfo.label}
                              </span>
                              <span className="text-sm text-gray-600">
                                {ingredient.weight} {ingredient.unit}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                              <button
                                onClick={() => handleEditIngredient(ingredient)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                title="Edit bahan"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletionWithModal(
                                    ingredient.id,
                                    "ingredient"
                                  )
                                }
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                                title="Hapus bahan"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Nutrition Info */}
                        <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-gray-700">
                          <div className="flex items-center space-x-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{ingredient.calories} kcal</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span>
                              {parseFloat(ingredient.protein).toFixed(1)}g
                              protein
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Coffee className="h-3 w-3 text-green-500" />
                            <span>
                              {parseFloat(ingredient.carbs).toFixed(1)}g karbo
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3 text-yellow-500" />
                            <span>
                              {parseFloat(ingredient.fats).toFixed(1)}g lemak
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {searchTerm
                    ? "Tidak Ada Bahan Ditemukan"
                    : "Database Bahan Kosong"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? "Coba ubah kata kunci pencarian."
                    : "Mulai tambahkan bahan-bahan makanan untuk membangun database Revitameal."}
                </p>
              </div>
            )
          ) : /* Templates Display */
          filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => {
                const typeInfo = getCategoryInfo(template.type, true);
                return (
                  <div
                    key={template.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {template.image_url ? (
                            <img
                              src={template.image_url}
                              alt={template.name}
                              className="w-16 h-16 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-16 h-16 bg-gradient-to-r ${
                              typeInfo.color
                            } rounded-xl items-center justify-center ${
                              template.image_url ? "hidden" : "flex"
                            }`}
                          >
                            <Layers className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                            {template.name}
                          </h3>
                          <div className="flex flex-wrap items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${typeInfo.color}`}
                            >
                              {typeInfo.label}
                            </span>
                            <span className="text-sm font-bold text-green-600">
                              Rp {template.basePrice?.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                              title="Edit template"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeletionWithModal(template.id, "template")
                              }
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              title="Hapus template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Nutrition Info - Show only if data exists */}
                      {(template.calories > 0 ||
                        template.protein > 0 ||
                        template.carbs > 0 ||
                        template.fats > 0) && (
                        <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-gray-700">
                          <div className="flex items-center space-x-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{template.calories || 0} kcal</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span>
                              {parseFloat(template.protein).toFixed(1)}g protein
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Coffee className="h-3 w-3 text-green-500" />
                            <span>
                              {parseFloat(template.carbs).toFixed(1)}g karbo
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3 text-yellow-500" />
                            <span>
                              {parseFloat(template.fats).toFixed(1)}g lemak
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Components List */}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">
                          Komponen:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.values(template.components || {})
                            .flatMap((c) => c.options)
                            .slice(0, 5)
                            .map((id) => {
                              const ingredient = getIngredientById(id);
                              return ingredient ? (
                                <span
                                  key={id}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {ingredient.name}
                                </span>
                              ) : null;
                            })}
                          {Object.values(template.components || {}).flatMap(
                            (c) => c.options
                          ).length > 5 && (
                            <span className="text-xs text-gray-400">+...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {searchTerm
                  ? "Tidak Ada Template Ditemukan"
                  : "Template Menu Kosong"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? "Coba ubah kata kunci pencarian."
                  : "Buat template menu baru untuk ditampilkan kepada pelanggan."}
              </p>
            </div>
          )}
        </section>
      </div>
      {/* Custom Modal for Confirmation */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {modalContent.title}
            </h3>
            <p className="text-gray-600 mb-6">{modalContent.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirm}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                {modalContent.confirmText}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors"
              >
                {modalContent.cancelText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
