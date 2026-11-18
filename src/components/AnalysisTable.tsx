import type { CellValue, TableColumn, TableData } from '../types/chat'
import { cx } from '../utils/cx'
import styles from './AnalysisTable.module.css'

function formatCell(v: CellValue | undefined): string {
  if (v == null || v === '') return '—'
  if (typeof v === 'number') return v.toLocaleString('ru-RU')
  return v
}

const alignClass = (col: TableColumn, index: number) => {
  const align = col.align ?? (index === 0 ? 'left' : 'right')
  return styles[align]
}

export default function AnalysisTable({ table }: { table: TableData }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {table.columns.map((col, i) => (
              <th key={col.key} className={alignClass(col, i)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id} className={cx(row.highlight && styles.highlight)}>
              {table.columns.map((col, i) => (
                <td key={col.key} className={cx(alignClass(col, i), row.highlight && col.accent && styles.accent)}>
                  {formatCell(row.cells[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
