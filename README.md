# TrustGuard - Secure Escrow System (MERN Stack)

**TrustGuard** is a secure and user-friendly **escrow system** built with the **MERN stack** (MongoDB, Express.js, React, Node.js).  
It ensures safe transactions between two parties by holding funds until both parties fulfill their obligations.

---

## 🚀 Features

- **User Authentication** (Login/Signup with JWT)
- **Create Deals** between buyer and seller
- **Escrow Logic**: Buyer deposits funds, seller ships the product, and buyer confirms delivery
- **Deal Status Updates**:
  - Mark as Shipped (Seller)
  - Mark as Delivered (Buyer)
- **OTP-based Deal Approval** for extra security
- **Email Notifications** for deal events
- **Delete Deal** with notifications to the other party
- Responsive and user-friendly **React frontend**
- Secure **Express.js backend** with MongoDB

---

## 🛠 Tech Stack

- **Frontend**: React, Bootstrap, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Email Service**: Nodemailer
- **Environment Management**: dotenv

---

## 📂 Project Structure
```bash
TrustGuard/
│
├── client/ # React frontend
│ ├── src/
│ ├── public/
│ └── package.json
│
├── server/ # Express backend
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── index.js
│ └── package.json
│
├── .gitignore
├── README.md
└── .env.example
```
---

## ⚙️ Setup Instructions

### 1. **Clone the Repo**
```bash
git clone https://github.com/priyanshuu-02/TrustGuard-MiddleMan-App.git
cd TrustGuard-MiddleMan-App
```
### 2. **Setup Backend**
```bash
cd server
npm install
```

**Create a .env file in server/:**
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

**Start the Backend**
```bash
npm start
```

### 3. **Setup Frontend**
```bash
cd ../client
npm install
npm start
```





