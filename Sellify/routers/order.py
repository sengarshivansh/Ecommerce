from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from ..database import SessionLocal
from ..model import Users, Products, Category, Cart, CartItem, Orders, OrderItems
from Sellify.routers.auth import get_current_admin, get_current_user, get_db

router = APIRouter(
    prefix="/order",
    tags=["Order"]
)

class OrderResponse(BaseModel):
    id: int
    total_price: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrderUpdateStatusRequest(BaseModel):
    status: str 


@router.post("/create")
def create_order(
    db:Session = Depends(get_db),
    user: Users = Depends(get_current_user)
):
    try:
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()

        if not cart:
            raise HTTPException(
                status_code = 404,
                detail = "Cart not Found"
            )
        
        items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
        
        if not items:
            raise HTTPException(
                status_code = 400,
                detail = "Cart is empty"
            )

        validated_items = []
        for item in items:
            #Here we are using Row locking to avoid race condition
            product = (
                db.query(Products)
                .filter(Products.id == item.product_id)
                .with_for_update()
                .first()
            )
            if not product:
                raise HTTPException(
                    status_code = 404,
                    detail= "Product Not Found"
                )
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code = 400,
                    detail= "Not Enough Product Available"
                )
            validated_items.append((item,product))

        order = Orders(
            user_id = user.id,
            total_price = 0,
            status = "pending"
        )

        db.add(order)
        db.flush()

        total_price = 0
        

        for item,product in validated_items:
            
            item_total = product.price * item.quantity

            order_item = OrderItems(
                order_id = order.id,
                product_id = product.id,
                price = product.price,
                quantity = item.quantity
            )
            db.add(order_item)
            product.stock -= item.quantity
            total_price += item_total

        order.total_price = total_price

        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        db.commit()
        db.refresh(order)

        return {
            "order_id":order.id,
            "total_price":order.total_price,
            "status":order.status
        }
    except Exception as e:
        db.rollback()
        raise e
        
@router.get("/me", response_model = list[OrderResponse])
def read_order_history(
        user : Users = Depends(get_current_user),
        page: int = 1,
        limit: int = 10,
        db : Session = Depends(get_db)
    ):
        offset = (page - 1) * limit
        orders = db.query(Orders).filter(Orders.user_id == user.id).offset(offset).limit(limit).all()
        return orders

@router.get("/{id}")
def get_order(
    id: int,
    db: Session = Depends(get_db),
    user: Users = Depends(get_current_user)
):

    order = db.query(Orders).filter(
        Orders.id == id,
        Orders.user_id == user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    items = db.query(OrderItems).filter(
        OrderItems.order_id == order.id
    ).all()

    response_items = []

    for item in items:

        product = db.query(Products).filter(
            Products.id == item.product_id
        ).first()

        response_items.append({
            "product_id": product.id,
            "name": product.name,
            "price": item.price,
            "quantity": item.quantity
        })

    return {
        "order_id": order.id,
        "total_price": order.total_price,
        "status": order.status,
        "items": response_items
    }

@router.put("/{order_id}/status")
def order_update_status(
    order_id: int,
    orderupdatestatusrequest: OrderUpdateStatusRequest,
    db: Session = Depends(get_db),
    admin: Users = Depends(get_current_admin)
    ):
        order = db.query(Orders).filter(Orders.id == order_id).first()

        if not order:
            raise HTTPException(
                status_code = 404,
                detail = "Order Not Found"
            )
        valid_status = {"pending", "confirmed", "shipped", "delivered"}

        if orderupdatestatusrequest.status not in valid_status:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )
        
        order.status = orderupdatestatusrequest.status

        db.commit()

        return {
                "order_id": order.id,
                "new_status": order.status
            }