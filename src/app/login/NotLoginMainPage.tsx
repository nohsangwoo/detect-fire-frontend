'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function NotLoginMainPage() {
    const router = useRouter()
    useEffect(() => {
        router.push('/')
    }, [])
    return <></>
}
