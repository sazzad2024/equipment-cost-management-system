output "namespace" {
  description = "The namespace where the application is deployed"
  value       = kubernetes_namespace.app.metadata[0].name
}

output "frontend_service" {
  description = "Frontend service name"
  value       = kubernetes_service.frontend.metadata[0].name
}

output "backend_service" {
  description = "Backend service name"
  value       = kubernetes_service.backend.metadata[0].name
}

output "ingress_host" {
  description = "Ingress hostname"
  value       = "equipment.local"
}

output "access_instructions" {
  description = "Instructions to access the application"
  value       = <<-EOT
    
    ===== ACCESS INSTRUCTIONS =====
    
    1. Add to hosts file (run as Administrator):
       Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "$(minikube ip) equipment.local"
    
    2. Or use minikube tunnel:
       minikube tunnel
    
    3. Access the application:
       http://equipment.local
    
    Default credentials:
       admin / admin123 (Administrator)
       idot / idot123 (Regular User)
    
    ================================
  EOT
}

output "kubectl_commands" {
  description = "Useful kubectl commands"
  value       = <<-EOT
    
    # View all resources
    kubectl get all -n ${var.namespace}
    
    # View pod logs
    kubectl logs -f deployment/backend -n ${var.namespace}
    kubectl logs -f deployment/frontend -n ${var.namespace}
    
    # Port forward (alternative access)
    kubectl port-forward svc/frontend-service 4200:80 -n ${var.namespace}
    kubectl port-forward svc/backend-service 8083:8083 -n ${var.namespace}
    
  EOT
}
