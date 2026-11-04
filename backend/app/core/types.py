from typing import Annotated

from pydantic import Field, StringConstraints

# Vietnamese phone: 0xxxxxxxxx or +84xxxxxxxxx
Phone = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^(0|\+84)\d{9,10}$")]
Password = Annotated[str, StringConstraints(min_length=8, max_length=72)]
Money = Annotated[int, Field(ge=0)]
ConditionPct = Annotated[int, Field(ge=10, le=100)]
