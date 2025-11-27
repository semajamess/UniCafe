import db from '../database.js';
import fetch from 'node-fetch';

// Seed drinks from TheCocktailDB API (Non-Alcoholic)
export const seedDrinkProducts = async () => {
  try {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic');
    const data = await response.json();
    
    // We'll store category as the enum string 'Drinks'
    const category = 'Drinks';
    
    // Get detailed info for each drink (limit to 25)
    const drinks = [];
    for (const drink of data.drinks.slice(0, 25)) {
      const detailResponse = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
      const detailData = await detailResponse.json();
      
      if (detailData.drinks && detailData.drinks[0]) {
        const detail = detailData.drinks[0];
        const category = detail.strCategory || 'Beverage';
        drinks.push({
          name: detail.strDrink,
          description: `Refreshing ${category.toLowerCase()} - ${detail.strDrink}`,
          price: (80 + Math.random() * 120).toFixed(2), // ₱80-₱200 Philippine Peso
          image: detail.strDrinkThumb
        });
      }
    }
    
    for (const drink of drinks) {
      await db.runAsync(
        `INSERT OR IGNORE INTO products (category, name, description, price, stock, image_url, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          category,
          drink.name,
          drink.description,
          drink.price,
          50, // Default stock
          drink.image,
          1
        ]
      );
    }
    console.log(`✅ Drink products seeded from TheCocktailDB API (${drinks.length} items)`);
  } catch (error) {
    console.error('❌ Error seeding drink products:', error.message);
  }
};



// Seed food from TheMealDB API (Multiple categories)
export const seedPastryProducts = async () => {
  try {
    // We'll store category as the enum string 'Food'
    const category = 'Food';
    
    // Fetch from multiple food categories
    const categories = ['Breakfast', 'Dessert', 'Pasta', 'Vegetarian'];
    const foods = [];
    
    for (const cat of categories) {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
      const data = await response.json();
      
      // Get 6-7 items from each category
      const itemsToFetch = data.meals.slice(0, Math.ceil(25 / categories.length));
      
      for (const meal of itemsToFetch) {
        const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const detailData = await detailResponse.json();
        
        if (detailData.meals && detailData.meals[0]) {
          const detail = detailData.meals[0];
          const area = detail.strArea || 'International';
          foods.push({
            name: detail.strMeal,
            description: `${area} ${cat} - ${detail.strMeal}`,
            price: (100 + Math.random() * 150).toFixed(2), // ₱100-₱250 Philippine Peso
            image: detail.strMealThumb
          });
        }
      }
    }
    
    for (const food of foods) {
      await db.runAsync(
        `INSERT OR IGNORE INTO products (category, name, description, price, stock, image_url, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          category,
          food.name,
          food.description,
          food.price,
          50, // Default stock
          food.image,
          1
        ]
      );
    }
    console.log(`✅ Food products seeded from TheMealDB API (${foods.length} items)`);
  } catch (error) {
    console.error('❌ Error seeding food products:', error.message);
  }
};

// Autocomplete search for drinks from API
export const searchDrinksAutocomplete = async (query) => {
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await response.json();
    
    if (!data.drinks) return [];
    
    // Get existing product names to filter out
    const existing = await db.allAsync('SELECT name FROM products');
    const existingNames = new Set(existing.map(p => p.name));
    
    return data.drinks
      .filter(drink => !existingNames.has(drink.strDrink))
      .slice(0, 5)
      .map(drink => ({
        name: drink.strDrink,
        description: `Refreshing ${(drink.strCategory || 'beverage').toLowerCase()} - ${drink.strDrink}`,
        image_url: drink.strDrinkThumb
      }));
  } catch (error) {
    console.error('❌ Error searching drinks:', error);
    return [];
  }
};

// Autocomplete search for food from API
export const searchFoodAutocomplete = async (query) => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    // Get existing product names to filter out
    const existing = await db.allAsync('SELECT name FROM products');
    const existingNames = new Set(existing.map(p => p.name));
    
    return data.meals
      .filter(meal => !existingNames.has(meal.strMeal))
      .slice(0, 5)
      .map(meal => ({
        name: meal.strMeal,
        description: `${meal.strArea || 'International'} ${meal.strCategory || 'food'} - ${meal.strMeal}`,
        image_url: meal.strMealThumb
      }));
  } catch (error) {
    console.error('❌ Error searching food:', error);
    return [];
  }
};

