import asyncio
from typing import Annotated

from sqlalchemy import String, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import settings

sync_engine = create_engine(
    url=settings.DATABASE_URL_psycopg
)

async_engine = create_async_engine(
    url=settings.DATABASE_URL_asyncpg,
    pool_size=20,
    max_overflow=10,
)

session_factory=sessionmaker(sync_engine)
async_session_factory=async_sessionmaker(async_engine)

str_256 = String(256)

class Base(DeclarativeBase):
    type_annotation_map = {
        str_256: String(256)
    }

    repr_cols_num = 3
    repr_cols = tuple()

    def __repr__(self):
        cols = []
        for idx, col in enumerate(self.__table__.columns.keys()):
            if col in self.repr_cols or idx < self.repr_cols_num:
                cols.append(f"{col}={getattr(self, col)}")

        return f"<{self.__class__.__name__} {', '.join(cols)}>"