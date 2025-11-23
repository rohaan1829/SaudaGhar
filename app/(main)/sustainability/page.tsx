import { Card } from '@/app/components/ui/Card'
import { WasteCalculator } from '@/app/components/calculator/WasteCalculator'

const TIPS = [
  {
    title: 'Reduce Industrial Waste',
    content: 'By reusing materials from other industries, you can significantly reduce your waste production and disposal costs.',
  },
  {
    title: 'Save Resources',
    content: 'Every kilogram of material reused saves energy, water, and raw materials that would otherwise be needed for new production.',
  },
  {
    title: 'Lower Carbon Footprint',
    content: 'Reusing materials reduces greenhouse gas emissions associated with manufacturing new products from raw materials.',
  },
  {
    title: 'Economic Benefits',
    content: 'Buying leftover materials is often cheaper than purchasing new materials, helping your business save money.',
  },
  {
    title: 'Community Impact',
    content: 'By participating in material exchange, you contribute to a circular economy and support local businesses.',
  },
  {
    title: 'Compliance',
    content: 'Proper waste management and material reuse can help your business comply with environmental regulations.',
  },
]

export default function SustainabilityPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Sustainability Tips</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {TIPS.map((tip, idx) => (
              <Card key={idx}>
                <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                <p className="text-gray-700">{tip.content}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <WasteCalculator />
        </div>
      </div>
    </div>
  )
}

