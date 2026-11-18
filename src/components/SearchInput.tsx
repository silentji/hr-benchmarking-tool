import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setQuery } from '../store/conversationsSlice'
import { SearchIcon } from './icons'
import styles from './SearchInput.module.css'

export default function SearchInput() {
  const dispatch = useAppDispatch()
  const query = useAppSelector((s) => s.conversations.query)

  return (
    <label className={styles.search}>
      <SearchIcon size={18} />
      <input
        type="text"
        value={query}
        placeholder="Поиск по истории"
        aria-label="Поиск по истории диалогов"
        onChange={(e) => dispatch(setQuery(e.target.value))}
      />
    </label>
  )
}
