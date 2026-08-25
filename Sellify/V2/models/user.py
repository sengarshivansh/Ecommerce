"""
User model — a person's identity record.

A person registers as a User first; seller capability is layered on later via a
separate SellerProfile (identity vs. capability, per ARCHITECTURE.md §2).
"""
from datetime import datetime, timezone

from sqlalchemy import BigInteger, Boolean, Column, DateTime, String

from constants.db.table import Table
from models import Base


def _utcnow() -> datetime:
    """Timezone-aware UTC now — paired with DateTime(timezone=True) columns."""
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = Table.USER

    # Internal identity — never exposed to clients.
    id = Column(BigInteger, primary_key=True)
    # Public identity — the only id that leaves the system (URLs, responses).
    urn = Column(String, nullable=False, index=True)

    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    # Lifecycle flags.
    is_active = Column(Boolean, nullable=False, default=True)   # suspend, don't delete
    is_deleted = Column(Boolean, nullable=False, default=False)  # soft delete

    # Audit.
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=_utcnow, index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=_utcnow)
