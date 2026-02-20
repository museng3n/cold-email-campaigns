"use client"

import { useEffect } from "react"
import CampaignsPage from "@/components/campaigns-page"

export default function Home() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      localStorage.setItem('triggerio_token', urlToken)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return <CampaignsPage />
}
