$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ">>> FIXING CONTAINER REGISTRY AUTHENTICATION ON APP SERVICES..." -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# 1. Detect active ACR from rg-emp360-shared
$acrName = (az acr list --resource-group rg-emp360-shared --query "[0].name" -o tsv)
if ([string]::IsNullOrWhiteSpace($acrName)) {
    $acrName = "cremp360b62vgl3"
}

Write-Host ">>> Found Active ACR: $acrName ($acrName.azurecr.io)" -ForegroundColor Green

# 2. Fetch fresh ACR admin credentials
Write-Host ">>> Fetching ACR Admin credentials from Azure..." -ForegroundColor Cyan
$acrPass = (az acr credential show --name $acrName --query "passwords[0].value" -o tsv)
$acrUser = (az acr credential show --name $acrName --query "username" -o tsv)
$acrUrl  = "https://$acrName.azurecr.io"

# 3. Apply correct registry URL, Username, and Password to App Services
$envs = @("dev", "test", "prod")

foreach ($env in $envs) {
    $rg = "rg-emp360-$env"
    $rgExists = (az group exists --name $rg)
    if ($rgExists -eq "true") {
        $frontend = (az webapp list --resource-group $rg --query "[?contains(name, 'frontend')].name" -o tsv)
        $backend  = (az webapp list --resource-group $rg --query "[?contains(name, 'backend')].name" -o tsv)

        if ($frontend) {
            Write-Host ">>> Updating Registry Auth on Frontend: $frontend ($rg)..." -ForegroundColor Yellow
            az webapp config container set `
                --name $frontend `
                --resource-group $rg `
                --container-image-name "$acrName.azurecr.io/employee360-frontend:latest" `
                --container-registry-url $acrUrl `
                --container-registry-user $acrUser `
                --container-registry-password $acrPass
            az webapp restart --name $frontend --resource-group $rg
            Write-Host "     Restarted $frontend with valid credentials!" -ForegroundColor Green
        }

        if ($backend) {
            Write-Host ">>> Updating Registry Auth on Backend: $backend ($rg)..." -ForegroundColor Yellow
            az webapp config container set `
                --name $backend `
                --resource-group $rg `
                --container-image-name "$acrName.azurecr.io/employee360-backend:latest" `
                --container-registry-url $acrUrl `
                --container-registry-user $acrUser `
                --container-registry-password $acrPass
            az webapp restart --name $backend --resource-group $rg
            Write-Host "     Restarted $backend with valid credentials!" -ForegroundColor Green
        }
    }
}

Write-Host "==========================================================================" -ForegroundColor Green
Write-Host ">>> ALL APP SERVICES AUTHENTICATED AND RESTARTED!" -ForegroundColor Green
Write-Host "Wait ~30 seconds, then refresh your browser tabs." -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Green
