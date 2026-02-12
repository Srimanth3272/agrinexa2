# Deploy to Google Cloud (AgriNexa Project)

$PROJECT_ID = "agrinexa2"
$REGION = "us-central1"
$SERVICE_NAME = "agrobid-backend"

Write-Host "Setting Google Cloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

Write-Host "Enabling necessary Google Cloud APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

Write-Host "Deploying Backend to Cloud Run..."
# Deploy source directly (requires Cloud Build)
gcloud run deploy $SERVICE_NAME --source ./backend --platform managed --region $REGION --allow-unauthenticated

Write-Host "----------------------------------------------------------------"
Write-Host "Done! If the deployment was successful, you see a Service URL above."
Write-Host "Please copy that URL and update your frontend/.env.production file."
Write-Host "----------------------------------------------------------------"
