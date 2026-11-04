import logging
from datetime import UTC, datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.db import SessionLocal
from app.modules.reservations.service import expire_due

logger = logging.getLogger("app.jobs")


async def expire_reservations() -> int:
    async with SessionLocal() as session:
        count = await expire_due(session, datetime.now(UTC))
        await session.commit()
    if count:
        logger.info("expired %d reservations", count)
    return count


def start_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(expire_reservations, "interval", minutes=10, id="expire_reservations")
    scheduler.start()
    return scheduler
