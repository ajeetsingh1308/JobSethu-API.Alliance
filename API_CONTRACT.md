# API Contract: Job Sethu

This document serves as the single source of truth for the Job Sethu application's API. It defines the data models and API endpoints that the frontend and backend teams will use to communicate.

## 1. Application Features

## ✨ Features
- 🔑 **User Authentication** -- Secure signup/login using **Supabase Auth**
- 📂 **Skill-based Profiles** -- Workers showcase their skills & experience
- 📢 **AI Job Posting** -- Auto-generate detailed job descriptions with **Genkit**
- 🗂️ **Job Feed & Search** -- Browse and filter local job opportunities
- 💬 **Real-time Chat** -- In-app messaging with AI reply suggestions
- 💳 **Secure Payments** -- Seamless transactions powered by **Razorpay**
- 📍 **Location-aware** -- Match jobs and workers by proximity (via PostGIS)
- 📷 **File & Image Uploads** -- Store resumes, documents, and job images in **Supabase Storage**
- 📊 **Dashboard** -- Track job postings, applications, and payments


---

Job Sethu API Documentation
===========================

This document serves as the single source of truth for all API communication between the Job Sethu frontend and the backend.

Authentication is handled via a JWT provided by Supabase. All protected API endpoints require the token in the request header: `Authorization: Bearer <SUPABASE_JWT>`

Of course. Here is the complete API documentation for your project, including the detailed JSON request and response bodies for every endpoint.

### **Authentication & User Profile**

#### **1. Sign Up User**

  * **Endpoint**: `POST /api/auth/signup`
  * **Description**: Creates a new user account.
  * **Request Body**:
    ```json
    {
      "email": "test.user@example.com",
      "password": "strongpassword123",
      "full_name": "Test User"
    }
    ```
  * **Success Response (`201 Created`)**:
    ```json
    {
      "message": "User created successfully. Please check your email to verify your account.",
      "user": {
        "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "email": "test.user@example.com",
        "full_name": "Test User"
      }
    }
    ```

-----

#### **2. Login User**

  * **Endpoint**: `POST /api/auth/login`
  * **Description**: Authenticates a user.
  * **Request Body**:
    ```json
    {
      "email": "test.user@example.com",
      "password": "strongpassword123"
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "message": "Login successful.",
      "token": "supabase.jwt.token.string",
      "user": {
        "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "email": "test.user@example.com",
        "full_name": "Test User"
      }
    }
    ```

-----

#### **3. Get Current User Profile**

  * **Endpoint**: `GET /api/profile`
  * **Description**: Retrieves the profile data for the currently authenticated user.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "full_name": "Rohan Patel",
      "email": "rohan.patel@example.com",
      "avatar_url": "https://<...>/avatars/rohan.png",
      "skills": ["Event Support", "Driving"],
      "location": { "lat": 15.2993, "lon": 74.1240 }
    }
    ```

-----

#### **4. Update User Profile (Onboarding)**

  * **Endpoint**: `PUT /api/profile`
  * **Description**: Updates the authenticated user's profile.
  * **Request Body**:
    ```json
    {
      "full_name": "Rohan P.",
      "skills": ["Event Support", "Driving", "Photography"],
      "location": { "lat": 15.3000, "lon": 74.1250 }
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "full_name": "Rohan P.",
      "email": "rohan.patel@example.com",
      "avatar_url": "https://<...>/avatars/rohan.png",
      "skills": ["Event Support", "Driving", "Photography"],
      "location": { "lat": 15.3000, "lon": 74.1250 }
    }
    ```

-----

### **Job Management**

#### **5. Get All Jobs (Public Feed)**

  * **Endpoint**: `GET /api/jobs`
  * **Description**: Fetches a paginated list of all currently open job postings.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    {
      "jobs": [
        {
          "id": "j1a2b3c4-...",
          "title": "Need help with garden weeding",
          "amount": 200000,
          "poster": {
            "full_name": "Ananya Sharma"
          }
        }
      ],
      "page": 1,
      "has_more": true
    }
    ```

-----

#### **6. Get Single Job Details**

  * **Endpoint**: `GET /api/jobs/:id`
  * **Description**: Retrieves the complete details for a single job posting.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    {
      "id": "j1a2b3c4-...",
      "poster_id": "p1q2r3s4-...",
      "title": "Need help with garden weeding",
      "description": "Looking for someone to help clear out weeds from my vegetable patch.",
      "amount": 200000,
      "skills_required": ["Gardening", "Manual Labor"],
      "image_url": "https://<...>/images/garden.png",
      "status": "open"
    }
    ```

-----

#### **7. Create a New Job**

  * **Endpoint**: `POST /api/jobs`
  * **Description**: Creates a new job posting.
  * **Request Body**:
    ```json
    {
      "title": "Math Tutor Needed",
      "description": "Looking for a tutor for grade 10 algebra.",
      "amount": 500000,
      "skills_required": ["Mathematics", "Tutoring"]
    }
    ```
  * **Success Response (`201 Created`)**:
    ```json
    {
      "id": "m9n8b7v6-...",
      "poster_id": "a1b2c3d4-...",
      "title": "Math Tutor Needed",
      "description": "Looking for a tutor for grade 10 algebra.",
      "amount": 500000,
      "skills_required": ["Mathematics", "Tutoring"],
      "status": "open"
    }
    ```

-----

#### **8. Update a Job**

  * **Endpoint**: `PUT /api/jobs/:id`
  * **Description**: Updates the details of an existing job.
  * **Request Body**:
    ```json
    {
      "description": "Updated: Looking for a tutor for grade 10 algebra and geometry.",
      "amount": 600000
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "id": "m9n8b7v6-...",
      "title": "Math Tutor Needed",
      "description": "Updated: Looking for a tutor for grade 10 algebra and geometry.",
      "amount": 600000,
      "status": "open"
    }
    ```

-----

#### **9. Delete a Job**

  * **Endpoint**: `DELETE /api/jobs/:id`
  * **Description**: Deletes a job posting.
  * **Request Body**: None.
  * **Success Response (`204 No Content`)**: No JSON body is returned.

-----

### **Job Applications**

#### **10. Apply for a Job**

  * **Endpoint**: `POST /api/jobs/:id/apply`
  * **Description**: Allows a user to submit an application for a specific job.
  * **Request Body**: None.
  * **Success Response (`201 Created`)**:
    ```json
    {
      "id": "app1a2b3-...",
      "job_id": "j1a2b3c4-...",
      "applicant_id": "u9p8o7i6-...",
      "status": "pending"
    }
    ```

-----

#### **11. Get Applicants for a Job**

  * **Endpoint**: `GET /api/jobs/:id/applicants`
  * **Description**: Retrieves a list of all users who have applied for a job.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    [
      {
        "application_id": "app1a2b3-...",
        "status": "pending",
        "applicant": {
          "id": "u9p8o7i6-...",
          "full_name": "Priya Singh",
          "skills": ["Gardening", "Teamwork"]
        }
      }
    ]
    ```

