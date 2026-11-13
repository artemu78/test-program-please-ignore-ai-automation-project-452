terraform {
  required_version = ">= 1.5.0"
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "~> 0.247.0"
    }
  }
}

provider "yandex" {
  service_account_key_file = "${path.module}/authorized_key.json"
  folder_id                = var.folder_id
}

variable "folder_id" {
  description = "Yandex Cloud folder ID for the function"
  type        = string
}

variable "caldav_url" {
  description = "CalDAV calendar collection URL"
  type        = string
}

variable "caldav_user" {
  description = "Yandex Calendar account email"
  type        = string
}

variable "caldav_password" {
  description = "CalDAV application password"
  type        = string
  sensitive   = true
}

locals {
  source_files = concat(
    ["index.js", "consultants.json", "package.json", "package-lock.json"],
    [for file in fileset("${path.module}/../src", "**") : "src/${file}"]
  )
  source_hash = sha256(join("", [for file in local.source_files : filesha256("${path.module}/../${file}")]))
}

resource "yandex_function" "booking" {
  name              = "booking"
  folder_id         = var.folder_id
  runtime           = "nodejs22"
  entrypoint        = "index.handler"
  memory            = 128
  execution_timeout = "10"
  user_hash         = local.source_hash
  environment = {
    CALDAV_URL      = var.caldav_url
    CALDAV_USER     = var.caldav_user
    CALDAV_PASSWORD = var.caldav_password
  }
  content {
    zip_filename = "${path.module}/booking.zip"
  }
}

resource "yandex_function_iam_member" "public_invoke" {
  function_id = yandex_function.booking.id
  role        = "serverless.functions.invoker"
  member      = "system:allUsers"
}

output "function_url" {
  value = "https://functions.yandexcloud.net/${yandex_function.booking.id}"
}
