"""
Chat System Package
Provides natural language query parsing and cohort-based response generation.
"""

from .cohort_patterns import COHORT_PATTERNS
from .response_generator import (
    parse_passenger_query,
    match_to_cohort,
    format_passenger_description,
    update_whatif_and_respond
)

__all__ = [
    'COHORT_PATTERNS',
    'parse_passenger_query',
    'match_to_cohort',
    'format_passenger_description',
    'update_whatif_and_respond'
]
