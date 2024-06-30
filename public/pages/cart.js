async function render(){
  const url='http://localhost:8080/getCart';
  try {
    const token = localStorage.getItem('token'); 
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    displayCart(data);
    console.log(data);
  }catch(err){
    console.log(err)
  }
}
function displayCart(data) {
  const cartContainer = document.getElementById('cart-container');
  const totalElement = document.getElementById('total');
  cartContainer.innerHTML = ''; // Clear previous content
  
  if (data.success) {
      let totalBill = 0;
      const cart = data.cart;
      cart.forEach(item => {
          const product = item.productId;
          const productHTML = `
              <div class="cart-item">
                  <div class="cart-item-details">
                      <h3>${product.title}</h3>
                      <p>Price: ₹${product.price}</p>
                      <p>Quantity: ${item.quantity}</p>
                      <button class="delete-button" onclick="deleteItem('${product._id}', ${item.quantity})">Remove</button>
                  </div>
              </div>
          `;
          cartContainer.innerHTML += productHTML;
          totalBill += product.price * item.quantity;
      });
      totalElement.textContent = `Total Bill: ₹${totalBill}`;
  } else {
      cartContainer.innerHTML = '<p>No items in the cart</p>';
  }
}

async function deleteItem(productId,itemquantity) {
//   console.log(productId);
  const url='http://localhost:8080/removefromcart';
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: productId, quantity:itemquantity })
  });
  const data = await response.json();
  if (data.success) {
      render();
  } else {
      console.error(data.message);
  }
}
document.addEventListener('DOMContentLoaded', render);
