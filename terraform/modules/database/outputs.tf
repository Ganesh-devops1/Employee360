output "server_name" {
  value = azurerm_mssql_server.sql.name
}

output "server_fqdn" {
  value = azurerm_mssql_server.sql.fully_qualified_domain_name
}

output "database_name" {
  value = azurerm_mssql_database.db.name
}

output "connection_string" {
  value     = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.db.name};Persist Security Info=False;User ID=${var.admin_username};Password=${var.admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  sensitive = true
}
