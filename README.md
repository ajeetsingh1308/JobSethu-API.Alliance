# JobSethu-API.Alliance
Job Sethu is a full-stack web application designed as a hyper-local marketplace to connect individuals seeking short-term work (gigs) with those offering it within their community. Powered by AI, the platform      simplifies the job posting and application process, making it easier for local talent like students and freelancers to find flexible work, and for residents to get help with tasks like tutoring, gardening, or event support.

## Team Members
1) Ajeet Singh - https://github.com/ajeetsingh1308
2) Akshay Koujalgi - https://github.com/akshayk2004
3) Pranav Kokitkar - https://github.com/PranavKokitkar21
4) Shubham Galve - https://github.com/Shubhamgalave
5) Vedanth Bandodkar - https://github.com/vedanthbandodkar
   
## ⚙️ Tech Stack

### 💻 Frontend
- [React](https://react.dev/) -- Component-based UI
- [JavaScript (ES6+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) -- Core language
- [Tailwind CSS](https://tailwindcss.com/) -- Utility-first styling
- [Headless UI / Radix UI](https://headlessui.dev/) -- Accessible UI primitives

### ⚙️ Backend
- [Node.js](https://nodejs.org/) -- Runtime environment
- [Express.js](https://expressjs.com/) -- REST API server
- [Supabase](https://supabase.com/) -- PostgreSQL, Auth, and Storage

### 🤖 AI
- [Google Genkit](https://ai.google.dev/genkit) -- AI pipelines & Gemini models

### 💳 Payments
- [Razorpay](https://razorpay.com/) -- Payment gateway
- [RazorpayX](https://razorpay.com/x/) -- Worker payouts (future-ready)

### 🛠️ DevOps
- [Vercel](https://vercel.com/) -- Frontend hosting
- [Render](https://render.com/) / [Railway](https://railway.app/) -- Backend hosting
- [Supabase Cloud](https://supabase.com/) -- Managed backend services
- 
   * For more details: https://docs.google.com/document/d/1ICAK-k_wz_JMJeOv5u5qisgwSu6m4i2j4nPfHddA4A4/edit?tab=t.ighf13o7yep5

## API Documentation

The complete blueprint for our backend is documented in the API Contract. It details every endpoint, its required parameters, and expected responses.

**[View the API Contract](./API_CONTRACT.md)**

Additionally, the running backend server provides interactive Swagger UI documentation.

## Live Demo & API

The backend for this project is deployed and live on Render.

* **Base URL:** [`https://jobsethu.onrender.com`](https://jobsethu.onrender.com)
* **Live API Documentation (Swagger UI):** [`https://jobsethu.onrender.com/api-docs/`](https://jobsethu.onrender.com/api-docs/)

---

## Getting Started

Follow these instructions to set up and run the backend server on your local machine.

### **Prerequisites**
* [Node.js](https://nodejs.org/) (v18 or later)
* [npm](https://www.npmjs.com/) (comes with Node.js)

### **Backend Setup**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ajeetsingh1308/JobSethu-API.Alliance
    cd JobSethu-API.Alliance
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
    
3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure environment variables**: Create a new file named `.env` in the `backend` directory. Add your database and API keys to this file.

    Bash

    ```
    # Supabase Configuration
    SUPABASE_URL=https://<your-project-ref>.supabase.co
    SUPABASE_ANON_KEY=your_project_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_project_service_role_key

    # Razorpay Keys
    RAZORPAY_KEY_ID=rzp_test_your_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_secret

    # Google Genkit/Gemini Keys
    GOOGLE_API_KEY=your_gemini_api_key

    ```

    *Note: Replace the placeholder values with your actual keys.*

5.  **Start the server:**
    ```bash
    node server.js
    ```

* The server will now be running at `http://localhost:3000`.
* The interactive API documentation will be available at `http://localhost:3000/api-docs`.

