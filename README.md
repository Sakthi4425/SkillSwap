# SkillSwap: Peer-to-Peer Learning Platform

![SkillSwap Homepage](https://i.imgur.com/your-hero-image-link.png) SkillSwap is a web-based, peer-to-peer learning platform built with Django. It redefines traditional e-learning by empowering every user to serve as both a learner and a teacher, fostering a collaborative and community-driven learning environment.

This system intelligently matches users based on the skills they possess and the skills they wish to acquire, creating a dynamic ecosystem for continuous learning and personal development.

## 🎨 New React UI

The application now features a modern, responsive React frontend with:
- **Beautiful UI** built with Tailwind CSS
- **Current user display** in the navbar
- **Session status indicators**: Pending → Ongoing → Completed
- **Real-time updates** and smooth animations
- **Toast notifications** for user feedback

## ✨ Core Features

* **User Authentication:** Secure user registration, login, logout, and password management.
* **Profile Management:** Users can edit their bio, upload a profile picture, and manage their "Skills to Teach" and "Skills to Learn."
* **Intelligent Matching:** A "Find Matches" page connects learners with suitable teachers based on complementary skills.
* **Public Profiles:** Viewable profiles for all users, showcasing their bio, skills, and average rating from past sessions.
* **End-to-End Session Scheduling:**
    * Learners can **request** a session (with a specific time) from a teacher.
    * Teachers manage all requests from a central **Dashboard**.
    * Teachers can **Confirm** or **Cancel** pending requests.
    * Teachers can add a **meeting link** (e.g., Zoom, Google Meet) to a confirmed session.
    * Teachers can **mark sessions as completed**.
* **Feedback & Rating System:**
    * Learners can leave a 1-5 star rating and a comment for completed sessions.
    * Average ratings and all feedback are displayed on the teacher's public profile.
* **Responsive UI:** A clean, professional, and mobile-friendly interface built with Bootstrap and Feather Icons.

## 🛠️ Technology Stack

* **Backend:**
    * [Python](https://www.python.org/)
    * [Django](https://www.djangoproject.com/) (Web Framework)
    * [Django REST Framework](https://www.django-rest-framework.org/) (API)
    * [SQLite](https://www.sqlite.org/index.html) (Development Database)
* **Frontend:**
    * [React](https://reactjs.org/) (UI Library)
    * [Tailwind CSS](https://tailwindcss.com/) (Styling)
    * [React Router](https://reactrouter.com/) (Routing)
    * [Axios](https://axios-http.com/) (HTTP Client)
* **Python Libraries:**
    * `Pillow` (for image upload processing)
    * `djangorestframework` (REST API)
    * `django-cors-headers` (CORS support)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* [Python 3.10+](https://www.python.org/downloads/)
* [Git](https://git-scm.com/downloads/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/skillswap.git](https://github.com/Sakthi4425/skillswap.git)
    cd skillswap-g
    ```

2.  **Create and activate a virtual environment:**
    ```sh
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Create a `requirements.txt` file:**
    Create a file named `requirements.txt` in the root of your project and paste the following:
    ```
    Django
    Pillow
    django-widget-tweaks
    djangorestframework
    django-cors-headers
    ```

4.  **Install the required packages:**
    ```sh
    pip install -r requirements.txt
    ```

5.  **Apply database migrations:**
    ```sh
    python manage.py makemigrations
    python manage.py migrate
    ```

6.  **Create an admin superuser:**
    ```sh
    python manage.py createsuperuser
    ```
    (You'll be prompted to create a username and password.)

7.  **Run the development server:**
    ```sh
    python manage.py runserver
    ```

### React Frontend Setup

1.  **Navigate to frontend directory:**
    ```sh
    cd frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Start the React server:**
    ```sh
    npm start
    ```

4.  **You're all set!** Open your browser and go to `http://localhost:3000/`.

### Quick Start (Both Servers)

On Windows, simply run:
```bat
start_server.bat
```

This will start both Django and React servers automatically.

## 🧑‍🏫 How to Use

1.  **Create an Account:** Go to the homepage and click "Sign Up."
2.  **Add Skills (Admin):** To populate the database with skills, log in to the admin panel at `http://127.0.0.1:8000/admin/` with your superuser account and add `Skill` objects (e.g., "Python", "Cooking", "Guitar").
3.  **Edit Your Profile:** Log in and click "Profile" in the navbar. Upload a profile picture, write a bio, and add the skills you just created.
4.  **Find a Match:** Create a second user account and set up their profile with complementary skills. Log back in as the first user and click "Find Matches."
5.  **Request a Session:** Click the "Request" button on a user's match card.
6.  **Manage Sessions:** Log in as the teacher and go to the "Dashboard" to "Confirm" the request.
7.  **Complete the Flow:** The teacher can then add a meeting link and mark the session as "Completed."
8.  **Leave Feedback:** The learner can now "Leave Feedback" from their dashboard.
9.  **View Profile:** Click any user's name to see their public profile, updated with the new average rating and feedback.
