import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, FolderTree, Loader } from "lucide-react";

const API_URL = "http://localhost:3000/api";

const Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "☕",
    color: "#f59e0b",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        data.map(async (cat) => {
          const productsRes = await fetch(
            `${API_URL}/products?category=${cat.name}`
          );
          const products = await productsRes.json();
          return {
            id: cat.id,
            name: cat.name,
            description:
              cat.name === "Drinks"
                ? "Beverages and coffee"
                : "Food items and snacks",
            productCount: products.filter((p) => p.is_available === 1).length,
            icon: cat.name === "Drinks" ? "☕" : "🍔",
            color: cat.name === "Drinks" ? "#f59e0b" : "#10b981",
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setFormData({ name: "", description: "", icon: "☕", color: "#f59e0b" });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    });
    setShowModal(true);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newCategory = {
        id: categories.length + 1,
        ...formData,
        productCount: 0,
      };
      setCategories([...categories, newCategory]);
    } else {
      setCategories(
        categories.map((c) =>
          c.id === selectedCategory.id ? { ...c, ...formData } : c
        )
      );
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">
            Manage product categories (auto-generated from products)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-12 h-12 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {category.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-500">Products</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: category.color }}
                >
                  {category.productCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mt-6">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Categories are automatically generated from
          your products. To add a new category, create a product with that
          category name.
        </p>
      </div>
    </div>
  );
};

export default Categories;
