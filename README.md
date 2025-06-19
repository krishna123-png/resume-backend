# AI Resume & Cover Letter Generator - Backend

This is the backend for the AI Resume & Cover Letter Generator web application. It provides secure authentication, integrates with AI APIs (OpenAI or Claude), and handles submission logic to generate resumes and cover letters based on user input.

## 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- OpenAI API / Claude API
- JWT Authentication
- Nodemailer (Email Integration)
- pdf-lib (PDF generation)

## 📁 Project Structure

- `controllers/` – Request handlers for auth and submission routes
- `models/` – Mongoose schemas for User and Submission
- `routes/` – Express route definitions
- `middlewares/` – JWT token verification
- `utils/` – Utility functions for PDF creation and email delivery
- `server.js` – App entry point

## 🔐 Authentication

- Users register and login using email/password
- JWT tokens are issued and stored in frontend localStorage
- Protected routes require valid tokens via middleware

## 📩 Features

- Generate AI-powered resume and cover letter
- Automatically send them via email as PDFs
- Save all submissions to MongoDB
- View all past submissions per user

🛠️ Deployment
The backend is deployed on Render and uses a cloud-hosted MongoDB Atlas instance.
