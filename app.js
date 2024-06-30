const logoutBtn=document.getElementById('logoutbtn');
const loginBtn=document.getElementById('loginbtn');
const cartBtn=document.getElementById('cartbtn');

logoutBtn.addEventListener('click',()=>{
    let token=localStorage.removeItem('token');
    checkAuth();
})

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      // User is logged in
      loginBtn.style.display = "none";
      logoutBtn.style.display = "block";
      cartBtn.style.display="block";
    } else {
      // User is not logged in
      loginBtn.style.display = "block";
      logoutBtn.style.display = "none";
      cartBtn.style.display="none";
    }
  }
checkAuth();

document.addEventListener("DOMContentLoaded", async () => {
  try {
      const products = await fetchProducts();
      renderProducts(products);
  } catch (error) {
      console.error('Error fetching products:', error);
  }
});

async function fetchProducts() {
  const response = await fetch('http://localhost:8080/getInventory');
  return response.json();
}

function renderProducts(products) {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = ''; // Clear existing products

  products.forEach(product => {
      const productDiv = document.createElement("div");
      productDiv.className = "product";

      productDiv.innerHTML = `
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          <div class="price">₹${product.price}</div>
          <button onclick="addToCart('${product._id}')">Add to Cart</button>
      `;

      productsContainer.appendChild(productDiv);
  });
}

async function addToCart(productId) {
  const url='http://localhost:8080/addtocart'
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, token }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      alert('Ice cream added to cart!');
    } else {
      alert('Error adding to cart.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while adding the item to the cart.');
  }
}

