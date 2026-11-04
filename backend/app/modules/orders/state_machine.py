"""Order status machine: the only place that knows which moves are legal."""

from app.modules.orders.models import OrderStatus as S
from app.modules.users.models import UserRole

# from -> allowed targets
TRANSITIONS: dict[S, set[S]] = {
    S.pending: {S.confirmed, S.cancelled},
    S.confirmed: {S.shipping, S.cancelled},
    S.shipping: {S.completed, S.cancelled},
    S.completed: set(),
    S.cancelled: set(),
}

# Buyers may only cancel from `pending`; admins may do every legal move.
BUYER_ALLOWED: set[tuple[S, S]] = {(S.pending, S.cancelled)}


def is_legal(src: S, dst: S) -> bool:
    return dst in TRANSITIONS[src]


def may_transition(role: UserRole, src: S, dst: S) -> bool:
    if not is_legal(src, dst):
        return False
    if role == UserRole.admin:
        return True
    return (src, dst) in BUYER_ALLOWED


def allowed_targets(role: UserRole, src: S) -> list[S]:
    return [dst for dst in TRANSITIONS[src] if may_transition(role, src, dst)]

