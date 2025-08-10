API_CONTRACT.md
Project: Job Sethu
Description: Job Sethu is a platform that connects college students and local people for short-term jobs. This document defines the API contract between the frontend and backend. It includes security and validation requirements to ensure consistent, secure, and reliable communication.
Authentication & Authorization

- Authentication Method: JSON Web Token (JWT)
- Token Location: HTTP Authorization header (Bearer <token>)
- Token Expiry: 7 days (refresh flow to be handled in backend)
- Authorization Rules:
  - Users can only view or edit their own profiles.
  - Only job posters can edit/delete their jobs.
  - Only job posters can select workers for their jobs.
  - Only selected workers or job posters can send messages in a job’s chat.
  - Only users involved in a job can leave reviews for each other.

Validation Rules (Global)

- Email: Must be valid format (name@example.com)
- Password: Min 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number
- Phone: Must be numeric, 10–15 digits
- Location: Required for job posting
- Payment: Must be a positive number
- Skills Array: Strings only, max 50 characters each
- Title: Max 100 characters
- Description: Max 1000 characters
- Rating: Integer 1–5

Data Models
User
{
  "id": "string (UUID)",
  "name": "string (required, max 100 chars)",
  "email": "string (required, unique, email format)",
  "passwordHash": "string",
  "phone": "string (required, 10-15 digits)",
  "location": "string (required, max 100 chars)",
  "skills": ["string (max 50 chars)"],
  "rating": "number (0-5)",
  "reviews": ["reviewId"]
}
Job
{
  "id": "string (UUID)",
  "title": "string (required, max 100 chars)",
  "description": "string (required, max 1000 chars)",
  "location": "string (required, max 100 chars)",
  "payment": "number (positive)",
  "category": "string (required, max 50 chars)",
  "urgencyFlag": "boolean",
  "postedBy": "userId",
  "applicants": ["applicationId"],
  "selectedWorkerId": "userId",
  "status": "open|in-progress|completed|cancelled",
  "createdAt": "ISODateString"
}
Application
{
  "id": "string (UUID)",
  "jobId": "jobId",
  "applicantId": "userId",
  "status": "pending|accepted|rejected",
  "appliedAt": "ISODateString"
}
ChatMessage
{
  "id": "string (UUID)",
  "jobId": "jobId",
  "senderId": "userId",
  "message": "string (required, max 1000 chars)",
  "timestamp": "ISODateString"
}
Review
{
  "id": "string (UUID)",
  "reviewerId": "userId",
  "reviewedUserId": "userId",
  "jobId": "jobId",
  "rating": "integer (1-5)",
  "comment": "string (max 500 chars)",
  "createdAt": "ISODateString"
}
Endpoints with Security & Validation
1. User Management
Register User

- Method: POST
- Path: /api/users/register
- Auth Required: No
- Validation: Email format, unique email, password strength, phone digits, required location

Request Body Example:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "9876543210",
  "location": "Goa",
  "skills": ["plumbing", "painting"]
}
Success Response (201):
{"message": "User registered successfully", "userId": "UUID"}

Login User

- Method: POST
- Path: /api/users/login
- Auth Required: No
- Validation: Email format, password required

Success Response (200):
{"token": "JWT_TOKEN", "userId": "UUID"}

Get User Profile

- Method: GET
- Path: /api/users/{id}
- Auth Required: Yes (self or admin)

2. Job Management
Create Job
Method: POST

Path: /api/jobs

Auth Required: ✅ (logged-in user)

Validation: Title, description, payment, category, location required

Request Body:

json
Copy
Edit
{
  "title": "Fix kitchen tap",
  "description": "The tap is leaking and needs repair.",
  "location": "Margao",
  "payment": 300,
  "category": "Plumbing",
  "urgencyFlag": true
}
Update Job
Auth Required: ✅ (only poster)

Validation: Same as create job

Delete Job
Auth Required: ✅ (only poster)

3. Applications
Apply for Job: Auth required, cannot apply to own job

Select Worker: Auth required, only poster can select

4. Chat
Auth Required: ✅ (only poster & selected worker)

5. Reviews
Auth Required: ✅ (only users involved in completed job)
