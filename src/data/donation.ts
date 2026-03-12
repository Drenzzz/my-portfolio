export const donationMethods = {
  local: [
    {
      name: "QRIS",
      description: "Scan menggunakan semua E-Wallet & Mobile Banking",
      imageKey: "qris",
      icon: "/images/donations/qris.svg",
      type: "qr",
    },
    {
      name: "DANA",
      number: "081931191052",
      link: "https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012021080389313560",
      imageKey: "dana",
      icon: "/images/donations/dana.svg",
      type: "ewallet",
    },
    {
      name: "Gopay",
      number: "082285672080",
      imageKey: "gopay",
      icon: "/images/donations/gopay.svg",
      type: "ewallet",
    },
    {
      name: "Seabank",
      number: "901393865137",
      icon: "/images/donations/seabank.svg",
      type: "bank",
    },
    {
      name: "BLU by BCA",
      number: "000125945033",
      icon: "/images/donations/blu.svg",
      type: "bank",
    },
    {
      name: "Superbank",
      number: "000057452799",
      icon: "/images/donations/superbank.svg",
      type: "bank",
    },
  ],
  international: [
    {
      name: "PayPal",
      url: "https://bit.ly/paypaldrenzzz",
      icon: "/images/donations/paypal.svg",
    },
    {
      name: "Ko-fi",
      url: "https://ko-fi.com/drenzzz",
      icon: "/images/donations/kofi.svg",
    },
    {
      name: "SociaBuzz",
      url: "https://sociabuzz.com/drenzzz",
      icon: "/images/donations/sociabuzz.svg",
    },
  ],
}
