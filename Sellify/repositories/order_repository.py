from ..model import Orders, OrderItems, Cart, CartItem, Products

def get_user_orders(db, user_id, offset, limit):
    return db.query(Orders)\
        .filter(Orders.user_id == user_id)\
        .offset(offset)\
        .limit(limit)\
        .all()

def get_cart_by_user(db, user_id):
    return db.query(Cart).filter(Cart.user_id == user_id).first()

def get_cart_items(db, cart_id):
    return db.query(CartItem).filter(CartItem.cart_id == cart_id).all()


def get_product_for_update(db, product_id):
    return db.query(Products)\
        .filter(Products.id == product_id)\
        .with_for_update()\
        .first()

def create_order(db, user_id):
    order = Orders(user_id=user_id, total_price=0, status="pending")
    db.add(order)
    db.flush()
    return order

def create_order_item(db, order_id, product_id, price, quantity):
    order_item = OrderItems(
        order_id=order_id,
        product_id=product_id,
        price=price,
        quantity=quantity
    )
    db.add(order_item)

def clear_cart(db, cart_id):
    db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()