project_name           = "emp360"
environment            = "prod"
location               = "centralindia"
deploy_shared_services = false
app_service_sku        = "B1" # Scalable to B2/P1v3 for client presentation
sql_sku                = "Basic"
tags = {
  Project     = "Employee360"
  Environment = "PROD"
  CostCenter  = "Enterprise-Production"
}
