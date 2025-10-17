# Healthcare Staff Scheduling System - Backend

This is the backend API for the Healthcare Staff Scheduling System, built with Node.js, Express, and MongoDB.

## Features

- **Admin Authentication**: Secure login for healthcare managers
- **Staff Management**: CRUD operations for staff members
- **Schedule Management**: Create, update, and manage staff schedules
- **Conflict Detection**: Prevents double-booking and scheduling conflicts
- **Department Management**: Organize staff by departments
- **Availability Tracking**: Track staff availability and working hours

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd CSSE-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   MONGO_URL=mongodb://localhost:27017/healthcare_system
   JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
   NODE_ENV=development
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run watch
   ```

## API Endpoints

### Authentication
- `POST /api/user/login` - Login user
- `GET /api/check-cookie` - Check authentication status
- `POST /api/logout` - Logout user

### Staff Management
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `GET /api/staff/department/:departmentId` - Get staff by department

### Schedule Management
- `GET /api/schedule` - Get all schedules (with optional filters)
- `POST /api/schedule` - Create new schedule
- `PUT /api/schedule/:id` - Update schedule
- `DELETE /api/schedule/:id` - Delete schedule
- `GET /api/schedule/available-staff` - Get available staff for time slot

### Department Management
- `GET /api/department` - Get all departments
- `POST /api/department` - Create new department
- `PUT /api/department/:id` - Update department
- `DELETE /api/department/:id` - Delete department

### Admin Management
- `POST /api/admin/register` - Register new admin
- `GET /api/admin` - Get all admins
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

## Sample Data

After running `npm run seed`, you'll have:

- **Admin User**: 
  - Email: admin@medicare.com
  - Password: admin123

- **Sample Staff Members**: 5 staff members across different departments
- **Sample Departments**: Emergency, Cardiology, Pediatrics, Surgery, Radiology
- **Sample Schedules**: A few pre-created schedules for testing

## Database Schema

### User Model
- Authentication and role management
- Supports Patient, Doctor, and Admin roles

### Staff Model
- Staff member information
- Department assignment
- Availability tracking

### Schedule Model
- Shift assignments
- Conflict detection
- Status tracking

### Department Model
- Department information
- Active/inactive status

### Admin Model
- Admin user information
- Permission management

## Error Handling

The API includes comprehensive error handling for:
- Authentication failures
- Validation errors
- Database errors
- Conflict detection
- Missing resources

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- SQL injection prevention through Mongoose

## Development

To contribute to this project:

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write clear comments
5. Test all endpoints thoroughly

## Production Deployment

Before deploying to production:

1. Change the JWT_SECRET to a secure random string
2. Set NODE_ENV to 'production'
3. Use a secure MongoDB connection string
4. Configure proper CORS settings
5. Set up proper logging
6. Use environment variables for all sensitive data
