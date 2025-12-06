import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // Get the cart key based on the current user
  const getCartKey = () => {
    return user ? `unicafe-cart-${user.id}` : "unicafe-cart-guest";
  };

  // Load cart from localStorage when user changes
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, user?.id]);

  // Auto-sync cart with products on interval and window focus
  useEffect(() => {
    // Sync cart with latest product data
    const syncCart = async () => {
      if (cart.length === 0) return;

      try {
        const response = await fetch(
          "http://localhost:3000/api/customer/products"
        );
        if (!response.ok) return;

        const products = await response.json();

        setCart((prevCart) => {
          let hasChanges = false;
          const updatedCart = prevCart
            .map((cartItem) => {
              const latestProduct = products.find(
                (p) => p.product_id === cartItem.id
              );

              if (latestProduct) {
                // Check if any data changed
                if (
                  cartItem.name !== latestProduct.product_name ||
                  cartItem.price !== latestProduct.product_price ||
                  cartItem.description !== latestProduct.product_description ||
                  cartItem.image_url !== latestProduct.product_image_url
                ) {
                  hasChanges = true;
                }

                return {
                  ...cartItem,
                  name: latestProduct.product_name,
                  price: latestProduct.product_price,
                  description: latestProduct.product_description,
                  image_url: latestProduct.product_image_url,
                  category: latestProduct.product_category,
                  is_available: latestProduct.product_is_available,
                };
              }

              return cartItem;
            })
            .filter((item) => item.is_available !== false);

          // Only update if there are changes
          return hasChanges || updatedCart.length !== prevCart.length
            ? updatedCart
            : prevCart;
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    };

    // Sync on window focus (when user switches back to tab)
    const handleFocus = () => {
      syncCart();
    };

    // Sync every 30 seconds if cart has items
    const interval = cart.length > 0 ? setInterval(syncCart, 30000) : null;

    window.addEventListener("focus", handleFocus);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [cart.length]);

  const addToCart = (product, quantity = 1) => {
    // Normalize product data: map API fields (product_id, product_name, etc.) to cart item fields (id, name, etc.)
    const normalizedProduct = {
      ...product,
      id: product.product_id,
      name: product.product_name,
      price: product.product_price,
      description: product.product_description,
      image_url: product.product_image_url,
      category: product.product_category,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === normalizedProduct.id
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { ...normalizedProduct, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const syncCartWithProducts = async () => {
    if (cart.length === 0) return;

    try {
      // Fetch latest product data for all items in cart
      const productIds = cart.map((item) => item.id);
      const response = await fetch(
        "http://localhost:3000/api/customer/products"
      );

      if (!response.ok) return;

      const products = await response.json();

      // Update cart with latest product information
      setCart((prevCart) => {
        return prevCart
          .map((cartItem) => {
            const latestProduct = products.find(
              (p) => p.product_id === cartItem.id
            );

            if (latestProduct) {
              // Update with latest data, preserve quantity
              return {
                ...cartItem,
                name: latestProduct.product_name,
                price: latestProduct.product_price,
                description: latestProduct.product_description,
                image_url: latestProduct.product_image_url,
                category: latestProduct.product_category,
                is_available: latestProduct.product_is_available,
              };
            }

            return cartItem;
          })
          .filter((item) => item.is_available !== false); // Remove unavailable items
      });
    } catch (error) {
      console.error("Failed to sync cart with products:", error);
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    syncCartWithProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
