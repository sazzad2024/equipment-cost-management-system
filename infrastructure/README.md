# Equipment Cost Management System - Infrastructure

This directory contains Infrastructure as Code (IaC) configurations for deploying the application.

## Directory Structure

```
infrastructure/
├── terraform/           # Terraform configurations for Kubernetes
│   ├── providers.tf     # Provider configuration (Kubernetes, Helm)
│   ├── variables.tf     # Variable definitions
│   ├── main.tf          # Main resource definitions
│   ├── outputs.tf       # Output values
│   └── terraform.tfvars.example  # Example variable values
└── README.md            # This file
```

## Quick Start

### Prerequisites

1. **Install required tools:**
   ```powershell
   # Install Minikube
   winget install minikube
   
   # Install Terraform
   winget install HashiCorp.Terraform
   
   # Install kubectl
   winget install kubectl
   
   # Install Helm
   winget install Helm.Helm
   ```

2. **Verify installations:**
   ```powershell
   minikube version
   terraform version
   kubectl version --client
   helm version
   ```

### Start Minikube Cluster

```powershell
# Start cluster with adequate resources
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify cluster is running
kubectl cluster-info
```

### Build Docker Images for Minikube

```powershell
# Point Docker CLI to Minikube's Docker daemon
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build images (from project root)
docker build -t equipment-backend:latest ./backend
docker build -t equipment-frontend:latest ./frontend

# Verify images
docker images | Select-String "equipment"
```

### Deploy with Terraform

```powershell
cd infrastructure/terraform

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your MongoDB URI and cookie secret

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply configuration
terraform apply
```

### Access the Application

```powershell
# Option 1: Add to hosts file (run as Administrator)
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "$(minikube ip) equipment.local"
# Then open: http://equipment.local

# Option 2: Use port-forward
kubectl port-forward svc/frontend-service 4200:80 -n equipment-system
# Then open: http://localhost:4200
```

## Useful Commands

```powershell
# View all resources
kubectl get all -n equipment-system

# View pod logs
kubectl logs -f deployment/backend -n equipment-system
kubectl logs -f deployment/frontend -n equipment-system

# Describe a pod (for debugging)
kubectl describe pod <pod-name> -n equipment-system

# Destroy all resources
terraform destroy

# Stop Minikube (preserves state)
minikube stop

# Delete Minikube cluster (fresh start)
minikube delete
```

## Troubleshooting

### Pods stuck in "ImagePullBackOff"
Make sure you built images using Minikube's Docker daemon:
```powershell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -t equipment-backend:latest ./backend
docker build -t equipment-frontend:latest ./frontend
```

### Cannot connect to cluster
```powershell
minikube status
minikube start
```

### Terraform state issues
```powershell
rm -rf .terraform
rm terraform.tfstate*
terraform init
```
