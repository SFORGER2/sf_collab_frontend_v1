import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import MeetingDetail from "@/components/ui/meeting-detail"

export default function MeetingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <MeetingDetail
      onJoin={() => navigate(`/meet/room/${id}`)}
      onBack={() => navigate(-1)}
    />
  )
}
