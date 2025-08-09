Backend Setup (Terminal 1)
1. Navigate to backend directory:
bashcd backend
2. Create and activate virtual environment:
bash# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate
3. Install Python dependencies:
bashpip install -r requirements.txt
4. Run database migrations:
bashpython manage.py migrate
5. Start the Django development server:
bashpython manage.py runserver
✅ Backend is now running on: http://127.0.0.1:8000
Keep this terminal open and running!

 Frontend Setup (Terminal 2)
Open a new terminal window/tab and follow these steps:
1. Navigate to frontend directory:
bashcd frontend
2. Install Node.js dependencies:
bashnpm install
3. Start the React development server:
bashnpm run dev
✅ Frontend is now running on: http://localhost:5173
Keep this terminal open and running too!
