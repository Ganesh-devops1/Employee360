param(
    [ValidateSet("dev", "test", "prod", "shared")]
    [string]$Environment = "shared"
)

Write-Host ">>> [WORKSPACE: $Environment] WARNING: Destroying Infrastructure for $Environment..." -ForegroundColor Yellow
Set-Location -Path "E:\employee360\terraform"

$tfCmd = if (Test-Path ".\terraform.exe") { ".\terraform.exe" } else { "terraform" }

& $tfCmd init
& $tfCmd workspace select -or-create $Environment
& $tfCmd destroy -var-file="environments/$Environment/$Environment.tfvars" -auto-approve

Write-Host ">>> [SUCCESS] $Environment infrastructure destroyed without touching other environments." -ForegroundColor Green
