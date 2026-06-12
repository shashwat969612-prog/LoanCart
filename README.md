# LoanCart

Lightweight loan management web app using PHP and MongoDB.

## Prerequisites

- PHP (7.4+ recommended)
- Composer
- MongoDB server
- PHP MongoDB extension (`php-mongodb`)

## Quick Setup

1. Install the PHP MongoDB extension (Debian/Ubuntu):

	sudo apt install php-mongodb

2. Install Composer dependencies from the project root:

	composer require mongodb/mongodb

3. Ensure MongoDB is running:

	sudo systemctl start mongod

4. (Optional) If you haven't initialized Composer in this folder yet:

	composer init

## Run the App (development)

Start the built-in PHP server from the project root:

```bash
php -S localhost:8000
```

Open the app in your browser:

http://localhost:8000/loan-management.html

## Default Login Accounts

- **Admin**
  - Email: admin@loanpro.com
  - Password: admin123

- **Customer**
  - Email: shashwatloan@gmail.com
  - Password: Admin123

## Project Structure (high level)

- `api/` — server endpoints (login, signup, apply-loan, admin actions, etc.)
- `css/`, `js/`, `img/`, `UI Images/` — frontend assets
- `vendor/` — Composer dependencies and autoload
- `loan-management.html` — main frontend entry

## Notes & Troubleshooting

- Verify `config.php` in `api/` for correct MongoDB connection settings.
- If you see MongoDB connection errors, confirm the `mongod` service is running and reachable.
- Run Composer commands from the project root where `composer.json` lives.