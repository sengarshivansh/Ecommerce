"""
UserRepository — data access for the User table.

Inherits generic CRUD from IRepository (create / retrieve / update); adds only
the query that is specific to users: lookup by email, which the registration
service uses for its "is this email already taken?" check.
"""
from sqlalchemy.orm import Session

from abstractions.repository import IRepository
from models.user import User


class UserRepository(IRepository):

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
            model=User,
            urn=urn,
            user_urn=user_urn,
            api_name=api_name,
            user_id=user_id,
        )

    def retrieve_record_by_email(
        self, email: str, is_deleted: bool = False
    ) -> User | None:
        """The lookup the registration service calls for its uniqueness check."""
        return (
            self.session.query(User)
            .filter(User.email == email, User.is_deleted == is_deleted)
            .first()
        )
