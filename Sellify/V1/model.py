from sqlalchemy import Column,Integer,String, DateTime, ForeignKey
from datetime import datetime
from .database import Base


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(String)
    phone_number = Column(String, unique=True)



class Products(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)
    description = Column(String)
    price = Column(Integer)
    discounted_price = Column(Integer)
    stock = Column(Integer)
    category_id = Column(Integer, ForeignKey("category.id"))



class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String)


class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_price = Column(Integer)
    created_at = Column(DateTime)

class CartItem(Base):
    __tablename__ = "cartitem"

    id = Column(Integer, primary_key=True, unique=True)
    cart_id = Column(Integer,ForeignKey("cart.id"))
    product_id = Column(Integer,ForeignKey("products.id"))
    quantity = Column(Integer)

class Orders(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, unique=True)
    user_id = Column(Integer,ForeignKey("users.id"))
    total_price = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")

class OrderItems(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, unique=True)
    order_id = Column(Integer,ForeignKey("orders.id"))
    product_id = Column(Integer,ForeignKey("products.id"))
    price = Column(Integer)
    quantity = Column(Integer)
    