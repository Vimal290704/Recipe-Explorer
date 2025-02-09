class RecipeAPI {
  constructor() {
    this.baseUrl = "http://localhost:3000/api";
  }
  async searchRecipes(searchTerm, recipeTypes = [], page = 0, maxResults = 20) {
    const params = new URLSearchParams({
      searchTerm,
      page,
      maxResults,
    });
    if (recipeTypes.length > 0) {
      params.append("recipeTypes", recipeTypes.join(","));
    }
    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  async getRecipe(recipeId) {
    const response = await fetch(`${this.baseUrl}/recipe/${recipeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}
const api = new RecipeAPI();
let currentRecipe = null;
const recipeTypes = document.querySelectorAll(".recipe-type");
recipeTypes.forEach((type) => {
  type.addEventListener("click", () => {
    type.classList.toggle("selected");
  });
});
async function searchRecipes() {
  const searchTerm = document.getElementById("searchInput").value;
  if (!searchTerm) return;
  showLoading(true);
  clearResults();
  const selectedTypes = Array.from(
    document.querySelectorAll(".recipe-type.selected")
  ).map((type) => type.dataset.type);
  try {
    const data = await api.searchRecipes(searchTerm, selectedTypes);
    if (data.recipes && data.recipes.recipe) {
      displayResults(data.recipes.recipe);
    } else {
      displayError("No recipes found. Try different search terms.");
    }
  } catch (error) {
    console.error("Error searching recipes:", error);
    displayError("Failed to search recipes. Please try again.");
  } finally {
    showLoading(false);
  }
}
function displayResults(recipes) {
  const grid = document.getElementById("resultsGrid");
  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    grid.appendChild(card);
  });
}
let imageUrl = new Map([]);
let recipeUrl = new Map([]);
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.onclick = () => showRecipeDetails(recipe.recipe_id);
  const fallbackImage = "https://placehold.co/300x200";
  imageUrl.set(recipe.recipe_id, recipe.recipe_image || fallbackImage);
  recipeUrl.set(recipe.recipe_id, recipe.recipe_url);
  card.innerHTML = `
      <div class="card-container" 
           style="box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
        
        <!-- Image Section -->
        <div class="image-container" style="height: 200px; overflow: hidden;">
          <img 
            src="${recipe.recipe_image || fallbackImage}" 
            onerror="this.onerror=null; this.src='${fallbackImage}';"
            alt="${recipe.recipe_name}" 
            style="width: 100%; height: 100%; object-fit: cover;"
          >
        </div>
        
        <!-- Content Section (Expanded to fill extra space) -->
        <div class="content" style="padding: 16px; border-bottom: none; flex: 1;">
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">
            ${recipe.recipe_name || "Untitled Recipe"}
          </h3>
          <p style="color: #666; font-size: 0.9rem; margin-bottom: 12px;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    overflow: hidden;">
            ${recipe.recipe_description || "No description available"}
          </p>
          
          <!-- Nutrition Grid -->
          <div class="nutrition-grid" 
               style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 12px 0; font-size: 0.9rem;">
            <div style="background: #f5f5f5; padding: 8px; border-radius: 4px;">
              <span style="color: #888;">Calories:</span> 
              <span style="font-weight: 500;">${
                recipe.recipe_nutrition.calories || "N/A"
              }</span>
            </div>
            <div style="background: #f5f5f5; padding: 8px; border-radius: 4px;">
              <span style="color: #888;">Carbs:</span> 
              <span style="font-weight: 500;">${
                recipe.recipe_nutrition.carbohydrate || "N/A"
              }g</span>
            </div>
            <div style="background: #f5f5f5; padding: 8px; border-radius: 4px;">
              <span style="color: #888;">Protein:</span> 
              <span style="font-weight: 500;">${
                recipe.recipe_nutrition.protein || "N/A"
              }g</span>
            </div>
            <div style="background: #f5f5f5; padding: 8px; border-radius: 4px;">
              <span style="color: #888;">Fat:</span> 
              <span style="font-weight: 500;">${
                recipe.recipe_nutrition.fat || "N/A"
              }g</span>
            </div>
          </div>
          
          <!-- Action Area: Consistent margin-top on both elements -->
          <div style="display: flex; justify-content: space-between; margin-top: 16px;">
           <button style="display: inline-block; padding: 8px 16px; background: #4CAF50; color: white; 
                           border: none; border-radius: 4px; margin: 0;">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  return card;
}

async function showRecipeDetails(recipeId) {
  try {
    showLoading(true);
    const data = await api.getRecipe(recipeId);
    if (!data || !data.recipe) {
      throw new Error("Invalid recipe data structure");
    }
    currentRecipe = data.recipe;
    updateAllTabs();
    document.getElementById("recipeModal").style.display = "block";
  } catch (error) {
    console.error("Error in showRecipeDetails:", error);
    displayError(`Failed to load recipe details: ${error.message}`);
  } finally {
    showLoading(false);
  }
}
function updateAllTabs() {
  updateDetailsTab();
  updateNutritionTab();
  updateIngredientsTab();
  updateDirectionsTab();
}
function updateDetailsTab() {
  const detailsContainer = document.getElementById("details");

  if (!currentRecipe) {
    detailsContainer.innerHTML = `
      <div class="empty-state" style="
          text-align: center; 
          padding: 20px; 
          color: #666;">
        <i class="fas fa-exclamation-circle" style="
            font-size: 2rem; 
            color: #ccc;"></i>
        <p style="
            font-size: 1.1rem; 
            margin-top: 10px;">
          No recipe data available
        </p>
      </div>`;
    return;
  }

  const prepTime = parseInt(currentRecipe.preparation_time_min) || 0;
  const cookTime = parseInt(currentRecipe.cooking_time_min) || 0;
  const totalTime = prepTime + cookTime;
  const ratingValue = currentRecipe.rating ? parseInt(currentRecipe.rating) : 0;
  const rating = currentRecipe.rating
    ? "★".repeat(ratingValue) + "☆".repeat(5 - ratingValue)
    : "N/A";
  const imageSrc = imageUrl.get(currentRecipe.recipe_id) || "default-image.jpg";

  const categoriesList =
    currentRecipe.recipe_categories?.recipe_category
      .map(
        (category) =>
          `<a href="${category.recipe_category_url}" target="_blank" style="
              color: #4CAF50; 
              text-decoration: none; 
              font-weight: 500; 
              transition: color 0.3s;"
            onmouseover="this.style.color='#388E3C'" 
            onmouseout="this.style.color='#4CAF50'">
            ${category.recipe_category_name}
          </a>`
      )
      .join(", ") || "N/A";

  detailsContainer.innerHTML = `
    <div class="recipe-card" style="
          background: linear-gradient(135deg, #ffffff, #f9f9f9);
          padding: 24px; 
          border-radius: 12px; 
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          max-width: 680px;
          margin: 24px auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      
      <div class="image-container" style="
            text-align: center; 
            margin-bottom: 16px;">
        <img src="${imageSrc}" alt="${currentRecipe.recipe_name}" 
             class="recipe-image"
             style="width: 100%; max-width: 500px; height: auto; 
                    object-fit: cover; border-radius: 10px; 
                    display: block; margin: 0 auto; 
                    transition: transform 0.3s;"
             onmouseover="this.style.transform='scale(1.05)'" 
             onmouseout="this.style.transform='scale(1)'">
      </div>

      <h2 class="recipe-title" style="
            font-size: 2rem; 
            text-align: center; 
            margin-bottom: 16px;
            color: #333;">
        ${currentRecipe.recipe_name || "Unknown Recipe"}
      </h2>

      <hr style="border: 0; height: 1px; background: #e0e0e0; margin-bottom: 16px;">

      <div class="recipe-stats" style="
            display: flex; 
            justify-content: space-around; 
            flex-wrap: wrap; 
            margin-bottom: 16px;">
        
        <div class="stat" style="
              font-size: 1rem; 
              color: #555; 
              margin: 6px;">
          <i class="fas fa-star" aria-label="Rating" style="color: #FFD700; margin-right: 4px;"></i> ${rating}
        </div>

        <div class="stat" style="
              font-size: 1rem; 
              color: #555; 
              margin: 6px;">
          <i class="fas fa-clock" aria-label="Total Time" style="margin-right: 4px;"></i> ${totalTime} min
        </div>

        <div class="stat" style="
              font-size: 1rem; 
              color: #555; 
              margin: 6px;">
          <i class="fas fa-hourglass-start" aria-label="Prep Time" style="margin-right: 4px;"></i> ${prepTime} min
        </div>

        <div class="stat" style="
              font-size: 1rem; 
              color: #555; 
              margin: 6px;">
          <i class="fas fa-fire" aria-label="Cook Time" style="margin-right: 4px;"></i> ${cookTime} min
        </div>
      </div>

      ${
        currentRecipe.recipe_description
          ? `<div class="recipe-description" style="
              margin-bottom: 16px; 
              font-size: 1rem; 
              line-height: 1.6; 
              color: #666;
              text-align: justify;">
          <i class="fas fa-info-circle" aria-label="Description" 
             style="margin-right: 8px; color: #4CAF50;"></i>
          ${currentRecipe.recipe_description}
        </div>`
          : ""
      }

      <div class="recipe-categories" style="
            margin-bottom: 16px; 
            font-size: 0.95rem; 
            text-align: center;">
        <i class="fas fa-tags" aria-label="Categories" style="color: #4CAF50; margin-right: 6px;"></i>
        <span>${categoriesList}</span>
      </div>

      <div style="text-align: center;">
        <a href="${recipeUrl.get(currentRecipe.recipe_id)}" 
           style="text-decoration: none;">
          <button style="
                  padding: 12px 24px; 
                  background: #4CAF50; 
                  color: #fff; 
                  border: none; 
                  border-radius: 6px; 
                  font-size: 1rem; 
                  cursor: pointer;
                  transition: background 0.3s, transform 0.2s;"
                  onmouseover="this.style.background='#388E3C'; this.style.transform='scale(1.05)'"
                  onmouseout="this.style.background='#4CAF50'; this.style.transform='scale(1)'">
            View Full Recipe
          </button>
        </a>
      </div>
    </div>`;
}

function updateNutritionTab() {
  const nutritionContent = document.getElementById("nutrition");
  if (!currentRecipe?.serving_sizes?.serving) {
    nutritionContent.innerHTML = "<p>No nutrition information available</p>";
    return;
  }
  const nutrition = currentRecipe.serving_sizes.serving;
  nutritionContent.innerHTML = `
      <div class="nutrition-wrapper">
        <!-- Top Section - Calories and Vitamins side by side -->
        <div class="nutrition-top-container">
          <!-- Calories Column -->
          <div class="nutrition-column">
            <div class="nutrition-card main-card">
              <h3>Calories</h3>
              <p class="calories-value">${nutrition.calories || "N/A"}</p>
              <p class="serving-size">Per ${
                nutrition.serving_size || "serving"
              }</p>
            </div>
          </div>
          <!-- Vitamins & Minerals Column -->
          <div class="nutrition-column">
            <h3>Vitamins & Minerals</h3>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="nutrient-name">Vitamin A</span>
                <span class="nutrient-value">${
                  nutrition.vitamin_a || "0"
                }%</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Vitamin C</span>
                <span class="nutrient-value">${
                  nutrition.vitamin_c || "0"
                }%</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Calcium</span>
                <span class="nutrient-value">${nutrition.calcium || "0"}%</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Iron</span>
                <span class="nutrient-value">${nutrition.iron || "0"}%</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Bottom Section - Other Nutrient Breakdowns -->
        <div class="nutrition-bottom-container">
          <!-- Macronutrients -->
          <div class="nutrition-section">
            <h3>Macronutrients</h3>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="nutrient-name">Protein</span>
                <span class="nutrient-value">${nutrition.protein || "0"}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Carbohydrates</span>
                <span class="nutrient-value">${
                  nutrition.carbohydrate || "0"
                }g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Fat</span>
                <span class="nutrient-value">${nutrition.fat || "0"}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Fiber</span>
                <span class="nutrient-value">${nutrition.fiber || "0"}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Sugar</span>
                <span class="nutrient-value">${nutrition.sugar || "0"}g</span>
              </div>
            </div>
          </div>
          <div class="nutrition-section">
            <h3>Fats Breakdown</h3>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="nutrient-name">Saturated Fat</span>
                <span class="nutrient-value">${
                  nutrition.saturated_fat || "0"
                }g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Trans Fat</span>
                <span class="nutrient-value">${
                  nutrition.trans_fat || "0"
                }g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Monounsaturated</span>
                <span class="nutrient-value">${
                  nutrition.monounsaturated_fat || "0"
                }g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Polyunsaturated</span>
                <span class="nutrient-value">${
                  nutrition.polyunsaturated_fat || "0"
                }g</span>
              </div>
            </div>
          </div>
          <div class="nutrition-section">
            <h3>Other Nutrients</h3>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="nutrient-name">Cholesterol</span>
                <span class="nutrient-value">${
                  nutrition.cholesterol || "0"
                }mg</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Sodium</span>
                <span class="nutrient-value">${nutrition.sodium || "0"}mg</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">Potassium</span>
                <span class="nutrient-value">${
                  nutrition.potassium || "0"
                }mg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        .nutrition-wrapper {
          padding: 1rem;
        }
        .nutrition-top-container {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .nutrition-column {
          flex: 1;
        }
        .main-card {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .calories-value {
          font-size: 3rem;
          font-weight: bold;
          color: #2563eb;
          margin: 1rem 0;
        }
        .serving-size {
          color: #64748b;
          font-size: 0.875rem;
        }
        .nutrition-section {
          margin-bottom: 2rem;
        }
        .nutrition-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .nutrition-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .nutrient-name {
          color: #1e293b;
          font-weight: 500;
        }
        .nutrient-value {
          color: #2563eb;
          font-weight: 600;
        }
        h3 {
          margin-bottom: 1rem;
          color: #0f172a;
        }
      </style>
    `;
}
function updateIngredientsTab() {
  const ingredientsContent = document.getElementById("ingredients");
  try {
    if (!currentRecipe?.ingredients?.ingredient) {
      throw new Error("No ingredients data available");
    }
    const ingredients = currentRecipe.ingredients.ingredient;
    const totalIngredients = ingredients.length;
    ingredientsContent.innerHTML = `
        <div class="ingredients-container">
          <div class="ingredients-header">
            <h3>Ingredients</h3>
            <span class="ingredient-count">${totalIngredients} items</span>
          </div>
          <ul class="ingredients-list">
            ${ingredients
              .map(
                (ingredient, index) => `
              <li class="ingredient-item">
                <div class="ingredient-number">${index + 1}</div>
                <div class="ingredient-content">
                  <div class="ingredient-main">
                    <span class="ingredient-name">${ingredient.food_name}</span>
                    <span class="ingredient-measure">${
                      ingredient.ingredient_description
                    }</span>
                  </div>
                  <div class="ingredient-details">
                    <span class="measurement">${
                      ingredient.measurement_description
                    }</span>
                    <a href="${ingredient.ingredient_url}" 
                       target="_blank" 
                       class="info-link"
                       title="Learn more about ${ingredient.food_name}">
                      More Info →
                    </a>
                  </div>
                </div>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
        <style>
          .ingredients-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
          }
          .ingredients-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
          }
          .ingredient-count {
            background-color: #f1f5f9;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            color: #64748b;
          }
          .ingredients-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .ingredient-item {
            display: flex;
            align-items: flex-start;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background-color: #f8fafc;
            border-radius: 0.5rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .ingredient-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .ingredient-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            background-color: #2563eb;
            color: white;
            border-radius: 9999px;
            font-weight: 600;
            margin-right: 1rem;
            flex-shrink: 0;
          }
          .ingredient-content {
            flex: 1;
          }
          .ingredient-main {
            margin-bottom: 0.5rem;
          }
          .ingredient-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 1.1rem;
          }
          .ingredient-measure {
            margin-left: 0.5rem;
            color: #64748b;
          }
          .ingredient-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.875rem;
          }
          .measurement {
            color: #64748b;
            font-style: italic;
          }
          .info-link {
            color: #2563eb;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s ease;
          }
          .info-link:hover {
            background-color: #dbeafe;
            text-decoration: underline;
          }
          .error {
            color: #dc2626;
            padding: 1rem;
            background-color: #fef2f2;
            border-radius: 0.5rem;
            border: 1px solid #fecaca;
          }
        </style>
      `;
  } catch (error) {
    console.error("Error in updateIngredientsTab:", error);
    ingredientsContent.innerHTML = `
        <div class="error">
          <strong>Error loading ingredients:</strong> ${error.message}
        </div>
      `;
  }
}
function updateDirectionsTab() {
  const directionsContent = document.getElementById("directions");
  try {
    if (!currentRecipe || !currentRecipe.directions) {
      throw new Error("No directions data available");
    }
    const totalSteps = currentRecipe.directions.direction.length;
    const directionsList = currentRecipe.directions.direction
      .map((step, index) => {
        const isLastStep = index === totalSteps - 1;
        return `
            <li class="direction-step">
              <div class="step-number">${step.direction_number}</div>
              <div class="step-content">
                <p class="step-description">${step.direction_description}</p>
                ${
                  isLastStep
                    ? '<p class="final-note">Recipe is ready to serve!</p>'
                    : ""
                }
              </div>
            </li>
          `;
      })
      .join("");
    directionsContent.innerHTML = `
        <div class="directions-container">
          <h3 class="directions-title">Cooking Instructions</h3>
          <div class="directions-subtitle">
            <span class="total-steps">Total Steps: ${totalSteps}</span>
          </div>
          <ol class="directions-list">
            ${directionsList || "<li>No directions available.</li>"}
          </ol>
        </div>
      `;
    const style = document.createElement("style");
    style.textContent = `
        .directions-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .directions-title {
          font-size: 24px;
          color: #2d3748;
          margin-bottom: 10px;
          text-align: center;
        }
        .directions-subtitle {
          text-align: center;
          color: #718096;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
        }
        .total-steps {
          font-size: 14px;
          background-color: #edf2f7;
          padding: 4px 12px;
          border-radius: 15px;
        }
        .directions-list {
          list-style: none;
          padding: 0;
        }
        .direction-step {
          display: flex;
          gap: 20px;
          margin-bottom: 25px;
          padding: 15px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease-in-out;
        }
        .direction-step:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .step-number {
          background-color: #4caf50;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .step-content {
          flex: 1;
        }
        .step-description {
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }
        .final-note {
          margin-top: 10px;
          color: #48bb78;
          font-style: italic;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .direction-step {
            flex-direction: column;
            gap: 10px;
          }
          .step-number {
            margin-bottom: 5px;
          }
        }
      `;
    const existingStyle = document.querySelector(
      "style[data-directions-style]"
    );
    if (existingStyle) {
      existingStyle.remove();
    }
    style.setAttribute("data-directions-style", "");
    document.head.appendChild(style);
  } catch (error) {
    console.error("Error in updateDirectionsTab:", error);
    directionsContent.innerHTML = `
        <div class="error-message">
          <p>Error loading directions: ${error.message}</p>
        </div>
      `;
  }
}
function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}
function setRating(stars) {
  return "⭐".repeat(stars);
}
function clearResults() {
  document.getElementById("resultsGrid").innerHTML = "";
}
function displayError(message) {
  document.getElementById(
    "resultsGrid"
  ).innerHTML = `<p class="error">${message}</p>`;
}
function closeModal() {
  document.getElementById("recipeModal").style.display = "none";
}
function showTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document
    .querySelectorAll(".tab-button")
    .forEach((button) => button.classList.remove("active"));
  document
    .querySelector(`button[onclick="showTab('${tabId}')"]`)
    .classList.add("active");
}
window.onclick = function (event) {
  const modal = document.getElementById("recipeModal");
  if (event.target === modal) {
    closeModal();
  }
};
