// alert('user')

function login(){
  fetch("/user/add", {
    method: "post",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      name: "admin1",
      pwd: "admin2"
    })
  })
  .then(res=>{
    // location.reload()
  });
}

function logout(){
  fetch("/logout", {
    method: "post",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
    })
  })
  .then(res=>{
    location.reload()
  });
}