"""
Physical table names, in one place.

Referenced by models (`__tablename__`), raw queries, and future Alembic
migrations. Centralising them kills magic strings: rename a table once here
instead of grepping for a quoted literal across the codebase.
"""
from typing import Final


class Table:
    USER: Final[str] = "users"
    SELLER_PROFILE: Final[str] = "seller_profiles"
