"""
Declarative base for all ORM models.

Every model imports `Base` from here, and the app calls
`Base.metadata.create_all(...)` once at startup. Keeping the base in one place
(rather than inline in the DB config) means models never import the engine — the
model layer stays free of any connection/config concern.
"""
from sqlalchemy.orm import declarative_base

# Modern SQLAlchemy 2.0 import path. (Calcount uses the deprecated
# `sqlalchemy.ext.declarative.declarative_base` — we use the current one.)
Base = declarative_base()
