
from datetime import datetime, timezone
from sqlalchemy import BigInteger, Boolean, Column, DateTime, String, ForeignKey

from constants.db.table import Table
from models import Base


def _utcnow() -> datetime:
    """Timezone-aware UTC now — paired with DateTime(timezone=True) columns."""
    return datetime.now(timezone.utc)


class SellerProfile(Base):
    __tablename__ = Table.SELLER_PROFILE

    # Internal identity — never exposed to clients.
    id = Column(BigInteger, primary_key=True)
    # Public identity — the only id that leaves the system (URLs, responses).
    urn = Column(String, nullable=False, index=True)
    business_name = Column(String, nullable=False)
    user_id = Column(
    BigInteger, ForeignKey(f"{Table.USER}.id"), nullable=False, unique=True, index=True
)

    # Lifecycle flags.
    is_active = Column(Boolean, nullable=False, default=True)   # suspend, don't delete
    is_deleted = Column(Boolean, nullable=False, default=False)  # soft delete
    is_verified = Column(Boolean, nullable=False, default=False)  # trust signal — server-set only
    # Audit.
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=_utcnow, index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=_utcnow)
