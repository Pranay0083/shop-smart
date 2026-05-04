# E-Commerce Backend API

A production-ready Node.js backend using Express, Prisma, and PostgreSQL (Supabase). This includes features like user authentication, product management, cart handling, and order placement with COD payment.

## 🚀 Setup Instructions

Follow these steps to get the backend running locally.

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` if not already done.
2. Fill in your Supabase connection string for `DATABASE_URL`.
3. Fill in your `SUPABASE_URL` and `SUPABASE_KEY`.
4. Replace `JWT_SECRET` with a strong random string.

### 3. Database Setup (Prisma Migration)

Run the following command to push the schema to your Supabase PostgreSQL database and generate the Prisma client:

```bash
npx prisma migrate dev --name init
```

_Note: If you run into issues, try `npx prisma db push` followed by `npx prisma generate`._

### 4. Run the Server

For development (with hot-reload):

```bash
npm run dev
```

For production:

```bash
npm start
```

## 🗺️ API Routes

### User

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/admin` _(Admin Only)_

### Product

- `POST /api/product/add` _(Admin Only)_
- `DELETE /api/product/remove` _(Admin Only)_
- `GET /api/product/single`
- `GET /api/product/list`

### Cart

- `GET /api/cart/get` _(Protected)_
- `POST /api/cart/add` _(Protected)_
- `PUT /api/cart/update` _(Protected)_

### Order

- `POST /api/order/place` _(Protected)_
- `GET /api/order/userorders` _(Protected)_
- `GET /api/order/list` _(Admin Only)_
- `PUT /api/order/status` _(Admin Only)_

## 🛠️ Built With

- **Node.js** & **Express**
- **Prisma** ORM
- **PostgreSQL** via Supabase
- **JWT** Authentication
- **Bcrypt** Password Hashing
