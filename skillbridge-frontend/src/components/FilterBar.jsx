const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={filters.status || 'all'}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        className="input-field w-auto min-w-[150px]"
      >
        <option value="all">All Status</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="CLOSED">Closed</option>
      </select>

      <select
        value={filters.sort || 'newest'}
        onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
        className="input-field w-auto min-w-[150px]"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="stipend-high">Stipend: High to Low</option>
        <option value="stipend-low">Stipend: Low to High</option>
      </select>
    </div>
  )
}

export default FilterBar
