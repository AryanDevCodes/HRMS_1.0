# 💼 Human Resource Management System (HRMS)

A **web-based HR Management System** that simplifies managing employees, attendance, and payroll.  
This system helps organizations streamline HR tasks such as tracking employee details, calculating salaries, and generating reports with a clean, intuitive dashboard.

---

## 🚀 Features

✅ Employee Management (Add / Edit / Delete / View Employees)  
✅ Department Management  
✅ Attendance Tracking  
✅ Payroll Management & Salary Slip Generation  
✅ Role-Based Authentication (Admin / HR / Employee)  
✅ Dashboard with Analytics & Reports  
✅ Responsive UI for all devices  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js / HTML / CSS / typeScript |
| **Backend** | Spring / Spring Boot  |
| **Database** |  PostgreSQL |
| **Authentication** | JWT  |
| **UI Framework** | Tailwind CSS / Material UI |
| **Charts** | Chart.js / Recharts |

---

## 📁 Project Structure

```plaintext
HRMS/
├── backend/
│   ├── server.js              # Main server entry point
│   ├── config/
│   │   └── db.js              # Database connection setup
│   ├── models/
│   │   ├── Employee.js        # Employee schema
│   │   ├── Department.js      # Department schema
│   │   ├── Attendance.js      # Attendance schema
│   │   └── Payroll.js         # Payroll schema
│   ├── routes/
│   │   ├── employeeRoutes.js  # Employee API routes
│   │   ├── deptRoutes.js      # Department API routes
│   │   ├── attendanceRoutes.js# Attendance API routes
│   │   └── payrollRoutes.js   # Payroll API routes
│   ├── controllers/
│   │   ├── employeeController.js  # Business logic for employee APIs
│   │   ├── deptController.js      # Business logic for departments
│   │   ├── attendanceController.js# Attendance CRUD functions
│   │   └── payrollController.js   # Payroll calculations
│   └── middleware/
│       └── authMiddleware.js      # JWT authentication middleware
│
├── frontend/
│   ├── public/
│   │   └── index.html         # Base HTML file
│   ├── src/
│   │   ├── App.js             # Root React component
│   │   ├── index.js           # React entry file
│   │   ├── components/        # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── pages/
│   │   │   ├── Dashboard.js   # Main dashboard view
│   │   │   ├── Employees.js   # Employee management UI
│   │   │   ├── Departments.js # Department management UI
│   │   │   ├── Attendance.js  # Attendance UI
│   │   │   ├── Payroll.js     # Payroll UI
│   │   │   └── Login.js       # Login page
│   │   ├── services/
│   │   │   └── api.js         # API calls to backend
│   │   ├── assets/            # Icons, logos, and images
│   │   └── styles/            # CSS / Tailwind files
│   └── package.json           # Frontend dependencies
│
├── docs/
│   ├── HRMS Flow.png          # System design flow (uploaded diagram)
│   └── README_Design.md       # Design documentation
│
├── .env.example               # Example environment variable file
├── .gitignore                 # Git ignore configuration
├── package.json               # Root dependencies
├── README.md                  # Main documentation (you’re reading this)
└── LICENSE                    # Open-source license (MIT recommended)
