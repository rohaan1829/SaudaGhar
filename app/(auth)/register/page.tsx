import RegistrationForm from '@/app/components/forms/RegistrationForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-2xl">
      <RegistrationForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  )
}

