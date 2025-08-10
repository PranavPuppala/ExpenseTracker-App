🐍 Backend Setup (Terminal 1)
Navigate to backend directory

bash
Copy
Edit
cd backend
Create and activate virtual environment

Create virtual environment:

bash
Copy
Edit
python -m venv .venv
Activate virtual environment:

Windows:

bash
Copy
Edit
.venv\Scripts\activate
macOS/Linux:

bash
Copy
Edit
source .venv/bin/activate
Install Python dependencies

bash
Copy
Edit
pip install -r requirements.txt
Run database migrations

bash
Copy
Edit
python manage.py migrate
Start the Django development server

bash
Copy
Edit
python manage.py runserver
✅ Backend is now running at: http://127.0.0.1:8000
Keep this terminal open and running.

⚛️ Frontend Setup (Terminal 2)
Navigate to frontend directory

bash
Copy
Edit
cd frontend
Install Node.js dependencies

bash
Copy
Edit
npm install
Start the React development server

bash
Copy
Edit
npm run dev
✅ Frontend is now running at: http://localhost:5173
Keep this terminal open and running.


