# SkillSwap - React + Django Setup Guide

This guide will help you set up and run the SkillSwap application with the new React frontend.

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- pip (Python package manager)
- npm (Node package manager)

## Backend Setup (Django)

### 1. Navigate to the project root directory

```bash
cd C:\Sakthi\SkillSwap
```

### 2. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create a superuser (optional, for admin access)

```bash
python manage.py createsuperuser
```

### 6. Start the Django development server

```bash
python manage.py runserver
```

The Django server should now be running at http://localhost:8000

## Frontend Setup (React)

### 1. Navigate to the frontend directory

Open a new terminal and run:

```bash
cd C:\Sakthi\SkillSwap\frontend
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the React development server

```bash
npm start
```

The React app should now be running at http://localhost:3000

## Running the Application

1. Start the Django backend (run `python manage.py runserver` in the project root)
2. Start the React frontend (run `npm start` in the frontend directory)
3. Open your browser and navigate to http://localhost:3000

## Features

### New React UI Features:
- 🎨 Modern, responsive UI with Tailwind CSS
- 👤 Current user name displayed in navbar
- 🔄 Real-time session status (Pending → Ongoing → Completed)
- 📊 Improved dashboard with session management
- 🔍 Enhanced profile management
- 💼 Better skill matching interface

### Session Status Indicators:
- **Pending** - Session requested, waiting for confirmation (Yellow badge)
- **Ongoing** - Session confirmed and in progress (Blue badge)
- **Completed** - Session finished successfully (Green badge)
- **Cancelled** - Session cancelled (Red badge)

## API Endpoints

The Django REST API provides the following endpoints:

- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User signup
- `GET /api/users/current_user/` - Get current user
- `POST /api/users/{id}/update_profile/` - Update user profile
- `GET /api/sessions/` - Get user sessions
- `POST /api/sessions/` - Create session request
- `POST /api/sessions/{id}/update_status/` - Update session status
- `GET /api/skills/matches/` - Get skill matches

## Troubleshooting

### Django Server Issues

- Make sure you're in the virtual environment
- Check if port 8000 is already in use
- Run `python manage.py migrate` if database errors occur

### React Server Issues

- Make sure Node.js is installed
- Run `npm install` if dependencies are missing
- Check if port 3000 is already in use
- Clear browser cache if UI doesn't load properly

### CORS Issues

- Ensure Django CORS headers are configured in settings.py
- Check that allowed origins include http://localhost:3000

## Production Deployment

For production deployment:

1. Build the React app: `npm run build`
2. Collect static files: `python manage.py collectstatic`
3. Update Django settings for production (debug=False, allowed hosts, etc.)
4. Use a production-ready web server (gunicorn, nginx, etc.)

## Project Structure

```
SkillSwap/
├── frontend/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   └── utils/         # API utilities
│   └── package.json
├── users/                 # Django app for user management
├── skills/                # Django app for skills
├── scheduling/            # Django app for session management
└── manage.py             # Django management script
```

## Support

For issues or questions, please refer to the project documentation or contact the development team.

