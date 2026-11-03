# Downloads official Terraform binary directly into E:\employee360\terraform
$ProgressPreference = 'SilentlyContinue'
$version = "1.9.8"
$url = "https://releases.hashicorp.com/terraform/${version}/terraform_${version}_windows_amd64.zip"
$zipPath = "$PSScriptRoot\terraform.zip"
$destPath = "E:\employee360\terraform"

Write-Host ">>> Downloading Terraform v$version from HashiCorp..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host ">>> Extracting terraform.exe to $destPath..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $destPath -Force
Remove-Item -Path $zipPath -Force

Write-Host ">>> Terraform installed successfully!" -ForegroundColor Green
& "$destPath\terraform.exe" version
