const question = document.querySelector("#heading");
const input = document.querySelector("#form-input");
const okBtn = document.querySelector("#ok-btn");
const hello = document.querySelector("#hello");

const init = () => {
  okBtn.addEventListener("click", helloName);
};

const helloName = (event) => {
  hello.innerHTML = `Hello, ${input.value}`;
  okBtn.remove();
  input.remove();
  heading.remove();
};

window.onload = init;
