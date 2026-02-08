'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  Upload,
  Eye,
  EyeOff,
  Building,
  Globe,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

interface InvitationData {
  id: string
  name: string
  email: string
  role_id?: string
  department?: string
  role?: { name: string }
}

function OnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    profile_photo: '',
    password: '',
    confirm_password: '',
  })

  const totalSteps = 4

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/staff/invitations/validate?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Invalid or expired invitation')
        }

        setInvitation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to validate invitation')
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('bucket', 'staff-photos')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      setFormData({ ...formData, profile_photo: data.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    setError('')
    
    switch (stepNumber) {
      case 1:
        // Profile photo is optional
        return true
      case 2:
        // Personal info - all optional for now
        return true
      case 3:
        // Emergency contact - optional but recommended
        return true
      case 4:
        // Password validation
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return false
        }
        if (formData.password !== formData.confirm_password) {
          setError('Passwords do not match')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(4)) return
    
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/staff/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...formData,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. You can now log in to access your staff portal.
          </p>
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
            <span className="text-sm">Redirecting to login...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 relative mx-auto mb-4">
            <Image
              src="/logo-enauwi.png"
              alt="E'Nauwi Resort"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to E&apos;Nauwi Resort</h1>
          <p className="text-gray-600 mt-2">Complete your profile to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s === step
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                      : s < step
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                <span className={`text-xs mt-2 font-medium ${s <= step ? 'text-teal-600' : 'text-gray-400'}`}>
                  {s === 1 && 'Photo'}
                  {s === 2 && 'Personal'}
                  {s === 3 && 'Emergency'}
                  {s === 4 && 'Password'}
                </span>
              </div>
            ))}
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Invitation Info Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl">
              {invitation?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-teal-800">{invitation?.name}</p>
              <p className="text-sm text-teal-600">{invitation?.email}</p>
              {invitation?.role?.name && (
                <p className="text-xs text-teal-500 mt-0.5">
                  {invitation.role.name} {invitation.department && `• ${invitation.department}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Step 1: Profile Photo */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Photo</h2>
                    <p className="text-sm text-gray-500">
                      Add a professional photo to help your colleagues recognize you
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      {formData.profile_photo ? (
                        <img
                          src={formData.profile_photo}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                          <User className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                      {uploading ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span>{formData.profile_photo ? 'Change Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                        </>
                      )}
                    </label>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB (optional)</p>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-sm text-gray-500">
                      Tell us a bit more about yourself
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="+678 1234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User className="inline h-4 w-4 mr-1" />
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Globe className="inline h-4 w-4 mr-1" />
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="e.g., Ni-Vanuatu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Home Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows={2}
                      placeholder="Your home address"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Emergency Contact */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Emergency Contact</h2>
                    <p className="text-sm text-gray-500">
                      Someone we can contact in case of an emergency
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800 flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      This information will only be used in emergencies and will be kept confidential.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Family member or friend"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="+678 1234567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Password */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Set Your Password</h2>
                    <p className="text-sm text-gray-500">
                      Create a secure password for your account
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Minimum 8 characters"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Confirm your password"
                        minLength={8}
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      <p className="font-medium mb-2">Password requirements:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                          At least 8 characters
                        </li>
                        <li className={formData.password === formData.confirm_password && formData.password.length > 0 ? 'text-green-600' : ''}>
                          Passwords match
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Review Your Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Role</span>
                        <span className="font-medium">{invitation?.role?.name || 'Staff'}</span>
                      </div>
                      {invitation?.department && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Department</span>
                          <span className="font-medium">{invitation.department}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <span className="font-medium">{formData.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Navigation */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creating Account...' : 'Complete Setup'}
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
