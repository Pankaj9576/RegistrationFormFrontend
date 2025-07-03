Registration Form Application
A responsive registration form application built with React, Bootstrap, and Node.js/Express, featuring a YouTube video iframe, Google Maps integration, and email confirmation using SendGrid. The application allows users to register with detailed form validation and stores data in a MongoDB database.

Table of Contents
Features
Prerequisites
Setup Instructions
Running the Application
How the Code Works
API Endpoints
Environment Variables
Dependencies
License
Features
Responsive layout with a YouTube video on the left and a registration form on the right.
Auto-fill customer data based on a 10-digit phone number.
Real-time password strength meter.
Geolocation integration with Google Maps preview.
Form validation for all fields.
Email confirmation sent via SendGrid upon successful registration.
Device information capture (browser, OS, etc.).
Styled with custom CSS and Bootstrap.
Prerequisites
Node.js (v14.x or later)
npm (comes with Node.js)
MongoDB (local instance or MongoDB Atlas)
Google Maps API Key (for geolocation and map preview)
SendGrid API Key (for email confirmation)
Setup Instructions
1. Clone the Repository
bash

Collapse

Wrap

Run

Copy
git clone <repository-url>
cd registration-form
2. Backend Setup
Navigate to the backend folder (if separated, e.g., server directory, or adjust if in the root):
bash

Collapse

Wrap

Run

Copy
cd server
Install backend dependencies:
bash

Collapse

Wrap

Run

Copy
npm install
Create a .env file in the backend directory and add the following environment variables:
text

Collapse

Wrap

Copy
MONGODB_URI=your_mongodb_connection_string
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sendgrid_email
PORT=5000
Replace your_mongodb_connection_string with your MongoDB URI (e.g., from MongoDB Atlas).
Replace your_sendgrid_api_key with your SendGrid API key.
Replace your_verified_sendgrid_email with a verified sender email in SendGrid.
3. Frontend Setup
Navigate to the frontend folder (if separated, e.g., client directory, or adjust if in the root):
bash

Collapse

Wrap

Run

Copy
cd client
Install frontend dependencies:
bash

Collapse

Wrap

Run

Copy
npm install
Create a .env file in the frontend directory and add the following:
text

Collapse

Wrap

Copy
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
Replace your_google_maps_api_key with your Google Maps API key.
4. Install SweetAlert2 (Optional)
The success message uses SweetAlert2. Install it in the frontend:
bash

Collapse

Wrap

Run

Copy
npm install sweetalert2
Running the Application
1. Start the Backend Server
From the backend directory:
bash

Collapse

Wrap

Run

Copy
npm start
The server will run on http://localhost:5000 (or the port specified in .env).
2. Start the Frontend Development Server
From the frontend directory:
bash

Collapse

Wrap

Run

Copy
npm start
The app will open in your default browser at http://localhost:3000.
3. Test the Application
Fill out the registration form with valid data (e.g., name, email, 10-digit phone number, etc.).
Click "Get Location" to fetch and display your geolocation on a Google Map.
Submit the form to register and receive a confirmation email.
Use a 10-digit phone number that exists in the database to test auto-fill functionality.
How the Code Works
Frontend (React)
Main Component (App.js):
Uses React hooks (useState, useEffect) to manage form state and device information.
Integrates Bootstrap for layout and styling, with custom CSS in App.css for a purple background and responsive design.
Features a YouTube iframe (200x200px) on the left with autoplay, shifted slightly left with a negative margin.
Includes a form with fields for full name, email, phone number, gender, date of birth, address, password, and location data.
Validates inputs in real-time (e.g., email format, 10-digit phone number, password match).
Displays a password strength meter based on complexity (uppercase, lowercase, numbers, special characters).
Fetches geolocation using the browser's Geolocation API and previews it on a Google Map.
Auto-fills form fields if a customer with the entered phone number exists, via an API call to /api/customers/phone/:phoneNumber.
Submits data to the backend API (/api/customers) and shows a SweetAlert2 success toast on completion.
Backend (Node.js/Express)
Server Setup (server.js):
Uses Express to handle API requests and MongoDB via Mongoose for data storage.
Configures CORS to allow requests from localhost:3000 and the deployed frontend.
Connects to MongoDB using an environment variable (MONGODB_URI).
Implements a Customer schema with fields for all form data, including device info.
API Endpoints:
GET /api/test: Returns a simple message to verify the backend is running.
GET /api/customers/phone/:phoneNumber: Fetches customer data by phone number for auto-fill.
POST /api/customers: Handles form submission, validates data, saves to MongoDB, and sends a confirmation email.
Email Integration:
Uses SendGrid to send a welcome email after successful registration.
Logs email sending errors but allows registration to proceed.
Styling (App.css)
Applies the Poppins font and a black background with a semi-transparent white form container.
Positions the YouTube iframe on the left with a -20px left margin, adjusting responsively at different breakpoints (1200px, 992px, 768px).
Includes hover effects on buttons and focus states on inputs for better user experience.
API Endpoints
GET /api/test: Test backend connectivity.
GET /api/customers/phone/:phoneNumber: Retrieve customer data by phone number (returns 404 if not found).
POST /api/customers: Submit registration data (returns 201 on success, 400 on validation errors, 500 on server errors).
Environment Variables
.env (Backend):
MONGODB_URI: MongoDB connection string.
SENDGRID_API_KEY: SendGrid API key for email.
FROM_EMAIL: Verified sender email for SendGrid.
PORT: Server port (default: 5000).
.env (Frontend):
REACT_APP_GOOGLE_MAPS_API_KEY: Google Maps API key.
Dependencies
Frontend: React, React-Bootstrap, axios, @react-google-maps/api, ua-parser-js, sweetalert2.
Backend: Express, mongoose, cors, dotenv, @sendgrid/mail.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Notes
The README assumes a typical project structure with separate client and server directories. Adjust paths if your setup differs (e.g., if everything is in the root).
Ensure all API keys and environment variables are securely managed and not committed to version control.
Test the setup thoroughly, especially the email functionality and geolocation, as they depend on external services.
