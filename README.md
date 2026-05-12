# 🧁 Munchies — School Canteen Website

**Better Food, Better School Days**

A modern, polished React web application for a school canteen. Students can browse the menu, add items to their cart, and place orders. Admins can manage products via a Shopify-style dashboard.

---

## ✨ Features

### Student Frontend
- **Menu Page** — Browse products with category filters, responsive grid, hover animations
- **Cart Drawer** — Slide-in cart with quantity controls and micro-animations
- **Two-Step Checkout** — Phone/Class info → Payment method selection (Cash/InstaPay/Telda)
- **Responsive Design** — Optimized for mobile, tablet, and desktop

### Admin Dashboard (`/admins-only`)
- **Protected Route** — Hardcoded credentials: `adminmunchies` / `admins2121`
- **Shopify-Style Product Management** — Full CRUD with image upload, variants, and live preview
- **Orders View** — View all submitted orders with payment method badges
- **Stats Overview** — Product count, categories, and order totals

### Animations (Framer Motion)
- Page transitions (fade/slide)
- Product card hover (scale + shadow)
- Cart drawer (spring slide-in)
- Layout animations for cart items
- Checkout step transitions (slide left/right)
- Modal open/close (scale + backdrop blur)
- Input focus states
- Error message fade-in
- Skeleton loading shimmer

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router** | Client-side routing |
| **Framer Motion** | Animations & transitions |
| **Supabase** | Database & storage |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Router + layout
├── index.css                # Design tokens & global styles
├── lib/
│   └── supabase.js          # Supabase clients & helpers
├── context/
│   └── CartContext.jsx       # Cart state management
├── components/
│   ├── Navbar.jsx/css        # Sticky glassmorphism navbar
│   ├── ProductCard.jsx/css   # Product card with hover animation
│   ├── Cart.jsx/css          # Slide-in cart drawer
│   └── Footer.jsx/css        # Brand footer
└── pages/
    ├── MenuPage.jsx/css      # Product menu with hero & filters
    ├── CheckoutPage.jsx/css  # Two-step checkout flow
    ├── AdminLogin.jsx/css    # Admin authentication
    └── AdminDashboard.jsx/css # Product & order management
```

---

## 🎨 Design System

- **Primary:** Olive Green `#8B9A46` (from chef hat logo)
- **Accent:** Chocolate Brown `#5C4033` (from product imagery)
- **Background:** Warm Cream `#FDFBF7`
- **Fonts:** Nunito (body) + Fredoka (headings)
- **Radius:** 8px–20px rounded corners
- **Shadows:** Subtle depth with green-tinted hover states

---

## 🔑 Supabase Configuration

| Key | Value |
|-----|-------|
| URL | `https://wpxuydfourdzanmvnhvs.supabase.co` |
| Frontend Key | `sb_publishable_jE5ydDKAa4NSnaVRXdjx2w_xxxTsPpa` |
| Admin Key | `[REDACTED FOR SECURITY]` |

### Database Tables

- **`products`**: id, name, category, price, description, image_url, variants_json
- **`orders`**: id, phone_number, class, items_json, payment_method, created_at

---

## 👤 Admin Credentials

- **Route:** `/admins-only`
- **Username:** `adminmunchies`
- **Password:** `admins2121`
