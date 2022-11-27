const scriptURL = "https://script.google.com/macros/s/AKfycbxbVC7zhbrE_t_rNeeDiL52b5hk1uBsQI26251SZoAd1_VVe0zEYeZ8WFV0vAMuLRlO/exec";
const form = document.forms["submit-to-google-sheet"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => console.log("Success!", response))
    .catch((error) => console.error("Error!", error.message));
});
