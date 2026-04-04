export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(month) - 1]} ${year}`
}

export function formatGSSI(value: number): string {
  return value.toFixed(1)
}

export function zScoreTo100(z: number): number {
  return Math.round(((Math.min(Math.max(z, -3), 3) + 3) / 6) * 100)
}
