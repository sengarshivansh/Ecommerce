from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from ..database import SessionLocal
from ..model import Users, Products, Category, Cart, CartItem, Orders, OrderItems
from Sellify.routers.auth import get_current_admin, get_current_user, get_db

from ..services import order_service


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


class OrderListResponse(BaseModel):
    page: int
    limit: int
    data: list[OrderResponse]

@router.post("/create")
def create_order(
    db: Session = Depends(get_db),
    user: Users = Depends(get_current_user)
):
    return order_service.create_order(db, user.id)
        
@router.get("/me", response_model = OrderListResponse)
def read_order_history(
        user : Users = Depends(get_current_user),
        page: int = 1,
        limit: int = 10,
        db : Session = Depends(get_db)
    ):
        return order_service.get_user_orders(
        db, user.id, page, limit
    )

@router.get("/all",response_model = OrderListResponse)
def get_all_orders(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin: Users = Depends(get_current_admin)
    ):
        offset = (page - 1) * limit
        orders = db.query(Orders).offset(offset).limit(limit).all()

        return {
            "page": page,
            "limit": limit,
            "data": orders
        }

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
        
        valid_flow = {
            "pending": ["confirmed"],
            "confirmed": ["shipped"],
            "shipped": ["delivered"],
            "delivered": []
        }

        new_status = orderupdatestatusrequest.status

        if new_status not in valid_flow[order.status]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot change status from {order.status} to {new_status}"
            )
        
        order.status = orderupdatestatusrequest.status

        db.commit()

        return {
                "order_id": order.id,
                "new_status": order.status
            }

