variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "cavree.com"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for images"
  type        = string
  default     = "cavree-images"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "ec2_key_name" {
  description = "EC2 Key Pair name for SSH access (must be created in AWS Console first)"
  type        = string
  default     = "cavree-deploy"
}

variable "db_password" {
  description = "RDS PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for CloudFront (must be in us-east-1)"
  type        = string
}
