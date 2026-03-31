from ..model import Orders

def get_user_orders(db, user_id, offset, limit):
    return db.query(Orders)\
        .filter(Orders.user_id == user_id)\
        .offset(offset)\
        .limit(limit)\
        .all()