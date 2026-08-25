from fastapi import HTTPException
from ..repositories import order_repository

def get_user_orders(db, user_id, page, limit):
    offset = (page - 1) * limit

    orders = order_repository.get_user_orders(
        db, user_id, offset, limit
    )

    return {
        "page": page,
        "limit": limit,
        "data": orders
    }

def create_order(db, user_id):
    try:
        cart = order_repository.get_cart_by_user(db, user_id)
        if not cart:
            raise HTTPException(404, "Cart not Found")

        items = order_repository.get_cart_items(db, cart.id)

        if not items:
            raise HTTPException(400, "Cart is empty")
        
        validated_items = []

        for item in items:
            product = order_repository.get_product_for_update(
                db, item.product_id
            )

            if not product:
                raise HTTPException(404, "Product Not Found")

            if product.stock < item.quantity:
                raise HTTPException(400, "Not Enough Product Available")

            validated_items.append((item, product))
        
        order = order_repository.create_order(db, user_id)

        total_price = 0

        for item, product in validated_items:
            item_total = product.price * item.quantity

            order_repository.create_order_item(
                db,
                order.id,
                product.id,
                product.price,
                item.quantity
            )

            product.stock -= item.quantity
            total_price += item_total
        order.total_price = total_price

        order_repository.clear_cart(db, cart.id)

        db.commit()
        db.refresh(order)

        return {
            "order_id": order.id,
            "total_price": order.total_price,
            "status": order.status
        }
    except Exception as e:
        db.rollback()
        raise e