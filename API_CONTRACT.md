# API Contract: Job Sethu

This document serves as the single source of truth for the Job Sethu application's API. It defines the data models and API endpoints that the frontend and backend teams will use to communicate.

## 1. Application Features

- **User Registration & Login:** New users can create an account and log in. Assumes JWT-based authentication.
- **User Profile Management:** Users can view, update, and delete their own profiles.
- **Job Posting:** Authenticated users can create, view, update, and delete job postings.
- **Job Browsing & Discovery:** Users can view a feed of all open jobs and filter them by category, location, or urgency.
- **Job Application:** Authenticated users can apply for open jobs.
- **Job Selection:** Job posters can view applicants for their jobs and select/assign a worker.
- **Chat System:** A real-time chat system for communication between a job poster and the assigned worker.
- **Job Lifecycle Management:** Workers can mark jobs as completed, and posters can confirm completion and payment status.
- **Reviews and Ratings:** Users can leave reviews and ratings for each other after a job is completed.

---

## 2. Data Models

### User Model

Represents a user of the platform.

```json
{
  "id": "user-123",
  "name": "Vedanth Bandodkar",
  "email": "vedanth@example.com",
  "phone": "9876543210",
  "location": "Panjim, Goa",
  "skills": ["React", "Node.js", "Web Design"],
  "rating": 4.8,
  "reviews": ["review-abc", "review-def"]
}
```

### Job Model

Represents a job posting on the platform.

```json
{
  "id": "job-456",
  "title": "Simple Website for a Local Cafe",
  "description": "Need a student to build a one-page responsive website for a new cafe. Should be mobile-friendly.",
  "location": "Panjim, Goa",
  "payment": 5000,
  "category": "Web Development",
  "urgencyFlag": false,
  "postedBy": "user-789",
  "applicants": ["user-123"],
  "selectedWorkerId": null,
  "status": "open", // 'open', 'assigned', 'completed', 'paid', 'canceled'
  "createdAt": "2023-10-27T10:00:00Z"
}
```

### Application Model

Represents a user's application for a specific job.

```json
{
  "id": "app-xyz",
  "jobId": "job-456",
  "applicantId": "user-123",
  "status": "pending", // 'pending', 'accepted', 'rejected'
  "appliedAt": "2023-10-27T11:30:00Z"
}
```

### ChatMessage Model

Represents a single message in a chat conversation.

```json
{
  "id": "msg-1a2b",
  "jobId": "job-456",
  "senderId": "user-123",
  "message": "Hi! I'm interested in this job. When can we discuss?",
  "timestamp": "2023-10-27T12:00:00Z"
}
```

### Review Model

Represents a review left by one user for another after a job is completed.

```json
{
  "id": "review-abc",
  "reviewerId": "user-789",
  "reviewedUserId": "user-123",
  "jobId": "job-456",
  "rating": 5,
  "comment": "Excellent work! Very professional and delivered on time.",
  "createdAt": "2023-11-05T14:00:00Z"
}
```

---

## 3. API Endpoints

All endpoints are prefixed with `/api`. Authentication is required for all endpoints except `Login` and `Register`.

### Authentication

#### Feature: User Registration
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "Namir Khan",
    "email": "namir@example.com",
    "password": "securepassword123",
    "phone": "9988776655",
    "location": "Margao, Goa"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "user": {
      "id": "user-124",
      "name": "Namir Khan",
      "email": "namir@example.com"
    },
    "token": "ey..."
  }
  ```
- **Error Response (400):**
  ```json
  {
    "message": "Email already exists."
  }
  ```

#### Feature: User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Description:** Authenticates a user and returns a JWT.
- **Request Body:**
  ```json
  {
    "email": "namir@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "user": {
      "id": "user-124",
      "name": "Namir Khan",
      "email": "namir@example.com"
    },
    "token": "ey..."
  }
  ```
- **Error Response (401):**
  ```json
  {
    "message": "Invalid credentials."
  }
  ```

### Users

#### Feature: Get User Profile
- **Method:** `GET`
- **Endpoint:** `/api/users/:userId`
- **Description:** Retrieves the public profile of a specific user.
- **Request Body:** None
- **Success Response (200):**
  ```json
  {
    "id": "user-123",
    "name": "Vedanth Bandodkar",
    "location": "Panjim, Goa",
    "skills": ["React", "Node.js"],
    "rating": 4.8
  }
  ```
- **Error Response (404):**
  ```json
  {
    "message": "User not found."
  }
  ```

#### Feature: Update User Profile
- **Method:** `PUT`
- **Endpoint:** `/api/users/me`
- **Description:** Updates the profile of the currently authenticated user.
- **Request Body:**
  ```json
  {
    "name": "Vedanth B.",
    "location": "Bambolim, Goa",
    "skills": ["React", "Next.js", "Firebase"]
  }
  ```
- **Success Response (200):**
  ```json
  {
    "id": "user-123",
    "name": "Vedanth B.",
    "email": "vedanth@example.com",
    "location": "Bambolim, Goa",
    "skills": ["React", "Next.js", "Firebase"]
  }
  ```
- **Error Response (400):**
  ```json
  {
    "message": "Validation Error: Skills must be an array of strings."
  }
  ```
  
#### Feature: Delete User Profile
- **Method:** `DELETE`
- **Endpoint:** `/api/users/me`
- **Description:** Deletes the profile of the currently authenticated user.
- **Request Body:** None
- **Success Response (200):**
  ```json
  {
    "message": "User account deleted successfully."
  }
  ```
- **Error Response (401):**
  ```json
  {
    "message": "Authentication required."
  }
  ```

### Jobs

#### Feature: Get All Jobs
- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Description:** Retrieves a list of all `open` jobs. Can be filtered by query parameters (e.g., `/api/jobs?category=Web%20Development&location=Panjim`).
- **Request Body:** None
- **Success Response (200):**
  ```json
  [
    {
      "id": "job-456",
      "title": "Simple Website for a Local Cafe",
      "location": "Panjim, Goa",
      "payment": 5000,
      "category": "Web Development",
      "urgencyFlag": false,
      "status": "open",
      "createdAt": "2023-10-27T10:00:00Z"
    }
  ]
  ```

#### Feature: Get Single Job
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId`
- **Description:** Retrieves the full details of a single job.
- **Success Response (200):** (Returns the full Job Model object)

