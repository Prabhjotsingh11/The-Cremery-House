document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("signupForm");
  
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      signup(username,password);
      document.getElementById("signupForm").reset();
  
      // console.log("Username:", username);
      // console.log("Password:", password);
    });
  });

  async function signup(username,password){
    const url='http://localhost:8080/signup';
    const dataTosend={
      username:username,
      password:password,
      role:'user',
    };

    try{
      const res=await fetch(url,{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(dataTosend)
      });
    }catch(err){
      console.log(err)
    }
  }