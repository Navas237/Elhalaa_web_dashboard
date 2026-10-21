import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBarber } from '../services/staff.service'
import { staffKeys } from '../query-keys'
import type { CreateBarberDto } from '../dto/staff.dto'

export function useCreateBarber() {
  return useMutation<void, Error, CreateBarberDto>({
    mutationFn: (data) => createBarber(data),
  })
}
