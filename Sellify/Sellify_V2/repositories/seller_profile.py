"""
SellerProfileRespository — data access for the SellerProfile table.

Inherits generic CRUD from IRepository (create / retrieve / update); adds only
the query that is specific to users: lookup by user_id, to check if this user is a seller
"""
from sqlalchemy.orm import Session

from abstractions.repository import IRepository
from models.seller_profile import SellerProfile


class SellerProfileRepository(IRepository):

    def __init__(
        self,
        session: Session,
        urn: str = None,
        user_urn: str = None,
        api_name: str = None,
        user_id: int = None,
    ) -> None:
        # Hand the generic base THIS repository's model.
        super().__init__(
            session=session,
            model=SellerProfile,
            urn=urn,
            user_urn=user_urn,
            api_name=api_name,
            user_id=user_id,
        )

    def retrieve_record_by_user_id(
        self, user_id: int, is_deleted: bool = False
    ) -> SellerProfile | None:
        """The lookup the registration service calls for its uniqueness check."""
        return (
            self.session.query(SellerProfile)
            .filter(SellerProfile.user_id == user_id, SellerProfile.is_deleted == is_deleted)
            .first()
        )
