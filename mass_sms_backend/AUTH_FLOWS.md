# Authentication Flows

## Overview
Two distinct authentication methods now exist:
- **Admin (email + password)**: traditional registration & login.
- **User (Safaricom phone + OTP)**: passwordless, phone-based login & implicit account creation.

## Database Schema Changes
Migration files: `otp_auth_migration.sql`, `otp_cooldown_migration.sql`, `sms_tracking_migration.sql`
- **users table**: Added `phone`, `otp_code` (hashed), `otp_expires_at`, `otp_requested_at`, `otp_attempts`, `locked_until`
- **sms_deliveries table**: Tracks all SMS dispatch attempts (provider, status, message_id, errors)

## Admin Flow
1. Register: `POST /api/auth/register { email, password }` (creates admin user)
2. Login: `POST /api/auth/login { email, password }`
3. JWT payload: `{ id, email, role }`

## User OTP Flow
1. Request OTP: `POST /api/auth/otp/request { phone }`
   - Normalizes phone (e.g. 07XXXXXXX -> 2547XXXXXXX)
   - Creates user if phone not found (role='user').
   - Enforces 60s cooldown and max 5 OTPs/hour per phone.
   - Global IP rate limit: 30/hour via `otpLimiter`.
   - Sends SMS (Africa's Talking if creds present; otherwise stub logs to console).
2. Verify OTP: `POST /api/auth/otp/verify { phone, code }`
   - Validates code & expiry (5 minutes).
   - Clears otp_code and otp_expires_at then issues JWT `{ id, phone, role }`.

## Frontend Changes
- `login_screen.dart` toggles Admin vs User (OTP) modes.
- `auth_service.dart` adds `requestOtp()` and `verifyOtp()`.
- `User` model supports optional `email` and `phone`.

## Token Claims
| Field  | Admin Accounts | User Accounts |
|--------|----------------|---------------|
| id     | yes            | yes           |
| email  | yes            | maybe/null    |
| phone  | maybe/null     | yes           |
| role   | 'admin'        | 'user'        |

## Migrations Execution (Docker)
```powershell
cd e:\mass_sms_backend
docker compose exec -T db psql -U postgres -d mass_sms -f otp_auth_migration.sql
docker compose exec -T db psql -U postgres -d mass_sms -f otp_cooldown_migration.sql
docker compose exec -T db psql -U postgres -d mass_sms -f sms_tracking_migration.sql
docker compose restart api
```

## Environment Variables (Africa's Talking)
Add to `.env` if using real SMS:
```
AFRICAS_TALKING_USERNAME=your_username
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_SENDER_ID=optional_sender
```

## Phone Normalization
Implemented in `phoneUtil.ts` (Kenyan patterns). Adjust for multi-country support later.

## Rate Limiting & Cooldown
- Per phone cooldown: 60 seconds between OTP requests.
- Per phone hourly cap: 5 OTP generations.
- Per IP hourly cap: 30 requests (`otpLimiter`).
- Expiry: 5 minutes.
- **Attempt lockout**: 5 failed OTP verification attempts trigger 15-minute account lock.
- Attempts counter resets on new OTP request or successful verification.

## Promotion / Role Management
To promote a phone user to admin:
```sql
UPDATE users SET role='admin' WHERE phone='2547XXXXXXX';
```

## Security Notes
- OTP codes stored as bcrypt hashes (8 rounds).
- OTP cleared after successful verification.
- Normalization prevents duplicate accounts for same number format.
- **SMS delivery tracking**: All SMS attempts logged to `sms_deliveries` table for audit.
- **Bruteforce protection**: Account locks for 15 minutes after 5 failed attempts.
- Lockout auto-expires; attempts reset on new OTP or successful login.
- Recommend monitoring `sms_deliveries` for delivery failures and `locked_until` for abuse patterns.

## Next Enhancement Ideas
- ✅ Resend endpoint (implemented)
- ✅ Hash OTP codes (bcrypt, implemented)
- ✅ Attempt counter lockouts (implemented)
- ✅ SMS delivery tracking (implemented)
- Multi-country phone parsing with library.
- Admin UI for user/role management & SMS logs dashboard.
- Switch to queue for SMS dispatch (resilience).
- Alert system for repeated lockouts (potential attacker).
- Geolocation-based anomaly detection.
