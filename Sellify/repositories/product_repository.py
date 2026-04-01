from ..model import Products

def get_products_query(db):
    return db.query(Products)