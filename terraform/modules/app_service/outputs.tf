output "backend_default_hostname" {
  value = azurerm_linux_web_app.backend.default_hostname
}

output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_default_hostname" {
  value = azurerm_linux_web_app.frontend.default_hostname
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}
