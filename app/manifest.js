export default function manifest() {
  return {
    name: "GigForge - Connect Clients & Developers",
    short_name: "GigForge",
    description: "A marketplace to post projects, bid, collaborate, and get paid.",
    icons: [
      {
        src: "/icon0.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon1.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon1.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon1.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    theme_color: "#0a0a0a",
    background_color: "#0a0a0a",
    display: "standalone",
    start_url: "/",
    orientation: "portrait",
  }
}