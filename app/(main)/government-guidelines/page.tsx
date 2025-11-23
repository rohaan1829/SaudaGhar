import { Card } from '@/app/components/ui/Card'

const GUIDELINES = [
  {
    title: 'Pakistan Environmental Protection Act, 1997',
    content: 'All industries must comply with waste management regulations and obtain necessary environmental clearances.',
    link: '#',
  },
  {
    title: 'Hazardous Waste Management Rules',
    content: 'Proper handling, storage, and disposal of hazardous materials is mandatory. Exchange of such materials requires proper documentation.',
    link: '#',
  },
  {
    title: 'Industrial Waste Disposal Guidelines',
    content: 'Industries are encouraged to reduce, reuse, and recycle waste materials before disposal. Material exchange platforms support these goals.',
    link: '#',
  },
  {
    title: 'Environmental Impact Assessment',
    content: 'Large-scale material exchanges may require EIA approval. Consult with local EPA office for guidance.',
    link: '#',
  },
  {
    title: 'Business Registration Requirements',
    content: 'Ensure your business is properly registered with relevant authorities before engaging in material exchange activities.',
    link: '#',
  },
]

export default function GovernmentGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Government Guidelines</h1>
        <p className="text-gray-600">
          Important regulations and guidelines from Pakistan Environmental Protection Agency (EPA)
        </p>
      </div>

      <div className="space-y-4">
        {GUIDELINES.map((guideline, idx) => (
          <Card key={idx}>
            <h3 className="text-lg font-semibold mb-2">{guideline.title}</h3>
            <p className="text-gray-700 mb-3">{guideline.content}</p>
            <a
              href={guideline.link}
              className="text-primary-600 hover:underline text-sm"
              onClick={(e) => {
                e.preventDefault()
                // Link to official EPA resources
              }}
            >
              Learn More →
            </a>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-blue-50">
        <h3 className="font-semibold mb-2">Contact Pakistan EPA</h3>
        <p className="text-sm text-gray-700">
          For official guidelines and compliance requirements, please visit the Pakistan Environmental Protection Agency website or contact your local EPA office.
        </p>
      </Card>
    </div>
  )
}

