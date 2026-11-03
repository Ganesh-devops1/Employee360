param(
    [ValidateSet("dev", "test", "prod", "shared")]
    [string]$Environment = "shared"
)

Write-Host ">>> [WORKSPACE: $Environment] Running Terraform Plan..." -ForegroundColor Cyan
Set-Location -Path "E:\employee360\terraform"

$tfCmd = if (Test-Path ".\terraform.exe") { ".\terraform.exe" } else { "terraform" }

& $tfCmd init
& $tfCmd workspace select -or-create $Environment
& $tfCmd plan -var-file="environments/$Environment/$Environment.tfvars"
