import { IconSearch } from '@tabler/icons-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group'

export function GlobalSearch() {
  return (
    <InputGroup>
      <InputGroupAddon>
        Везде

      </InputGroupAddon>

      <InputGroupInput
        placeholder="Поиск"
      />

      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
    </InputGroup>
  )
}
