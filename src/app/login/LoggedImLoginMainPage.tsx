'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function LoggedImLoginMainPage() {
    const router = useRouter()
    useEffect(() => {
        router.push('/')
    }, [])
    return <></>
}
