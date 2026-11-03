resource "random_string" "suffix" {
  length  = 7
  special = false
  upper   = false
  keepers = {
    location = var.location
  }
}

resource "azurerm_resource_group" "shared" {
  name     = "rg-${var.project_name}-shared"
  location = var.location
  tags     = var.tags
}

resource "azurerm_container_registry" "acr" {
  name                = "cr${var.project_name}${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.shared.name
  location            = azurerm_resource_group.shared.location
  sku                 = "Basic" # Free credit optimized
  admin_enabled       = true
  tags                = var.tags
}

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                        = "kv-${var.project_name}-${random_string.suffix.result}"
  location                    = azurerm_resource_group.shared.location
  resource_group_name         = azurerm_resource_group.shared.name
  enabled_for_disk_encryption = false
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge", "Recover"
    ]
  }

  tags = var.tags
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "JwtSecretKey"
  value        = "Employee360_Super_Secret_Cloud_Key_2026_Secure!"
  key_vault_id = azurerm_key_vault.kv.id
}
