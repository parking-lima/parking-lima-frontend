
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ParkingExplorer from './ParkingExplorer'
import { getParkings, getParkingSpaces } from '../api/parkings'
import type { ParkingSpace } from '../api/parkings'


vi.mock('../api/parkings', () => ({
  getParkings: vi.fn(),
  getParkingSpaces: vi.fn(),
}))

const mockedGetParkings = vi.mocked(getParkings)
const mockedGetParkingSpaces = vi.mocked(getParkingSpaces)

const parking = {
  id: 1,
  district_id: 1,
  name: 'Parking Demo Miraflores',
  address: 'Dirección ficticia - Miraflores',
}

const parkingTwo = {
  id: 2,
  district_id: 1,
  name: 'Parking Demo Secundario',
  address: 'Dirección ficticia secundaria',
}

describe('ParkingExplorer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedGetParkings.mockResolvedValue([parking])
    mockedGetParkingSpaces.mockResolvedValue([])
  })

  it('shows a loading state', () => {
    mockedGetParkings.mockReturnValue(new Promise(() => { }))

    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    expect(screen.getByRole('status'))
      .toHaveTextContent('Cargando estacionamientos...')
  })

  it('displays parking lots from FastAPI', async () => {
    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    expect(
      await screen.findByText('Parking Demo Miraflores')
    ).toBeInTheDocument()

    expect(mockedGetParkings).toHaveBeenCalledWith(1)
  })

  it('shows an empty state', async () => {
    mockedGetParkings.mockResolvedValue([])

    render(
      <ParkingExplorer districtId={3} districtName="Surco" />
    )

    expect(
      await screen.findByText(
        'No hay estacionamientos registrados en este distrito.'
      )
    ).toBeInTheDocument()
  })

  it('shows an error when loading parking lots fails', async () => {
    mockedGetParkings.mockRejectedValue(
      new Error('Connection failed')
    )

    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'No se pudieron cargar los estacionamientos'
    )
  })

  it('loads parking spaces when selected', async () => {
    const user = userEvent.setup()

    mockedGetParkingSpaces.mockResolvedValue([
      {
        id: 1,
        parking_id: 1,
        code: 'A01',
        is_active: true,
      },
      {
        id: 2,
        parking_id: 1,
        code: 'A02',
        is_active: false,
      },
    ])

    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    await screen.findByText('Parking Demo Miraflores')

    await user.click(
      screen.getByRole('button', { name: 'Ver espacios' })
    )

    expect(mockedGetParkingSpaces).toHaveBeenCalledWith(1)

    expect(await screen.findByText('A01')).toBeInTheDocument()
    expect(screen.getByText('A02')).toBeInTheDocument()
    expect(screen.getByText('Habilitado')).toBeInTheDocument()
    expect(screen.getByText('Inhabilitado')).toBeInTheDocument()
  })

  it('shows an error when loading spaces fails', async () => {
    const user = userEvent.setup()

    mockedGetParkingSpaces.mockRejectedValue(
      new Error('Connection failed')
    )

    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    await screen.findByText('Parking Demo Miraflores')

    await user.click(
      screen.getByRole('button', { name: 'Ver espacios' })
    )

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('No se pudieron cargar los espacios')
  })

  it('shows an empty state when a parking lot has no spaces', async () => {
    const user = userEvent.setup()

    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    await screen.findByText('Parking Demo Miraflores')

    await user.click(
      screen.getByRole('button', { name: 'Ver espacios' })
    )

    expect(
      await screen.findByText('No hay espacios registrados.')
    ).toBeInTheDocument()
  })


  it('ignores outdated spaces after selecting another parking', async () => {
    const user = userEvent.setup()

    mockedGetParkings.mockResolvedValue([parking, parkingTwo])

    let resolveFirst!: (spaces: ParkingSpace[]) => void

    const firstRequest = new Promise<ParkingSpace[]>((resolve) => {
      resolveFirst = resolve
    })

    mockedGetParkingSpaces.mockImplementation((parkingId) => {
      if (parkingId === 1) {
        return firstRequest
      }

      return Promise.resolve([
        {
          id: 20,
          parking_id: 2,
          code: 'B01',
          is_active: true,
        },
      ])
    })

    render(
      <ParkingExplorer districtId={1} districtName="Miraflores" />
    )

    await screen.findByText('Parking Demo Miraflores')

    const buttons = screen.getAllByRole('button', {
      name: 'Ver espacios',
    })

    await user.click(buttons[0])
    await user.click(buttons[1])

    expect(await screen.findByText('B01')).toBeInTheDocument()

    resolveFirst([
      {
        id: 10,
        parking_id: 1,
        code: 'A01',
        is_active: true,
      },
    ])
    await waitFor(() => {
      expect(screen.queryByText('A01')).not.toBeInTheDocument()
      expect(screen.getByText('B01')).toBeInTheDocument()
    })
  })

})