#### Feature: Post a New Job
- **Method:** `POST`
- **Endpoint:** `/api/jobs`
- **Description:** Creates a new job posting.
- **Request Body:**
  ```json
  {
    "title": "Urgent: Edit a Short College Project Video",
    "description": "Need to quickly edit a 5-minute video. Just trimming clips and adding music.",
    "location": "Remote",
    "payment": 1500,
    "category": "Video Editing",
    "urgencyFlag": true
  }
  ```
- **Success Response (201):** (Returns the newly created Job Model object)

#### Feature: Update a Job
- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:jobId`
- **Description:** Updates a job posting. Only the poster can update.
- **Request Body:** (Partial Job Model)
- **Success Response (200):** (Returns the updated Job Model object)
- **Error Response (403):** `{"message": "Forbidden. You are not the poster of this job."}`

#### Feature: Delete a Job
- **Method:** `DELETE`
- **Endpoint:** `/api/jobs/:jobId`
- **Description:** Deletes a job posting. Only the poster can delete.
- **Success Response (200):** `{"message": "Job deleted successfully."}`
- **Error Response (403):** `{"message": "Forbidden. You are not the poster of this job."}`

### Applications & Job Lifecycle

#### Feature: Apply for a Job
- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/apply`
- **Description:** Allows an authenticated user to apply for a job.
- **Request Body:** None
- **Success Response (201):** (Returns the new Application Model object)
- **Error Response (409):** `{"message": "You have already applied for this job."}`

#### Feature: View Applicants for a Job
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId/applicants`
- **Description:** Retrieves a list of users who have applied for a job. Only for the job poster.
- **Success Response (200):**
  ```json
  [
    {
      "applicantId": "user-123",
      "name": "Vedanth Bandodkar",
      "rating": 4.8
    }
  ]
  ```
- **Error Response (403):** `{"message": "Forbidden. You are not the poster of this job."}`

#### Feature: Select an Applicant
- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:jobId/select`
- **Description:** Assigns a job to a specific applicant. Only the job poster can do this.
- **Request Body:**
  ```json
  {
    "applicantId": "user-123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "message": "Job assigned successfully to user-123.",
    "job": {
      "id": "job-456",
      "status": "assigned",
      "selectedWorkerId": "user-123"
    }
  }
  ```

#### Feature: Mark Job as Complete
- **Method:** `PUT`
- **Endpoint:** `/api/jobs/:jobId/complete`
- **Description:** Marks a job as completed. Only the assigned worker can do this.
- **Success Response (200):** `{"message": "Job marked as complete."}`
- **Error Response (403):** `{"message": "Only the assigned worker can mark this job as complete."}`

### Chat

#### Feature: Get Chat Messages
- **Method:** `GET`
- **Endpoint:** `/api/jobs/:jobId/messages`
- **Description:** Retrieves all chat messages for a specific job. Only accessible to the poster and assigned worker.
- **Success Response (200):** (Returns an array of ChatMessage objects)
- **Error Response (403):** `{"message": "You do not have access to this chat."}`

#### Feature: Send Chat Message
- **Method:** `POST`
- **Endpoint:** `/api/jobs/:jobId/messages`
- **Description:** Sends a new message in the chat for a job.
- **Request Body:**
  ```json
  {
    "message": "Sounds good. What time?"
  }
  ```
- **Success Response (201):** (Returns the newly created ChatMessage object)

### Reviews

#### Feature: Create a Review
- **Method:** `POST`
- **Endpoint:** `/api/reviews`
- **Description:** Allows a user to review another user after a job is completed.
- **Request Body:**
  ```json
  {
    "reviewedUserId": "user-123",
    "jobId": "job-456",
    "rating": 5,
    "comment": "Did a fantastic job. Highly recommended!"
  }
  ```
- **Success Response (201):** (Returns the newly created Review object)
- **Error Response (400):** `{"message": "You cannot review a user for a job that is not completed."}`

#### Feature: Get Reviews for a User
- **Method:** `GET`
- **Endpoint:** `/api/users/:userId/reviews`
- **Description:** Retrieves all reviews for a specific user.
- **Success Response (200):** (Returns an array of Review objects)
