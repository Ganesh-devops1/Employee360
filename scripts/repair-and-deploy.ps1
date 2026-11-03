$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ">>> STEP 1: Provisioning Shared Infrastructure (ACR & Key Vault)..." -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

Set-Location -Path "E:\employee360\terraform"
$tfCmd = if (Test-Path ".\terraform.exe") { ".\terraform.exe" } else { "terraform" }

& $tfCmd init
& $tfCmd workspace select -or-create shared
& $tfCmd apply -var-file="environments/shared/shared.tfvars" -auto-approve

Write-Host ">>> Querying newly created Azure Container Registry..." -ForegroundColor Cyan
$AcrName = (az acr list --resource-group rg-emp360-shared --query "[0].name" -o tsv)
if ([string]::IsNullOrWhiteSpace($AcrName)) {
    throw "ERROR: Failed to retrieve ACR from rg-emp360-shared."
}
$acrServer = "$AcrName.azurecr.io"
Write-Host ">>> Active ACR: $AcrName ($acrServer)" -ForegroundColor Green

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ">>> STEP 2: Building and Pushing Docker Images to $acrServer..." -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

Set-Location -Path "E:\employee360"
az acr login --name $AcrName

# 1. Build & Push Backend
Write-Host ">>> Building and pushing Backend image..." -ForegroundColor Cyan
docker build -t employee360-backend:latest ./src/backend
docker tag employee360-backend:latest "$acrServer/employee360-backend:latest"
docker push "$acrServer/employee360-backend:latest"

# 2. Build & Push Frontend (no cache for fresh Vite bundle with click features)
Write-Host ">>> Building and pushing Frontend image with Clickable Cards..." -ForegroundColor Cyan
docker build --no-cache -t employee360-frontend:latest ./src/frontend
docker tag employee360-frontend:latest "$acrServer/employee360-frontend:latest"
docker push "$acrServer/employee360-frontend:latest"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ">>> STEP 3: Updating and Restarting Azure App Services..." -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$envs = @("dev", "test", "prod")
foreach ($env in $envs) {
    $rg = "rg-emp360-$env"
    $rgExists = (az group exists --name $rg)
    if ($rgExists -eq "true") {
        $frontendApp = (az webapp list --resource-group $rg --query "[?contains(name, 'frontend')].name" -o tsv)
        $backendApp = (az webapp list --resource-group $rg --query "[?contains(name, 'backend')].name" -o tsv)

        if ($backendApp) {
            Write-Host ">>> Updating Backend in $rg ($backendApp)..." -ForegroundColor Yellow
            az webapp config container set --name $backendApp --resource-group $rg --container-image-name "$acrServer/employee360-backend:latest"
            az webapp restart --name $backendApp --resource-group $rg
        }

        if ($frontendApp) {
            Write-Host ">>> Updating Frontend in $rg ($frontendApp)..." -ForegroundColor Yellow
            az webapp config container set --name $frontendApp --resource-group $rg --container-image-name "$acrServer/employee360-frontend:latest"
            az webapp restart --name $frontendApp --resource-group $rg
            Write-Host "     Restarted $frontendApp successfully!" -ForegroundColor Green
        }
    }
}

Write-Host "==========================================================================" -ForegroundColor Green
Write-Host ">>> ALL SYSTEMS REPAIRED AND DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "Dev Frontend:  https://app-emp360-frontend-dev-009be2.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Dev Backend:   https://app-emp360-backend-dev-009be2.azurewebsites.net/swagger" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Green
