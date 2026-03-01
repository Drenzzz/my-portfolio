export const donationMethods = {
  local: [
    {
      name: "QRIS",
      description: "Scan menggunakan semua E-Wallet & Mobile Banking",
      imageKey: "qris",
      icon: "https://images.seeklogo.com/logo-png/39/1/quick-response-code-indonesia-standard-qris-logo-png_seeklogo-391791.png",
      type: "qr",
    },
    {
      name: "DANA",
      number: "081931191052",
      link: "https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012021080389313560",
      imageKey: "dana",
      icon: "https://static.vecteezy.com/system/resources/previews/028/766/365/non_2x/dana-payment-icon-symbol-free-png.png",
      type: "ewallet",
    },
    {
      name: "Gopay",
      number: "082285672080",
      imageKey: "gopay",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU1_u4kBagPaDWERIyFFmDI8VxkzZEd4YFWQ&s",
      type: "ewallet",
    },
    {
      name: "Seabank",
      number: "901393865137",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3IuFZtxk15Nuq9UULkVKBn0jaZb6ctPrbxg&s",
      type: "bank",
    },
    {
      name: "BLU by BCA",
      number: "000125945033",
      icon: "https://i.pinimg.com/736x/ec/d7/35/ecd735513aef74926ec482823ba8a151.jpg",
      type: "bank",
    },
    {
      name: "Superbank",
      number: "000057452799",
      icon: "https://www.superbank.id/content/img/superbank.webp",
      type: "bank",
    },
  ],
  international: [
    {
      name: "PayPal",
      url: "https://bit.ly/paypaldrenzzz",
      icon: "https://cdn-icons-png.flaticon.com/512/174/174861.png",
    },
    {
      name: "Ko-fi",
      url: "https://ko-fi.com/drenzzz",
      icon: "https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/670f5a01229bf8a18f97a3c1_favion.png",
    },
    {
      name: "SociaBuzz",
      url: "https://sociabuzz.com/drenzzz",
      icon: "https://media.licdn.com/dms/image/v2/C560BAQHYmkTFFVzAig/company-logo_200_200/company-logo_200_200/0/1645603423088/sociabuzz_logo?e=2147483647&v=beta&t=4PucXnxcQqFMCB_YwrZ44KS-yGSRtdkuJSspLoxb824",
    },
  ],
};
