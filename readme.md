# SnapPDF - All-in-One PDF Utility Suite

![SnapPDF Hero](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)

**SnapPDF** is a modern, high-performance web application for managing PDF documents. Built with privacy and speed in mind, it offers a suite of tools like **Merge PDF**, **Split PDF**, and **Compress PDF** directly in your browser.

> **Privacy First**: SnapPDF processes files strictly on the client-side whenever possible (using WebAssembly & JS libraries), ensuring your sensitive documents never leave your device.

---

## 🚀 Features

### 🛠️ PDF Tools

- **Merge PDF**: Combine multiple PDF files into one. Drag & drop interface with instant client-side processing using `pdf-lib`.
- **Split PDF**: (Coming Soon) Extract pages or split documents.
- **Compress PDF**: (Coming Soon) Optimize file size without losing quality.
- **Convert PDF**: (Coming Soon) Convert to/from Word, Excel, and PowerPoint.

### 🔐 Authentication & Security

- **Secure Auth**: Powered by **NextAuth.js v5** (Beta).
- **Social Login**: One-click sign-in with **Google**.
- **Credentials**: Secure Email/Password login with `bcryptjs` encryption.
- **Middleware Protection**: Automated route guards for private pages.
- **Input Validation**: Server actions protected by **Zod** schemas to prevent injection attacks.

### 🎨 Modern UI/UX

- **Dark Mode**: Sleek, professional dark theme by default.
- **Animations**: Fluid interactions powered by **Framer Motion**.
- **Responsive**: Fully optimized for Desktop, Tablet, and Mobile.
- **Design System**: Built with **Tailwind CSS** and **Lucide React** icons.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Directory)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [NeonDB](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/)
- **Validation**: [Zod](https://zod.dev/)

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18.17+
- **PNPM**: v8+ (Recommended)
- **PostgreSQL Database** (e.g., NeonDB)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/sahusateesh8737/snapPDF.git
    cd snapPDF
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in `apps/web`:

    ```env
    # Database
    DATABASE_URL="postgres://..."

    # NextAuth
    AUTH_SECRET="your_secret_key" # Linux: `openssl rand -hex 32`
    AUTH_URL="http://localhost:3000"

    # Google OAuth
    AUTH_GOOGLE_ID="your_google_client_id"
    AUTH_GOOGLE_SECRET="your_google_client_secret"
    ```

4.  **Database Migration**
    Push the schema to your database:

    ```bash
    cd apps/web
    npx drizzle-kit push
    ```

5.  **Run Development Server**

    ```bash
    # From root
    pnpm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
