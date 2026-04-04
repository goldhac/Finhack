import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import type { ScenarioInput, ScenarioResult } from '@/types/scenario'

async function simulateScenario(
  input: ScenarioInput
): Promise<ScenarioResult> {
  const response = await apiFetch<{ success: boolean; data: ScenarioResult }>(
    '/scenarios/simulate',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  )
  return response.data
}

export function useScenario() {
  const mutation = useMutation({
    mutationFn: simulateScenario,
  })

  return {
    simulate: mutation.mutate,
    simulateAsync: mutation.mutateAsync,
    result: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
