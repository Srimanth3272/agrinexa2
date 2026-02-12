# Simple Google Cloud Deployment (Backend + Frontend)

Follow these steps to deploy your Django backend to Cloud Run and connect it to your React frontend.

## 1. Backend Deployment (Cloud Run)

This is the easiest way to deploy your code directly from your computer.

1.  Open your terminal in `c:\Users\akant\OneDrive\Desktop\a to z solutions`.
2.  Run the deployment command:

    ```bash
    gcloud run deploy agrobid-backend --source ./backend --region us-central1 --allow-unauthenticated
    ```

    *   Follow the prompts (enable APIs if asked).
    *   Once finished, it will show a **Service URL** (e.g., `https://agrobid-backend-xyz.a.run.app`). **Copy this URL.**

3.  **Set Environment Variables** (Important for Security):
    Update the deployed service with your secure settings:

    ```bash
    gcloud run services update agrobid-backend --update-env-vars "DEBUG=False,SECRET_KEY=your-actual-secret-key-here,ALLOWED_HOSTS=*"
    ```

## 2. Connect Frontend to Backend

Now update your frontend to talk to the new backend.

1.  Open `frontend/.env.production` (create it if missing).
2.  Add the Backend URL you copied earlier:

    ```env
    VITE_API_URL=https://agrobid-backend-xyz.a.run.app
    ```

3.  Build the frontend:

    ```bash
    cd frontend
    npm run build
    ```

## 3. Frontend Deployment (Firebase Hosting)

Deploy the frontend to Firebase (assuming you use Firebase Hosting).

1.  Login and Init (if not done):
    ```bash
    firebase login
    firebase init hosting
    ```
    *   Select "Use an existing project".
    *   Public directory: `dist`
    *   Configure as single-page app: **Yes**

2.  Deploy:
    ```bash
    firebase deploy --only hosting
    ```
    *   It will show a **Hosting URL** (e.g., `https://your-project.web.app`).

## 4. Final Connection (CORS)

Allow the frontend to access the backend.

1.  Run this command to update the backend's allowed origins:

    ```bash
    gcloud run services update agrobid-backend --update-env-vars "CORS_ALLOWED_ORIGINS=https://your-project.web.app"
    ```

**Done!** Your app is now live and connected.
