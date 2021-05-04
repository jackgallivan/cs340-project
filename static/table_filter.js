document.addEventListener('DOMContentLoaded', addFilters)

function addFilters () {
  const tables = document.querySelectorAll('table')
  for (let tbl of tables) {
    addTableFilter(tbl)
  }
}

function addTableFilter (tbl) {
  // Adds filter and sorting functionality to the given DOM table element.

  // Get the table header elements
  const tableHeaders = tbl.querySelector('tr').children
  // Determine num columns, and num that house buttons (header textContent = 'Update' or 'Delete').
  const numCols = tableHeaders.length
  let numButtons = 0
  for (e of tableHeaders) {
    if (e.textContent == 'Update' || e.textContent == 'Delete') {
      numButtons++
    }
  }

  // Create filter config for the given table
  const filterConfig = {
    base_path: '../static/node_modules/tablefilter/dist/tablefilter/',
    extensions: [{ name: 'sort' }]
  }
  // Add the config for each column.
  // 'select' = dropdown. 'none' = no filter (button columns).
  for (let i = 0; i < numCols; i++) {
    if (i < numCols - numButtons) {
      filterConfig['col_' + i] = 'select'
    } else {
      filterConfig['col_' + i] = 'none'
    }
  }

  // Create the filter using the config, and initialize it
  const tf = new TableFilter(tbl, filterConfig)
  tf.init()
}
