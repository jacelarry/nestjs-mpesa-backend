# Mass SMS Backend Setup Guide

## Quick Start Options

### Option 1: Docker (Recommended - Once Downloaded)
```powershell
cd e:\mass_sms_backend
docker compose up --build
```
Then run migrations in container:
```powershell
docker compose exec api npm run migrate
```

### Option 2: Local PostgreSQL Setup

#### Step 1: Start PostgreSQL
Open **pgAdmin 4** (installed with PostgreSQL):
1. Launch pgAdmin from Start Menu
2. Connect to PostgreSQL (it will start the server automatically)
3. Enter your master password

Or manually start via Stack Builder:
1. Search for "Stack Builder" in Start Menu
2. Or check Windows Services for PostgreSQL service

#### Step 2: Create Database
In pgAdmin:
1. Right-click "Databases" → Create → Database
2. Name: `mass_sms`
3. Owner: postgres
4. Click "Save"

Or via SQL:
1. Open Query Tool in pgAdmin
2. Run: `CREATE DATABASE mass_sms;`

#### Step 3: Update .env File
Edit `e:\mass_sms_backend\.env`:
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/mass_sms
```
Replace `YOUR_PASSWORD` with your PostgreSQL password.

#### Step 4: Run Migrations
```powershell
cd e:\mass_sms_backend
npm run migrate
```

#### Step 5: Start Backend
```powershell
npm run dev
```

Server will be at: http://localhost:4000

## API Endpoints

### Health Check
```
GET http://localhost:4000/health
```

### Authentication
```
POST http://localhost:4000/api/auth/register
Body: { "email": "user@example.com", "password": "password123" }

POST http://localhost:4000/api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
```

### Menu (requires Bearer token)
```
GET http://localhost:4000/api/menu
Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
```

### Token Management (requires Bearer token)
```
GET http://localhost:4000/api/tokens/balance
POST http://localhost:4000/api/tokens/purchase
Body: { "amount": 100 }
```

### M-Pesa Integration (requires Bearer token)
```
POST http://localhost:4000/api/payments/mpesa/stk
Body: { "amount": 100, "phone": "254712345678" }
```

### Webhooks (no auth required)
```
POST http://localhost:4000/api/webhooks/sms
Body: { "from": "254712345678", "message": "Hello" }

POST http://localhost:4000/api/payments/callback/mpesa
Body: { /* M-Pesa callback data */ }
```

## M-Pesa Configuration

To enable M-Pesa payments:
1. Get sandbox credentials from https://developer.safaricom.co.ke
2. Update `.env`:
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-public-url/api/payments/callback/mpesa
```

3. For local testing, use ngrok to expose your local server:
```powershell
ngrok http 4000
```
Then update `MPESA_CALLBACK_URL` with the ngrok URL.

## Testing

Run tests:
```powershell
npm test
```

## Troubleshooting

### PostgreSQL Not Running
1. Open Windows Services (`services.msc`)
2. Look for PostgreSQL service
3. Right-click → Start

Or use pgAdmin which starts PostgreSQL automatically.

### Port Already in Use
Change PORT in `.env`:
```env
PORT=5000
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure `mass_sms` database exists
- Try: `telnet localhost 5432` to test connectivity

## Next Steps

Once backend is running:
1. Test endpoints with Postman or curl
2. Integrate with Flutter app
3. Configure M-Pesa for production
4. Set up proper JWT_SECRET for production
5. Configure logging and monitoring
