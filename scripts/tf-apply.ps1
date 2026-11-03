param(
    [ValidateSet("dev", "test", "prod", "shared")]
    [string]$Environment = "shared"
)

Write-Host ">>> [WORKSPACE: $Environment] Applying Terraform Infrastructure..." -ForegroundColor Green
Set-Location -Path "E:\employee360\terraform"

$tfCmd = if (Test-Path ".\terraform.exe") { ".\terraform.exe" } else { "terraform" }

& $tfCmd init

# Ensure workspace state directory has existing state if migrating from default
$workspaceDir = "terraform.tfstate.d\$Environment"
if ($Environment -eq "dev" -and (Test-Path ".\terraform.tfstate") -and !(Test-Path "$workspaceDir\terraform.tfstate")) {
    New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
    Copy-Item ".\terraform.tfstate" "$workspaceDir\terraform.tfstate" -Force
    Write-Host ">>> Synchronized existing resources into workspace '$Environment'." -ForegroundColor Cyan
}

# Select or create the isolated workspace for this environment
& $tfCmd workspace select -or-create $Environment

# Apply infrastructure specifically to this environment workspace
& $tfCmd apply -var-file="environments/$Environment/$Environment.tfvars" -auto-approve

Write-Host ">>> [SUCCESS] $Environment infrastructure applied in workspace '$Environment'." -ForegroundColor Green
