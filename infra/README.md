# Яндекс Облако через Terraform

Конфигурация создаёт функцию `booking`, её версию и публичное право вызова. Код и CalDAV-запросы исполняются в Яндекс Облаке; Яндекс Календарь остаётся внешним сервисом аккаунта.

Перед запуском нужны ID каталога (`folder_id`), адрес календаря, логин и пароль приложения CalDAV. Ключ сервисного аккаунта должен лежать в `infra/authorized_key.json` и не попадать в Git. У сервисного аккаунта должны быть права создавать функции и назначать права вызова в выбранном каталоге.

```bash
cd infra
export TF_VAR_folder_id='...'
export TF_VAR_caldav_url='https://caldav.yandex.ru/calendars/.../events-.../'
export TF_VAR_caldav_user='...@yandex.ru'
export TF_VAR_caldav_password='...'
cd .. && make package && cd infra
terraform init
terraform validate
terraform plan
terraform apply
terraform output -raw function_url
```

Terraform state содержит пароль CalDAV в открытом виде. Храните state в защищённом месте и не добавляйте его в Git.
