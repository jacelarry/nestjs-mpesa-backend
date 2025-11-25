# User Role Management

## Overview
The app now supports two user roles:
- **admin**: Full access to all features
- **user**: Limited access (regular users)

## Admin Features
Admins have access to:
- Interactive SMS menu creation
- API Configuration (Africa's Talking credentials)
- Settings screen
- Developer mode (manual token balance)
- All regular user features

## Regular User Features
Regular users can:
- Import contacts
- Quick Send SMS
- Buy tokens (via configured M-Pesa)
- View SMS history
- Receive and respond to interactive SMS menus

## Setting Up Roles

### 1. Apply Database Migration
Run this on your existing PostgreSQL database:
```bash
cd e:\mass_sms_backend
docker compose exec -T db psql -U postgres -d mass_sms < add_role_migration.sql
```

Or manually in pgAdmin:
```sql
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

### 2. Make Yourself Admin
After running the migration, update your account to admin role:
```sql
-- Find your user ID
SELECT id, email, role FROM users;

-- Set your account as admin (replace with your email)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Verify Role Assignment
Login to the app and check:
- Admins will see the Settings icon in the AppBar
- Admins will see "Interactive SMS" menu option
- Regular users won't see these options

## Creating Admin Users
All new registrations default to 'user' role. To promote a user to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'another-admin@example.com';
```

## Security Notes
- Only admins should have access to M-Pesa credentials
- API keys are stored in backend .env file (not in user accounts)
- Regular users can only use the pre-configured payment system
- Interactive SMS menus are created by admins, used by all users
