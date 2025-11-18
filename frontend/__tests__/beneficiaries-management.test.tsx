import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BeneficiariesManagement from '@/components/beneficiaries-management'
import * as service from '@/services/beneficiaries.service'

describe('BeneficiariesManagement search behavior', () => {
  const programId = 'all'

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(service.beneficiariesService, 'getBeneficiariesByProgram').mockResolvedValue({
      success: true,
      message: 'ok',
      data: { beneficiaries: [], total: 0, page: 1, limit: 10, totalPages: 1 }
    })
    vi.spyOn(service.beneficiariesService, 'getBeneficiariesStats').mockResolvedValue({
      total: 0, activos: 0, inactivos: 0, porVereda: {}, porPrograma: {}
    })
    vi.spyOn(service.beneficiariesService, 'getVeredas').mockResolvedValue([])
  })

  it('maintains input value during copy operations', async () => {
    render(<BeneficiariesManagement programId={programId} />)
    const input = screen.getByPlaceholderText('Buscar por nombre, documento o correo...') as HTMLInputElement
    fireEvent.input(input, { target: { value: 'Café Sostenible' } })

    input.setSelectionRange(0, input.value.length)
    input.dispatchEvent(new Event('copy'))

    expect(input.value).toBe('Café Sostenible')
    expect(document.activeElement).toBe(input)
  }, { timeout: 20000 })

  it('debounces search updates (400ms)', async () => {
    vi.useFakeTimers()
    render(<BeneficiariesManagement programId={programId} />)
    const input = screen.getByPlaceholderText('Buscar por nombre, documento o correo...')

    fireEvent.input(input, { target: { value: 'abc' } })
    expect(service.beneficiariesService.getBeneficiariesByProgram).toHaveBeenCalledTimes(1) // initial load

    vi.advanceTimersByTime(200)
    fireEvent.input(input, { target: { value: 'def' } })
    vi.advanceTimersByTime(300)

    // After 400ms total since last keystroke, one additional call should occur
    expect(service.beneficiariesService.getBeneficiariesByProgram).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  }, { timeout: 20000 })

  it('remains stable during simultaneous interactions', async () => {
    render(<BeneficiariesManagement programId={programId} />)
    const input = screen.getByPlaceholderText('Buscar por nombre, documento o correo...')

    fireEvent.input(input, { target: { value: 'vereda test' } })
    vi.advanceTimersByTime(100)

    vi.advanceTimersByTime(500)
    expect(service.beneficiariesService.getBeneficiariesByProgram).toHaveBeenCalledTimes(2)
  }, { timeout: 20000 })
})
import React from 'react'