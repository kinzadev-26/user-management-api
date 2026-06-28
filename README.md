# User Management REST API

A secure, scalable REST API built with **NestJS**, **MongoDB**, and **JWT Authentication**.
Developed as part of Week 3 Backend Development Internship.

---

## Tech Stack

| Technology     | Purpose                        |
|----------------|--------------------------------|
| NestJS         | Backend framework (TypeScript) |
| MongoDB Atlas  | Cloud NoSQL database           |
| Mongoose       | MongoDB ODM                    |
| JWT            | Authentication tokens          |
| bcryptjs       | Password hashing               |
| Passport.js    | Auth strategy middleware       |
| class-validator| DTO input validation           |

---

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/kinzadev-26/user-management-api.git
cd user-management-api
```

**2. Install dependencies**
```bash
npm install
```

**3. Setup environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/userdb
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

**4. Seed the database**
```bash
npm run seed
```

**5. Start the development server**
```bash
npm run start:dev
```

Server runs at: `http://localhost:5000/api`

---

## API Endpoints

### Auth Endpoints

| Method | Endpoint                  | Access  | Description              |
|--------|---------------------------|---------|--------------------------|
| POST   | /api/auth/register        | Public  | Register new user        |
| POST   | /api/auth/login           | Public  | Login and get tokens     |
| POST   | /api/auth/logout          | Private | Logout current user      |
| GET    | /api/auth/me              | Private | Get logged in user       |
| POST   | /api/auth/refresh-token   | Public  | Refresh access token     |

### User Endpoints


| Method | Endpoint                      | Access      | Description              |
|--------|-------------------------------|-------------|--------------------------|
| GET    | /api/users                    | Admin only  | Get all users            |
| GET    | /api/users/profile            | Any user    | Get own profile          |
| GET    | /api/users/:id                | Admin/Self  | Get user by ID           |
| PUT    | /api/users/:id                | Admin/Self  | Update user              |
| DELETE | /api/users/:id                | Admin only  | Delete user              |
| PATCH  | /api/users/:id/status         | Admin only  | Toggle active status     |


---

## Project Structure
```
src/
├── auth/
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── dto/
│   │   └── update-user.dto.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── roles.decorator.ts
│       └── current-user.decorator.ts
├── app.module.ts
├── main.ts
└── seeder.ts
```

## Postman Collection

Import the collection into Postman:

1. Open Postman
2. Click **Import**
3. Select `NestJS user managemant.postman_collection.json`
4. Also import `NestJS user managemant.postman_environment.json`
5. Select the environment from top-right dropdown
6. Run **Login - Admin** first to auto-save the token
7. All other requests will use the token automatically


---

## Author

**Kinza Imtiaz**
- GitHub: [@Kinza_dev](https://github.com/kinzadev-26)
- Email: kinzaimtiaz313@gmail.com
---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
