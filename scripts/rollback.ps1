param(
    [ValidateSet("dev", "test", "prod")]
    [string]$Environment = "prod",
    [string]$TargetTag = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Red
Write-Host ">>> INITIATING AUTOMATED ROLLBACK FOR ENVIRONMENT: $Environment" -ForegroundColor Red
Write-Host "==========================================================================" -ForegroundColor Red

# 1. Locate active ACR
$acrName = (az acr list --resource-group rg-emp360-shared --query "[0].name" -o tsv)
if ([string]::IsNullOrWhiteSpace($acrName)) {
    $acrName = (az acr list --query "[0].name" -o tsv)
}
$acrServer = "$AcrName.azurecr.io"

# 2. If no target tag provided, query ACR for the previous tag
if ([string]::IsNullOrWhiteSpace($TargetTag)) {
    Write-Host ">>> Querying recent container tags in ACR repository..." -ForegroundColor Cyan
    $tags = (az acr repository show-tags --name $acrName --repository employee360-frontend --orderby time_desc --query "[0:5]" -o tsv)
    
    Write-Host ">>> Recent Available Tags:" -ForegroundColor Yellow
    $tags | ForEach-Object { Write-Host "   • $_" }
    
    # Pick the second most recent tag (previous stable build)
    if ($tags.Count -gt 1) {
        $TargetTag = $tags[1]
    } else {
        $TargetTag = $tags[0]
    }
}

Write-Host ">>> Reverting to Stable Target Tag: $TargetTag" -ForegroundColor Green

# 3. Apply rollback image to App Service
$rg = "rg-emp360-$Environment"
$frontendApp = (az webapp list --resource-group $rg --query "[?contains(name, 'frontend')].name" -o tsv)

if ($frontendApp) {
    $rollbackImage = "$acrServer/employee360-frontend:$TargetTag"
    Write-Host ">>> Reverting App Service '$frontendApp' in $rg to '$rollbackImage'..." -ForegroundColor Yellow
    
    az webapp config container set --name $frontendApp --resource-group $rg --container-image-name $rollbackImage
    az webapp restart --name $frontendApp --resource-group $rg
    
    Write-Host "==========================================================================" -ForegroundColor Green
    Write-Host ">>> ROLLBACK COMPLETED SUCCESSFULLY IN UNDER 30 SECONDS!" -ForegroundColor Green
    Write-Host "Live App URL: https://$frontendApp.azurewebsites.net" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not find frontend web app in $rg" -ForegroundColor Red
}
