'use client'

import { useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'

const WASTE_IMPACTS: Record<string, { co2: number; water: number; landfill: number }> = {
  'Plastic': { co2: 2.5, water: 100, landfill: 0.8 },
  'Metal': { co2: 1.8, water: 50, landfill: 0.3 },
  'Paper': { co2: 1.2, water: 200, landfill: 0.5 },
  'Textile': { co2: 3.0, water: 150, landfill: 0.7 },
  'Food': { co2: 2.0, water: 300, landfill: 0.9 },
  'Other': { co2: 1.5, water: 100, landfill: 0.6 },
}

export function WasteCalculator() {
  const [materialType, setMaterialType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [results, setResults] = useState<{ co2: number; water: number; landfill: number } | null>(null)

  const calculate = () => {
    if (!materialType || !quantity) {
      alert('Please fill in all fields')
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    const impact = WASTE_IMPACTS[materialType] || WASTE_IMPACTS['Other']
    setResults({
      co2: impact.co2 * qty,
      water: impact.water * qty,
      landfill: impact.landfill * qty,
    })
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Waste-to-Resource Calculator</h2>
      <p className="text-gray-600 mb-4">
        Calculate the environmental impact saved by reusing materials instead of disposing them.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Type
          </label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Material</option>
            <option value="Plastic">Plastic</option>
            <option value="Metal">Metal</option>
            <option value="Paper">Paper</option>
            <option value="Textile">Textile</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Input
          label="Quantity (kg)"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
        />

        <Button onClick={calculate} variant="primary" className="w-full">
          Calculate Impact
        </Button>

        {results && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-3">Environmental Impact Saved:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>CO₂ Emissions:</span>
                <span className="font-semibold">{results.co2.toFixed(2)} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span>Water Saved:</span>
                <span className="font-semibold">{results.water.toFixed(0)} liters</span>
              </div>
              <div className="flex justify-between">
                <span>Landfill Space:</span>
                <span className="font-semibold">{results.landfill.toFixed(2)} m³</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

