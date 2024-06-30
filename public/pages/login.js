document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    document.getElementById("loginForm").reset();
    login(username,password);
    console.log("Username:", username);
    console.log("Password:", password);
  });
});

async function login(username,password){
  const url='http://localhost:8080/login';
  const dataTosend={
    username:username,
    password:password,
  };

  try{
    const res=await fetch(url,{
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(dataTosend)
    });
    if(res.ok){
      const data=await res.json();
      // console.log(data);
      localStorage.setItem('token', data.token);
      window.location.href='index.html';
    }else{
      alert('Login Failed')
    }
  }catch(err){
    console.log(err);
    alert('An error occurred. Please try again.');
  }
}
