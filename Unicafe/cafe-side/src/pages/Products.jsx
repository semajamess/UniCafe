import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Coffee, Loader, Link as LinkIcon, Upload } from "lucide-react";

const API_URL = "http://localhost:3000/api/cafe";

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saveConfirmText, setSaveConfirmText] = useState("");
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
  });
  const [imageInputMode, setImageInputMode] = useState("url"); // "url" or "upload"
  const [imageFile, setImageFile] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image_url: "",
    is_available: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAutocomplete &&
        !event.target.closest(".autocomplete-container")
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAutocomplete]);

  // Clear autocomplete suggestions when modal mode changes (only used in add)
  useEffect(() => {
    if (modalMode !== "add") {
      setShowAutocomplete(false);
      setAutocompleteSuggestions([]);
    }
  }, [modalMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      params.append('available', 'true');

      const response = await fetch(`${API_URL}/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/customer/categories`
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleNameChange = async (value) => {
    setFormData({ ...formData, name: value });

    // Only fetch recommendations/autocomplete when adding a new product
    if (modalMode !== "add") {
      setShowAutocomplete(false);
      setAutocompleteSuggestions([]);
      return;
    }

    if (value.length >= 1) {
      try {
        // First, get deactivated products
        console.log("Fetching deactivated products for:", value);
        const dbResponse = await fetch(
          `${API_URL}/products/deactivated?q=${value}`
        );
        const deactivatedProducts = await dbResponse.json();
        console.log("Deactivated products response:", deactivatedProducts);

        // Then get API suggestions
        const categoryName = formData.category || "";
        console.log(
          "Fetching API suggestions for:",
          value,
          "category:",
          categoryName
        );
        const apiResponse = await fetch(
          `${API_URL}/products/autocomplete?q=${value}&type=${categoryName}`
        );
        const apiSuggestions = await apiResponse.json();
        console.log("API suggestions response:", apiSuggestions);

        // Combine results - normalize deactivated products to match API format
        const deactivatedList = Array.isArray(deactivatedProducts)
          ? deactivatedProducts.map((p) => ({
              name: p.product_name,
              category: p.product_category,
              description: p.product_description,
              price: p.product_price,
              stock: p.product_stock,
              image_url: p.product_image_url,
              product_id: p.product_id,
              isDeactivated: true,
            }))
          : [];

        const apiList = Array.isArray(apiSuggestions)
          ? apiSuggestions.filter(
              (s) =>
                !deactivatedList.find(
                  (d) => d.name.toLowerCase() === s.name.toLowerCase()
                )
            )
          : [];

        const combined = [...deactivatedList, ...apiList];

        console.log("Final autocomplete results:", combined);
        console.log("showAutocomplete will be:", combined.length > 0);
        setAutocompleteSuggestions(combined);
        setShowAutocomplete(combined.length > 0);
      } catch (error) {
        console.error("Error fetching autocomplete:", error);
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
      setAutocompleteSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.isDeactivated) {
      // For deactivated products, show reactivation modal
      setExistingProduct(suggestion);
      setFormData({
        ...formData,
        name: suggestion.name,
        category: suggestion.category || suggestion.category_name || "",
        description: suggestion.description || "",
        price: suggestion.price || "",
        stock: suggestion.stock || "",
        image_url: suggestion.image_url || "",
      });
      setShowReactivateModal(true);
    } else {
      // For API suggestions, auto-fill with empty price/stock
      setFormData({
        ...formData,
        name: suggestion.name,
        category: suggestion.category || suggestion.category_name || "",
        description: suggestion.description || "",
        image_url: suggestion.image_url || "",
        price: "",
        stock: "",
      });
    }
    setShowAutocomplete(false);
    setAutocompleteSuggestions([]);
  };

  const handleAddProduct = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setImageInputMode("url");
    setImageFile(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      image_url: "",
      is_available: true,
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setImageInputMode("url");
    setImageFile(null);
    setFormData({
      name: product.product_name || product.name,
      category:
        product.product_category ||
        product.category ||
        product.category_name ||
        "",
      price: product.product_price || product.price,
      stock: product.product_stock || product.stock || 0,
      description: product.product_description || product.description || "",
      image_url: product.product_image_url || product.image_url || "",
      is_available:
        product.product_is_available !== undefined
          ? product.product_is_available
          : product.is_available,
    });
    setShowModal(true);
  };

  const handleConfirmedSave = async () => {
    if (saveConfirmText !== "SAVE") {
      alert("Please type SAVE to confirm changes");
      return;
    }

    // Determine final image URL - only upload if in upload mode with a new file
    let finalImageUrl = formData.image_url;
    if (imageInputMode === "upload" && imageFile) {
      try {
        setLoading(true);
        finalImageUrl = await uploadImageFile(imageFile);
      } catch (error) {
        setLoading(false);
        alert(`Failed to upload image: ${error.message}. Please try again or use a URL instead.`);
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      // Convert form data to database column names (professional API contract)
      const productData = {
        product_category: formData.category,
        product_name: formData.name,
        product_description: formData.description,
        product_price: parseFloat(formData.price),
        product_stock: parseInt(formData.stock) || 0,
        product_image_url: finalImageUrl,
        product_is_available: formData.is_available ? 1 : 0,
      };

      const productId = selectedProduct.product_id || selectedProduct.id;
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await fetchProducts();
        setShowModal(false);
        setShowSaveConfirm(false);
        setSaveConfirmText("");
        setSuccessMessage({
          title: "Product Updated!",
          message: `${formData.name} has been successfully updated.`,
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmText("");
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Please type DELETE to confirm");
      return;
    }

    try {
      // Soft delete - set product_is_available to 0
      const productId = productToDelete.product_id || productToDelete.id;
      
      // Build proper update payload with database column names
      const updatePayload = {
        product_category: productToDelete.product_category,
        product_name: productToDelete.product_name,
        product_description: productToDelete.product_description,
        product_price: productToDelete.product_price,
        product_stock: productToDelete.product_stock,
        product_image_url: productToDelete.product_image_url,
        product_is_available: 0  // Soft delete - deactivate the product
      };

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        await fetchProducts();
        const productName =
          productToDelete.product_name || productToDelete.name;
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        setDeleteConfirmText("");
        setSuccessMessage({
          title: "Product Deactivated!",
          message: `${productName} has been successfully deactivated. You can reactivate it anytime.`,
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error deactivating product:", error);
    }
  };

  const handleReactivate = async () => {
    // Determine final image URL - only upload if in upload mode with a new file
    let finalImageUrl = formData.image_url;
    if (imageInputMode === "upload" && imageFile) {
      try {
        setLoading(true);
        finalImageUrl = await uploadImageFile(imageFile);
      } catch (error) {
        setLoading(false);
        alert(`Failed to upload image: ${error.message}. Please try again or use a URL instead.`);
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      // Convert form data to database column names and reactivate
      const productData = {
        product_category: formData.category,
        product_name: formData.name,
        product_description: formData.description,
        product_price: parseFloat(formData.price),
        product_stock: parseInt(formData.stock) || 0,
        product_image_url: finalImageUrl,
        product_is_available: 1,
      };

      const productId = existingProduct.product_id || existingProduct.id;
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await fetchProducts();
        setShowModal(false);
        setShowReactivateModal(false);
        setExistingProduct(null);
        setSuccessMessage({
          title: "Product Reactivated!",
          message: `${formData.name} is now available again.`,
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error reactivating product:", error);
    }
  };

  const uploadImageFile = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        body: formDataObj,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Return full URL (backend is on localhost:3000)
        return `http://localhost:3000${data.imageUrl}`;
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine final image URL based on input mode
    let finalImageUrl = formData.image_url;
    
    // Only upload file if user is in upload mode AND has selected a file AND hasn't autofilled from API
    if (imageInputMode === "upload" && imageFile) {
      try {
        setLoading(true);
        finalImageUrl = await uploadImageFile(imageFile);
      } catch (error) {
        setLoading(false);
        alert(`Failed to upload image: ${error.message}. Please try again or use a URL instead.`);
        return;
      } finally {
        setLoading(false);
      }
    }
    // If user selected API autofill, formData.image_url already has the external URL - no upload needed
    // If user is in URL mode, formData.image_url already has the pasted URL - no upload needed


    // Show save confirmation modal for edits
    if (modalMode === "edit") {
      setShowSaveConfirm(true);
      return;
    }

    try {
      // Convert form data to database column names (professional API contract)
      const productData = {
        product_category: formData.category,
        product_name: formData.name,
        product_description: formData.description,
        product_price: parseFloat(formData.price),
        product_stock: parseInt(formData.stock) || 0,
        product_image_url: formData.image_url,
        product_is_available: formData.is_available ? 1 : 0,
      };

      if (modalMode === "add") {
        // Check if product already exists but is deactivated
        const checkResponse = await fetch(
          `${API_URL}/products/check-exists?name=${encodeURIComponent(
            formData.name
          )}`
        );
        const existingData = await checkResponse.json();

        if (existingData.exists && !existingData.product.is_available) {
          setExistingProduct(existingData.product);
          setShowReactivateModal(true);
          return;
        }

        const response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          await fetchProducts();
          setShowModal(false);
          setSuccessMessage({
            title: "Product Added!",
            message: `${formData.name} has been successfully added to the menu.`,
          });
          setShowSuccessModal(true);
        }
      } else {
        const response = await fetch(
          `${API_URL}/products/${selectedProduct.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          }
        );

        if (response.ok) {
          await fetchProducts();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const filteredProducts = products;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">
            Manage your cafe menu and inventory
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-12 h-12 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.product_id || product.id}
              className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100 hover:shadow-xl hover:border-amber-200 transition-all card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {product.product_image_url || product.image_url ? (
                    <img
                      src={product.product_image_url || product.image_url}
                      alt={product.product_name || product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-3xl">
                      ☕
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {product.product_name || product.name}
                    </h3>
                    <span className="text-sm text-amber-600 font-semibold">
                      {product.product_category ||
                        product.category ||
                        product.category_name}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {product.product_description || product.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    ₱
                    {parseFloat(
                      product.product_price || product.price || 0
                    ).toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-semibold mt-1 px-2 py-1 rounded inline-block ${
                      (product.product_stock || product.stock || 0) > 10
                        ? "bg-green-100 text-green-700"
                        : (product.product_stock || product.stock || 0) > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.product_stock || product.stock || 0} in stock
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (
                      product.product_is_available !== undefined
                        ? product.product_is_available
                        : product.is_available
                    )
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {(
                    product.product_is_available !== undefined
                      ? product.product_is_available
                      : product.is_available
                  )
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-20">
          <Coffee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No products found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {modalMode === "add" ? "Add New Product" : "Edit Product"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="relative autocomplete-container">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() =>
                    formData.name.length >= 1 && setShowAutocomplete(true)
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Cappuccino"
                />
                {modalMode === "add" &&
                  showAutocomplete &&
                  autocompleteSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-amber-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {autocompleteSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {suggestion.image_url && (
                              <img
                                src={suggestion.image_url}
                                alt={suggestion.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="font-semibold text-slate-900">
                                  {suggestion.name}
                                </div>
                                {suggestion.isDeactivated && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                    Deactivated
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                {suggestion.isDeactivated
                                  ? "Click to reactivate"
                                  : "From API - Enter price & stock manually"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category (Auto-filled from API)
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                  disabled={modalMode === "add"}
                >
                  {modalMode === "add" && (
                    <option value="">Auto-detected</option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="50"
                  />
                  {modalMode === "edit" && (
                    <p className="text-xs text-slate-500 mt-2">
                      Current stock:{" "}
                      {selectedProduct?.product_stock ||
                        selectedProduct?.stock ||
                        0}{" "}
                      units
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Product description..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Image
                </label>
                
                {/* Toggle between URL and File Upload */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImageInputMode("url");
                      setImageFile(null);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      imageInputMode === "url"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageInputMode("upload");
                      setFormData({ ...formData, image_url: "" });
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      imageInputMode === "upload"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                </div>

                {imageInputMode === "url" ? (
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          // Create a temporary URL for preview
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, image_url: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {imageFile && (
                      <p className="text-xs text-slate-500 mt-2">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Image Preview */}
                {formData.image_url && (
                  <div className="mt-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                  className="w-5 h-5 text-amber-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                />
                <label
                  htmlFor="is_available"
                  className="text-sm font-semibold text-slate-700"
                >
                  Available for sale
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  {modalMode === "add" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Deactivate Product?
            </h3>
            <p className="text-slate-600 mb-4">
              This will deactivate{" "}
              <span className="font-bold">{productToDelete?.name}</span>. The
              product will be hidden from customers but can be reactivated
              later.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Type <span className="text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Type DELETE"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== "DELETE"}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Confirm Changes
            </h3>
            <p className="text-slate-600 mb-4">
              You are about to save changes to{" "}
              <span className="font-bold">{selectedProduct?.name}</span>.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Type <span className="text-green-600">SAVE</span> to confirm:
              </label>
              <input
                type="text"
                value={saveConfirmText}
                onChange={(e) => setSaveConfirmText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Type SAVE"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSaveConfirm(false);
                  setSaveConfirmText("");
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedSave}
                disabled={saveConfirmText !== "SAVE"}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Product Modal */}
      {showReactivateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-amber-600 mb-4">
              Product Already Exists!
            </h3>
            <p className="text-slate-600 mb-4">
              <span className="font-bold">{existingProduct?.name}</span> already
              exists but is currently deactivated.
            </p>
            <p className="text-slate-600 mb-6">
              Would you like to reactivate it with the new information?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReactivateModal(false);
                  setExistingProduct(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivate}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Reactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {successMessage.title}
              </h3>

              {/* Message */}
              <p className="text-slate-600 mb-6">{successMessage.message}</p>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
