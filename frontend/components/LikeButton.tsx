"use client"

import { useState } from "react"
import axios from "@/lib/axios"
import { Heart, HeartOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LikeButtonProps {
  adventureId: number
  initialLikes: number
  initiallyLiked: boolean
}

export default function LikeButton({ adventureId, initialLikes, initiallyLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initiallyLiked)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (liked) {
        await axios.delete(`/api/adventures/${adventureId}/like`)
        setLikes((prev) => prev - 1)
        setLiked(false)
      } else {
        await axios.post(`/api/adventures/${adventureId}/like`)
        setLikes((prev) => prev + 1)
        setLiked(true)
      }
    } catch (error) {
      console.error("Error toggling like", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {liked ? (
        <>
          <HeartOff className="h-4 w-4 text-red-500" />
          <span> {likes}</span>
        </>
      ) : (
        <>
          <Heart className="h-4 w-4" />
          <span> {likes}</span>
        </>
      )}
    </Button>
  )
}
