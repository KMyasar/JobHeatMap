
# Job Prep Heatmap

A personalized, AI-assisted career readiness platform that helps job seekers match their skills, resume, and experience with targeted job descriptions — and guides them on how to improve.

---

##  Features

- **Auth System**: Email/password signup with OTP-based email verification.
- **First-Time Onboarding**: Users fill out key fields — skills, locations, resume (PDF/DOCX), certifications, and achievements.
- **JD Matcher**: Paste any job description and instantly view:
  - ATS score
  - Matched skills (out of 10)
  - Missing skills to improve
- **Resume Analyzer**: Compare your resume with a JD, get:
  - Spelling issues
  - ATS score
  - Suggestions to improve (via LLM)
- **Role Suggestions**: Get job roles to apply for (based on JD, resume, and location) using Google Job Search v3 API.
-  **Opening Heatmap**: See job opening trends by region and skill.
-  **Settings**: Update profile, location, skills, and resume at any time.
-  **Responsive UI**: Built with React + Tailwind CSS for a clean, minimal, and professional experience.
-  **Backend**: Supabase for auth and DB, Bolt.new for serverless logic.
-  **LLM Integration** *(Optional)*: Hugging Face models to match skills, resume, and JD semantically.

---

##  Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python + Supabase + Bolt.new Functions
- **Database/Auth**: Supabase
- **LLM/NLP**: Hugging Face Transformers (optional/future)
- **Job Feed**: Google Job Search v3 API
- **Deployment**: Bolt.new

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
📂 Folder Structure
```
```
/src
  ├── components/         # UI components (ResumeBox, JDMatch, etc.)
  ├── pages/              # Page-level views
  ├── utils/              # Helpers (e.g., resume parser, similarity scorer)
  ├── api/                # Bolt.new functions
  └── assets/             # Static files (icons, images)
```
To-Do (Post MVP)

Integrate real-time LLM (OpenAI or Hugging Face).
Add smart filters for role suggestions.
Enable PDF/Word resume parsing offline.
Improve ATS scoring logic using benchmarks.

🤝 Contributing

Pull requests and issue discussions are welcome. Make sure your changes follow the design language and keep the UI minimal.
