from fastapi import APIRouter, Depends

from app.core.deps import SessionDep, require_admin
from app.modules.reports import service
from app.modules.reports.schemas import InventoryOverview

router = APIRouter(
    prefix="/admin/inventory",
    tags=["admin-inventory"],
    dependencies=[Depends(require_admin)],
)


@router.get("/overview", response_model=InventoryOverview)
async def overview(session: SessionDep) -> InventoryOverview:
    return await service.inventory_overview(session)
