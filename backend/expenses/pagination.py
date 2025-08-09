# expenses/pagination.py
from rest_framework.pagination import CursorPagination

class ExpenseCursorPagination(CursorPagination):
    page_size  = 20          # or whatever default you want
    ordering   = "-date"     # newest-first, matches your table
