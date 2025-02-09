# Enhanced Recipe Explorer 🍳

A modern web application for discovering and exploring recipes with detailed nutritional information and cooking instructions.

## Project Overview

Enhanced Recipe Explorer is a feature-rich recipe search application that helps users find, explore, and understand recipes in detail. The application integrates with the FatSecret Platform API to provide comprehensive recipe information including ingredients, nutritional facts, and step-by-step cooking instructions.

### Key Features

- **Advanced Recipe Search**: Search through thousands of recipes with real-time results
- **Detailed Recipe Views**: Each recipe includes:
  - Comprehensive nutritional information
  - Complete ingredient lists with measurements
  - Step-by-step cooking instructions
  - Preparation and cooking times
  - Serving sizes and portions
- **User-Friendly Interface**: Clean, modern UI with:
  - Responsive design for all devices
  - Intuitive navigation
  - Modal-based detailed views
  - Tab-organized content
- **Personalization**: Remembers user preferences and settings

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **API Integration**: FatSecret Platform API
- **Authentication**: OAuth 1.0
- **Styling**: Custom CSS with responsive design

## ⚠️ Known Deployment Issue

The application is currently facing a critical deployment issue with the backend server:

**Backend Deployment Problem**:
- The Node.js/Express backend server fails to deploy properly to hosting platforms
- This prevents the application from making successful API calls to the FatSecret Platform
- The frontend cannot communicate with the backend in the production environment

### Impact:
- Recipe search functionality is non-operational in production
- Users cannot access recipe details or nutritional information
- The application is limited to static content only

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/enhanced-recipe-explorer.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

4. Start the development server:
```bash
npm start
```

## Development Requirements

- Node.js v14 or higher
- npm v6 or higher
- FatSecret API credentials

## Deployment Troubleshooting Guide

To resolve the backend deployment issue:

1. **Platform-Specific Setup**:
   - Follow hosting platform's specific guidelines for Node.js applications
   - Check if the platform requires a specific `start` script in `package.json`
   - Verify if a `Procfile` is needed (for platforms like Heroku)

2. **Dependencies**:
   - Ensure all dependencies are listed in `package.json`
   - Check if any dependencies require additional platform configurations
   - Verify node and npm versions are compatible with the hosting platform
