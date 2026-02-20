"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/shared-api-config/api/client"
import ENDPOINTS from "@/shared-api-config/api/endpoints"
import { isAuthenticated } from "@/shared-api-config/utils/auth"
import { URLS } from "@/shared-api-config/api/config"
import { sampleCampaigns } from "@/lib/sample-campaigns-data"

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [campaigns, setCampaigns] = useState<any[]>(sampleCampaigns)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Auth check
    if (!isAuthenticated()) {
      window.location.href = URLS.AUTH
      return
    }

    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(ENDPOINTS.CAMPAIGNS.BASE)
      if (response.data && Array.isArray(response.data)) {
        setCampaigns(response.data)
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setCampaigns(response.data.data)
      }
    } catch (err: any) {
      console.error("Failed to fetch campaigns:", err)
      setError(err.response?.data?.message || "فشل في تحميل الحملات")
      // Keep sample data as fallback
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async (id: number) => {
    try {
      await apiClient.post(ENDPOINTS.CAMPAIGNS.PAUSE(id))
      fetchCampaigns()
    } catch (err) {
      console.error("Failed to pause campaign:", err)
    }
  }

  const handleResume = async (id: number) => {
    try {
      await apiClient.post(ENDPOINTS.CAMPAIGNS.RESUME(id))
      fetchCampaigns()
    } catch (err) {
      console.error("Failed to resume campaign:", err)
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab === "all") return true
    return campaign.status === activeTab
  })

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length
  const totalSentToday = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0)
  const avgOpenRate = campaigns.length
    ? (campaigns.reduce((sum, c) => sum + (c.stats?.openRate || 0), 0) / campaigns.length).toFixed(1)
    : "0"
  const avgDeliverability = campaigns.length
    ? (campaigns.reduce((sum, c) => sum + (c.stats?.deliverabilityRate || 0), 0) / campaigns.length).toFixed(0)
    : "0"

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-[Cairo]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-gray-900">Cold Email Campaigns</h1>
            <p className="text-[#6B7280] mt-1">حملات البريد الباردة</p>
            <p className="text-sm text-[#6B7280] mt-2">Multi-step sequences with smart personalization</p>
            <p className="text-sm text-[#6B7280]">حملات متعددة الخطوات مع تخصيص ذكي</p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold shadow-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-400 hover:via-pink-400 hover:to-orange-300 hover:shadow-lg hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>إنشاء حملة جديدة</span>
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 - Active Campaigns */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{activeCampaigns}</div>
            <div className="text-sm text-gray-600 mb-1">Active Campaigns</div>
            <div className="text-sm text-gray-600 mb-3">حملات نشطة</div>
          </div>

          {/* Card 2 - Sent Today */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalSentToday.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mb-1">Total Sent</div>
            <div className="text-sm text-gray-600 mb-3">إجمالي المُرسل</div>
          </div>

          {/* Card 3 - Open Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{avgOpenRate}%</div>
            <div className="text-sm text-gray-600 mb-1">Open Rate</div>
            <div className="text-sm text-gray-600 mb-3">معدل الفتح</div>
          </div>

          {/* Card 4 - Deliverability */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{avgDeliverability}%</div>
            <div className="text-sm text-gray-600 mb-1">Deliverability Rate</div>
            <div className="text-sm text-gray-600 mb-3">معدل التوصيل</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { id: "all", label: "All", labelAr: "الكل" },
              { id: "active", label: "Active", labelAr: "نشطة" },
              { id: "scheduled", label: "Scheduled", labelAr: "مجدولة" },
              { id: "paused", label: "Paused", labelAr: "موقوفة" },
              { id: "completed", label: "Completed", labelAr: "مكتملة" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#7C3AED] text-[#7C3AED]"
                    : "border-transparent text-[#6B7280] hover:bg-[#F3F4F6]"
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs">{tab.labelAr}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
            <span className="mr-3 text-gray-600">جاري التحميل...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-4 mt-4">
          {!loading && filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onPause={handlePause}
              onResume={handleResume}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CampaignCard({
  campaign,
  onPause,
  onResume,
}: {
  campaign: any
  onPause: (id: number) => void
  onResume: (id: number) => void
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      {/* Top Row - Status, Name, Temperature */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <StatusBadge status={campaign.status} />
        <h3 className="text-lg font-bold text-gray-900 flex-1">{campaign.name}</h3>
        <TemperatureBadge temperature={campaign.temperature} />
      </div>
      <div className="text-sm text-gray-600 mb-4">{campaign.nameAr}</div>

      {/* Sequence Info */}
      {campaign.sequence && (
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Sequence:</span> {campaign.sequence.steps} steps (Day{" "}
          {campaign.sequence.schedule.join(", ")})
        </div>
      )}

      {/* Stats Row */}
      {campaign.stats && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <span>
            <strong>Contacts:</strong> {campaign.stats.totalContacts}
          </span>
          <span>
            <strong>Sent:</strong> {campaign.stats.sent?.toLocaleString()}
          </span>
          <span>
            <strong>Opens:</strong> {campaign.stats.opened} ({campaign.stats.openRate}%)
          </span>
        </div>
      )}

      {/* Progress Bars */}
      {campaign.sequence && campaign.progress && (
        <div className="space-y-2 mb-4">
          {Array.from({ length: campaign.sequence.steps }).map((_, index) => {
            const stepNum = index + 1
            const progress = campaign.progress[`step${stepNum}`] || 0
            return (
              <div key={stepNum} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">Step {stepNum}:</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progress === 100 ? "bg-green-500" : progress > 0 ? "bg-[#7C3AED]" : "bg-gray-300"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12">{progress}%</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Detailed Stats */}
      {campaign.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Opens</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{campaign.stats.openRate}%</div>
            <div className="text-xs text-gray-500">
              {campaign.stats.opened} of {campaign.stats.sent}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <span className="text-sm">Clicks</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{campaign.stats.clickRate}%</div>
            <div className="text-xs text-gray-500">{campaign.stats.clicked} clicks</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="text-sm">Replies</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{campaign.stats.replied}</div>
            <div className="text-xs text-gray-500">{campaign.stats.replyRate}% rate</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Delivery</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{campaign.stats.deliverabilityRate}%</div>
            <div className="text-xs text-gray-500">{campaign.stats.delivered} delivered</div>
          </div>
        </div>
      )}

      {/* Temperature Progression */}
      {campaign.temperatureProgression && (
        <div className="flex items-center gap-4 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Temperature:</span>
          <span className="text-blue-700">{campaign.temperatureProgression.cold} Cold</span>
          <span className="text-gray-400">→</span>
          <span className="text-orange-700">{campaign.temperatureProgression.warm} Warm</span>
          <span className="text-gray-400">→</span>
          <span className="text-red-700">{campaign.temperatureProgression.hot} Hot</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
        <button className="px-4 py-2 text-sm font-medium text-[#7C3AED] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          View
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Edit
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Duplicate
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Stats
        </button>
        {campaign.status === "active" ? (
          <button
            onClick={() => onPause(campaign.id)}
            className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Pause
          </button>
        ) : campaign.status === "paused" ? (
          <button
            onClick={() => onResume(campaign.id)}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            Resume
          </button>
        ) : null}
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        نشطة
      </span>
    )
  }

  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-sm font-medium">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        مجدولة
      </span>
    )
  }

  if (status === "paused") {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-500 text-white text-sm font-medium">
        موقوفة
      </span>
    )
  }

  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500 text-white text-sm font-medium">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        مكتملة
      </span>
    )
  }

  return null
}

function TemperatureBadge({ temperature }: { temperature: string }) {
  if (temperature === "cold") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5z" />
        </svg>
        بارد
      </span>
    )
  }

  if (temperature === "warm") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7z" />
        </svg>
        دافئ
      </span>
    )
  }

  if (temperature === "hot") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        ساخن
      </span>
    )
  }

  if (temperature === "mixed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        مختلط
      </span>
    )
  }

  return null
}
