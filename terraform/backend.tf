# Terraform Remote State Configuration
# In a local test or initial bootstrap, this block can be left commented or configured to local state.
# For Azure DevOps Pipeline execution, uncomment and populate with your Azure Blob Storage details:

# terraform {
#   backend "azurerm" {
#     resource_group_name  = "rg-emp360-tfstate"
#     storage_account_name = "stemp360tfstate"
#     container_name       = "tfstate"
#     key                  = "employee360.terraform.tfstate"
#   }
# }
