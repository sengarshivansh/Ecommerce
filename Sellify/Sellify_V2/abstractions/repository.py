"""
IRepository — base class for every repository.

Holds the generic, model-agnostic CRUD (Template Method pattern): the algorithm
is written once here against `self.model`, and each concrete repository injects
*which* model it operates on. It also threads per-request context (urn/user_id)
into a bound logger, so every DB call is traceable back to the request that
issued it.

Note: the generic reads/updates assume every model carries `id`, `urn`, and
`is_deleted`. That holds because all our tables share the same audit columns
(soon to become a shared mixin).
"""
from abc import ABC

from loguru import logger
from sqlalchemy.orm import Session


class IRepository(ABC):

    def __init__(
        self,
        session: Session,
        model,
        urn: str = None,
        user_urn: str = None,
        api_name: str = None,
        user_id: int = None,
    ) -> None:
        if session is None:
            raise RuntimeError("DB session is required")
        self.session = session
        self.model = model  # the mapped class the generic CRUD operates on
        self.urn = urn
        self.user_urn = user_urn
        self.api_name = api_name
        self.user_id = user_id
        self.logger = logger.bind(
            urn=urn, user_urn=user_urn, api_name=api_name, user_id=user_id
        )

    def create_record(self, record):
        self.session.add(record)
        self.session.flush() # populate DB-generated values (id, defaults)
        return record

    def retrieve_record_by_id(self, id, is_deleted: bool = False):
        return (
            self.session.query(self.model)
            .filter(self.model.id == id, self.model.is_deleted == is_deleted)
            .first()
        )

    def retrieve_record_by_urn(self, urn: str, is_deleted: bool = False):
        return (
            self.session.query(self.model)
            .filter(self.model.urn == urn, self.model.is_deleted == is_deleted)
            .first()
        )

    def update_record(self, id, new_data: dict):
        record = (
            self.session.query(self.model).filter(self.model.id == id).first()
        )
        if record is None:
            raise ValueError(f"{self.model.__name__} with id {id} not found")
        for attr, value in new_data.items():
            setattr(record, attr, value)
        self.session.flush()
        return record
