const API_BASE = 'http://localhost:9092/api'; // Update with your backend URL

// Validate userId before making API calls
function validateUserId(userId) {
  if (!userId) {
    throw new Error('User ID is null or undefined. Please ensure the user is logged in.');
  }
}

function assertNotGuest() {
  try {
    if (localStorage.getItem('guestMode') === '1') {
      throw new Error('Guest mode is read-only. Please login to perform this action.');
    }
  } catch (e) {
    // If localStorage not available, treat as read-only safeguard
    throw new Error('Read-only mode: login required to perform this action.');
  }
}

// Fetch all products
export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

// Fetch products for a specific user
export async function fetchProductsByUser(userId) {
  validateUserId(userId);
  const res = await fetch(`${API_BASE}/products/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user products');
  return res.json();
}

// Save a product for a specific user
export async function saveProductForUser(userId, product) {
  assertNotGuest();
  validateUserId(userId);

  // Format the product data to match the required structure
  const formattedProduct = {
    barcode: product.barcode,
    name: product.name,
    brand: product.brand,
    quantity: typeof product.quantity === 'string' ? product.quantity : `${product.quantity}`,
    ingredients: Array.isArray(product.ingredients)
      ? product.ingredients.join(', ')
      : product.ingredients,
    caloriesPer100g: isNaN(parseFloat(product.caloriesPer100g)) ? 0 : parseFloat(product.caloriesPer100g),
    sugarPer100g: isNaN(parseFloat(product.sugarPer100g)) ? 0 : parseFloat(product.sugarPer100g),
    date: product.date ? product.date : new Date().toISOString().split('T')[0],
  };

  // Log the formatted product data for debugging
  console.log('Formatted Product Data:', formattedProduct);
  console.log('Final Payload Sent to API:', formattedProduct);

  const res = await fetch(`${API_BASE}/products/user/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedProduct),
  });

  // Log the response for debugging
  const responseBody = await res.text();
  console.log('API Response:', responseBody);

  if (!res.ok) throw new Error(`Failed to save product: ${responseBody}`);
  return JSON.parse(responseBody);
}

// Delete a product for a specific user
export async function deleteProductForUser(userId, productId) {
  assertNotGuest();
  validateUserId(userId);
  const res = await fetch(`${API_BASE}/products/user/${userId}/${productId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.text();
}

// Register a user
export async function registerUser(user) {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to register user');
  return res.json();
}

// Login a user
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Failed to login');
  return res.json();
}

// Fetch product details by barcode
const P_API_BASE = 'https://world.openfoodfacts.org/api/v0/product';

export async function fetchProduct(barcode) {
  const res = await fetch(`${P_API_BASE}/${barcode}.json`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  const data = await res.json();
  if (data.status !== 1) throw new Error('Product not found');
  return data.product;
}

// Send userId to n8n webhook via POST
export async function sendUserIdToN8N(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await fetch("https://mohaneswar.app.n8n.cloud/webhook-test/e10fa83d-3204-4faf-830c-fa691f73cc60", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: `${userId}` })
  });
  if (!res.ok) throw new Error('Failed to send userId to n8n');
  return res.json();
}

// Get messages from backend
export async function fetchMessages() {
  const res = await fetch("http://localhost:9092/api/messages");
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

const userId = localStorage.getItem('userId');

// fetch("https://mohaneswar.app.n8n.cloud/webhook-test/e10fa83d-3204-4faf-830c-fa691f73cc60", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ userId: `${userId}` })
// });
