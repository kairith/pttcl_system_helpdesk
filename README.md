Next.js Project
Welcome to your Next.js project, bootstrapped with create-next-app. This README provides step-by-step instructions to set up, run, and deploy your application.
Table of Contents

Getting Started
Prerequisites
Database Setup
Environment Configuration
Running the Project


Learn More
Deployment
Contributing

Getting Started
Follow these steps to set up and run the project locally.
Prerequisites

Node.js: Ensure you have Node.js installed (version 16 or higher recommended).
XAMPP: Install XAMPP for MySQL database management (recommended) or use a MySQL CLI if preferred.
Git: Required to clone the repository.

Database Setup

Clone the Repository:
git clone <repository-url>
cd <repository-name>


Set Up MySQL Database:

Download the database dump from this Google Drive link https://drive.google.com/file/d/19QoUaBChegaqiHtL4ZKAXKzOdjgjF6G3/view?usp=drive_link.
Start XAMPP and ensure the MySQL service is running.
Import the downloaded database dump into your MySQL server using phpMyAdmin or the MySQL CLI.
Navigate to the database folder in the project and update the database configuration file (e.g., config.js or similar) with your MySQL settings (host, user, password, database name).



Environment Configuration

Set Up Environment Variables:
Download the .env file from this Google Drive link https://drive.google.com/file/d/1uvhZVe3FX6hrD5E7WbTIM0gE3T-FddBB/view?usp=sharing.
Rename the downloaded file to .env and place it in the root directory of the project (outside the app folder).
Update the .env file with your specific configuration (e.g., database credentials, API keys, etc.).



Running the Project

Install dependencies:
npm install
# or
yarn install
# or
pnpm install
# or
bun install


Start the development server:
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open http://localhost:3000 in your browser to view the application.

Start editing by modifying app/page.tsx. The page will auto-update as you make changes.



Note: This project uses next/font to optimize and load Geist, a modern font family by Vercel.

Learn More
To deepen your understanding of Next.js, explore these resources:

Next.js Documentation - Comprehensive guide to Next.js features and APIs.
Learn Next.js - Interactive tutorial for building with Next.js.
Next.js GitHub Repository - Contribute or provide feedback to the Next.js project.

Deployment
Deploy your Next.js application effortlessly using the Vercel Platform from the creators of Next.js. For detailed instructions, refer to the Next.js deployment documentation.
Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request on the project's GitHub repository. Your feedback helps improve the project.

Built with ❤️ using Next.js
