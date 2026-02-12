# Deploy EVERYTHING (Backend + Frontend) to Project: agrinexa2

$PROJECT_ID = "agrinexa2"
$REGION = "us-central1"
$BACKEND_SERVICE = "agrobid-backend"

Write-Host "----------------------------------------------------------------"
Write-Host "Starting Full Deployment for $PROJECT_ID"
Write-Host "----------------------------------------------------------------"

# 1. Setup Backend
Write-Host "[1/5] Setting up Google Cloud Project..."
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Deploy Backend
Write-Host "[2/5] Deploying Django Backend to Cloud Run..."
# We use --quiet to avoid prompts and force defaults
gcloud run deploy $BACKEND_SERVICE --source ./backend --platform managed --region $REGION --allow-unauthenticated --quiet

# 3. Configure Frontend (Using Firebase Rewrites to Proxy /api -> Backend)
Write-Host "[3/5] Configuring Frontend..."
# Ensure .env.production is correct for rewrites
Set-Content -Path "frontend/.env.production" -Value "VITE_API_URL=/api`nVITE_FIREBASE_PROJECT_ID=$PROJECT_ID"

# 4. Build Frontend
Write-Host "[4/5] Building React Frontend..."
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed!"; exit 1 }

# 5. Deploy Frontend
Write-Host "[5/5] Deploying to Firebase Hosting..."
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) { Write-Error "Firebase deploy failed!"; exit 1 }

Write-Host "----------------------------------------------------------------"
Write-Host "Deployment Complete!"
Write-Host "Your app should be live at: https://$PROJECT_ID.web.app"
Write-Host "The backend is connected via /api proxy."
Write-Host "----------------------------------------------------------------"
