param(
    [ValidateSet("dev", "test", "prod", "all")]
    [string]$Environment = "dev",
    [string]$AcrName = ""
)

$ErrorActionPreference = "Stop"

# Dynamically find the active ACR in your Azure subscription
if ([string]::IsNullOrWhiteSpace($AcrName)) {
    Write-Host ">>> Querying active Azure Container Registry from Azure..." -ForegroundColor Cyan
    $AcrName = (az acr list --query "[0].name" -o tsv)
    if ([string]::IsNullOrWhiteSpace($AcrName)) {
        Write-Host ">>> Checking rg-emp360-shared specifically..." -ForegroundColor Cyan
        $AcrName = (az acr list --resource-group rg-emp360-shared --query "[0].name" -o tsv)
    }
}

if ([string]::IsNullOrWhiteSpace($AcrName)) {
    throw "ERROR: Could not find an active Azure Container Registry in your Azure subscription. Run 'az acr list -o table' to check."
}

Write-Host ">>> Found Active Azure Container Registry: $AcrName" -ForegroundColor Green

$timestamp = (Get-Date -Format "yyyyMMddHHmm")
$versionTag = "v2-$timestamp"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ">>> 1. Rebuilding Frontend Docker image (Version: $versionTag)..." -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

Set-Location -Path "E:\employee360"
docker build --no-cache -t employee360-frontend:$versionTag -t employee360-frontend:latest ./src/frontend

Write-Host ">>> 2. Logging into Azure Container Registry: $AcrName..." -ForegroundColor Cyan
az acr login --name $AcrName

$acrServer = "$AcrName.azurecr.io"
$fullImageTag = "$acrServer/employee360-frontend:$versionTag"

Write-Host ">>> 3. Tagging and Pushing fresh image: $fullImageTag..." -ForegroundColor Green
docker tag employee360-frontend:$versionTag $fullImageTag
docker push $fullImageTag

# Determine environments to update
$envs = if ($Environment -eq "all") { @("dev", "test", "prod") } else { @($Environment) }

foreach ($env in $envs) {
    $rg = "rg-emp360-$env"
    $frontendApp = (az webapp list --resource-group $rg --query "[?contains(name, 'frontend')].name" -o tsv)
    
    if ($frontendApp) {
        Write-Host ">>> 4. Updating App Service '$frontendApp' in $rg with new image ($fullImageTag)..." -ForegroundColor Yellow
        $cred = (az acr credential show --name $AcrName --query "{username:username, password:passwords[0].value}" -o json | ConvertFrom-Json)
        az webapp config container set --name $frontendApp --resource-group $rg `
            --container-image-name $fullImageTag `
            --container-registry-url "https://$acrServer" `
            --container-registry-user $cred.username `
            --container-registry-password $cred.password
        
        Write-Host ">>> 5. Restarting App Service '$frontendApp'..." -ForegroundColor Yellow
        az webapp restart --name $frontendApp --resource-group $rg
        Write-Host "     Done for $env! URL: https://$frontendApp.azurewebsites.net" -ForegroundColor Green
    }
}

Write-Host "==========================================================================" -ForegroundColor Green
Write-Host ">>> SUCCESS: Fresh container image deployed and running in $Environment!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
