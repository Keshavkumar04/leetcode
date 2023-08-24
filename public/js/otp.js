// document.addEventListener("DOMContentLoaded", () => {
//     const inputs = document.querySelectorAll(".input");
//     inputs.forEach((input, index) => {
//       input.addEventListener("input", () => {
//         if (input.value.length === 1) {
//           if (index < inputs.length - 1) {
//             inputs[index + 1].focus();
//           }
//           checkAndCombine(inputs);
//         } else if (input.value.length === 0 && index > 0) {
//           inputs[index - 1].focus();
//           checkAndCombine(inputs);
//         }
//       });
//     });
//   });
  
//   function checkAndCombine(inputs) {
//     const otpValue = Array.from(inputs).map(input => input.value).join("");
//     console.log("Combined OTP:", otpValue);
//     // You can use otpValue as needed (e.g., send to server for verification)
//   }
  


  