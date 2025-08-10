# 🐍 Backend Setup (Terminal 1)
cd backend

python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# ✅ Backend running at: http://127.0.0.1:8000 (keep this terminal open)

# ⚛️ Frontend Setup (Terminal 2)
cd frontend

npm install

npm run dev
# ✅ Frontend running at: http://localhost:5173 (keep this terminal open)









