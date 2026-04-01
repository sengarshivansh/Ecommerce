# 🛒 Sellify — Scalable E-Commerce Backend API

🚀 A **production-ready E-Commerce backend system** built with FastAPI, implementing real-world features like authentication, order processing, stock management, and admin workflows.

🔗 **Live API:**
https://sellify-backend-fprf.onrender.com/docs

---

## ✨ Key Highlights

* 🔐 JWT-based Authentication & Authorization
* 🛍️ Product Management with filtering & pagination
* 🛒 Cart → Order workflow (real-world logic)
* 📦 Order lifecycle management (admin controlled)
* 📉 Automatic stock validation & reduction
* 🧱 Clean Architecture (service + repository pattern)
* ☁️ Deployed on cloud (Render + PostgreSQL)

---

## 🧠 Problem Solved

Designed a backend system that simulates **real-world e-commerce operations**, including:

* Handling concurrent orders safely
* Maintaining inventory consistency
* Enforcing valid order status transitions
* Separating business logic from API layer

---

## 🏗️ Architecture

```text
Client → FastAPI (Routers) → Services → Repositories → Database
```

* **Routers** → request handling
* **Services** → business logic
* **Repositories** → DB queries
* **Models** → schema

✔ Scalable
✔ Maintainable
✔ Production-style structure

---

## ⚙️ Tech Stack

* **Backend:** FastAPI
* **Database:** PostgreSQL
* **ORM:** SQLAlchemy
* **Auth:** JWT (python-jose)
* **Hashing:** bcrypt
* **Deployment:** Render
* **Env Management:** dotenv

---

## 🔐 Core Features

### Authentication

* Register / Login
* Token-based authorization
* Protected routes

### Products

* Create, update, delete (Admin)
* Pagination + search + filtering

### Orders

* Create order from cart
* Stock validation before checkout
* Order history & details
* Status flow enforcement:

  ```
  pending → confirmed → shipped → delivered
  ```

### Admin Controls

* View all orders
* Update order status safely

---

## 🧪 API Testing

Interactive Swagger UI:

```text
/docs
```

* Try all endpoints
* Test authentication
* Debug requests

---

## 🚀 Running Locally

```bash
git clone https://github.com/your-username/Ecommerce.git
cd Ecommerce

python -m venv venv
source venv/bin/activate

pip install -r Sellify/requirements.txt

uvicorn Sellify.main:app --reload
```

---

## 🔑 Environment Variables

```env
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=your_database_url
```

---

## 📈 Future Improvements

* Dockerization
* Alembic migrations
* Unit & integration tests
* Redis caching
* Payment gateway integration

---

## 👨‍💻 Author

**Shivansh Shekhar**

---

## ⭐ Support

If you found this project useful, consider giving it a star.
