'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NotLogInHomePage() {
    const router = useRouter()
    useEffect(() => {
        router.push('/login')
    }, [])
    return <></>
}