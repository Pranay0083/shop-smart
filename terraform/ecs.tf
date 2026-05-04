# ECR Repository (Phase 3 Requirement)
resource "aws_ecr_repository" "app_repo" {
  name                 = "${var.app_name}-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  # Prevent accidental deletion — losing all Docker images would be catastrophic
  lifecycle {
    prevent_destroy = true
  }
}

# ECR Repository for Client
resource "aws_ecr_repository" "client_repo" {
  name                 = "${var.app_name}-client-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "${var.app_name}-cluster"

  # Prevent accidental deletion of the entire cluster
  lifecycle {
    prevent_destroy = true
  }
}

# Fetch existing AWS Academy Role
data "aws_iam_role" "ecs_execution_role" {
  name = "LabRole"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app_task" {
  family                   = "${var.app_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.ecs_execution_role.arn

  # For the initial terraform apply, we use a placeholder image.
  # The actual image will be pushed and updated by the GitHub Actions deployment step.
  container_definitions = jsonencode([
    {
      name  = "${var.app_name}-server"
      image = "nginx:latest" # Placeholder, replaced by CI/CD
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      essential = true
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = tostring(var.container_port)
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        },
        {
          name  = "DIRECT_URL"
          value = var.direct_url
        },
        {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        }
      ]
    },
    {
      name  = "${var.app_name}-client"
      image = "nginx:latest" # Placeholder, replaced by CI/CD
      portMappings = [
        {
          containerPort = var.client_port
          hostPort      = var.client_port
          protocol      = "tcp"
        }
      ]
      essential = true
    }
  ])
}

# ECS Service (Phase 3 Requirement)
resource "aws_ecs_service" "app_service" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.client_tg.arn
    container_name   = "${var.app_name}-client"
    container_port   = var.client_port
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.server_tg.arn
    container_name   = "${var.app_name}-server"
    container_port   = var.container_port
  }

  # Ignore changes to the task definition made outside of Terraform (by GitHub Actions)
  lifecycle {
    ignore_changes = [task_definition]
  }
}
