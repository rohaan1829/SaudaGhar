'use client'

import { Card } from '@/app/components/ui/Card'

const SEASONAL_ALERTS = [
  {
    season: 'Harvest Season',
    material: 'Agricultural Waste',
    description: 'High demand for crop residues and agricultural byproducts during harvest season.',
    timeframe: 'March - May, September - November',
  },
  {
    season: 'Construction Season',
    material: 'Construction Materials',
    description: 'Increased need for bricks, cement, and steel during peak construction months.',
    timeframe: 'October - April',
  },
  {
    season: 'Textile Production',
    material: 'Textile Waste',
    description: 'Higher availability of textile scraps during peak manufacturing periods.',
    timeframe: 'Year Round',
  },
]

export function SeasonalAlerts() {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Seasonal Demand Alerts</h3>
        <p className="text-sm text-gray-500">
          Materials in high demand during specific seasons
        </p>
      </div>

      <div className="space-y-4">
        {SEASONAL_ALERTS.map((alert, idx) => (
          <div key={idx} className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-semibold text-primary-700">{alert.season}</h4>
            <p className="text-sm text-gray-600 mt-1">{alert.material}</p>
            <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
            <p className="text-xs text-gray-400 mt-1">{alert.timeframe}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

