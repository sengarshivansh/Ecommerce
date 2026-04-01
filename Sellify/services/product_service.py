from ..repositories import product_repository

def get_products(
    db,
    category_id,
    search,
    sort,
    min_price,
    max_price,
    page,
    limit
):
    query = product_repository.get_products_query(db)

    # filter
    if category_id:
        query = query.filter(Products.category_id == category_id)

    # search
    if search:
        query = query.filter(Products.name.ilike(f"%{search}%"))

    # price filter
    if min_price:
        query = query.filter(Products.price >= min_price)

    if max_price:
        query = query.filter(Products.price <= max_price)

    # sorting
    if sort == "price_asc":
        query = query.order_by(Products.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Products.price.desc())

    # pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    return {
        "page": page,
        "limit": limit,
        "data": products
    }