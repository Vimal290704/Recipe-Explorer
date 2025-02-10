# Enhanced Recipe Explorer 🍳
A modern web application for discovering and exploring recipes with detailed nutritional information and cooking instructions.

## Project Overview
Enhanced Recipe Explorer is a feature-rich recipe search application that helps users find, explore, and understand recipes in detail. The application integrates with the FatSecret Platform API to provide comprehensive recipe information, including ingredients, nutritional facts, and step-by-step cooking instructions.

## Key Features
- **Advanced Recipe Search**: Search through thousands of recipes with real-time results.
- **Detailed Recipe Views**:
  - Comprehensive nutritional information.
  - Complete ingredient lists with measurements.
  - Step-by-step cooking instructions.
  - Preparation and cooking times.
  - Serving sizes and portions.
- **User-Friendly Interface**:
  - Clean, modern UI.
  - Responsive design for all devices.
  - Intuitive navigation.
  - Modal-based detailed views.
  - Tab-organized content.
- **Personalization**: Remembers user preferences and settings.

## Technical Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend**: Node.js, Express.js.
- **API Integration**: FatSecret Platform API.
- **Authentication**: OAuth 1.0.
- **Styling**: Custom CSS with responsive design.

## ⚠️ Known Deployment Issue
The application is currently facing a critical deployment issue with the backend server:

### Backend Deployment Problem:
- The Node.js/Express backend server fails to deploy properly to hosting platforms.
- This prevents the application from making successful API calls to the FatSecret Platform.
- The frontend cannot communicate with the backend in the production environment.

### Impact:
- Recipe search functionality is non-operational in production.
- Users cannot access recipe details or nutritional information.
- The application is limited to static content only.

## Running the Project Locally
Due to the deployment issue, we recommend running the application locally. Follow these steps:

### Installation and Setup 
I have hardcoded the counsumer key and all..... 
1. **Clone the repository:**
   ```sh
   git clone https://github.com/Vimal290704/Recipe-Explorer.git
   ```
2. **Install the dependencies**
   ```sh
   npm install cors path express crypto
   ```
3. **Run the server**
   ```sh
   node server.js
   ```
4. **Now run the frontend:**
    Run the the index.html with Live server

### Development Requirements
- **Node.js** v14 or higher.
- **npm** v6 or higher.
- **FatSecret API credentials** (obtain from [FatSecret Platform API](https://platform.fatsecret.com/)).

## Deployment Troubleshooting Guide
To resolve the backend deployment issue:

### Dependencies:
- Ensure all dependencies are listed in `package.json`.
- Check if any dependencies require additional platform configurations.
- Verify that the Node.js and npm versions are compatible with the hosting platform.

If you encounter any issues, feel free to open an issue in the repository.

---
### 📢 Contribution & Support
We welcome contributions! Feel free to submit pull requests or report issues.

For further questions or troubleshooting, please reach out via GitHub Issues.