-----

#### **12. Update Application Status**

  * **Endpoint**: `PUT /api/applications/:id`
  * **Description**: Allows the job poster to accept or reject an applicant.
  * **Request Body**:
    ```json
    {
      "status": "accepted"
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "message": "Application status updated."
    }
    ```

-----

### **Chat & Messaging**

#### **13. Get Message History for a Job**

  * **Endpoint**: `GET /api/jobs/:id/messages`
  * **Description**: Retrieves the chat history for a specific job.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    [
      {
        "id": "msg1-...",
        "sender_id": "u9p8o7i6-...",
        "content": "Hi, I'm interested in the gardening job.",
        "created_at": "2025-08-16T10:30:00Z"
      }
    ]
    ```

-----

#### **14. Send a Message**

  * **Endpoint**: `POST /api/jobs/:id/messages`
  * **Description**: Sends a new message in a job's chat.
  * **Request Body**:
    ```json
    {
      "content": "Yes, I have 2 years of landscaping experience."
    }
    ```
  * **Success Response (`201 Created`)**:
    ```json
    {
      "id": "msg2-...",
      "sender_id": "p1q2r3s4-...",
      "content": "Yes, I have 2 years of landscaping experience.",
      "created_at": "2025-08-16T10:32:00Z"
    }
    ```

-----

### **Payment Integration (Razorpay) 💳**

#### **15. Create Payment Order**

  * **Endpoint**: `POST /api/jobs/:id/create-order`
  * **Description**: Creates a Razorpay order.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    {
      "order_id": "order_K8yq8X5J2v6Z8Y",
      "razorpay_key_id": "rzp_test_12345",
      "amount": 200000,
      "currency": "INR"
    }
    ```

-----

#### **16. Handle Razorpay Webhook**

  * **Endpoint**: `POST /api/payment/webhook`
  * **Description**: Receives and verifies notifications from Razorpay.
  * **Request Body (from Razorpay)**:
    ```json
    {
      "entity": "event",
      "event": "payment.captured",
      "payload": {
        "payment": {
          "entity": {
            "id": "pay_K8z...",
            "order_id": "order_K8yq8X5J2v6Z8Y",
            "status": "captured"
          }
        }
      }
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "status": "received"
    }
    ```

-----

#### **17. Confirm Job Completion & Initiate Payout**

  * **Endpoint**: `POST /api/jobs/:id/release-funds`
  * **Description**: Initiates a payout to the worker.
  * **Request Body**: None.
  * **Success Response (`200 OK`)**:
    ```json
    {
      "message": "Payout initiated successfully.",
      "payout_id": "pout_K9a..."
    }
    ```

-----

### **AI Features (Genkit & Gemini)**

#### **18. Suggest Job Details**

  * **Endpoint**: `POST /api/ai/suggest-job-details`
  * **Description**: Generates a job description and skills.
  * **Request Body**:
    ```json
    {
      "title": "Help moving boxes to a new apartment"
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "description": "Seeking a reliable individual to assist with moving boxes...",
      "skills": ["Manual Labor", "Punctuality", "Physical Fitness"]
    }
    ```

-----

#### **19. Generate Job Image**

  * **Endpoint**: `POST /api/ai/generate-job-image`
  * **Description**: Generates an image for the job posting.
  * **Request Body**:
    ```json
    {
      "prompt": "A friendly person helping with gardening under a sunny sky"
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "image_url": "https://<...>/generated-images/new-image.png"
    }
    ```

-----

#### **20. Suggest Chat Reply**

  * **Endpoint**: `POST /api/ai/suggest-reply`
  * **Description**: Generates contextual chat reply suggestions.
  * **Request Body**:
    ```json
    {
      "job_title": "Need help with garden weeding",
      "message_history": [
        { "sender": "applicant", "content": "Hi, is this job still available?" }
      ]
    }
    ```
  * **Success Response (`200 OK`)**:
    ```json
    {
      "suggestions": [
        "Yes, it is! Are you available this week?",
        "Yes! Could you tell me about your experience?"
      ]
    }
    ```
