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